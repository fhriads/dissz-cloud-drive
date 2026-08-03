use crate::core::database::DbConnection;
use crate::core::telegram::{
    detect_file_type, extract_document_from_messages, extract_message_id_from_updates,
    mime_guess_from_path, TelegramState,
};

#[tauri::command(rename_all = "snake_case")]
pub async fn cmd_upload_file(
    app_handle: tauri::AppHandle,
    conn: tauri::State<'_, DbConnection>,
    tg_state: tauri::State<'_, TelegramState>,
    file_path: String,
    transfer_id: String,
    folder_id: Option<String>,
    is_encrypted: Option<bool>,
) -> Result<(), String> {
    use tauri::Emitter;
    use std::path::Path;
    use std::time::Instant;
    use grammers_tl_types as tl;

    let path = Path::new(&file_path);
    if !path.exists() {
        return Err(format!("File tidak ditemukan: {}", file_path));
    }

    let file_name = path.file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_else(|| "unknown".to_string());

    let file_bytes = std::fs::read(&path)
        .map_err(|e| format!("Gagal membaca file: {}", e))?;
    let total_bytes = file_bytes.len() as u64;

    let client = {
        let guard = tg_state.client.lock().await;
        guard.as_ref().ok_or("Client Telegram belum terkoneksi.")?.clone()
    };

    let file_id: i64 = rand::random();
    let chunk_size: usize = 512 * 1024;
    let total_parts = ((file_bytes.len() + chunk_size - 1) / chunk_size) as i32;
    let start_time = Instant::now();

    for (i, chunk) in file_bytes.chunks(chunk_size).enumerate() {
        let success = client.invoke(&tl::functions::upload::SaveFilePart {
            file_id,
            file_part: i as i32,
            bytes: chunk.to_vec(),
        }).await.map_err(|e| format!("Upload chunk {} gagal: {}", i, e))?;

        if !success {
            return Err(format!("Server Telegram menolak chunk {}", i));
        }

        let uploaded = ((i + 1) * chunk_size).min(file_bytes.len()) as u64;
        let elapsed = start_time.elapsed().as_secs_f64();
        let speed = if elapsed > 0.0 { uploaded as f64 / elapsed } else { 0.0 };
        let percent = (uploaded as f64 / total_bytes as f64 * 100.0).min(99.0);

        let _ = app_handle.emit("upload-progress", serde_json::json!({
            "id": transfer_id,
            "percent": percent as u32,
            "uploaded_bytes": uploaded,
            "total_bytes": total_bytes,
            "speed_bytes_per_sec": speed as u64
        }));
    }

    let input_file = tl::enums::InputFile::File(tl::types::InputFile {
        id: file_id,
        parts: total_parts,
        name: file_name.clone(),
        md5_checksum: String::new(),
    });

    let send_result = client.invoke(&tl::functions::messages::SendMedia {
        peer: tl::enums::InputPeer::PeerSelf,
        media: tl::enums::InputMedia::UploadedDocument(tl::types::InputMediaUploadedDocument {
            file: input_file,
            mime_type: mime_guess_from_path(&file_name),
            attributes: vec![
                tl::enums::DocumentAttribute::Filename(tl::types::DocumentAttributeFilename {
                    file_name: file_name.clone(),
                }),
            ],
            thumb: None,
            stickers: None,
            ttl_seconds: None,
            nosound_video: false,
            force_file: true,
            spoiler: false,
            video_cover: None,
            video_timestamp: None,
        }),
        message: format!("[Dissz Cloud Drive] {}", file_name),
        random_id: rand::random::<i64>(),
        reply_to: None,
        schedule_date: None,
        reply_markup: None,
        entities: None,
        silent: true,
        background: false,
        clear_draft: false,
        noforwards: false,
        update_stickersets_order: false,
        invert_media: false,
        quick_reply_shortcut: None,
        effect: None,
        allow_paid_stars: None,
        allow_paid_floodskip: false,
        send_as: None,
        suggested_post: None,
    }).await.map_err(|e| format!("Gagal mengirim media: {}", e))?;

    let telegram_message_id: Option<i64> = extract_message_id_from_updates(&send_result);

    let _ = app_handle.emit("upload-progress", serde_json::json!({
        "id": transfer_id,
        "percent": 100,
        "uploaded_bytes": total_bytes,
        "total_bytes": total_bytes,
        "speed_bytes_per_sec": 0
    }));

    let record_id = format!("f_{:x}", rand::random::<u64>());
    let created_at = {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();
        format!("{}", now)
    };
    let file_type = detect_file_type(&file_name);
    {
        let db = conn.inner.lock().map_err(|e| e.to_string())?;
        let query = "INSERT INTO files (id, name, size, file_type, parent_id, created_at, is_encrypted, is_split, telegram_message_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        let mut stmt = db.prepare(query).map_err(|e| e.to_string())?;
        stmt.bind((1, record_id.as_str())).map_err(|e| e.to_string())?;
        stmt.bind((2, file_name.as_str())).map_err(|e| e.to_string())?;
        stmt.bind((3, total_bytes as i64)).map_err(|e| e.to_string())?;
        stmt.bind((4, file_type.as_str())).map_err(|e| e.to_string())?;
        match &folder_id {
            Some(fid) => stmt.bind((5, fid.as_str())).map_err(|e| e.to_string())?,
            None => stmt.bind((5, ())).map_err(|e| e.to_string())?,
        };
        stmt.bind((6, created_at.as_str())).map_err(|e| e.to_string())?;
        let is_enc_val = if is_encrypted.unwrap_or(false) { 1i64 } else { 0i64 };
        stmt.bind((7, is_enc_val)).map_err(|e| e.to_string())?;
        stmt.bind((8, 0i64)).map_err(|e| e.to_string())?;
        match telegram_message_id {
            Some(mid) => stmt.bind((9, mid)).map_err(|e| e.to_string())?,
            None => stmt.bind((9, ())).map_err(|e| e.to_string())?,
        };
        stmt.next().map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command(rename_all = "snake_case")]
pub async fn cmd_download_file(
    app_handle: tauri::AppHandle,
    tg_state: tauri::State<'_, TelegramState>,
    file_name: String,
    telegram_message_id: i64,
    transfer_id: String,
    save_path: String,
) -> Result<(), String> {
    use tauri::Emitter;
    use grammers_tl_types as tl;
    use std::time::Instant;

    let client = {
        let guard = tg_state.client.lock().await;
        guard.as_ref().ok_or("Client Telegram belum terkoneksi.")?.clone()
    };

    let messages_result = client.invoke(&tl::functions::messages::GetMessages {
        id: vec![tl::enums::InputMessage::Id(tl::types::InputMessageId {
            id: telegram_message_id as i32,
        })],
    }).await.map_err(|e| format!("Gagal mengambil pesan Telegram: {}", e))?;

    let document = extract_document_from_messages(messages_result)
        .ok_or_else(|| "Dokumen tidak ditemukan dalam pesan Telegram.".to_string())?;

    let total_size = document.size as u64;

    let _ = app_handle.emit("download-progress", serde_json::json!({
        "id": transfer_id,
        "percent": 0,
        "uploaded_bytes": 0,
        "total_bytes": total_size,
        "speed_bytes_per_sec": 0
    }));

    let chunk_size: i32 = 512 * 1024;
    let total_chunks = ((total_size + chunk_size as u64 - 1) / chunk_size as u64) as i32;
    let mut all_bytes: Vec<u8> = Vec::with_capacity(total_size as usize);
    let start_time = Instant::now();

    let input_location = tl::enums::InputFileLocation::InputDocumentFileLocation(
        tl::types::InputDocumentFileLocation {
            id: document.id,
            access_hash: document.access_hash,
            file_reference: document.file_reference.clone(),
            thumb_size: String::new(),
        }
    );

    for i in 0..total_chunks {
        let offset = (i as i64) * (chunk_size as i64);
        let result = client.invoke(&tl::functions::upload::GetFile {
            location: input_location.clone(),
            offset,
            limit: chunk_size,
            precise: false,
            cdn_supported: false,
        }).await.map_err(|e| format!("Gagal mengunduh chunk {}: {}", i, e))?;

        match result {
            tl::enums::upload::File::File(f) => {
                all_bytes.extend_from_slice(&f.bytes);
            }
            _ => return Err("Format respon file tidak dikenali.".to_string()),
        }

        let downloaded = all_bytes.len() as u64;
        let elapsed = start_time.elapsed().as_secs_f64();
        let speed = if elapsed > 0.0 { downloaded as f64 / elapsed } else { 0.0 };
        let percent = (downloaded as f64 / total_size as f64 * 100.0).min(99.0) as u32;

        let _ = app_handle.emit("download-progress", serde_json::json!({
            "id": transfer_id,
            "percent": percent,
            "uploaded_bytes": downloaded,
            "total_bytes": total_size,
            "speed_bytes_per_sec": speed as u64
        }));
    }

    std::fs::write(&save_path, &all_bytes)
        .map_err(|e| format!("Gagal menyimpan file ke disk: {}", e))?;

    let _ = app_handle.emit("download-progress", serde_json::json!({
        "id": transfer_id,
        "percent": 100,
        "uploaded_bytes": total_size,
        "total_bytes": total_size,
        "speed_bytes_per_sec": 0
    }));

    println!("Download selesai: {} -> {}", file_name, save_path);
    Ok(())
}

use crate::core::database::DbConnection;
use crate::core::telegram::{detect_file_type, extract_document_from_messages, TelegramState};
use tauri::Manager;

fn is_encrypted_int(is_vault: bool) -> i64 {
    if is_vault { 1 } else { 0 }
}

#[tauri::command(rename_all = "snake_case")]
pub fn cmd_create_file_record(
    conn: tauri::State<DbConnection>,
    id: String,
    name: String,
    parent_id: Option<String>,
    created_at: String,
    is_encrypted: bool,
) -> Result<(), String> {
    let conn = conn.inner.lock().map_err(|e| e.to_string())?;
    let file_type = detect_file_type(&name);
    let query = "INSERT INTO files (id, name, size, file_type, parent_id, created_at, is_encrypted) VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    let mut stmt = conn.prepare(query).map_err(|e| e.to_string())?;
    
    stmt.bind((1, id.as_str())).map_err(|e| e.to_string())?;
    stmt.bind((2, name.as_str())).map_err(|e| e.to_string())?;
    stmt.bind((3, 0i64)).map_err(|e| e.to_string())?;
    stmt.bind((4, file_type.as_str())).map_err(|e| e.to_string())?;
    
    match &parent_id {
        Some(p_id) => stmt.bind((5, p_id.as_str())).map_err(|e| e.to_string())?,
        None => stmt.bind((5, ())).map_err(|e| e.to_string())?,
    };
    
    stmt.bind((6, created_at.as_str())).map_err(|e| e.to_string())?;
    stmt.bind((7, is_encrypted_int(is_encrypted))).map_err(|e| e.to_string())?;
    
    stmt.next().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command(rename_all = "snake_case")]
pub async fn cmd_preview_file(
    app_handle: tauri::AppHandle,
    tg_state: tauri::State<'_, TelegramState>,
    telegram_message_id: i64,
    file_name: String,
) -> Result<String, String> {
    let app_data_dir = app_handle.path().app_data_dir()
        .map_err(|e| format!("Gagal mendeteksi folder penyimpanan sistem: {}", e))?;
    let cache_dir = app_data_dir.join("cache");
    if !cache_dir.exists() {
        std::fs::create_dir_all(&cache_dir).map_err(|e| e.to_string())?;
    }

    let cache_file_name = format!("{}_{}", telegram_message_id, file_name);
    let cache_file_path = cache_dir.join(&cache_file_name);

    if cache_file_path.exists() {
        return Ok(cache_file_path.to_string_lossy().to_string());
    }

    let client = {
        let guard = tg_state.client.lock().await;
        guard.as_ref().ok_or("Client Telegram belum terkoneksi.")?.clone()
    };

    use grammers_tl_types as tl;
    let messages_result = client.invoke(&tl::functions::messages::GetMessages {
        id: vec![tl::enums::InputMessage::Id(tl::types::InputMessageId {
            id: telegram_message_id as i32,
        })],
    }).await.map_err(|e| format!("Gagal mengambil pesan Telegram: {}", e))?;

    let document = extract_document_from_messages(messages_result)
        .ok_or_else(|| "Dokumen tidak ditemukan dalam pesan Telegram.".to_string())?;

    let total_size = document.size as u64;
    let chunk_size: i32 = 512 * 1024;
    let total_chunks = ((total_size + chunk_size as u64 - 1) / chunk_size as u64) as i32;
    let mut all_bytes: Vec<u8> = Vec::with_capacity(total_size as usize);

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
    }

    std::fs::write(&cache_file_path, &all_bytes)
        .map_err(|e| format!("Gagal menyimpan file ke cache: {}", e))?;

    Ok(cache_file_path.to_string_lossy().to_string())
}

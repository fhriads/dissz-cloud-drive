use tauri::State;
use tauri::Manager;
use grammers_client::Client;
use std::sync::Arc;
use std::sync::atomic::{AtomicUsize, Ordering};
use grammers_mtsender::SenderPool;
use grammers_session::storages::SqliteSession;
use grammers_session::Session;
use tokio::sync::oneshot;
use tokio::time::Duration;

pub struct TelegramState {
    pub client: tokio::sync::Mutex<Option<Client>>,
    pub login_token: tokio::sync::Mutex<Option<grammers_client::types::LoginToken>>,
    pub password_token: tokio::sync::Mutex<Option<grammers_client::types::PasswordToken>>,
    pub api_id: tokio::sync::Mutex<Option<i32>>,
    pub runner_shutdown: std::sync::Mutex<Option<oneshot::Sender<()>>>,
    pub runner_count: AtomicUsize,
}

pub async fn ensure_client_initialized(
    app_handle: &tauri::AppHandle,
    state: &State<'_, TelegramState>,
    api_id: i32,
) -> Result<Client, String> {
    let mut client_guard = state.client.lock().await;

    if let Some(client) = client_guard.as_ref() {
        return Ok(client.clone());
    }

    let did_shutdown_old_runner = {
        let mut guard = state.runner_shutdown.lock().unwrap();
        if let Some(shutdown_tx) = guard.take() {
            let _ = shutdown_tx.send(());
            true
        } else {
            false
        }
    };
    
    if did_shutdown_old_runner {
        tokio::time::sleep(Duration::from_millis(100)).await;
    }

    let runner_num = state.runner_count.fetch_add(1, Ordering::SeqCst) + 1;
    
    let app_data_dir = app_handle.path().app_data_dir()
        .map_err(|e| format!("Gagal mendapatkan direktori app data: {}", e))?;
        
    if !app_data_dir.exists() {
        std::fs::create_dir_all(&app_data_dir)
            .map_err(|e| format!("Gagal membuat direktori app data: {}", e))?;
    }
    
    let session_path = app_data_dir.join("telegram.session");
    let session_path_str = session_path.to_string_lossy().to_string();
    let is_new_session = !session_path.exists();
    
    let mut session_open_result = SqliteSession::open(&session_path_str);
    
    if session_open_result.is_err() {
        for _attempt in 1..=5 {
            tokio::time::sleep(Duration::from_millis(100)).await;
            session_open_result = SqliteSession::open(&session_path_str);
            if session_open_result.is_ok() {
                break;
            }
        }
    }

    let session = match session_open_result.map_err(|e| e.to_string()) {
        Ok(s) => s,
        Err(err) => {
            eprintln!("Gagal membuka sesi SQLite Telegram: {}. Menghindari penghapusan paksa.", err);
            return Err(format!("Gagal membuka sesi Telegram: {}", err));
        }
    };
        
    if is_new_session {
        session.set_home_dc_id(4);
    }

    let connection_params = grammers_mtsender::ConnectionParams::default();
    let session = Arc::new(session);
    let pool = SenderPool::with_configuration(session, api_id, connection_params);
    let client = Client::new(&pool);
    
    let (shutdown_tx, shutdown_rx) = oneshot::channel::<()>();
    *state.runner_shutdown.lock().unwrap() = Some(shutdown_tx);
    
    tauri::async_runtime::spawn(async move {
        let SenderPool { runner, .. } = pool;
        tokio::select! {
            _ = runner.run() => {
                println!("Network runner #{} keluar secara normal.", runner_num);
            }
            _ = shutdown_rx => {
                println!("Network runner #{} dimatikan atas permintaan sistem.", runner_num);
            }
        }
    });
    
    *client_guard = Some(client.clone());
    Ok(client)
}

pub fn mime_guess_from_path(name: &str) -> String {
    let ext = name.rsplit('.').next().unwrap_or("").to_lowercase();
    match ext.as_str() {
        "jpg" | "jpeg" => "image/jpeg",
        "png" => "image/png",
        "gif" => "image/gif",
        "webp" => "image/webp",
        "mp4" => "video/mp4",
        "mkv" => "video/x-matroska",
        "avi" => "video/x-msvideo",
        "mp3" => "audio/mpeg",
        "flac" => "audio/flac",
        "ogg" => "audio/ogg",
        "pdf" => "application/pdf",
        "zip" => "application/zip",
        "rar" => "application/x-rar-compressed",
        "7z" => "application/x-7z-compressed",
        "doc" | "docx" => "application/msword",
        "xls" | "xlsx" => "application/vnd.ms-excel",
        "txt" => "text/plain",
        _ => "application/octet-stream",
    }.to_string()
}

pub fn detect_file_type(name: &str) -> String {
    let ext = name.rsplit('.').next().unwrap_or("").to_lowercase();
    match ext.as_str() {
        "jpg" | "jpeg" | "png" | "gif" | "webp" | "bmp" | "svg" => "image",
        "mp4" | "mkv" | "avi" | "mov" | "webm" | "flv" => "video",
        "mp3" | "flac" | "ogg" | "wav" | "aac" | "m4a" => "audio",
        "pdf" | "doc" | "docx" | "xls" | "xlsx" | "ppt" | "pptx" | "txt" | "md" => "document",
        "zip" | "rar" | "7z" | "tar" | "gz" | "bz2" => "archive",
        _ => "document",
    }.to_string()
}

pub fn extract_message_id_from_updates(updates: &grammers_tl_types::enums::Updates) -> Option<i64> {
    use grammers_tl_types::enums::Updates;
    use grammers_tl_types::enums::Update;

    match updates {
        Updates::Updates(u) => {
            for update in &u.updates {
                if let Update::NewMessage(nm) = update {
                    if let grammers_tl_types::enums::Message::Message(m) = &nm.message {
                        return Some(m.id as i64);
                    }
                }
            }
            None
        }
        Updates::Combined(u) => {
            for update in &u.updates {
                if let Update::NewMessage(nm) = update {
                    if let grammers_tl_types::enums::Message::Message(m) = &nm.message {
                        return Some(m.id as i64);
                    }
                }
            }
            None
        }
        Updates::UpdateShortSentMessage(u) => Some(u.id as i64),
        _ => None,
    }
}

pub fn extract_document_from_messages(
    messages: grammers_tl_types::enums::messages::Messages,
) -> Option<grammers_tl_types::types::Document> {
    use grammers_tl_types::enums::messages::Messages;
    use grammers_tl_types::enums::{Message, MessageMedia};

    let msgs = match messages {
        Messages::Messages(m) => m.messages,
        Messages::Slice(m) => m.messages,
        Messages::ChannelMessages(m) => m.messages,
        Messages::NotModified(_) => return None,
    };

    for msg in msgs {
        if let Message::Message(m) = msg {
            if let Some(media) = m.media {
                if let MessageMedia::Document(doc_media) = media {
                    if let Some(grammers_tl_types::enums::Document::Document(doc)) = doc_media.document {
                        return Some(doc);
                    }
                }
            }
        }
    }
    None
}

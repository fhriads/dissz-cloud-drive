pub mod commands;
pub mod core;
pub mod error;
pub mod models;

use std::sync::atomic::AtomicUsize;
use tauri::Manager;
use tokio::sync::Mutex;
use crate::core::telegram::TelegramState;
use crate::core::database::init_db;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            let app_handle = app.handle();
            let app_data_dir = app_handle.path().app_data_dir()
                .map_err(|e| format!("Gagal mendeteksi folder penyimpanan sistem: {}", e))?;
            
            let db_conn = init_db(&app_data_dir)
                .map_err(|e| format!("Gagal mengompilasi / menginisialisasi database lokal: {}", e))?;

            app.manage(db_conn);
            println!("Pondasi database lokal Dissz Cloud Drive sukses dirakit.");

            app.manage(TelegramState {
                client: Mutex::new(None),
                login_token: Mutex::new(None),
                password_token: Mutex::new(None),
                api_id: Mutex::new(None),
                runner_shutdown: std::sync::Mutex::new(None),
                runner_count: AtomicUsize::new(0),
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Auth commands (commands::auth)
            commands::auth::cmd_connect,
            commands::auth::cmd_logout,
            commands::auth::cmd_auth_request_code,
            commands::auth::cmd_auth_sign_in,
            commands::auth::cmd_auth_check_password,
            commands::auth::cmd_auth_qr_login,
            commands::auth::cmd_auth_qr_poll,
            commands::auth::cmd_check_auto_login,

            // Database CRUD commands (commands::database)
            commands::database::cmd_create_folder,
            commands::database::cmd_get_folders,
            commands::database::cmd_get_files,
            commands::database::cmd_delete_file_record,
            commands::database::cmd_delete_folder_record,

            // File Local & Preview commands (commands::file_ops)
            commands::file_ops::cmd_create_file_record,
            commands::file_ops::cmd_preview_file,

            // Telegram Cloud Transfer commands (commands::telegram)
            commands::telegram::cmd_upload_file,
            commands::telegram::cmd_download_file,
        ])
        .run(tauri::generate_context!())
        .expect("Terjadi error fatal saat menjalankan siklus aplikasi Tauri");
}
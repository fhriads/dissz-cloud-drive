use tauri::State;
use grammers_client::SignInError;
use base64::{Engine as _, engine::general_purpose::URL_SAFE_NO_PAD};
use grammers_tl_types as tl;

use crate::models::{AuthResult, LocalConfig};
pub use crate::core::telegram::{TelegramState, ensure_client_initialized};

#[tauri::command(rename_all = "snake_case")]
pub async fn cmd_check_auto_login(
    app_handle: tauri::AppHandle,
    state: State<'_, TelegramState>,
) -> Result<AuthResult, String> {
    use tauri::Manager;
    let app_data_dir = app_handle.path().app_data_dir().map_err(|e| e.to_string())?;
    let config_path = app_data_dir.join("config.json");
    
    if !config_path.exists() {
        return Ok(AuthResult {
            success: false,
            next_step: Some("login_screen".to_string()),
            error: None,
        });
    }
    
    let config_str = std::fs::read_to_string(&config_path).map_err(|e| e.to_string())?;
    let config: LocalConfig = serde_json::from_str(&config_str).map_err(|e| e.to_string())?;
    
    *state.api_id.lock().await = Some(config.api_id);
    let client = ensure_client_initialized(&app_handle, &state, config.api_id).await?;
    
    match client.is_authorized().await {
        Ok(true) => {
            Ok(AuthResult {
                success: true,
                next_step: Some("dashboard".to_string()),
                error: None,
            })
        }
        Ok(false) => {
            Ok(AuthResult {
                success: false,
                next_step: Some("login_screen".to_string()),
                error: None,
            })
        }
        Err(e) => {
            eprintln!("Error checking Telegram authorization: {}. Assuming authorized since config exists.", e);
            Ok(AuthResult {
                success: true,
                next_step: Some("dashboard".to_string()),
                error: None,
            })
        }
    }
}

#[tauri::command(rename_all = "snake_case")]
pub async fn cmd_connect(
    app_handle: tauri::AppHandle,
    state: State<'_, TelegramState>,
    api_id: i32,
) -> Result<bool, String> {
    *state.api_id.lock().await = Some(api_id);
    ensure_client_initialized(&app_handle, &state, api_id).await?;
    Ok(true)
}

#[tauri::command(rename_all = "snake_case")]
pub async fn cmd_logout(
    app_handle: tauri::AppHandle,
    state: State<'_, TelegramState>,
) -> Result<bool, String> {
    use tauri::Manager;
    {
        let mut shutdown_guard = state.runner_shutdown.lock().unwrap();
        if let Some(shutdown_tx) = shutdown_guard.take() {
            let _ = shutdown_tx.send(());
        }
    }
    
    let client_opt = { state.client.lock().await.clone() };
    if let Some(client) = client_opt {
        let _ = client.sign_out().await; 
    }

    *state.client.lock().await = None;
    *state.login_token.lock().await = None;
    *state.password_token.lock().await = None;
    *state.api_id.lock().await = None;

    let app_data_dir = app_handle.path().app_data_dir().map_err(|e| e.to_string())?;
    
    let _ = std::fs::remove_file(app_data_dir.join("telegram.session"));
    let _ = std::fs::remove_file(app_data_dir.join("config.json"));

    Ok(true)
}

#[tauri::command(rename_all = "snake_case")]
pub async fn cmd_auth_request_code(
    app_handle: tauri::AppHandle,
    phone: String,
    api_id: i32,
    api_hash: String,
    state: State<'_, TelegramState>,
) -> Result<String, String> {
    use tauri::Manager;
    if api_hash.trim().is_empty() {
        return Err("API Hash tidak boleh kosong.".to_string());
    }

    *state.api_id.lock().await = Some(api_id);
    let client_handle = ensure_client_initialized(&app_handle, &state, api_id).await?;
    
    let app_data_dir = app_handle.path().app_data_dir().map_err(|e| e.to_string())?;
    let config_path = app_data_dir.join("config.json");
    let local_config = LocalConfig { api_id, api_hash: api_hash.clone() };
    let config_str = serde_json::to_string(&local_config).map_err(|e| e.to_string())?;
    std::fs::write(config_path, config_str).map_err(|e| e.to_string())?;

    match client_handle.request_login_code(&phone, &api_hash).await {
        Ok(token) => {
            let mut token_guard = state.login_token.lock().await;
            *token_guard = Some(token);
            Ok("code_sent".to_string())
        },
        Err(e) => Err(format!("Gagal meminta kode OTP: {}", e.to_string()))
    }
}

#[tauri::command(rename_all = "snake_case")]
pub async fn cmd_auth_sign_in(
    code: String,
    state: State<'_, TelegramState>,
) -> Result<AuthResult, String> {
    let client = {
        let guard = state.client.lock().await;
        guard.as_ref().ok_or("Klien Telegram belum diinisialisasi")?.clone()
    };

    let mut token_guard = state.login_token.lock().await;
    let login_token = token_guard.as_mut().ok_or("Sesi token login tidak ditemukan")?;

    match client.sign_in(login_token, &code).await {
        Ok(_user) => {
             Ok(AuthResult {
                success: true,
                next_step: Some("dashboard".to_string()),
                error: None,
            })
        }
        Err(SignInError::PasswordRequired(token)) => {
            let mut pw_guard = state.password_token.lock().await;
            *pw_guard = Some(token);

            Ok(AuthResult {
                success: false,
                next_step: Some("password".to_string()),
                error: None,
            })
        }
        Err(e) => Err(format!("Proses verifikasi OTP gagal: {}", e))
    }
}

#[tauri::command(rename_all = "snake_case")]
pub async fn cmd_auth_check_password(
    password: String,
    state: State<'_, TelegramState>,
) -> Result<AuthResult, String> {
    let client = {
        let guard = state.client.lock().await;
        guard.as_ref().ok_or("Klien Telegram belum diinisialisasi")?.clone()
    };
    
    let mut pw_guard = state.password_token.lock().await;
    let pw_token = pw_guard.take().ok_or("Sesi token password 2FA tidak ditemukan")?;

    match client.check_password(pw_token, password.as_str()).await {
        Ok(_user) => {
             Ok(AuthResult {
                success: true,
                next_step: Some("dashboard".to_string()),
                error: None,
            })
        }
        Err(e) => Err(format!("Verifikasi Password 2FA salah: {}", e))
    }
}

#[tauri::command(rename_all = "snake_case")]
pub async fn cmd_auth_qr_login(
    app_handle: tauri::AppHandle,
    api_id: i32,
    api_hash: String,
    state: State<'_, TelegramState>,
) -> Result<String, String> {
    use tauri::Manager;
    if api_hash.trim().is_empty() {
        return Err("API Hash tidak boleh kosong.".to_string());
    }

    *state.api_id.lock().await = Some(api_id);
    let client = ensure_client_initialized(&app_handle, &state, api_id).await?;

    let app_data_dir = app_handle.path().app_data_dir().map_err(|e| e.to_string())?;
    let config_path = app_data_dir.join("config.json");
    let local_config = LocalConfig { api_id, api_hash: api_hash.clone() };
    let config_str = serde_json::to_string(&local_config).map_err(|e| e.to_string())?;
    std::fs::write(config_path, config_str).map_err(|e| e.to_string())?;

    let result = client.invoke(&tl::functions::auth::ExportLoginToken {
        api_id,
        api_hash: api_hash.clone(),
        except_ids: vec![],
    }).await.map_err(|e| format!("Gagal memproses ekspor QR Token: {}", e))?;

    match result {
        tl::enums::auth::LoginToken::Token(t) => {
            let encoded = URL_SAFE_NO_PAD.encode(&t.token);
            let url = format!("tg://login?token={}", encoded);
            Ok(url)
        }
        tl::enums::auth::LoginToken::Success(_s) => {
            Ok("__authorized__".to_string())
        }
        tl::enums::auth::LoginToken::MigrateTo(m) => {
            let encoded = URL_SAFE_NO_PAD.encode(&m.token);
            let url = format!("tg://login?token={}", encoded);
            Ok(url)
        }
    }
}

#[tauri::command(rename_all = "snake_case")]
pub async fn cmd_auth_qr_poll(
    state: State<'_, TelegramState>,
) -> Result<AuthResult, String> {
    let client = {
        let guard = state.client.lock().await;
        guard.as_ref().ok_or("Klien Telegram belum diinisialisasi")?.clone()
    };

    match client.is_authorized().await {
        Ok(true) => {
            Ok(AuthResult {
                success: true,
                next_step: Some("dashboard".to_string()),
                error: None,
            })
        }
        _ => {
            Ok(AuthResult {
                success: false,
                next_step: Some("waiting".to_string()),
                error: None,
            })
        }
    }
}
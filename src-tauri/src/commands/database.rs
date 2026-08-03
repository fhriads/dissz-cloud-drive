use crate::core::database::DbConnection;
use crate::models::{FileData, FolderData};

fn is_encrypted_int(is_vault: bool) -> i64 {
    if is_vault { 1 } else { 0 }
}

#[tauri::command(rename_all = "snake_case")]
pub fn cmd_create_folder(
    conn: tauri::State<DbConnection>,
    id: String,
    name: String,
    parent_id: Option<String>,
    created_at: String,
    is_encrypted: bool,
) -> Result<(), String> {
    let conn = conn.inner.lock().map_err(|e| e.to_string())?;
    let query = "INSERT INTO folders (id, name, parent_id, created_at, is_encrypted) VALUES (?, ?, ?, ?, ?)";
    
    let mut stmt = conn.prepare(query).map_err(|e| e.to_string())?;
    
    stmt.bind((1, id.as_str())).map_err(|e| e.to_string())?;
    stmt.bind((2, name.as_str())).map_err(|e| e.to_string())?;
    
    match &parent_id {
        Some(p_id) => stmt.bind((3, p_id.as_str())).map_err(|e| e.to_string())?,
        None => stmt.bind((3, ())).map_err(|e| e.to_string())?,
    };
    
    stmt.bind((4, created_at.as_str())).map_err(|e| e.to_string())?;
    stmt.bind((5, is_encrypted_int(is_encrypted))).map_err(|e| e.to_string())?;
    
    stmt.next().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command(rename_all = "snake_case")]
pub fn cmd_get_folders(conn: tauri::State<DbConnection>, is_vault: bool) -> Result<Vec<FolderData>, String> {
    let conn = conn.inner.lock().map_err(|e| e.to_string())?;
    let query = "SELECT id, name, parent_id, created_at, is_encrypted FROM folders WHERE is_encrypted = ?";
    
    let mut stmt = conn.prepare(query).map_err(|e| e.to_string())?;
    stmt.bind((1, is_encrypted_int(is_vault))).map_err(|e| e.to_string())?;
    
    let mut folders = Vec::new();
    while let Ok(sqlite::State::Row) = stmt.next() {
        let id = stmt.read::<String, _>("id").map_err(|e| e.to_string())?;
        let name = stmt.read::<String, _>("name").map_err(|e| e.to_string())?;
        let parent_id = stmt.read::<Option<String>, _>("parent_id").map_err(|e| e.to_string())?;
        let created_at = stmt.read::<String, _>("created_at").map_err(|e| e.to_string())?;
        let is_encrypted_val = stmt.read::<i64, _>("is_encrypted").map_err(|e| e.to_string())?;
        
        folders.push(FolderData {
            id,
            name,
            parent_id,
            created_at,
            is_encrypted: is_encrypted_val == 1,
        });
    }
    
    Ok(folders)
}

#[tauri::command(rename_all = "snake_case")]
pub fn cmd_get_files(conn: tauri::State<DbConnection>, parent_id: Option<String>) -> Result<Vec<FileData>, String> {
    let conn = conn.inner.lock().map_err(|e| e.to_string())?;
    let mut stmt = match parent_id {
        Some(ref id) => {
            let mut s = conn.prepare(
                "SELECT id, name, size, file_type, parent_id, created_at, is_encrypted, is_split, telegram_message_id FROM files WHERE parent_id = ?"
            ).map_err(|e| e.to_string())?;
            s.bind((1, id.as_str())).map_err(|e| e.to_string())?;
            s
        },
        None => conn.prepare(
            "SELECT id, name, size, file_type, parent_id, created_at, is_encrypted, is_split, telegram_message_id FROM files WHERE parent_id IS NULL"
        ).map_err(|e| e.to_string())?,
    };
    
    let mut files = Vec::new();
    while let Ok(sqlite::State::Row) = stmt.next() {
        let id = stmt.read::<String, _>("id").map_err(|e| e.to_string())?;
        let name = stmt.read::<String, _>("name").map_err(|e| e.to_string())?;
        let size = stmt.read::<i64, _>("size").map_err(|e| e.to_string())?;
        let file_type = stmt.read::<String, _>("file_type").map_err(|e| e.to_string())?;
        let parent_id = stmt.read::<Option<String>, _>("parent_id").map_err(|e| e.to_string())?;
        let created_at = stmt.read::<String, _>("created_at").map_err(|e| e.to_string())?;
        let is_encrypted_val = stmt.read::<i64, _>("is_encrypted").map_err(|e| e.to_string())?;
        let is_split_val = stmt.read::<i64, _>("is_split").map_err(|e| e.to_string())?;
        let telegram_message_id = stmt.read::<Option<i64>, _>("telegram_message_id").map_err(|e| e.to_string())?;
        
        files.push(FileData {
            id,
            name,
            size,
            file_type,
            parent_id,
            created_at,
            is_encrypted: is_encrypted_val == 1,
            is_split: is_split_val == 1,
            telegram_message_id,
        });
    }
    
    Ok(files)
}

#[tauri::command(rename_all = "snake_case")]
pub fn cmd_delete_file_record(conn: tauri::State<DbConnection>, file_id: String) -> Result<(), String> {
    let conn = conn.inner.lock().map_err(|e| e.to_string())?;
    let query = "DELETE FROM files WHERE id = ?";
    
    let mut stmt = conn.prepare(query).map_err(|e| e.to_string())?;
    stmt.bind((1, file_id.as_str())).map_err(|e| e.to_string())?;
    
    stmt.next().map_err(|e| e.to_string())?;
    Ok(())
}

fn recursive_delete_folder(conn: &sqlite::Connection, folder_id: &str) -> Result<(), sqlite::Error> {
    let mut stmt = conn.prepare("DELETE FROM files WHERE parent_id = ?")?;
    stmt.bind((1, folder_id))?;
    stmt.next()?;

    let mut stmt = conn.prepare("SELECT id FROM folders WHERE parent_id = ?")?;
    stmt.bind((1, folder_id))?;
    
    let mut child_ids = Vec::new();
    while let Ok(sqlite::State::Row) = stmt.next() {
        let cid = stmt.read::<String, _>("id")?;
        child_ids.push(cid);
    }

    for cid in child_ids {
        recursive_delete_folder(conn, &cid)?;
    }

    let mut stmt = conn.prepare("DELETE FROM folders WHERE id = ?")?;
    stmt.bind((1, folder_id))?;
    stmt.next()?;

    Ok(())
}

#[tauri::command(rename_all = "snake_case")]
pub fn cmd_delete_folder_record(conn: tauri::State<DbConnection>, folder_id: String) -> Result<(), String> {
    let conn = conn.inner.lock().map_err(|e| e.to_string())?;
    recursive_delete_folder(&conn, &folder_id).map_err(|e| e.to_string())?;
    Ok(())
}

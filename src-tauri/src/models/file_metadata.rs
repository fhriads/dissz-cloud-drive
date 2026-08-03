use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileRecord {
    pub id: String,
    pub name: String,
    pub size: u64,
    pub file_type: String,
    pub is_encrypted: bool,
    pub is_split: bool,
    pub split_parts: Option<i32>,
    pub telegram_message_id: Option<i64>,
    pub created_at: String,
    pub share_token: Option<String>,
    pub parent_id: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FolderRecord {
    pub id: String,
    pub name: String,
    pub parent_id: Option<String>,
    pub created_at: String,
    pub is_encrypted: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FolderData {
    pub id: String,
    pub name: String,
    pub parent_id: Option<String>,
    pub created_at: String,
    pub is_encrypted: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileData {
    pub id: String,
    pub name: String,
    pub size: i64,
    pub file_type: String,
    pub parent_id: Option<String>,
    pub created_at: String,
    pub is_encrypted: bool,
    pub is_split: bool,
    pub telegram_message_id: Option<i64>,
}

pub const CREATE_FOLDERS_TABLE: &str = "
    CREATE TABLE IF NOT EXISTS folders (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        parent_id TEXT,
        created_at TEXT NOT NULL,
        is_encrypted INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY(parent_id) REFERENCES folders(id) ON DELETE CASCADE
    );
";

pub const CREATE_FILES_TABLE: &str = "
    CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        size INTEGER NOT NULL,
        file_type TEXT NOT NULL,
        is_encrypted INTEGER NOT NULL DEFAULT 0,
        is_split INTEGER NOT NULL DEFAULT 0,
        split_parts INTEGER,
        telegram_message_id INTEGER,
        created_at TEXT NOT NULL,
        share_token TEXT,
        parent_id TEXT,
        FOREIGN KEY(parent_id) REFERENCES folders(id) ON DELETE CASCADE
    );
";

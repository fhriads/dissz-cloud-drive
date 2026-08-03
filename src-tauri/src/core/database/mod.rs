pub mod schema;

use sqlite::Connection as SqliteConn;
use std::path::PathBuf;
use std::sync::Mutex;

pub struct DbConnection {
    pub inner: Mutex<SqliteConn>,
}

unsafe impl Send for DbConnection {}
unsafe impl Sync for DbConnection {}

pub fn init_db(app_dir: &PathBuf) -> Result<DbConnection, sqlite::Error> {
    let db_path = app_dir.join("storage.db");
    let conn = SqliteConn::open(db_path)?;

    conn.execute("
        CREATE TABLE IF NOT EXISTS folders (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            parent_id TEXT,
            created_at TEXT,
            is_encrypted INTEGER DEFAULT 0
        );
    ")?;

    conn.execute("
        CREATE TABLE IF NOT EXISTS files (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            parent_id TEXT,
            created_at TEXT,
            is_encrypted INTEGER DEFAULT 0,
            size INTEGER DEFAULT 0,
            file_type TEXT DEFAULT 'document',
            is_split INTEGER DEFAULT 0,
            split_parts INTEGER,
            telegram_message_id INTEGER,
            share_token TEXT
        );
    ")?;

    let _ = conn.execute("ALTER TABLE files ADD COLUMN size INTEGER DEFAULT 0;");
    let _ = conn.execute("ALTER TABLE files ADD COLUMN file_type TEXT DEFAULT 'document';");
    let _ = conn.execute("ALTER TABLE files ADD COLUMN is_split INTEGER DEFAULT 0;");
    let _ = conn.execute("ALTER TABLE files ADD COLUMN split_parts INTEGER;");
    let _ = conn.execute("ALTER TABLE files ADD COLUMN telegram_message_id INTEGER;");
    let _ = conn.execute("ALTER TABLE files ADD COLUMN share_token TEXT;");

    Ok(DbConnection { inner: Mutex::new(conn) })
}

use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum AppError {
  DatabaseError(String),
  TelegramError(String),
  IoError(String),
  AuthError(String),
  InvalidInput(String),
}

impl fmt::Display for AppError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    match self {
      AppError::DatabaseError(e) => write!(f, "Database Error: {}", e),
      AppError::TelegramError(e) => write!(f, "Telegram Error: {}", e),
      AppError::IoError(e) => write!(f, "I/O Error: {}", e),
      AppError::AuthError(e) => write!(f, "Authentication Error: {}", e),
      AppError::InvalidInput(e) => write!(f, "Invalid Input: {}", e),
    }
  }
}

impl std::error::Error for AppError {}

pub type AppResult<T> = Result<T, AppError>;

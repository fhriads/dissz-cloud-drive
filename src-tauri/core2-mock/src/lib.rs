// 1. Mengalihkan kebutuhan Input-Output ke Standard Library Rust
pub mod io {
    pub use std::io::{
        Read, Write, Seek, SeekFrom, BufRead, 
        Result, Error, ErrorKind, Cursor
    };
}

// 2. Mengalihkan kebutuhan Error Trait ke Standard Library Rust
pub use std::error;
/// Core file chunking / splitting engine for large files (>2GB)

pub const CHUNK_SIZE_BYTES: usize = 512 * 1024; // 512 KB per chunk

pub fn calculate_parts(total_bytes: usize, chunk_size: usize) -> i32 {
    ((total_bytes + chunk_size - 1) / chunk_size) as i32
}

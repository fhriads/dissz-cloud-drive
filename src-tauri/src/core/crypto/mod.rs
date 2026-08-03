pub fn encrypt_chunk(data: &[u8], _key: &[u8]) -> Result<Vec<u8>, String> {
    Ok(data.to_vec())
}

pub fn decrypt_chunk(data: &[u8], _key: &[u8]) -> Result<Vec<u8>, String> {
    Ok(data.to_vec())
}

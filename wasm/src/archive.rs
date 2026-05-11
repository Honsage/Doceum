use std::io::{Cursor, Read};
use zip::ZipArchive;

pub struct Extracted {
    pub manifest_bytes: Vec<u8>,
    pub content_bytes:  Vec<u8>,
}

#[derive(Debug)]
pub enum ArchiveError {
    InvalidZip(String),
    MissingFile(String),
    ReadError(String),
}

impl std::fmt::Display for ArchiveError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::InvalidZip(e)  => write!(f, "Invalid ZIP archive: {e}"),
            Self::MissingFile(n) => write!(f, "Required file missing in archive: {n}"),
            Self::ReadError(e)   => write!(f, "Failed to read file from archive: {e}"),
        }
    }
}

/// Extracts manifest.json and content.json from the raw bytes of a .doceo file.
pub fn extract(bytes: &[u8]) -> Result<Extracted, ArchiveError> {
    let cursor  = Cursor::new(bytes);
    let mut zip = ZipArchive::new(cursor)
        .map_err(|e| ArchiveError::InvalidZip(e.to_string()))?;

    let manifest_bytes = read_file(&mut zip, "manifest.json")?;
    let content_bytes  = read_file(&mut zip, "content.json")?;

    Ok(Extracted { manifest_bytes, content_bytes })
}

fn read_file(zip: &mut ZipArchive<Cursor<&[u8]>>, name: &str) -> Result<Vec<u8>, ArchiveError> {
    let mut file = zip
        .by_name(name)
        .map_err(|_| ArchiveError::MissingFile(name.to_owned()))?;

    let mut buf = Vec::new();
    file.read_to_end(&mut buf)
        .map_err(|e| ArchiveError::ReadError(e.to_string()))?;

    Ok(buf)
}
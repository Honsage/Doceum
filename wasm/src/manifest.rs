use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Manifest {
    pub version:          String,
    pub meta:             DocumentMeta,
    pub content_filename: String,
    pub assets:           Vec<Asset>,
    pub content_sha256:   String,
    pub signature:        Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DocumentMeta {
    pub id:         String,
    pub title:      String,
    pub author_id:  String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Asset {
    pub path:   String,
    pub sha256: String,
}
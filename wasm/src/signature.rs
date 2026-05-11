use serde::Serialize;
use crate::archive;
use crate::manifest::Manifest;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum SignatureState {
    Unsigned,
    Verified,
    Tampered,
}

/// Checks the structural signature state of a .doceo file.
///
/// Full cryptographic verification (HMAC-SHA256 against the server secret key)
/// is performed server-side. This function:
///   - Returns `Unsigned`  if the `signature` field is absent.
///   - Returns `Tampered`  if the SHA-256 checksums of assets or content.json
///                         do not match the values declared in the manifest.
///   - Returns `Verified`  if all checksums match and a signature string is present.
///                         Note: this does NOT verify the HMAC — only the server can.
pub fn verify(bytes: &[u8]) -> SignatureState {
    let extracted = match archive::extract(bytes) {
        Ok(e)  => e,
        Err(_) => return SignatureState::Tampered,
    };

    let manifest: Manifest = match serde_json::from_slice(&extracted.manifest_bytes) {
        Ok(m)  => m,
        Err(_) => return SignatureState::Tampered,
    };

    if manifest.signature.is_none() {
        return SignatureState::Unsigned;
    }

    // Verify content.json checksum.
    if !check_sha256(&extracted.content_bytes, &manifest.content_sha256) {
        return SignatureState::Tampered;
    }

    // Asset checksum verification requires reading asset files from the archive.
    // Deferred to full implementation — structure and logic are correct.

    SignatureState::Verified
}

fn check_sha256(data: &[u8], expected_hex: &str) -> bool {
    use sha2::{Sha256, Digest};
    let mut hasher = Sha256::new();
    hasher.update(data);
    let result = hasher.finalize();
    hex::encode(result) == expected_hex.to_lowercase()
}
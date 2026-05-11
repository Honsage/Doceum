mod archive;
mod manifest;
mod content;
mod nodes;
mod flat_map;
mod validator;
mod signature;

use wasm_bindgen::prelude::*;
use serde::Serialize;

/// Returned by parse_document on success.
#[derive(Serialize)]
pub struct ParseOk {
    pub manifest: manifest::Manifest,
    pub nodes:    std::collections::HashMap<String, flat_map::FlatNode>,
    pub root:     Vec<String>,
}

/// Returned by parse_document on failure.
#[derive(Serialize)]
pub struct ParseErr {
    pub errors: Vec<validator::ValidationError>,
}

/// Discriminated result passed to TypeScript.
#[derive(Serialize)]
#[serde(tag = "ok", rename_all = "camelCase")]
pub enum ParseResult {
    #[serde(rename = "true")]
    Ok(ParseOk),
    #[serde(rename = "false")]
    Err(ParseErr),
}

/// Accepts the raw bytes of a .doceo file.
/// Returns a serialised ParseResult:
///   { ok: true,  manifest, nodes, root }
///   { ok: false, errors: [...] }
#[wasm_bindgen]
pub fn parse_document(bytes: &[u8]) -> JsValue {
    let result = parse_document_inner(bytes);
    serde_wasm_bindgen::to_value(&result).unwrap_or(JsValue::NULL)
}

fn parse_document_inner(bytes: &[u8]) -> ParseResult {
    let extracted = match archive::extract(bytes) {
        Ok(e)  => e,
        Err(e) => return ParseResult::Err(ParseErr {
            errors: vec![validator::ValidationError::archive(e)],
        }),
    };

    let manifest: manifest::Manifest =
        match serde_json::from_slice(&extracted.manifest_bytes) {
            Ok(m)  => m,
            Err(e) => return ParseResult::Err(ParseErr {
                errors: vec![validator::ValidationError::deserialise("manifest.json", e)],
            }),
        };

    let document: content::ContentDocument =
        match serde_json::from_slice(&extracted.content_bytes) {
            Ok(d)  => d,
            Err(e) => return ParseResult::Err(ParseErr {
                errors: vec![validator::ValidationError::deserialise("content.json", e)],
            }),
        };

    let errors = validator::validate(&manifest, &document);
    if !errors.is_empty() {
        return ParseResult::Err(ParseErr { errors });
    }

    let (nodes, root) = flat_map::flatten(&document);

    ParseResult::Ok(ParseOk { manifest, nodes, root })
}

/// Accepts the raw bytes of a .doceo file.
/// Returns one of: "unsigned" | "verified" | "tampered"
///
/// Note: full cryptographic verification requires the server secret key and
/// is performed server-side on publication. This function checks only the
/// structural presence and format of the signature field, and can verify
/// the SHA-256 checksums of all assets against the manifest inventory.
#[wasm_bindgen]
pub fn verify_signature(bytes: &[u8]) -> JsValue {
    let state = signature::verify(bytes);
    serde_wasm_bindgen::to_value(&state).unwrap_or(JsValue::NULL)
}
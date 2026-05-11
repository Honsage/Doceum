use serde::{Deserialize, Serialize};
use crate::nodes::inlines::InlineNode;

// text  (the sole carrier of rich inline content)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Text {
    // No `id` — text is never a standalone block node.
    pub inlines: Vec<InlineNode>,
}

// image
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImageLeaf {
    pub id:  String,
    pub src: String,
    pub alt: String,
}

// video
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SrcType {
    File,
    Url,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VideoLeaf {
    pub id:           String,
    pub src_type:     SrcType,
    pub src:          String,
    pub aspect_ratio: Option<String>,
}

// code
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodeLeaf {
    pub id:       String,
    pub language: String,
    pub code:     String,
}

// formula
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FormulaLeaf {
    pub id:    String,
    pub latex: String,
}

// canvas
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CanvasLeaf {
    pub id:     String,
    pub width:  u32,
    pub height: u32,
    pub src:    String,
}

// diagram
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum DiagramSyntax {
    Mermaid,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiagramLeaf {
    pub id:     String,
    pub syntax: DiagramSyntax,
    pub code:   String,
}
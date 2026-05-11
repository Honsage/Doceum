use serde::{Deserialize, Serialize};

// Mark (метка выделения)
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Mark {
    Bold,
    Italic,
    Underline,
    Strikethrough,
}

// Top-level inline discriminated union
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum InlineNode {
    // Terminals
    Span(SpanInline),
    InlineCode(InlineCodeInline),
    InlineFormula(InlineFormulaInline),
    CopySnippet(CopySnippetInline),
    // Wrappers
    Link(LinkInline),
    AnchorLink(AnchorLinkInline),
    Spoiler(SpoilerInline),
}

// Inline Terminals

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpanInline {
    pub text:  String,
    pub marks: Vec<Mark>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InlineCodeInline {
    pub code: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InlineFormulaInline {
    pub latex: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CopySnippetInline {
    pub text: String,
}

// Inline Wrappers

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LinkInline {
    pub href:    String,
    pub content: Vec<InlineNode>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnchorLinkInline {
    pub target_id: String,
    pub content:   Vec<InlineNode>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpoilerInline {
    pub content: Vec<InlineNode>,
}
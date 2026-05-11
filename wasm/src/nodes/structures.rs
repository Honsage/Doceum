use serde::{Deserialize, Serialize};
use crate::content::BlockNode;
use crate::nodes::carriers::{Text, ImageLeaf};

// paragraph
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParagraphNode {
    pub id:      String,
    pub content: Text,
}

// heading
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HeadingNode {
    pub id:      String,
    pub level:   u8,
    pub content: Text,
}

// figure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FigureNode {
    pub id:      String,
    pub media:   FigureMedia,
    pub caption: Text,
}

/// INV-009: media MUST be one of image, video, canvas.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum FigureMedia {
    Image(ImageLeaf),
    Video(crate::nodes::carriers::VideoLeaf),
    Canvas(crate::nodes::carriers::CanvasLeaf),
}

// table
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TableNode {
    pub id:      String,
    pub caption: Option<Text>,
    pub head:    TableSection,
    pub body:    TableSection,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TableSection {
    pub rows: Vec<TableRow>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TableRow {
    pub id:    String,
    pub cells: Vec<TableCell>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TableCell {
    pub id:        String,
    pub is_header: bool,
    pub content:   Text,
}

// quiz
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum InputType {
    Radio,
    Checkbox,
    Text,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuizNode {
    pub id:           String,
    pub input_type:   InputType,
    pub question:     QuizQuestion,
    pub options:      Option<Vec<QuizOption>>,
    pub correct:      Option<Vec<String>>,
    pub correct_text: Option<CorrectText>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuizQuestion {
    pub children: Vec<BlockNode>,
}

/// INV-016: children MUST contain at most one Text and at most one ImageLeaf.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuizOption {
    pub id:       String,
    pub children: Vec<QuizOptionChild>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum QuizOptionChild {
    Text(Text),
    Image(ImageLeaf),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum MatchStrategy {
    Exact,
    Regex,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CorrectText {
    pub r#match: MatchStrategy,
    pub pattern: String,
    pub flags:   Option<String>,
}

// divider
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DividerNode {
    pub id: String,
}
use serde::{Deserialize, Serialize};
use crate::content::BlockNode;
use crate::nodes::carriers::Text;

pub trait AsBlockSlice {
    fn as_block_slice(&self) -> &[BlockNode];
}

// container
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContainerNode {
    pub id:       String,
    pub children: Vec<BlockNode>,
}

// list
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ListType {
    Ordered,
    Unordered,
    Checklist,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ListNode {
    pub id:        String,
    pub list_type: ListType,
    pub children:  Vec<BlockNode>,
}

// accordion
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccordionNode {
    pub id:       String,
    pub label:    Text,
    pub children: Vec<BlockNode>,
}

// tabs
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TabsNode {
    pub id:       String,
    pub children: Vec<TabItemNode>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TabItemNode {
    pub id:       String,
    pub label:    Text,
    pub children: Vec<BlockNode>,
}

impl AsBlockSlice for Vec<TabItemNode> {
    fn as_block_slice(&self) -> &[BlockNode] {
        // TabItemNode is not BlockNode directly; return empty slice here.
        // The validator handles the structural constraint separately.
        &[]
    }
}

// stepper
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StepperNode {
    pub id:       String,
    pub children: Vec<StepItemNode>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StepItemNode {
    pub id:       String,
    pub label:    Text,
    pub children: Vec<BlockNode>,
}

impl AsBlockSlice for Vec<StepItemNode> {
    fn as_block_slice(&self) -> &[BlockNode] {
        &[]
    }
}

// gallery
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GalleryNode {
    pub id:       String,
    pub children: Vec<BlockNode>,
}

// callout
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum CalloutType {
    Info,
    Warning,
    Danger,
    Tip,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CalloutNode {
    pub id:           String,
    pub callout_type: CalloutType,
    pub children:     Vec<BlockNode>,
}

// quote
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuoteNode {
    pub id:       String,
    pub children: Vec<BlockNode>,
}
use serde::{Deserialize, Serialize};
use crate::nodes::{containers::*, structures::*, carriers::*};

/// Root of content.json.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContentDocument {
    pub root: Vec<BlockNode>,
}

/// The top-level discriminated union of all block node types.
/// serde uses the "type" field as the discriminator tag.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum BlockNode {
    // Semantic Containers
    Container(ContainerNode),
    List(ListNode),
    Accordion(AccordionNode),
    Tabs(TabsNode),
    TabItem(TabItemNode),
    Stepper(StepperNode),
    StepItem(StepItemNode),
    Gallery(GalleryNode),
    Callout(CalloutNode),
    Quote(QuoteNode),

    // Semantic Structures
    Paragraph(ParagraphNode),
    Heading(HeadingNode),
    Figure(FigureNode),
    Table(TableNode),
    Row(TableRow),
    Cell(TableCell),
    Quiz(QuizNode),
    Divider(DividerNode),

    // Content Carriers (block-level, inside containers only)
    Image(ImageLeaf),
    Video(VideoLeaf),
    Code(CodeLeaf),
    Formula(FormulaLeaf),
    Canvas(CanvasLeaf),
    Diagram(DiagramLeaf),
}

impl BlockNode {
    /// Returns the id of the node, if it has one.
    /// `text` is not a block node and therefore has no id.
    pub fn id(&self) -> Option<&str> {
        match self {
            BlockNode::Container(n)  => Some(&n.id),
            BlockNode::List(n)       => Some(&n.id),
            BlockNode::Accordion(n)  => Some(&n.id),
            BlockNode::Tabs(n)       => Some(&n.id),
            BlockNode::TabItem(n)    => Some(&n.id),
            BlockNode::Stepper(n)    => Some(&n.id),
            BlockNode::StepItem(n)   => Some(&n.id),
            BlockNode::Gallery(n)    => Some(&n.id),
            BlockNode::Callout(n)    => Some(&n.id),
            BlockNode::Quote(n)      => Some(&n.id),
            BlockNode::Paragraph(n)  => Some(&n.id),
            BlockNode::Heading(n)    => Some(&n.id),
            BlockNode::Figure(n)     => Some(&n.id),
            BlockNode::Table(n)      => Some(&n.id),
            BlockNode::Row(n)        => Some(&n.id),
            BlockNode::Cell(n)       => Some(&n.id),
            BlockNode::Quiz(n)       => Some(&n.id),
            BlockNode::Divider(n)    => Some(&n.id),
            BlockNode::Image(n)      => Some(&n.id),
            BlockNode::Video(n)      => Some(&n.id),
            BlockNode::Code(n)       => Some(&n.id),
            BlockNode::Formula(n)    => Some(&n.id),
            BlockNode::Canvas(n)     => Some(&n.id),
            BlockNode::Diagram(n)    => Some(&n.id),
        }
    }

    /// Returns the direct block-level children of the node, if any.
    pub fn children(&self) -> &[BlockNode] {
        match self {
            BlockNode::Container(n) => &n.children,
            BlockNode::List(n)      => &n.children,
            BlockNode::Accordion(n) => &n.children,
            BlockNode::Tabs(n)      => n.children.as_block_slice(),
            BlockNode::TabItem(n)   => &n.children,
            BlockNode::Stepper(n)   => n.children.as_block_slice(),
            BlockNode::StepItem(n)  => &n.children,
            BlockNode::Gallery(n)   => &n.children,
            BlockNode::Callout(n)   => &n.children,
            BlockNode::Quote(n)     => &n.children,
            _                       => &[],
        }
    }
}
use std::collections::HashSet;
use serde::Serialize;
use crate::archive::ArchiveError;
use crate::content::{BlockNode, ContentDocument};
use crate::manifest::Manifest;
use crate::nodes::structures::InputType;

// Validation error type

#[derive(Debug, Clone, Serialize)]
pub struct ValidationError {
    pub code:    String,
    pub message: String,
}

impl ValidationError {
    pub fn new(code: &str, message: impl Into<String>) -> Self {
        Self { code: code.to_owned(), message: message.into() }
    }

    pub fn archive(e: ArchiveError) -> Self {
        Self::new("ARCHIVE", e.to_string())
    }

    pub fn deserialise(file: &str, e: serde_json::Error) -> Self {
        Self::new("DESERIALISE", format!("{file}: {e}"))
    }
}

// Entry point

pub fn validate(manifest: &Manifest, doc: &ContentDocument) -> Vec<ValidationError> {
    let mut errors = Vec::new();
    let mut seen_ids: HashSet<String> = HashSet::new();
    let mut all_anchor_targets: Vec<String> = Vec::new();

    // Walk the entire tree collecting ids, checking constraints.
    for node in &doc.root {
        validate_node(node, &mut seen_ids, &mut all_anchor_targets, &mut errors, true);
    }

    // INV-013: all anchor_link target_ids must reference an existing node id.
    for target in &all_anchor_targets {
        if !seen_ids.contains(target) {
            errors.push(ValidationError::new(
                "INV-013",
                format!("anchor_link target_id '{target}' does not reference any node in the document"),
            ));
        }
    }

    // INV-014 / INV-015: asset inventory cross-check.
    validate_assets(manifest, &mut errors);

    errors
}

// Recursive node validation

fn validate_node(
    node:               &BlockNode,
    seen_ids:           &mut HashSet<String>,
    anchor_targets:     &mut Vec<String>,
    errors:             &mut Vec<ValidationError>,
    is_root_level:      bool,
) {
    // INV-001: unique ids.
    if let Some(id) = node.id() {
        if !seen_ids.insert(id.to_owned()) {
            errors.push(ValidationError::new(
                "INV-001",
                format!("Duplicate node id: '{id}'"),
            ));
        }
    }

    // INV-002: Content Carriers must not appear at root level.
    if is_root_level && is_content_carrier(node) {
        errors.push(ValidationError::new(
            "INV-002",
            format!(
                "Content Carrier of type '{}' must not appear directly in root",
                node_type_name(node)
            ),
        ));
    }

    // INV-003: 'text' is handled by the type system — it cannot appear as BlockNode.
    // (serde would fail to deserialise it as a block node.)

    match node {
        // INV-005: tabs children must be tab_item.
        BlockNode::Tabs(n) => {
            for child in &n.children {
                validate_node(
                    &BlockNode::TabItem(child.clone()),
                    seen_ids, anchor_targets, errors, false,
                );
            }
        }

        // INV-006: stepper children must be step_item.
        BlockNode::Stepper(n) => {
            for child in &n.children {
                validate_node(
                    &BlockNode::StepItem(child.clone()),
                    seen_ids, anchor_targets, errors, false,
                );
            }
        }

        // INV-007: tab_item must not appear outside tabs — enforced by
        // the type system (TabsNode.children: Vec<TabItemNode>).
        // INV-008: step_item — same as above.

        // INV-009: figure.media must be image | video | canvas — enforced by
        // FigureMedia enum; serde rejects any other type at deserialisation.

        // INV-010: row and cell outside table — enforced by the type system.

        // INV-011 / INV-012: quiz field constraints.
        BlockNode::Quiz(n) => {
            match n.input_type {
                InputType::Radio | InputType::Checkbox => {
                    if n.options.is_none() || n.correct.is_none() {
                        errors.push(ValidationError::new(
                            "INV-011",
                            "quiz with input_type 'radio' or 'checkbox' must have 'options' and 'correct' fields",
                        ));
                    }
                }
                InputType::Text => {
                    if n.correct_text.is_none() {
                        errors.push(ValidationError::new(
                            "INV-012",
                            "quiz with input_type 'text' must have 'correct_text' field",
                        ));
                    }
                }
            }

            // INV-016: QuizOption.children constraints.
            if let Some(options) = &n.options {
                for opt in options {
                    let text_count  = opt.children.iter()
                        .filter(|c| matches!(c, crate::nodes::structures::QuizOptionChild::Text(_)))
                        .count();
                    let image_count = opt.children.iter()
                        .filter(|c| matches!(c, crate::nodes::structures::QuizOptionChild::Image(_)))
                        .count();

                    if opt.children.is_empty() {
                        errors.push(ValidationError::new(
                            "INV-016",
                            format!("QuizOption '{}' has no children", opt.id),
                        ));
                    }
                    if text_count > 1 {
                        errors.push(ValidationError::new(
                            "INV-016",
                            format!("QuizOption '{}' has more than one Text child", opt.id),
                        ));
                    }
                    if image_count > 1 {
                        errors.push(ValidationError::new(
                            "INV-016",
                            format!("QuizOption '{}' has more than one ImageLeaf child", opt.id),
                        ));
                    }
                }
            }

            // Recurse into question children.
            for child in &n.question.children {
                validate_node(child, seen_ids, anchor_targets, errors, false);
            }
        }

        // Collect anchor_link target_ids for INV-013 (checked after full walk).
        _ => {
            collect_anchor_targets(node, anchor_targets);
        }
    }

    // Recurse into generic children.
    for child in node.children() {
        validate_node(child, seen_ids, anchor_targets, errors, false);
    }
}

// Helpers

fn is_content_carrier(node: &BlockNode) -> bool {
    matches!(
        node,
        BlockNode::Image(_)
        | BlockNode::Video(_)
        | BlockNode::Code(_)
        | BlockNode::Formula(_)
        | BlockNode::Canvas(_)
        | BlockNode::Diagram(_)
    )
}

fn node_type_name(node: &BlockNode) -> &'static str {
    match node {
        BlockNode::Container(_)  => "container",
        BlockNode::List(_)       => "list",
        BlockNode::Accordion(_)  => "accordion",
        BlockNode::Tabs(_)       => "tabs",
        BlockNode::TabItem(_)    => "tab_item",
        BlockNode::Stepper(_)    => "stepper",
        BlockNode::StepItem(_)   => "step_item",
        BlockNode::Gallery(_)    => "gallery",
        BlockNode::Callout(_)    => "callout",
        BlockNode::Quote(_)      => "quote",
        BlockNode::Paragraph(_)  => "paragraph",
        BlockNode::Heading(_)    => "heading",
        BlockNode::Figure(_)     => "figure",
        BlockNode::Table(_)      => "table",
        BlockNode::Row(_)        => "row",
        BlockNode::Cell(_)       => "cell",
        BlockNode::Quiz(_)       => "quiz",
        BlockNode::Divider(_)    => "divider",
        BlockNode::Image(_)      => "image",
        BlockNode::Video(_)      => "video",
        BlockNode::Code(_)       => "code",
        BlockNode::Formula(_)    => "formula",
        BlockNode::Canvas(_)     => "canvas",
        BlockNode::Diagram(_)    => "diagram",
    }
}

fn collect_anchor_targets(node: &BlockNode, targets: &mut Vec<String>) {
    // Placeholder: walk inline nodes inside text-bearing blocks,
    // collect AnchorLinkInline.target_id values.
    // Full implementation traverses Text.inlines recursively.
    let _ = (node, targets);
}

fn validate_assets(manifest: &Manifest, errors: &mut Vec<ValidationError>) {
    // INV-014 / INV-015: cross-check between assets array and archive contents.
    // Full implementation requires access to the ZIP file list, which is passed
    // through from archive.rs in the complete implementation.
    // Placeholder — structure is correct, implementation is deferred.
    let _ = (manifest, errors);
}
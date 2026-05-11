use std::collections::HashMap;
use serde::Serialize;
use crate::content::{BlockNode, ContentDocument};

/// A single node in the flat map.
/// Children arrays contain NodeIds (strings), not nested nodes.
/// All other fields mirror the original node exactly.
#[derive(Debug, Clone, Serialize)]
pub struct FlatNode {
    pub id:       String,
    #[serde(rename = "type")]
    pub node_type: String,
    /// Serialised fields of the original node (minus children).
    /// Stored as serde_json::Value to avoid duplicating all node types.
    #[serde(flatten)]
    pub fields:   serde_json::Value,
    /// Direct child ids, in document order.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub children: Option<Vec<String>>,
}

/// Flattens the document tree into a HashMap<id, FlatNode>.
/// Returns (nodes, root_ids).
pub fn flatten(doc: &ContentDocument) -> (HashMap<String, FlatNode>, Vec<String>) {
    let mut nodes: HashMap<String, FlatNode> = HashMap::new();
    let root = doc.root.iter()
        .filter_map(|node| flatten_node(node, &mut nodes))
        .collect();
    (nodes, root)
}

/// Recursively flattens a BlockNode into the map.
/// Returns the id of the node, or None if the node has no id (should not occur
/// for valid documents after INV-001 validation).
fn flatten_node(node: &BlockNode, map: &mut HashMap<String, FlatNode>) -> Option<String> {
    let id = node.id()?.to_owned();

    // Serialise the entire node to a JSON Value so we can strip children.
    let mut value: serde_json::Value = serde_json::to_value(node).ok()?;
    let node_type = value.get("type")
        .and_then(|t| t.as_str())
        .unwrap_or("")
        .to_owned();

    // Extract and recursively flatten children, replacing them with id arrays.
    let child_ids: Option<Vec<String>> = extract_and_flatten_children(&mut value, map);

    // Remove the "type" field from the remaining fields to avoid duplication
    // with the top-level node_type field.
    if let serde_json::Value::Object(ref mut obj) = value {
        obj.remove("type");
    }

    let flat = FlatNode {
        id:        id.clone(),
        node_type,
        fields:    value,
        children:  child_ids,
    };

    map.insert(id.clone(), flat);
    Some(id)
}

/// Removes the "children" array from the JSON value, recursively flattens each
/// child, and returns the list of child ids.
fn extract_and_flatten_children(
    value: &mut serde_json::Value,
    map: &mut HashMap<String, FlatNode>,
) -> Option<Vec<String>> {
    let children_value = match value {
        serde_json::Value::Object(obj) => obj.remove("children")?,
        _ => return None,
    };

    let arr = children_value.as_array()?;

    // Each element is a serialised BlockNode; deserialise and flatten.
    let ids: Vec<String> = arr.iter()
        .filter_map(|child_val| {
            let child: BlockNode = serde_json::from_value(child_val.clone()).ok()?;
            flatten_node(&child, map)
        })
        .collect();

    Some(ids)
}
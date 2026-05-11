#!/usr/bin/env bash
set -euo pipefail

# Build the doceum-wasm module.
#
# Prerequisites:
#   rustup target add wasm32-unknown-unknown
#   cargo install wasm-pack

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Building doceum-wasm..."
wasm-pack build "$SCRIPT_DIR" \
  --target bundler \
  --release \
  --out-dir "$SCRIPT_DIR/pkg" \
  --out-name doceum_wasm

echo "Done. Output: $SCRIPT_DIR/pkg/"
#!/usr/bin/env bash
# new-project.sh — Create a new Claude project from template
# Usage: bash new-project.sh "My Project Name"

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_DIR="$SCRIPT_DIR/_template"

if [ -z "$1" ]; then
  echo "Usage: bash new-project.sh \"Project Name\""
  exit 1
fi

PROJECT_NAME="$1"
PROJECT_DIR="$SCRIPT_DIR/$PROJECT_NAME"

if [ -d "$PROJECT_DIR" ]; then
  echo "Error: Project '$PROJECT_NAME' already exists at $PROJECT_DIR"
  exit 1
fi

# Create the folder and copy template
mkdir -p "$PROJECT_DIR"
cp "$TEMPLATE_DIR/CLAUDE.md" "$PROJECT_DIR/CLAUDE.md"

# Patch the project name into the CLAUDE.md
sed -i "s/\[Project Name\]/$PROJECT_NAME/g" "$PROJECT_DIR/CLAUDE.md"

echo ""
echo "Project created: $PROJECT_DIR"
echo ""
echo "Next steps:"
echo "  1. Open a new VS Code terminal"
echo "  2. cd \"$PROJECT_DIR\""
echo "  3. Run: claude"
echo ""

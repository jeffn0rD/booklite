#!/bin/bash
# Reusable workflow for generating specifications from templates
# Usage: ./generate-from-template.sh <template-name> <output-prompt-name>

set -e

TEMPLATE_NAME=$1
OUTPUT_PROMPT_NAME=$2

if [ -z "$TEMPLATE_NAME" ] || [ -z "$OUTPUT_PROMPT_NAME" ]; then
    echo "Usage: ./generate-from-template.sh <template-name> <output-prompt-name>"
    exit 1
fi

echo "=== Step 1: Query RAG database for context ==="
cd /workspace/booklite
python tools/rag/query_specs_lite.py --query "$TEMPLATE_NAME architecture structure" > /tmp/rag_context.txt

echo "=== Step 2: Generate prompt (manual step - AI will create this) ==="
echo "Prompt will be saved to: prompts/${OUTPUT_PROMPT_NAME}.md"

echo "=== Step 3: Execute prompt (manual step - AI will execute) ==="
echo "Output will be organized into appropriate directories"

echo "=== Step 4: Update RAG database ==="
python tools/rag/index_specs_lite.py --rebuild

echo "=== Step 5: Commit and push ==="
git add .
git commit -m "Add ${TEMPLATE_NAME} specification and implementation"
git push https://x-access-token:$GITHUB_TOKEN@github.com/jeffn0rD/booklite.git ninja-spec-dev

echo "=== Complete! ==="
# Specification Generation Workflow

## Overview
This document describes the reusable workflow for generating specifications from templates in a careful, step-by-step manner with review between steps.

## Workflow Steps

### Step 1: Query RAG Database
Query the RAG database for relevant context based on the template topic.

```bash
cd booklite
python tools/rag/query_specs_lite.py --query "relevant keywords" --context "template context"
```

### Step 2: Generate Prompt
Create a comprehensive prompt by:
1. Reading the template
2. Extracting placeholders ({{VARIABLE}})
3. Querying RAG database for relevant information
4. Filling in placeholders with context-appropriate values
5. Adding additional relevant information from specs
6. Saving to `prompts/<name>.md`

### Step 3: Execute Prompt
Execute the prompt carefully:
1. Read and understand requirements
2. Create output in appropriate directories
3. Follow organizational structure specified
4. Note any conflicts or issues
5. Resolve conflicts systematically

### Step 4: Update RAG Database
Rebuild the RAG database to include new specifications:

```bash
cd booklite
python tools/rag/index_specs_lite.py --rebuild
```

### Step 5: Commit and Push
Commit changes with descriptive message:

```bash
git add .
git commit -m "Add [description] specification"
git push https://x-access-token:$GITHUB_TOKEN@github.com/jeffn0rD/booklite.git ninja-spec-dev
```

## Usage Pattern

When user provides a template:

1. **AI acknowledges** the template and workflow
2. **AI queries RAG** for context
3. **AI generates prompt** with filled placeholders
4. **AI executes prompt** (specification only, no premature implementation)
5. **AI updates RAG** database
6. **AI commits and pushes** changes
7. **AI reports** completion and awaits review

## Important Notes

- **No premature implementation**: Generate specifications only unless explicitly requested
- **Step-by-step**: Complete each step fully before moving to next
- **Review points**: Natural pause after prompt generation for user review if needed
- **Conflict resolution**: Document and resolve any conflicts systematically
- **Organized output**: Follow specified directory structure

## Template Variables

Common template variables to fill from RAG/specs:
- `{{FRONTEND_FRAMEWORK}}` - e.g., Astro, React, Vue
- `{{BACKEND_FRAMEWORK}}` - e.g., Fastify, Express, NestJS
- `{{DATABASE_SYSTEM}}` - e.g., PostgreSQL, MySQL
- `{{STYLING_FRAMEWORK}}` - e.g., Tailwind, CSS Modules
- `{{PACKAGE_MANAGER}}` - e.g., npm, pnpm, yarn
- `{{LINTER}}` - e.g., ESLint, Biome
- `{{CODE_FORMATTER}}` - e.g., Prettier, Biome
- `{{CONTAINERIZATION}}` - e.g., Docker, Podman
- `{{CI_CD_PLATFORM}}` - e.g., GitHub Actions, GitLab CI

## Directory Organization

Specifications go to: `specs/`
Prompts go to: `prompts/`
Implementation (when requested): `src/`, `api/`, etc.
Documentation: `docs/`
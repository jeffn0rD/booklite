# Booklite Specs RAG System

This system provides Retrieval-Augmented Generation (RAG) capabilities for the Booklite specification documents, enabling intelligent querying and context-aware generation.

## Overview

The RAG system indexes all markdown documents in the `/specs` directory and allows you to:
- Search across all specification documents with semantic similarity
- Retrieve relevant context for LLM generation tasks
- Maintain consistency across generated content
- Avoid hallucinations by grounding responses in actual specifications

## Setup

### Prerequisites

- Python 3.8+
-pip (Python package manager)

### Installation

1. Navigate to the RAG tools directory:
```bash
cd tools/rag
```

2. Install required packages:
```bash
make install
# or manually:
pip install -r requirements.txt
```

### Initial Indexing

Index all specification documents:
```bash
make index
```

This will:
- Scan all `.md` files in the `/specs` directory
- Split content into searchable chunks
- Generate embeddings using sentence transformers
- Store in a local ChromaDB database

## Usage

### Basic Search

Search for specific topics:
```bash
make search QUERY="authentication methods"
make search QUERY="database schema" FILE="entities.md"
make search QUERY="password policy requirements"
```

### Get Context for Generation

Retrieve formatted context suitable for LLM prompts:
```bash
make context QUERY="how should payments be handled"
make context QUERY="security requirements for API endpoints"
```

### Database Statistics

View indexing statistics:
```bash
make stats
```

### List Indexed Files

See all files that have been indexed:
```bash
make list
```

### File Summaries

Get a summary of a specific file:
```bash
make summary FILE="security-and-authentication-policy.md"
```

### Interactive Mode

Enter interactive search mode:
```bash
make interactive
```

## Advanced Usage

### Python API

You can also use the system programmatically:

```python
from tools.rag.query_specs import SpecsQuery

# Initialize the query tool
query_tool = SpecsQuery()

# Search for content
results = query_tool.search("authentication requirements")
for result in results:
    print(f"File: {result['metadata']['file_path']}")
    print(f"Relevance: {result.get('relevance_score', 0):.3f}")
    print(f"Content: {result['content'][:200]}...")

# Get context for generation
context = query_tool.get_context_for_generation("database security")
print(context)
```

### Custom Queries

Use the Python scripts directly for more control:

```bash
# Search with specific parameters
python query_specs.py --query "API security" --n-results 3

# Get context with custom token limit
python query_specs.py --context "user authentication" --max-tokens 2000

# Filter by specific file
python query_specs.py --query "payments" --file "entities.md"
```

## Database Structure

The RAG system stores:

- **Documents**: Chunks of text from the specification files
- **Metadata**: File path, section titles, chunk indices, and other context
- **Embeddings**: Vector representations for semantic search
- **Index**: Optimized search structure for fast retrieval

## Integration with Development Workflow

### Before Generating New Content

1. Query existing specifications to ensure consistency:
```bash
make context QUERY="related topic you're working on"
```

2. Search for similar concepts:
```bash
make search QUERY="concept name or keyword"
```

### During Development

- Use the RAG system to verify that new content aligns with existing specifications
- Search for terms to ensure consistent terminology
- Retrieve relevant sections to reference during implementation

### Code Generation

When generating code or documentation, include the retrieved context in your prompts:

```
Based on the following Booklite specifications:

[Insert context from 'make context QUERY="your topic"']

Generate [what you need] that aligns with these specifications.
```

## Maintenance

### Updating the Index

When specification documents change, rebuild the index:
```bash
make index
```

### Cleaning the Database

Remove all indexed data:
```bash
make clean
```

### Adding New Documents

New markdown files added to the `/specs` directory will be automatically included when you run `make index`.

## Technical Details

- **Vector Database**: ChromaDB (persistent local storage)
- **Embedding Model**: all-MiniLM-L6-v2 (fast, efficient)
- **Chunking**: Token-based with overlap (1000 tokens, 200 overlap)
- **Similarity**: Cosine similarity for semantic search
- **Storage**: Local filesystem in `docs/rag/chroma_db`

## Troubleshooting

### Common Issues

1. **"Database not found" error**
   - Solution: Run `make index` to create the initial database

2. **"Missing required package" error**
   - Solution: Run `make install` to install dependencies

3. **Poor search results**
   - Try more specific queries
   - Use different terminology
   - Check if the content exists with `make list`

4. **Memory issues**
   - The system is designed to work efficiently with the current spec size
   - If issues occur, try `make clean` then `make index`

### Performance Tips

- The database scales well with hundreds of documents
- For very large document sets, consider increasing chunk overlap
- Search performance is typically sub-second for this size dataset

## Future Enhancements

Potential improvements to consider:

- Integration with external APIs
- Multi-modal support (diagrams, images)
- Real-time indexing
- Advanced filtering options
- Integration with IDE/editor plugins
- Web-based search interface

## Support

For issues or questions:
1. Check this README for common solutions
2. Review the Makefile targets for available commands
3. Examine the Python scripts for advanced usage
4. Check the database statistics with `make stats`
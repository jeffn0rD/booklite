# Booklite Specs RAG System (Lightweight)

This system provides Retrieval-Augmented Generation (RAG) capabilities for the Booklite specification documents using efficient TF-IDF vectorization instead of heavy neural embeddings.

## Overview

The lightweight RAG system indexes all markdown documents in the `/specs` directory and allows you to:
- Search across all specification documents with semantic similarity
- Retrieve relevant context for LLM generation tasks
- Maintain consistency across generated content
- Avoid hallucinations by grounding responses in actual specifications
- Work efficiently with minimal resource requirements

## Advantages of the Lightweight Version

- **Fast installation**: Small dependencies (~50MB vs 2GB+ for neural models)
- **Quick indexing**: Processes documents in seconds
- **Low memory usage**: Suitable for resource-constrained environments
- **No GPU required**: CPU-based TF-IDF vectorization
- **Portable**: Easy to run in various environments

## Setup

### Prerequisites

- Python 3.8+
- pip (Python package manager)

### Installation

1. Navigate to the RAG tools directory:
```bash
cd tools/rag
```

2. Install lightweight dependencies:
```bash
make install-lite
# or manually:
pip install -r requirements-lite.txt
```

### Initial Indexing

Index all specification documents:
```bash
make index
```

This will:
- Scan all `.md` files in the `/specs` directory
- Split content into searchable chunks
- Generate TF-IDF vectors for semantic similarity
- Store in a compact pickle database

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

## Technical Details

### How It Works

1. **Text Processing**: Documents are parsed from Markdown and chunked into manageable pieces
2. **TF-IDF Vectorization**: Creates term frequency-inverse document frequency vectors for each chunk
3. **Similarity Search**: Uses cosine similarity to find the most relevant chunks for a query
4. **Context Generation**: Formats results into structured context for LLM consumption

### Performance Characteristics

- **Indexing Time**: ~2-5 seconds for typical spec documents
- **Search Time**: ~10-50ms per query
- **Memory Usage**: ~10-50MB for typical document sets
- **Storage**: Compact pickle database (~1-5MB)

### Search Quality

While TF-IDF doesn't capture semantic meaning as deeply as neural embeddings, it provides:
- Excellent keyword matching
- Good term relevance scoring
- Fast and reliable results
- Deterministic output (no randomness)

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

## Advanced Usage

### Python API

You can also use the system programmatically:

```python
from tools.rag.query_specs_lite import LiteSpecsQuery

# Initialize the query tool
query_tool = LiteSpecsQuery('docs/rag/rag_db.pkl')

# Search for content
results = query_tool.search("authentication requirements")
for result in results:
    print(f"File: {result['metadata']['file_path']}")
    print(f"Similarity: {result.get('similarity_score', 0):.3f}")
    print(f"Content: {result['content'][:200]}...")

# Get context for generation
context = query_tool.get_context_for_generation("database security")
print(context)
```

### Custom Queries

Use the Python scripts directly for more control:

```bash
# Search with specific parameters
python query_specs_lite.py --query "API security" --db-path docs/rag/rag_db.pkl

# Get context with custom token limit
python query_specs_lite.py --context "user authentication" --max-tokens 2000

# Filter by specific file
python query_specs_lite.py --query "payments" --file "entities.md"
```

## Database Structure

The RAG system stores:

- **Documents**: Chunks of text from the specification files
- **Metadata**: File path, section titles, chunk indices, and other context
- **TF-IDF Matrix**: Vector representations for similarity search
- **Vectorizer**: Fitted TF-IDF vectorizer for query processing

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

## Comparison with Full Neural Version

| Feature | Lightweight (TF-IDF) | Full (Neural Embeddings) |
|---------|---------------------|-------------------------|
| Installation Size | ~50MB | ~2GB+ |
| Indexing Speed | ~2-5 seconds | ~30-60 seconds |
| Search Speed | ~10-50ms | ~50-200ms |
| Memory Usage | ~10-50MB | ~500MB-2GB |
| Semantic Understanding | Good (keyword-based) | Excellent (semantic) |
| Resource Requirements | CPU only | CPU/GPU |
| Consistency | Deterministic | Slight randomness |
| Setup Complexity | Simple | Complex |

## Troubleshooting

### Common Issues

1. **"Database not found" error**
   - Solution: Run `make index` to create the initial database

2. **"Missing required package" error**
   - Solution: Run `make install-lite` to install dependencies

3. **Poor search results**
   - Try more specific queries
   - Use different terminology
   - Check if the content exists with `make list`

4. **Memory issues**
   - The lightweight version is designed to work efficiently
   - If issues occur, try `make clean` then `make index`

### Performance Tips

- The system scales well with hundreds of documents
- TF-IDF works best with keyword-rich content
- Search performance is typically sub-second for this size dataset

## Future Enhancements

Potential improvements to consider:

- Hybrid approach: combine TF-IDF with lightweight semantic models
- Advanced filtering options (by date, author, etc.)
- Integration with version control for tracking changes
- Web-based search interface
- Real-time indexing of document changes
- Multi-language support

## Migration from Full Version

If you previously used the full neural version and want to switch to lightweight:

1. Clean the old database:
```bash
make clean
```

2. Install lightweight dependencies:
```bash
make install-lite
```

3. Rebuild the index:
```bash
make index
```

The API remains the same, so your existing integrations will continue to work.

## Support

For issues or questions:
1. Check this README for common solutions
2. Review the Makefile targets for available commands
3. Examine the Python scripts for advanced usage
4. Check the database statistics with `make stats`
.PHONY: help install-lite index search stats clean context

# Default target
help:
	@echo "Booklite Specs RAG System (Lightweight)"
	@echo "======================================"
	@echo ""
	@echo "Available commands:"
	@echo "  install-lite Install lightweight Python packages"
	@echo "  index        Index all specs documents"
	@echo "  search       Search the indexed documents"
	@echo "  stats        Show database statistics"
	@echo "  context      Get context for LLM generation"
	@echo "  clean        Remove the database"
	@echo ""
	@echo "Examples:"
	@echo "  make index"
	@echo "  make search QUERY='authentication methods'"
	@echo "  make context QUERY='password policy requirements'"
	@echo "  make search QUERY='database schema' FILE='entities.md'"

# Install lightweight dependencies
install-lite:
	pip install -r requirements-lite.txt

# Index all documents
index:
	python index_specs_lite.py --specs-dir ../../specs --rebuild

# Search documents
search:
	@if [ -z "$(QUERY)" ]; then \
		echo "Error: QUERY parameter is required"; \
		echo "Usage: make search QUERY='your search query'"; \
		exit 1; \
	fi
	@if [ -z "$(FILE)" ]; then \
		python query_specs_lite.py --db-path docs/rag/rag_db.pkl --query "$(QUERY)"; \
	else \
		python query_specs_lite.py --db-path docs/rag/rag_db.pkl --query "$(QUERY)" --file "$(FILE)"; \
	fi

# Show statistics
stats:
	python query_specs_lite.py --db-path docs/rag/rag_db.pkl --stats

# Get context for LLM generation
context:
	@if [ -z "$(QUERY)" ]; then \
		echo "Error: QUERY parameter is required"; \
		echo "Usage: make context QUERY='your query'"; \
		exit 1; \
	fi
	@python query_specs_lite.py --db-path docs/rag/rag_db.pkl --context "$(QUERY)" --max-tokens $(MAX_TOKENS)

# List all indexed files
list:
	python query_specs_lite.py --db-path docs/rag/rag_db.pkl --list-files

# Get summary of specific file
summary:
	@if [ -z "$(FILE)" ]; then \
		echo "Error: FILE parameter is required"; \
		echo "Usage: make summary FILE='path/to/file.md'"; \
		exit 1; \
	fi
	@python query_specs_lite.py --db-path docs/rag/rag_db.pkl --file-summary "$(FILE)"

# Clean database
clean:
	rm -f docs/rag/rag_db.pkl
	@echo "Database cleaned"

# Interactive mode
interactive:
	@echo "Entering interactive mode. Type 'quit' to exit."
	@python -c "
import sys
sys.path.append('.')
from query_specs_lite import LiteSpecsQuery

try:
    query_tool = LiteSpecsQuery('docs/rag/rag_db.pkl')
    while True:
        query = input('Search query (or &quot;quit&quot;): ').strip()
        if query.lower() in ['quit', 'exit', 'q']:
            break
        if query:
            results = query_tool.search(query)
            for i, result in enumerate(results, 1):
                print(f'{i}. [{result[&quot;metadata&quot;][&quot;file_path&quot;]}] {result.get(&quot;similarity_score&quot;, 0):.3f}')
                print(f'   {result[&quot;content&quot;][:200]}...')
                print()
except KeyboardInterrupt:
    print('\nGoodbye!')
except Exception as e:
    print(f'Error: {e}')
"

# Install full dependencies (for future use)
install:
	@echo "Note: Full dependencies may require significant disk space"
	@echo "Use 'make install-lite' for the lightweight version"
	pip install -r requirements.txt || echo "Full install failed, try 'make install-lite'"
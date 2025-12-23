#!/usr/bin/env python3
"""
RAG Query Tool for Booklite Specifications
Provides intelligent querying of the indexed specification documents.
"""

import os
import sys
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
import argparse

try:
    import chromadb
    from sentence_transformers import SentenceTransformer
    import tiktoken
except ImportError as e:
    print(f"Missing required package: {e}")
    print("Install with: pip install chromadb sentence-transformers tiktoken")
    sys.exit(1)

class SpecsQuery:
    def __init__(self, db_path: str = "docs/rag/chroma_db"):
        self.db_path = Path(db_path)
        
        if not self.db_path.exists():
            raise FileNotFoundError(f"Database not found at {db_path}. Run index_specs.py first.")
        
        # Initialize ChromaDB
        self.client = chromadb.PersistentClient(path=str(self.db_path))
        self.collection = self.client.get_or_create_collection(
            name="booklite_specs"
        )
        
        # Initialize embedding model
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Initialize tokenizer
        self.encoding = tiktoken.get_encoding("cl100k_base")
        
        # Load index summary
        summary_path = self.db_path.parent / "index_summary.json"
        if summary_path.exists():
            with open(summary_path, 'r') as f:
                self.summary = json.load(f)
        else:
            self.summary = {}
    
    def search(self, query: str, n_results: int = 5, file_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        """Search the indexed documents."""
        query_embedding = self.model.encode([query]).tolist()
        
        # Build where clause if file filter is specified
        where_clause = None
        if file_filter:
            where_clause = {"file_path": {"$contains": file_filter}}
        
        results = self.collection.query(
            query_embeddings=query_embedding,
            n_results=n_results,
            where=where_clause
        )
        
        formatted_results = []
        for i in range(len(results['ids'][0])):
            result = {
                "id": results['ids'][0][i],
                "content": results['documents'][0][i],
                "metadata": results['metadatas'][0][i],
                "distance": results['distances'][0][i] if 'distances' in results else None,
                "relevance_score": 1 - results['distances'][0][i] if 'distances' in results else None
            }
            formatted_results.append(result)
        
        return formatted_results
    
    def get_context_for_generation(self, query: str, max_tokens: int = 4000) -> str:
        """Get formatted context for LLM generation."""
        results = self.search(query, n_results=10)
        
        context_parts = []
        current_tokens = 0
        
        # Add metadata header
        context_parts.append("CONTEXT FROM BOOKLITE SPECIFICATIONS:")
        context_parts.append("=" * 50)
        current_tokens += len(self.encoding.encode("\n".join(context_parts)))
        
        for result in results:
            # Check if adding this result would exceed token limit
            result_text = f"\n--- From {result['metadata']['file_path']} ---\n"
            result_text += f"Section: {result['metadata'].get('title', 'N/A')}\n"
            result_text += f"Relevance: {result.get('relevance_score', 0):.2f}\n"
            result_text += f"Content:\n{result['content']}\n"
            
            result_tokens = len(self.encoding.encode(result_text))
            
            if current_tokens + result_tokens > max_tokens:
                break
            
            context_parts.append(result_text)
            current_tokens += result_tokens
        
        return "\n".join(context_parts)
    
    def get_file_summary(self, file_path: str) -> Dict[str, Any]:
        """Get summary of a specific file."""
        where_clause = {"file_path": file_path}
        results = self.collection.get(where=where_clause)
        
        if not results['ids']:
            return {"error": f"No content found for file: {file_path}"}
        
        # Group by file and extract sections
        sections = {}
        for i, metadata in enumerate(results['metadatas']):
            title = metadata.get('title', 'Untitled')
            if title not in sections:
                sections[title] = []
            sections[title].append(results['documents'][i])
        
        return {
            "file_path": file_path,
            "total_chunks": len(results['ids']),
            "sections": list(sections.keys()),
            "content_preview": "\n".join([doc[:200] + "..." for doc in results['documents'][:3]])
        }
    
    def list_indexed_files(self) -> List[str]:
        """List all indexed files."""
        all_results = self.collection.get()
        files = set(meta['file_path'] for meta in all_results['metadatas'])
        return sorted(list(files))
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get database statistics."""
        return {
            "total_chunks": self.collection.count(),
            "indexed_files": len(self.list_indexed_files()),
            "model_used": self.summary.get("model", "unknown"),
            "created_at": self.summary.get("created_at", "unknown")
        }

def main():
    parser = argparse.ArgumentParser(description="Query Booklite specifications RAG database")
    parser.add_argument("--db-path", default="docs/rag/chroma_db", help="Path to ChromaDB")
    parser.add_argument("--query", help="Search query")
    parser.add_argument("--file", help="Filter by file path")
    parser.add_argument("--context", help="Generate context for LLM generation")
    parser.add_argument("--max-tokens", type=int, default=4000, help="Max tokens for context")
    parser.add_argument("--list-files", action="store_true", help="List all indexed files")
    parser.add_argument("--stats", action="store_true", help="Show database statistics")
    parser.add_argument("--file-summary", help="Get summary of specific file")
    
    args = parser.parse_args()
    
    try:
        query_tool = SpecsQuery(args.db_path)
    except FileNotFoundError as e:
        print(e)
        return
    
    if args.stats:
        stats = query_tool.get_statistics()
        print("Database Statistics:")
        print(json.dumps(stats, indent=2))
    
    elif args.list_files:
        files = query_tool.list_indexed_files()
        print("Indexed Files:")
        for file in files:
            print(f"  - {file}")
    
    elif args.file_summary:
        summary = query_tool.get_file_summary(args.file_summary)
        print(f"File Summary for {args.file_summary}:")
        print(json.dumps(summary, indent=2))
    
    elif args.context:
        context = query_tool.get_context_for_generation(args.context, args.max_tokens)
        print(context)
    
    elif args.query:
        results = query_tool.search(args.query, file_filter=args.file)
        
        print(f"Search Results for: '{args.query}'")
        if args.file:
            print(f"Filtered by file: {args.file}")
        print()
        
        for i, result in enumerate(results, 1):
            print(f"--- Result {i} ---")
            print(f"File: {result['metadata']['file_path']}")
            print(f"Section: {result['metadata'].get('title', 'N/A')}")
            print(f"Relevance Score: {result.get('relevance_score', 0):.3f}")
            print(f"Content Preview:")
            print(result['content'][:400] + "..." if len(result['content']) > 400 else result['content'])
            print()
    
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
Lightweight RAG Query Tool for Booklite Specifications
Uses TF-IDF based search for efficient querying.
"""

import os
import sys
import json
import pickle
from pathlib import Path
from typing import List, Dict, Any, Optional
import argparse

from index_specs_lite import LiteSpecsIndexer

class LiteSpecsQuery:
    def __init__(self, db_path: str = "docs/rag/rag_db.pkl"):
        self.db_path = Path(db_path)
        
        if not self.db_path.exists():
            raise FileNotFoundError(f"Database not found at {db_path}. Run index_specs_lite.py first.")
        
        # Initialize and load the indexer
        self.indexer = LiteSpecsIndexer()
        self.indexer.db_path = self.db_path
        self.indexer.load()
        
        if not self.indexer.is_indexed:
            raise ValueError("Database is not properly indexed.")
    
    def search(self, query: str, n_results: int = 5, file_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        """Search the indexed documents."""
        results = self.indexer.search(query, n_results)
        
        # Apply file filter if specified
        if file_filter:
            results = [r for r in results if file_filter in r['metadata']['file_path']]
        
        return results
    
    def get_context_for_generation(self, query: str, max_tokens: int = 4000) -> str:
        """Get formatted context for LLM generation."""
        return self.indexer.get_context_for_generation(query, max_tokens)
    
    def get_file_summary(self, file_path: str) -> Dict[str, Any]:
        """Get summary of a specific file."""
        filtered_results = [r for r in self.indexer.metadata if file_path in r['file_path']]
        
        if not filtered_results:
            return {"error": f"No content found for file: {file_path}"}
        
        # Group by file and extract sections
        sections = {}
        total_chunks = 0
        
        for meta in filtered_results:
            title = meta.get('title', 'Untitled')
            if title not in sections:
                sections[title] = []
            sections[title].append(meta['chunk_preview'])
            total_chunks += 1
        
        # Get content preview
        file_docs = [doc for doc, meta in zip(self.indexer.documents, self.indexer.metadata) 
                    if file_path in meta['file_path']]
        content_preview = "\n".join([doc[:200] + "..." for doc in file_docs[:3]])
        
        return {
            "file_path": file_path,
            "total_chunks": total_chunks,
            "sections": list(sections.keys()),
            "content_preview": content_preview
        }
    
    def list_indexed_files(self) -> List[str]:
        """List all indexed files."""
        files = set(meta['file_path'] for meta in self.indexer.metadata)
        return sorted(list(files))
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get database statistics."""
        return self.indexer.get_statistics()

def main():
    parser = argparse.ArgumentParser(description="Query Booklite specifications RAG database")
    parser.add_argument("--db-path", default="docs/rag/rag_db.pkl", help="Path to database file")
    parser.add_argument("--query", help="Search query")
    parser.add_argument("--file", help="Filter by file path")
    parser.add_argument("--context", help="Generate context for LLM generation")
    parser.add_argument("--max-tokens", type=int, default=4000, help="Max tokens for context")
    parser.add_argument("--list-files", action="store_true", help="List all indexed files")
    parser.add_argument("--stats", action="store_true", help="Show database statistics")
    parser.add_argument("--file-summary", help="Get summary of specific file")
    
    args = parser.parse_args()
    
    try:
        query_tool = LiteSpecsQuery(args.db_path)
    except (FileNotFoundError, ValueError) as e:
        print(e)
        print("Run 'python index_specs_lite.py --rebuild' first to create the database.")
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
        
        if not results:
            print("No results found.")
        else:
            for i, result in enumerate(results, 1):
                print(f"--- Result {i} ---")
                print(f"File: {result['metadata']['file_path']}")
                print(f"Section: {result['metadata'].get('title', 'N/A')}")
                print(f"Similarity Score: {result.get('similarity_score', 0):.3f}")
                print(f"Content Preview:")
                preview = result['content'][:400]
                print(preview + "..." if len(result['content']) > 400 else preview)
                print()
    
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
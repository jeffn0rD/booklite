#!/usr/bin/env python3
"""
RAG Indexer for Booklite Specifications
Indexes all markdown documents in the /specs folder for use in future generation tasks.
"""

import os
import sys
import json
import hashlib
from pathlib import Path
from typing import List, Dict, Any
import argparse

# Try to import required packages, provide installation guidance if missing
try:
    import chromadb
    from sentence_transformers import SentenceTransformer
    import markdown
    from bs4 import BeautifulSoup
    import tiktoken
except ImportError as e:
    print(f"Missing required package: {e}")
    print("Install with: pip install chromadb sentence-transformers markdown beautifulsoup4 tiktoken")
    sys.exit(1)

class SpecsIndexer:
    def __init__(self, specs_dir: str = "specs", db_path: str = "docs/rag/chroma_db"):
        self.specs_dir = Path(specs_dir)
        self.db_path = Path(db_path)
        self.db_path.mkdir(parents=True, exist_ok=True)
        
        # Initialize ChromaDB
        self.client = chromadb.PersistentClient(path=str(self.db_path))
        self.collection = self.client.get_or_create_collection(
            name="booklite_specs",
            metadata={"description": "Booklite specification documents"}
        )
        
        # Initialize embedding model
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Initialize tokenizer for chunking
        self.encoding = tiktoken.get_encoding("cl100k_base")
        
    def extract_markdown_content(self, file_path: Path) -> Dict[str, Any]:
        """Extract structured content from markdown file."""
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Parse markdown
        html = markdown.markdown(content, extensions=['tables', 'fenced_code', 'toc'])
        soup = BeautifulSoup(html, 'html.parser')
        
        # Extract metadata
        metadata = {
            "file_path": str(file_path.relative_to(self.specs_dir)),
            "file_name": file_path.name,
            "file_size": len(content),
            "hash": hashlib.md5(content.encode()).hexdigest(),
            "title": self._extract_title(soup),
            "sections": self._extract_sections(soup)
        }
        
        return {
            "content": content,
            "html": html,
            "metadata": metadata
        }
    
    def _extract_title(self, soup: BeautifulSoup) -> str:
        """Extract the main title from the document."""
        h1 = soup.find('h1')
        if h1:
            return h1.get_text().strip()
        return "Untitled"
    
    def _extract_sections(self, soup: BeautifulSoup) -> List[Dict[str, str]]:
        """Extract sections with their content."""
        sections = []
        current_section = None
        
        for element in soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']):
            level = int(element.name[1])
            title = element.get_text().strip()
            
            if current_section:
                sections.append(current_section)
            
            current_section = {
                "level": level,
                "title": title,
                "content": ""
            }
        
        if current_section:
            sections.append(current_section)
        
        return sections
    
    def chunk_content(self, content: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        """Split content into chunks using tokenizer."""
        tokens = self.encoding.encode(content)
        chunks = []
        
        for i in range(0, len(tokens), chunk_size - overlap):
            chunk_tokens = tokens[i:i + chunk_size]
            chunk_text = self.encoding.decode(chunk_tokens)
            chunks.append(chunk_text)
        
        return chunks
    
    def index_file(self, file_path: Path):
        """Index a single markdown file."""
        print(f"Indexing {file_path}")
        
        doc_data = self.extract_markdown_content(file_path)
        chunks = self.chunk_content(doc_data["content"])
        
        # Create embeddings
        embeddings = self.model.encode(chunks).tolist()
        
        # Prepare documents for ChromaDB
        documents = []
        metadatas = []
        ids = []
        
        for i, chunk in enumerate(chunks):
            chunk_metadata = doc_data["metadata"].copy()
            chunk_metadata.update({
                "chunk_index": i,
                "chunk_total": len(chunks),
                "chunk_preview": chunk[:200] + "..." if len(chunk) > 200 else chunk
            })
            
            documents.append(chunk)
            metadatas.append(chunk_metadata)
            ids.append(f"{doc_data['metadata']['file_path']}_{i}")
        
        # Add to ChromaDB
        self.collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )
        
        print(f"  Indexed {len(chunks)} chunks from {file_path.name}")
    
    def index_all(self):
        """Index all markdown files in the specs directory."""
        print(f"Indexing all markdown files in {self.specs_dir}")
        
        # Clear existing collection
        self.client.delete_collection("booklite_specs")
        self.collection = self.client.get_or_create_collection(
            name="booklite_specs",
            metadata={"description": "Booklite specification documents"}
        )
        
        # Find all markdown files
        md_files = list(self.specs_dir.rglob("*.md"))
        
        if not md_files:
            print("No markdown files found!")
            return
        
        for file_path in md_files:
            try:
                self.index_file(file_path)
            except Exception as e:
                print(f"Error indexing {file_path}: {e}")
        
        print(f"Indexing complete! Processed {len(md_files)} files.")
        
        # Show collection stats
        count = self.collection.count()
        print(f"Total chunks in database: {count}")
    
    def search(self, query: str, n_results: int = 5) -> List[Dict[str, Any]]:
        """Search the indexed documents."""
        query_embedding = self.model.encode([query]).tolist()
        
        results = self.collection.query(
            query_embeddings=query_embedding,
            n_results=n_results
        )
        
        formatted_results = []
        for i in range(len(results['ids'][0])):
            formatted_results.append({
                "id": results['ids'][0][i],
                "content": results['documents'][0][i],
                "metadata": results['metadatas'][0][i],
                "distance": results['distances'][0][i] if 'distances' in results else None
            })
        
        return formatted_results
    
    def export_summary(self, output_path: str = "docs/rag/index_summary.json"):
        """Export a summary of the indexed content."""
        count = self.collection.count()
        
        # Get sample documents to understand the structure
        sample_results = self.collection.get(limit=10)
        
        summary = {
            "total_chunks": count,
            "indexed_files": list(set(meta['file_path'] for meta in sample_results['metadatas'])),
            "created_at": str(Path.cwd()),
            "model": "all-MiniLM-L6-v2",
            "chunk_size": 1000,
            "overlap": 200
        }
        
        with open(output_path, 'w') as f:
            json.dump(summary, f, indent=2)
        
        print(f"Index summary saved to {output_path}")

def main():
    parser = argparse.ArgumentParser(description="Index Booklite specifications for RAG")
    parser.add_argument("--specs-dir", default="specs", help="Directory containing spec files")
    parser.add_argument("--db-path", default="docs/rag/chroma_db", help="Path to ChromaDB")
    parser.add_argument("--query", help="Search query to test the index")
    parser.add_argument("--rebuild", action="store_true", help="Rebuild the entire index")
    
    args = parser.parse_args()
    
    indexer = SpecsIndexer(args.specs_dir, args.db_path)
    
    if args.rebuild or not indexer.collection.count():
        indexer.index_all()
        indexer.export_summary()
    
    if args.query:
        print(f"\nSearching for: '{args.query}'")
        results = indexer.search(args.query)
        
        for i, result in enumerate(results, 1):
            print(f"\n--- Result {i} ---")
            print(f"File: {result['metadata']['file_path']}")
            print(f"Section: {result['metadata'].get('title', 'N/A')}")
            print(f"Distance: {result.get('distance', 'N/A')}")
            print(f"Content: {result['content'][:300]}...")

if __name__ == "__main__":
    main()
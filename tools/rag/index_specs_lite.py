#!/usr/bin/env python3
"""
Lightweight RAG Indexer for Booklite Specifications
Uses TF-IDF instead of heavy neural embeddings for efficiency.
"""

import os
import sys
import json
import hashlib
import pickle
from pathlib import Path
from typing import List, Dict, Any
import argparse

# Try to import required packages
try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    import markdown
    from bs4 import BeautifulSoup
    import numpy as np
except ImportError as e:
    print(f"Missing required package: {e}")
    print("Install with: pip install -r requirements-lite.txt")
    sys.exit(1)

class LiteSpecsIndexer:
    def __init__(self, specs_dir: str = "specs", db_path: str = "docs/rag/rag_db.pkl"):
        self.specs_dir = Path(specs_dir)
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Initialize TF-IDF Vectorizer
        self.vectorizer = TfidfVectorizer(
            max_features=5000,
            stop_words='english',
            ngram_range=(1, 2),
            min_df=1,
            max_df=0.95
        )
        
        self.documents = []
        self.metadata = []
        self.tfidf_matrix = None
        self.is_indexed = False
    
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
        """Split content into chunks using simple text splitting."""
        chunks = []
        
        # Split by paragraphs first
        paragraphs = content.split('\n\n')
        current_chunk = ""
        
        for paragraph in paragraphs:
            if len(current_chunk) + len(paragraph) + 2 <= chunk_size:
                if current_chunk:
                    current_chunk += "\n\n" + paragraph
                else:
                    current_chunk = paragraph
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                    current_chunk = paragraph
                else:
                    # Paragraph too long, split it
                    words = paragraph.split()
                    for i in range(0, len(words), chunk_size // 5):
                        chunk_words = words[i:i + (chunk_size // 5)]
                        chunks.append(' '.join(chunk_words))
        
        if current_chunk:
            chunks.append(current_chunk.strip())
        
        return chunks
    
    def index_file(self, file_path: Path):
        """Index a single markdown file."""
        print(f"Indexing {file_path}")
        
        doc_data = self.extract_markdown_content(file_path)
        chunks = self.chunk_content(doc_data["content"])
        
        for i, chunk in enumerate(chunks):
            chunk_metadata = doc_data["metadata"].copy()
            chunk_metadata.update({
                "chunk_index": i,
                "chunk_total": len(chunks),
                "chunk_preview": chunk[:200] + "..." if len(chunk) > 200 else chunk
            })
            
            self.documents.append(chunk)
            self.metadata.append(chunk_metadata)
        
        print(f"  Indexed {len(chunks)} chunks from {file_path.name}")
    
    def index_all(self):
        """Index all markdown files in the specs directory."""
        print(f"Indexing all markdown files in {self.specs_dir}")
        
        # Clear existing data
        self.documents = []
        self.metadata = []
        
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
        
        if self.documents:
            # Create TF-IDF matrix
            print("Creating TF-IDF matrix...")
            self.tfidf_matrix = self.vectorizer.fit_transform(self.documents)
            self.is_indexed = True
            print(f"TF-IDF matrix shape: {self.tfidf_matrix.shape}")
        
        print(f"Indexing complete! Processed {len(md_files)} files.")
        print(f"Total chunks: {len(self.documents)}")
        
        # Save the database
        self.save()
    
    def search(self, query: str, n_results: int = 5) -> List[Dict[str, Any]]:
        """Search the indexed documents."""
        if not self.is_indexed:
            self.load()
            if not self.is_indexed:
                raise ValueError("No indexed data found. Run index_all() first.")
        
        # Transform query to TF-IDF
        query_vec = self.vectorizer.transform([query])
        
        # Calculate cosine similarity
        similarities = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
        
        # Get top results
        top_indices = np.argsort(similarities)[::-1][:n_results]
        
        results = []
        for idx in top_indices:
            if similarities[idx] > 0:  # Only return results with some similarity
                results.append({
                    "content": self.documents[idx],
                    "metadata": self.metadata[idx],
                    "similarity_score": float(similarities[idx]),
                    "chunk_index": idx
                })
        
        return results
    
    def save(self):
        """Save the database to disk."""
        db_data = {
            "documents": self.documents,
            "metadata": self.metadata,
            "vectorizer": self.vectorizer,
            "tfidf_matrix": self.tfidf_matrix,
            "is_indexed": self.is_indexed
        }
        
        with open(self.db_path, 'wb') as f:
            pickle.dump(db_data, f)
        
        print(f"Database saved to {self.db_path}")
    
    def load(self):
        """Load the database from disk."""
        if not self.db_path.exists():
            return
        
        try:
            with open(self.db_path, 'rb') as f:
                db_data = pickle.load(f)
            
            self.documents = db_data["documents"]
            self.metadata = db_data["metadata"]
            self.vectorizer = db_data["vectorizer"]
            self.tfidf_matrix = db_data["tfidf_matrix"]
            self.is_indexed = db_data["is_indexed"]
            
            print(f"Database loaded from {self.db_path}")
        except Exception as e:
            print(f"Error loading database: {e}")
    
    def get_context_for_generation(self, query: str, max_tokens: int = 4000) -> str:
        """Get formatted context for LLM generation."""
        results = self.search(query, n_results=10)
        
        context_parts = []
        current_chars = 0
        
        # Add metadata header
        context_parts.append("CONTEXT FROM BOOKLITE SPECIFICATIONS:")
        context_parts.append("=" * 50)
        current_chars += len("\n".join(context_parts))
        
        for result in results:
            # Check if adding this result would exceed limit
            result_text = f"\n--- From {result['metadata']['file_path']} ---\n"
            result_text += f"Section: {result['metadata'].get('title', 'N/A')}\n"
            result_text += f"Similarity: {result.get('similarity_score', 0):.2f}\n"
            result_text += f"Content:\n{result['content']}\n"
            
            if current_chars + len(result_text) > max_tokens:
                break
            
            context_parts.append(result_text)
            current_chars += len(result_text)
        
        return "\n".join(context_parts)
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get database statistics."""
        return {
            "total_chunks": len(self.documents),
            "indexed_files": len(set(meta['file_path'] for meta in self.metadata)),
            "vectorizer_features": len(self.vectorizer.vocabulary_) if self.is_indexed else 0,
            "is_indexed": self.is_indexed
        }

def main():
    parser = argparse.ArgumentParser(description="Lightweight RAG indexer for Booklite specifications")
    parser.add_argument("--specs-dir", default="specs", help="Directory containing spec files")
    parser.add_argument("--db-path", default="docs/rag/rag_db.pkl", help="Path to database file")
    parser.add_argument("--query", help="Search query to test the index")
    parser.add_argument("--rebuild", action="store_true", help="Rebuild the entire index")
    
    args = parser.parse_args()
    
    indexer = LiteSpecsIndexer(args.specs_dir, args.db_path)
    
    if args.rebuild or not indexer.is_indexed:
        indexer.index_all()
    
    if args.query:
        print(f"\nSearching for: '{args.query}'")
        results = indexer.search(args.query)
        
        for i, result in enumerate(results, 1):
            print(f"\n--- Result {i} ---")
            print(f"File: {result['metadata']['file_path']}")
            print(f"Section: {result['metadata'].get('title', 'N/A')}")
            print(f"Similarity: {result.get('similarity_score', 0):.3f}")
            print(f"Content: {result['content'][:300]}...")

if __name__ == "__main__":
    main()
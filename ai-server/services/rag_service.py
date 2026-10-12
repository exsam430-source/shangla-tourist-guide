import os
import json
from pathlib import Path
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()

CHROMA_PATH = os.getenv("CHROMA_PERSIST_PATH", "./data/chroma_db")
KNOWLEDGE_PATH = os.getenv("KNOWLEDGE_PATH", "./data/knowledge")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

class RAGService:
    def __init__(self):
        self.vectorstore = None
        self.embeddings = None
        self.is_ready = False
        self.use_openai = bool(OPENAI_API_KEY and OPENAI_API_KEY != "your_openai_api_key_here")
        self._initialize()

    def _initialize(self):
        try:
            if self.use_openai:
                self._init_with_openai()
            else:
                self._init_simple()
        except Exception as e:
            print(f"RAG initialization error: {e}")
            self.is_ready = False

    def _init_with_openai(self):
        """Initialize with OpenAI embeddings"""
        try:
            from langchain_openai import OpenAIEmbeddings
            from langchain_community.vectorstores import Chroma

            self.embeddings = OpenAIEmbeddings(
                openai_api_key=OPENAI_API_KEY,
                model="text-embedding-3-small"
            )

            chroma_path = Path(CHROMA_PATH)
            if chroma_path.exists() and any(chroma_path.iterdir()):
                self.vectorstore = Chroma(
                    persist_directory=CHROMA_PATH,
                    embedding_function=self.embeddings
                )
                self.is_ready = True
                print("✅ RAG Service initialized with OpenAI embeddings")
            else:
                print("⚠️  No knowledge base found. Run /ai/seed-knowledge to build it.")
        except Exception as e:
            print(f"OpenAI RAG init error: {e}")
            self._init_simple()

    def _init_simple(self):
        """Simple keyword-based fallback when no embeddings available"""
        self.documents = []
        self._load_documents_to_memory()
        self.is_ready = len(self.documents) > 0
        if self.is_ready:
            print(f"✅ Simple RAG initialized with {len(self.documents)} documents")
        else:
            print("⚠️  No documents loaded. Run /ai/seed-knowledge")

    def _load_documents_to_memory(self):
        """Load documents into memory for keyword search"""
        knowledge_path = Path(KNOWLEDGE_PATH)
        if not knowledge_path.exists():
            return

        for file_path in knowledge_path.glob("**/*.json"):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                if isinstance(data, list):
                    self.documents.extend(data)
                elif isinstance(data, dict):
                    self.documents.append(data)
            except Exception as e:
                print(f"Error reading {file_path}: {e}")

        for file_path in knowledge_path.glob("**/*.txt"):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                self.documents.append({
                    "content": content,
                    "source": file_path.name,
                    "category": "general",
                    "language": "en"
                })
            except Exception as e:
                print(f"Error reading {file_path}: {e}")

    def ingest_documents(self, documents: List[dict]) -> int:
        """Ingest documents into vector store or memory"""
        if not documents:
            return 0

        if self.use_openai and self.embeddings:
            return self._ingest_with_vectorstore(documents)
        else:
            return self._ingest_to_memory(documents)

    def _ingest_with_vectorstore(self, documents: List[dict]) -> int:
        try:
            from langchain_community.vectorstores import Chroma
            from langchain.text_splitter import RecursiveCharacterTextSplitter
            from langchain.schema import Document

            splitter = RecursiveCharacterTextSplitter(
                chunk_size=800,
                chunk_overlap=100
            )

            docs = []
            for doc in documents:
                content = doc.get("content", "")
                if not content.strip():
                    continue
                metadata = {
                    "source": doc.get("source", "manual"),
                    "category": doc.get("category", "general"),
                    "place_name": doc.get("place_name", ""),
                    "language": doc.get("language", "en"),
                }
                chunks = splitter.split_text(content)
                for chunk in chunks:
                    docs.append(Document(page_content=chunk, metadata=metadata))

            if not docs:
                return 0

            self.vectorstore = Chroma.from_documents(
                documents=docs,
                embedding=self.embeddings,
                persist_directory=CHROMA_PATH
            )
            self.vectorstore.persist()
            self.is_ready = True
            print(f"✅ Ingested {len(docs)} chunks to vector store")
            return len(docs)
        except Exception as e:
            print(f"Vector store ingestion error: {e}")
            return self._ingest_to_memory(documents)

    def _ingest_to_memory(self, documents: List[dict]) -> int:
        """Store documents in memory for keyword search"""
        if not hasattr(self, 'documents'):
            self.documents = []
        self.documents.extend(documents)
        self.is_ready = True

        # Save to knowledge directory
        knowledge_path = Path(KNOWLEDGE_PATH)
        knowledge_path.mkdir(parents=True, exist_ok=True)
        save_path = knowledge_path / "ingested_data.json"
        try:
            existing = []
            if save_path.exists():
                with open(save_path, "r", encoding="utf-8") as f:
                    existing = json.load(f)
            existing.extend(documents)
            with open(save_path, "w", encoding="utf-8") as f:
                json.dump(existing, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Error saving documents: {e}")

        print(f"✅ Stored {len(documents)} documents in memory")
        return len(documents)

    def retrieve(self, query: str, k: int = 5, language: str = "en") -> List[str]:
        """Retrieve relevant documents for a query"""
        if not self.is_ready:
            return []

        if self.use_openai and self.vectorstore:
            return self._retrieve_from_vectorstore(query, k, language)
        else:
            return self._keyword_search(query, k, language)

    def _retrieve_from_vectorstore(self, query: str, k: int, language: str) -> List[str]:
        try:
            results = self.vectorstore.similarity_search(query, k=k)
            return [doc.page_content for doc in results]
        except Exception as e:
            print(f"Vector retrieval error: {e}")
            return self._keyword_search(query, k, language)

    def _keyword_search(self, query: str, k: int, language: str) -> List[str]:
        """Simple keyword-based search as fallback"""
        if not hasattr(self, 'documents') or not self.documents:
            return []

        query_words = set(query.lower().split())
        scored_docs = []

        for doc in self.documents:
            content = doc.get("content", "")
            doc_language = doc.get("language", "en")

            # Language filter (soft)
            lang_bonus = 1.5 if doc_language == language else 1.0

            # Score by keyword matches
            content_lower = content.lower()
            score = sum(
                content_lower.count(word) * lang_bonus
                for word in query_words
                if len(word) > 2
            )

            # Boost by place name match
            place_name = doc.get("place_name", "").lower()
            for word in query_words:
                if word in place_name:
                    score += 10

            if score > 0:
                scored_docs.append((score, content))

        # Sort by score and return top k
        scored_docs.sort(key=lambda x: x[0], reverse=True)
        return [doc for _, doc in scored_docs[:k]]

    def ingest_from_files(self) -> int:
        knowledge_dir = Path(KNOWLEDGE_PATH)
        if not knowledge_dir.exists():
            return 0
        documents = []
        for file_path in knowledge_dir.glob("**/*.json"):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                if isinstance(data, list):
                    documents.extend(data)
                elif isinstance(data, dict):
                    documents.append(data)
            except Exception as e:
                print(f"Error reading {file_path}: {e}")

        return self.ingest_documents(documents) if documents else 0

# Singleton
rag_service = RAGService()
# 🧠 WDR RAG System (Django + Next.js)

A production-oriented Retrieval-Augmented Generation (RAG) system built using **Django (backend)** and **Next.js (frontend)**. This project enables intelligent querying over PDF documents (e.g., World Development Report) using hybrid retrieval, reranking, and LLM-based answer generation.

---

# 🚀 Features

## 🔍 Core Capabilities

* PDF ingestion and processing
* Semantic chunking and embedding
* Hybrid retrieval (BM25 + vector search)
* Reranking for relevance improvement
* LLM-based answer generation
* Multi-answer generation + best answer selection
* Semantic validation (LLM judge)

---

## 🧠 Architecture Overview

```
User Query
   ↓
Query Processing / (Optional Rewrite)
   ↓
Hybrid Retrieval (BM25 + Vector)
   ↓
Reranker (Top-K refinement)
   ↓
Context Builder
   ↓
Multi-Answer Generation (LLM)
   ↓
Answer Selection (Best Answer)
   ↓
Validation Layer (LLM Judge)
   ↓
Final Response
```

---

# 📁 Project Structure

```
WDR-REPORT/
│
├── Backend/                # Django backend (RAG pipeline)
│   ├── rag/
│   │   ├── services/
│   │   │   ├── chunker.py
│   │   │   ├── embedder.py
│   │   │   ├── retriever.py
│   │   │   ├── bm25_retriever.py
│   │   │   ├── reranker.py
│   │   │   ├── vector_store.py
│   │   │   ├── pdf_loader.py
│   │   │   └── llm.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   ├── assets/             # PDF files
│   ├── chroma_db/          # (ignored) vector database
│   └── requirements.txt
│
├── wdr-frontend/           # Next.js frontend
│
├── .gitignore
└── README.md
```

---

# ⚙️ Tech Stack

## Backend

* Django
* ChromaDB (Vector Store)
* BM25 (Lexical Search)
* Sentence Transformers / Embedding Models
* Reranker (Cross-Encoder)
* LLM (API or local via Ollama)

## Frontend

* Next.js
* React

---

# 🛠️ Setup Instructions

## 1. Clone the repository

```bash
git clone https://github.com/your-username/WDR-RAG.git
cd WDR-RAG
```

---

## 2. Backend Setup (Django)

```bash
cd Backend
python -m venv .venv
source .venv/Scripts/activate   # Windows
pip install -r requirements.txt
```

### Run migrations

```bash
python manage.py migrate
```

### Ingest PDF

```bash
python manage.py ingest_pdf
```

### Run server

```bash
python manage.py runserver
```

---

## 3. Frontend Setup (Next.js)

```bash
cd wdr-frontend
npm install
npm run dev
```

---

# 🧪 Current System Status

| Component            | Status          |
| -------------------- | --------------- |
| PDF ingestion        | ✅               |
| Chunking             | ✅               |
| Embeddings           | ✅               |
| Hybrid Retrieval     | ✅               |
| Reranking            | ✅               |
| Multi-answer system  | ✅               |
| Validation layer     | ✅               |
| Evaluation framework | ❌ (to be added) |

---

# ⚠️ Known Limitations

* ❌ Images/graphs in PDFs are not processed (text-only pipeline)
* ❌ No evaluation dataset (performance not measurable yet)
* ❌ No multimodal support
* ❌ Possible over-engineering without metrics

---

# 🧠 Design Philosophy

This project avoids heavy framework abstraction and focuses on:

* Transparency
* Modular design
* Full control over pipeline
* Incremental improvement

---

# 🚀 Future Improvements

## 🔥 High Priority

* Add evaluation dataset (Q/A pairs)
* Implement accuracy + faithfulness metrics
* Logging & observability

## 🔥 Medium Priority

* Query rewriting
* Model routing (cost optimization)
* Context compression

## 🔥 Advanced

* Multimodal RAG (images + graphs)
* Answer grounding verification
* Feedback loop refinement



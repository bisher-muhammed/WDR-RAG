from rag.services.vector_store import get_vector_db
from rag.services.reranker import rerank
from rag.services.bm25_retriever import BM25Retriever
from rag.services.llm import rewrite_query


bm25 = None


def init_bm25(all_docs):
    global bm25
    bm25 = BM25Retriever(all_docs)


def retrieve_documents(query, top_k=7):
    db = get_vector_db()

    # 🔥 Query rewrite
    rewritten_query = rewrite_query(query)

    embedding_query = f"Represent this sentence for searching relevant passages: {rewritten_query}"

    # 🔹 Dense
    dense_docs = db.max_marginal_relevance_search(
        embedding_query, k=20, fetch_k=50
    )

    # 🔹 TRUE BM25 (full corpus)
    sparse_docs = bm25.search(rewritten_query, top_k=20) if bm25 else []

    # 🔥 Merge + dedupe
    combined = {}
    for d in dense_docs + sparse_docs:
        combined[d.page_content] = d

    merged_docs = list(combined.values())

    # 🔹 Filter junk
    filtered_docs = [
        d for d in merged_docs
        if len(d.page_content.strip()) > 80 and not d.page_content.startswith("http")
    ]

    # 🔹 Strong rerank
    return rerank(query, filtered_docs, top_k=top_k)

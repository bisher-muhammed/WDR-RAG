from sentence_transformers import CrossEncoder
import numpy as np

reranker = CrossEncoder("BAAI/bge-reranker-base")


# 🔹 Doc reranking (unchanged but cleaned)
def rerank(query, docs, top_k=7, batch_size=16):
    if not docs:
        return []

    pairs = [(query, doc.page_content) for doc in docs]

    scores = reranker.predict(
        pairs,
        batch_size=batch_size,
        convert_to_numpy=True,
        show_progress_bar=False
    )

    # Normalize
    if len(scores) > 1:
        norm_scores = (scores - scores.min()) / (scores.max() - scores.min() + 1e-8)
    else:
        norm_scores = scores

    ranked = sorted(zip(docs, norm_scores), key=lambda x: x[1], reverse=True)

    result = []
    for doc, score in ranked[:top_k]:
        doc.metadata["rerank_score"] = float(score)
        result.append(doc)

    return result


# 🔥 NEW: Answer scoring using reranker
def score_answers(query, answers):
    if not answers:
        return []

    pairs = [(query, ans) for ans in answers]

    scores = reranker.predict(
        pairs,
        convert_to_numpy=True,
        show_progress_bar=False
    )

    # Normalize
    if len(scores) > 1:
        scores = (scores - scores.min()) / (scores.max() - scores.min() + 1e-8)

    return scores.tolist()
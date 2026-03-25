import re
from rank_bm25 import BM25Okapi


class BM25Retriever:
    def __init__(self, documents):
        self.docs = documents
        self.corpus = [self.tokenize(doc.page_content) for doc in documents]
        self.bm25 = BM25Okapi(self.corpus)

    def tokenize(self, text):
        text = text.lower()
        text = re.sub(r"[^\w\s]", "", text)
        return text.split()

    def search(self, query, top_k=20):
        tokenized_query = self.tokenize(query)
        scores = self.bm25.get_scores(tokenized_query)

        ranked = sorted(
            zip(self.docs, scores),
            key=lambda x: x[1],
            reverse=True
        )

        return [doc for doc, _ in ranked[:top_k]]
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')

def embed_texts(chunks):
    """
    Generates embeddings for a list of text chunks.

    Args:
        chunks (List[str]): A list of text chunks to be embedded.

    Returns:
        List[List[float]]: A list of embeddings for each chunk.
    """
    texts = [c["content"] for c in chunks]
    embedings = model.encode(texts)
    return embedings

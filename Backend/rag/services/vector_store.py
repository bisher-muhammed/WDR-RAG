from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from django.conf import settings
import os


def get_embeddings():
    return HuggingFaceEmbeddings(
        model_name="BAAI/bge-base-en-v1.5",  
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True}
    )


def get_vector_db():
    persist_directory = os.path.join(settings.BASE_DIR, "chroma_db")

    embedding_function = get_embeddings()

    db = Chroma(
        collection_name="pdf_docs",
        embedding_function=embedding_function,
        persist_directory=persist_directory
    )

    return db


def store_chunks(chunks):
    db = get_vector_db()

    texts = [c["content"] for c in chunks]
    metadatas = [c["metadata"] for c in chunks]

    db.add_texts(
        texts=texts,
        metadatas=metadatas
    )
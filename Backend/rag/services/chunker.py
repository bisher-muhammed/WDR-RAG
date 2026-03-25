from langchain_text_splitters import RecursiveCharacterTextSplitter

def chunk_text(pages):
    
    docs = []

    for page in pages:
        docs.append({
            "page_content": page["content"],
            "metadata": page["metadata"]
        })

    # Proper semantic splitter
    splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=100,
    separators=["\n\n", "\n", ".", " "]
)

    split_docs = splitter.create_documents(
        [d["page_content"] for d in docs],
        metadatas=[d["metadata"] for d in docs]
    )

    # Convert back to your format
    chunks = [
        {
            "content": doc.page_content,
            "metadata": doc.metadata
        }
        for doc in split_docs
    ]

    return chunks
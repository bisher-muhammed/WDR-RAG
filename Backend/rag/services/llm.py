from transformers import AutoTokenizer, T5ForConditionalGeneration
import torch
import re
from rag.services.reranker import score_answers

model_name = "google/flan-t5-large"

tokenizer = AutoTokenizer.from_pretrained(model_name)
model = T5ForConditionalGeneration.from_pretrained(model_name)


# 🔥 NEW: Query rewrite
def rewrite_query(query):
    prompt = f"""
Rewrite the query to improve document retrieval.

- Add missing keywords
- Keep meaning same
- Be concise

Query: {query}

Rewritten:
"""

    inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=256)

    with torch.no_grad():
        outputs = model.generate(**inputs, max_new_tokens=50)

    rewritten = tokenizer.decode(outputs[0], skip_special_tokens=True).strip()

    return rewritten if len(rewritten) > 5 else query


# 🔥 NEW: Context compression (REPLACES build_context)
def compress_context(query, docs, max_sentences=8):
    query_words = set(query.lower().split())
    scored = []

    for d in docs:
        sentences = re.split(r'(?<=[.!?]) +', d.page_content)

        for sent in sentences:
            words = set(sent.lower().split())
            overlap = len(query_words & words)

            if overlap > 0:
                score = overlap / (len(query_words) + 1)
                scored.append((sent, score))

    scored.sort(key=lambda x: x[1], reverse=True)

    return " ".join([s[0] for s in scored[:max_sentences]])


# 🔥 Multi-answer generation
def generate_multiple_answers(query, context, n=3):
    answers = []

    prompt = f"""
Answer using ONLY the context.

Rules:
- Clear and complete sentences
- No guessing

Context:
{context}

Question: {query}

Answer:
"""

    for _ in range(n):
        inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=1024)

        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=150,
                do_sample=True,
                temperature=0.7,
                top_p=0.9
            )

        ans = tokenizer.decode(outputs[0], skip_special_tokens=True).strip()
        answers.append(ans)

    return answers


# 🔹 Extract fallback
def extract_answer(query, docs):
    query_words = set(w for w in query.lower().split() if len(w) > 3)

    best_sentence = None
    best_score = 0

    for d in docs:
        sentences = re.split(r'(?<=[.!?]) +', d.page_content)

        for sent in sentences:
            words = set(sent.lower().split())
            overlap = len(query_words & words)

            if overlap > best_score and len(sent.split()) > 8:
                best_score = overlap
                best_sentence = sent.strip()

    return best_sentence


# 🔹 Main
def generate_answer(query, docs):
    context = compress_context(query, docs)

    answers = generate_multiple_answers(query, context, n=3)

    scores = score_answers(query, answers)

    best_idx = int(max(range(len(scores)), key=lambda i: scores[i]))
    best_answer = answers[best_idx]
    best_score = scores[best_idx]

    if best_score < 0.3 or len(best_answer.split()) < 6:
        extracted = extract_answer(query, docs)
        return extracted if extracted else "Answer not found."

    return best_answer

import fitz
import re

def clean_text(text):
    # Fix hyphenated line breaks (Projec-\ntions → Projections)
    text = re.sub(r"-\n", "", text)

    # Normalize multiple newlines
    text = re.sub(r"\n+", "\n", text)

    lines = text.split("\n")
    cleaned_lines = []

    buffer = ""

    for line in lines:
        line = line.strip()

        # Skip completely useless lines
        if len(line) < 5:
            continue

        # Skip reference markers like "a. something"
        if re.match(r"^[a-z]\.\s", line):
            continue

        # 🔥 Merge lines intelligently
        if buffer:
            # If previous line doesn't end properly → join
            if not buffer.endswith((".", ":", ";")):
                buffer += " " + line
            else:
                cleaned_lines.append(buffer)
                buffer = line
        else:
            buffer = line

    if buffer:
        cleaned_lines.append(buffer)

    # Join into paragraph-style text
    return " ".join(cleaned_lines)


def load_pdf(file_path):
    doc = fitz.open(file_path)
    pages = []

    for page_num, page in enumerate(doc):
        raw_text = page.get_text("text")

        if not raw_text.strip():
            continue

        text = clean_text(raw_text)

        if not text:
            continue

        pages.append({
            "content": text,
            "metadata": {
                "page": page_num + 1,
                "source": file_path,
                "length": len(text)   # useful for debugging
            }
        })

    return pages



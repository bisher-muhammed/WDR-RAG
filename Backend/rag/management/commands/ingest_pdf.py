from django.core.management.base import BaseCommand
from django.conf import settings
from rag.services.pdf_loader import load_pdf
from rag.services.chunker import chunk_text
from rag.services.vector_store import store_chunks
import os
import shutil

class Command(BaseCommand):
    help = "Ingest PDF into vector DB"

    def handle(self, *args, **kwargs):
        file_path = os.path.join(settings.BASE_DIR, "assets", "WDR_FullReport-1.pdf")

        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR("PDF file not found"))
            return

        # Clear old DB (important)
        db_path = os.path.join(settings.BASE_DIR, "chroma_db")
        if os.path.exists(db_path):
            shutil.rmtree(db_path)

        try:
            self.stdout.write("Loading PDF...")
            pages = load_pdf(file_path)

            if not pages:
                self.stdout.write(self.style.ERROR("No pages extracted"))
                return

            self.stdout.write("Chunking...")
            chunks = chunk_text(pages)

            if not chunks:
                self.stdout.write(self.style.ERROR("No chunks created"))
                return

            self.stdout.write(f"Total chunks: {len(chunks)}")

            self.stdout.write("Storing in Chroma...")
            store_chunks(chunks)

            self.stdout.write(self.style.SUCCESS("Done"))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error: {str(e)}"))
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from rag.services.retriever import retrieve_documents
from rag.services.llm import generate_answer


class RAGQueryView(APIView):

    def post(self, request):
        query = request.data.get("query")

        if not query:
            return Response(
                {"error": "Query is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            docs = retrieve_documents(query)
            answer = generate_answer(query, docs)

            sources = [
            {
                "page": d.metadata.get("page"),
                "score": d.metadata.get("rerank_score", 0),  # ✅ fixes NaN%
                "content": d.page_content[:200]
            }
            for d in docs
        ]

            return Response({
                "query": query,
                "answer": answer,
                "sources": sources
            })

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
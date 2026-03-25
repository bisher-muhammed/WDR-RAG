from django.urls import path
from .views import RAGQueryView

urlpatterns = [
    path("rag/query/", RAGQueryView.as_view(), name="rag-query"),
]

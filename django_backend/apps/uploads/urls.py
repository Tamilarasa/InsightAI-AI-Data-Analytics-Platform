from django.urls import path
from .views import UploadFileView, FileListView

urlpatterns = [
    path("upload/", UploadFileView.as_view()),
    path("list/", FileListView.as_view()),
]
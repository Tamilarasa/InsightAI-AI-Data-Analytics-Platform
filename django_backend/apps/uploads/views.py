import os
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from .models import UploadedFile
from .serializers import UploadedFileSerializer
from .services.data_processor import analyze_file


class UploadFileView(generics.CreateAPIView):
    queryset = UploadedFile.objects.all()
    serializer_class = UploadedFileSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        instance = serializer.save(user=self.request.user)

        file_path = instance.file.path
        analysis = analyze_file(file_path)

        instance.analysis_result = analysis
        instance.save()

        self.analysis_result = analysis

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)

        return Response({
            "message": "File uploaded and analyzed successfully",
            "data": response.data
        })


class FileListView(generics.ListAPIView):
    serializer_class = UploadedFileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UploadedFile.objects.filter(user=self.request.user)
    


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"message": "You are authenticated"})
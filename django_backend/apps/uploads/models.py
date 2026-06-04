from django.db import models
from django.conf import settings


class UploadedFile(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    file = models.FileField(upload_to="datasets/")
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=50)

    uploaded_at = models.DateTimeField(auto_now_add=True)

    # ✅ ADD THIS (VERY IMPORTANT FOR YOUR PROJECT)
    analysis_result = models.JSONField(null=True, blank=True)

    def __str__(self):
        return self.file_name
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

def home(request):
    return JsonResponse({
        "message": "InsightAI Backend Running Successfully"
    })

urlpatterns = [
    path("", home),

    path("admin/", admin.site.urls),

    path(
        "api/accounts/",
        include("apps.accounts.urls")
    ),

    path(
        "api/token/",
        TokenObtainPairView.as_view()
    ),

    path(
        "api/token/refresh/",
        TokenRefreshView.as_view()
    ),
    path(
    "api/uploads/",
    include("apps.uploads.urls")
),
]
from django.urls import path
from .views import HomeView, FileUploadView, FileAnalysisView
from .views import AIInsightView
from .views import DatasetChatView
from .views import ChartDataView
from .views import RegisterView
from .views import TopEmployeesView


urlpatterns = [
    path("home/", HomeView.as_view()),
    path("uploads/", FileUploadView.as_view()),
    path("analyze/<int:file_id>/", FileAnalysisView.as_view()),
    path("insights/<int:file_id>/", AIInsightView.as_view()),
    path("chat/<int:file_id>/", DatasetChatView.as_view()),
    path("chart/<int:file_id>/", ChartDataView.as_view()),
    path("register/", RegisterView.as_view()),
    path("top-employees/<int:file_id>/", TopEmployeesView.as_view()),
]
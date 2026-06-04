import pandas as pd
import google.generativeai as genai
import traceback
from django.conf import settings
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from .models import UploadedFile
from .serializers import FileUploadSerializer

from .serializers import (
    RegisterSerializer,
    UserSerializer
)


def safe_read_file(file_path, filename):
    try:
        if filename.endswith(".xlsx"):
            return pd.read_excel(file_path)

        # Try normal CSV first
        try:
            return pd.read_csv(
                file_path,
                encoding="utf-8",
                engine="python",
                on_bad_lines="skip"
            )
        except:
            # fallback for messy files
            return pd.read_csv(
                file_path,
                encoding="latin1",
                engine="python",
                on_bad_lines="skip"
            )

    except Exception as e:
        raise Exception(f"File cannot be read: {str(e)}")


class RegisterView(
    generics.CreateAPIView
):
    serializer_class = RegisterSerializer


class ProfileView(
    generics.RetrieveAPIView
):

    serializer_class = UserSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_object(self):
        return self.request.user

class HomeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "message": "Home API working 🚀",
            "user": request.user.username
        })
    

class FileUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        file = request.FILES.get("file")

        if not file:
            return Response({"error": "No file uploaded"}, status=400)
        allowed_extensions = [".csv", ".xlsx"]

        if not any(file.name.endswith(ext) for ext in allowed_extensions):
         return Response(
        {"error": "Only CSV and XLSX files are allowed"},
        status=400
    )

        uploaded = UploadedFile.objects.create(
            file=file,
            filename=file.name
        )

        serializer = FileUploadSerializer(uploaded)

        return Response({
            "message": "File uploaded successfully 🚀",
            "data": serializer.data
        })
class FileAnalysisView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, file_id):
        try:
            file_obj = UploadedFile.objects.get(id=file_id)
            file_path = file_obj.file.path

            # Read dataset safely
            try:
                if file_obj.filename.endswith(".xlsx"):
                    df = safe_read_file(file_path, file_obj.filename)
                else:
                    df = pd.read_csv(
                        file_path,
                        sep=None,
                        engine="python",
                        encoding_errors="ignore",
                        on_bad_lines="skip"
                    )
            except Exception as e:
                return Response(
                    {"error": f"Cannot read dataset: {str(e)}"},
                    status=400
                )

            data = {
                "rows": len(df),
                "columns": list(df.columns),
                "missing_values": df.isnull().sum().to_dict(),
                "summary": df.describe(include="all").fillna("").to_dict(),
                 "numeric_summary" : df.describe().to_dict()
            }

            return Response({
                "message": "Analysis complete 🚀",
                "filename": file_obj.filename,
                "analysis": data
            })

        except UploadedFile.DoesNotExist:
            return Response(
                {"error": "Dataset not found"},
                status=404
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=500
            )
class AIInsightView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, file_id):
        try:
            file_obj = UploadedFile.objects.get(id=file_id)
            df = pd.read_csv(file_obj.file.path)

            insights = []

            # BASIC INFO
            rows, cols = df.shape
            insights.append(
                f"This dataset contains {rows} records and {cols} features."
            )

            # MISSING DATA
            missing = df.isnull().sum().sum()
            if missing == 0:
                insights.append(
                    "There is no missing data, which indicates clean data quality."
                )
            else:
                insights.append(
                    f"There are {missing} missing values that may affect analysis."
                )

            # NUMERIC ANALYSIS (HUMAN STYLE)
            numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns

            for col in numeric_cols:
                mean_val = df[col].mean()
                std_val = df[col].std()

                if std_val > mean_val:
                    insights.append(
                        f"The column '{col}' shows high variation, meaning values are widely spread."
                    )
                else:
                    insights.append(
                        f"The column '{col}' is relatively stable with consistent values around {mean_val:.2f}."
                    )

            # FINAL SUMMARY (IMPORTANT PART)
            insights.append(
                "Overall, this dataset appears suitable for deeper AI/ML analysis and pattern discovery."
            )

            return Response({
                "file": file_obj.filename,
                "ai_summary": " ".join(insights),
                "insights": insights
            })

        except Exception as e:
            return Response({"error": str(e)}, status=500)

class DatasetChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, file_id):
        try:
            user_question = request.data.get("message")

            if not user_question:
                return Response(
                    {"error": "Message is required"},
                    status=400
                )

            file_obj = UploadedFile.objects.get(id=file_id)

            df = safe_read_file(
                file_obj.file.path,
                file_obj.filename
            )

            rows, cols = df.shape
            columns = list(df.columns)

            system_prompt = f"""
You are an AI Data Analyst.

Dataset: {file_obj.filename}
Rows: {rows}
Columns: {cols}

Available Columns:
{', '.join(columns)}
"""

            genai.configure(
                api_key=settings.GEMINI_API_KEY
            )

            model = genai.GenerativeModel("gemini-2.5-flash")

            response = model.generate_content(
                f"""
{system_prompt}

User Question:
{user_question}
"""
            )

            answer = response.text

            return Response({
                "question": user_question,
                "reply": answer
            })

        except Exception as e:
            print("\n===== CHAT ERROR =====")
            print(traceback.format_exc())
            print("======================\n")

            return Response(
                {"error": str(e)},
                status=500
            )

        except Exception as e:
            print("\n===== CHAT ERROR =====")
            print(traceback.format_exc())
            print(str(e))
            print("======================\n")
            # This catches any other unexpected crashes and sends it to the frontend safely instead of a 500 error
            return Response({"error": str(e)}, status=500)
        
class ChartDataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, file_id):
        try:
            file_obj = UploadedFile.objects.get(id=file_id)

            df = safe_read_file(file_obj.file.path, file_obj.filename)
            df = df.dropna(how="all")

            rows, cols = df.shape

            # Convert useful columns to numeric safely
            for col in ["Salary", "Performance", "Experience", "Age"]:
                if col in df.columns:
                    df[col] = pd.to_numeric(df[col], errors="coerce")

            # -----------------------------
            # KPI CALCULATIONS
            # -----------------------------
            kpis = {
                "rows": int(rows),
                "columns": int(cols),
                "missing_values": int(df.isnull().sum().sum()),
                "avg_salary": round(float(df["Salary"].mean()), 2) if "Salary" in df.columns else 0,
                "max_salary": round(float(df["Salary"].max()), 2) if "Salary" in df.columns else 0,
                "min_salary": round(float(df["Salary"].min()), 2) if "Salary" in df.columns else 0,
                "avg_performance": round(float(df["Performance"].mean()), 2) if "Performance" in df.columns else 0,
                "avg_experience": round(float(df["Experience"].mean()), 2) if "Experience" in df.columns else 0,
            }

            # -----------------------------
            # BAR 1: Average Salary by Department
            # -----------------------------
            salary_by_department = {}

            if "Department" in df.columns and "Salary" in df.columns:
                grouped = (
                    df.groupby("Department")["Salary"]
                    .mean()
                    .round(2)
                    .sort_values(ascending=False)
                )

                salary_by_department = {
                    "title": "Average Salary by Department",
                    "labels": grouped.index.astype(str).tolist(),
                    "values": grouped.values.tolist(),
                }

            # -----------------------------
            # BAR 2: Average Performance by Department
            # -----------------------------
            performance_by_department = {}

            if "Department" in df.columns and "Performance" in df.columns:
                grouped = (
                    df.groupby("Department")["Performance"]
                    .mean()
                    .round(2)
                    .sort_values(ascending=False)
                )

                performance_by_department = {
                    "title": "Average Performance by Department",
                    "labels": grouped.index.astype(str).tolist(),
                    "values": grouped.values.tolist(),
                }

            # -----------------------------
            # PIE: Department Distribution
            # -----------------------------
            department_distribution = {}

            if "Department" in df.columns:
                counts = df["Department"].fillna("Unknown").value_counts()

                department_distribution = {
                    "title": "Department Distribution",
                    "labels": counts.index.astype(str).tolist(),
                    "values": counts.values.tolist(),
                }

            # -----------------------------
            # HISTOGRAM: Salary Distribution
            # -----------------------------
            salary_distribution = {}

            if "Salary" in df.columns:
                salary_data = df["Salary"].dropna()

                if len(salary_data) > 0:
                    bins = pd.cut(salary_data, bins=6)
                    counts = bins.value_counts().sort_index()

                    salary_distribution = {
                        "title": "Salary Distribution",
                        "labels": [str(interval) for interval in counts.index],
                        "values": counts.values.tolist(),
                    }

            # -----------------------------
            # LINE: Performance Trend
            # -----------------------------
            performance_trend = {}

            if "Performance" in df.columns:
                trend = df["Performance"].head(30).fillna(0)

                performance_trend = {
                    "title": "Performance Trend",
                    "labels": [str(i + 1) for i in range(len(trend))],
                    "values": trend.tolist(),
                }

            # -----------------------------
            # SCATTER: Salary vs Performance
            # -----------------------------
            salary_vs_performance = {}

            if "Salary" in df.columns and "Performance" in df.columns:
                scatter_df = df[["Salary", "Performance"]].dropna().head(80)

                salary_vs_performance = {
                    "title": "Salary vs Performance",
                    "values": [
                        {
                            "x": float(row["Salary"]),
                            "y": float(row["Performance"])
                        }
                        for _, row in scatter_df.iterrows()
                    ],
                }

            return Response({
                "message": "Advanced analytics charts generated successfully",
                "filename": file_obj.filename,
                "kpis": kpis,
                "salary_by_department": salary_by_department,
                "performance_by_department": performance_by_department,
                "department_distribution": department_distribution,
                "salary_distribution": salary_distribution,
                "performance_trend": performance_trend,
                "salary_vs_performance": salary_vs_performance,
            })

        except UploadedFile.DoesNotExist:
            return Response(
                {"error": "Dataset not found"},
                status=404
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=500
            )
class TopEmployeesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, file_id):
        try:
            file_obj = UploadedFile.objects.get(id=file_id)

            df = safe_read_file(file_obj.file.path, file_obj.filename)

            df = df.dropna(how="all")

            if "Performance" not in df.columns:
                return Response(
                    {"error": "Performance column not found in dataset"},
                    status=400
                )

            df["Performance"] = pd.to_numeric(
                df["Performance"],
                errors="coerce"
            ).fillna(0)

            top_employees = df.sort_values(
                by="Performance",
                ascending=False
            ).head(10)

            preferred_columns = [
                "EmployeeID",
                "Name",
                "Department",
                "City",
                "Salary",
                "Experience",
                "Performance"
            ]

            available_columns = [
                col for col in preferred_columns
                if col in top_employees.columns
            ]

            table_data = top_employees[available_columns].fillna("").to_dict(
                orient="records"
            )

            return Response({
                "message": "Top employees fetched successfully",
                "filename": file_obj.filename,
                "columns": available_columns,
                "rows": table_data
            })

        except UploadedFile.DoesNotExist:
            return Response(
                {"error": "Dataset not found"},
                status=404
            )

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=500
            )
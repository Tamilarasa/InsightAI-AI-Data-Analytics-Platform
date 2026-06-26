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

            df.columns = [str(col).strip() for col in df.columns]

            col_map = {col.lower(): col for col in df.columns}

            def find_col(name):
                return col_map.get(name.lower())

            employee_id_col = find_col("EmployeeID")
            name_col = find_col("Name")
            department_col = find_col("Department")
            age_col = find_col("Age")
            salary_col = find_col("Salary")
            experience_col = find_col("Experience")
            city_col = find_col("City")
            performance_col = find_col("Performance")

            numeric_columns = [
                age_col,
                salary_col,
                experience_col,
                performance_col,
            ]

            for col in numeric_columns:
                if col:
                    df[col] = pd.to_numeric(df[col], errors="coerce")

            def clean_value(value):
                if pd.isna(value):
                    return None
                return round(float(value), 2)

            def chart_mean(category_col, value_col, top=10, ascending=False):
                if not category_col or not value_col:
                    return {"labels": [], "values": []}

                temp = df[[category_col, value_col]].dropna()

                if temp.empty:
                    return {"labels": [], "values": []}

                result = (
                    temp.groupby(category_col)[value_col]
                    .mean()
                    .round(2)
                    .sort_values(ascending=ascending)
                    .head(top)
                )

                return {
                    "labels": [str(x) for x in result.index.tolist()],
                    "values": result.values.tolist(),
                }

            def chart_count(category_col, top=10):
                if not category_col:
                    return {"labels": [], "values": []}

                result = df[category_col].dropna().value_counts().head(top)

                return {
                    "labels": [str(x) for x in result.index.tolist()],
                    "values": result.values.tolist(),
                }

            def numeric_distribution(value_col, bins=5):
                if not value_col:
                    return {"labels": [], "values": []}

                values = df[value_col].dropna()

                if values.empty or values.nunique() < 2:
                    return {"labels": [], "values": []}

                cuts = pd.cut(values, bins=bins)
                counts = cuts.value_counts().sort_index()

                labels = []
                for interval in counts.index:
                    labels.append(f"{int(interval.left):,} - {int(interval.right):,}")

                return {
                    "labels": labels,
                    "values": counts.values.tolist(),
                }

            def band_performance(source_col, bins, labels):
                if not source_col or not performance_col:
                    return {"labels": [], "values": []}

                temp = df[[source_col, performance_col]].dropna()

                if temp.empty:
                    return {"labels": [], "values": []}

                temp["Band"] = pd.cut(
                    temp[source_col],
                    bins=bins,
                    labels=labels,
                    include_lowest=True,
                )

                result = (
                    temp.groupby("Band", observed=False)[performance_col]
                    .mean()
                    .dropna()
                    .round(2)
                )

                return {
                    "labels": [str(x) for x in result.index.tolist()],
                    "values": result.values.tolist(),
                }

            salary_series = df[salary_col].dropna() if salary_col else pd.Series(dtype=float)
            performance_series = df[performance_col].dropna() if performance_col else pd.Series(dtype=float)
            experience_series = df[experience_col].dropna() if experience_col else pd.Series(dtype=float)
            age_series = df[age_col].dropna() if age_col else pd.Series(dtype=float)

            performance_max = performance_series.max() if not performance_series.empty else 0

            high_perf_limit = 85 if performance_max > 10 else 8
            low_perf_limit = 60 if performance_max > 10 else 5

            high_performers = 0
            low_performers = 0

            if performance_col:
                high_performers = int((df[performance_col] >= high_perf_limit).sum())
                low_performers = int((df[performance_col] <= low_perf_limit).sum())

            missing_values = int(df.isnull().sum().sum())

            salary_performance_corr = None
            experience_performance_corr = None

            if salary_col and performance_col:
                temp = df[[salary_col, performance_col]].dropna()
                if len(temp) > 1:
                    salary_performance_corr = clean_value(
                        temp[salary_col].corr(temp[performance_col])
                    )

            if experience_col and performance_col:
                temp = df[[experience_col, performance_col]].dropna()
                if len(temp) > 1:
                    experience_performance_corr = clean_value(
                        temp[experience_col].corr(temp[performance_col])
                    )

            kpis = {
                "rows": int(df.shape[0]),
                "columns": int(df.shape[1]),
                "missing_values": missing_values,
                "avg_salary": clean_value(salary_series.mean()) if not salary_series.empty else None,
                "median_salary": clean_value(salary_series.median()) if not salary_series.empty else None,
                "max_salary": clean_value(salary_series.max()) if not salary_series.empty else None,
                "min_salary": clean_value(salary_series.min()) if not salary_series.empty else None,
                "avg_performance": clean_value(performance_series.mean()) if not performance_series.empty else None,
                "avg_experience": clean_value(experience_series.mean()) if not experience_series.empty else None,
                "avg_age": clean_value(age_series.mean()) if not age_series.empty else None,
                "high_performers": high_performers,
                "low_performers": low_performers,
                "salary_performance_corr": salary_performance_corr,
                "experience_performance_corr": experience_performance_corr,
            }

            salary_by_department = chart_mean(department_col, salary_col)
            performance_by_department = chart_mean(department_col, performance_col)
            department_distribution = chart_count(department_col)
            city_performance = chart_mean(city_col, performance_col)
            city_distribution = chart_count(city_col)
            salary_distribution = numeric_distribution(salary_col, bins=6)

            if performance_col:
                if performance_max > 10:
                    perf_bins = [0, 50, 70, 85, 100]
                    perf_labels = ["Low", "Average", "Good", "Excellent"]
                else:
                    perf_bins = [0, 4, 6, 8, 10]
                    perf_labels = ["Low", "Average", "Good", "Excellent"]

                temp_perf = df[performance_col].dropna()
                if not temp_perf.empty:
                    perf_cut = pd.cut(
                        temp_perf,
                        bins=perf_bins,
                        labels=perf_labels,
                        include_lowest=True,
                    )
                    perf_counts = perf_cut.value_counts().sort_index()

                    performance_distribution = {
                        "labels": [str(x) for x in perf_counts.index.tolist()],
                        "values": perf_counts.values.tolist(),
                    }
                else:
                    performance_distribution = {"labels": [], "values": []}
            else:
                performance_distribution = {"labels": [], "values": []}

            experience_performance = band_performance(
                experience_col,
                [-1, 1, 3, 5, 10, 100],
                ["0-1 yrs", "2-3 yrs", "4-5 yrs", "6-10 yrs", "10+ yrs"],
            )

            age_performance = band_performance(
                age_col,
                [0, 25, 35, 45, 60, 100],
                ["<25", "25-35", "35-45", "45-60", "60+"],
            )

            salary_vs_performance = {"values": []}

            if salary_col and performance_col:
                temp = df[[salary_col, performance_col]].dropna().head(300)

                salary_vs_performance = {
                    "values": [
                        {
                            "x": float(row[salary_col]),
                            "y": float(row[performance_col]),
                        }
                        for _, row in temp.iterrows()
                    ]
                }

            performance_trend = {"labels": [], "values": []}

            if performance_col:
                trend = df[performance_col].dropna().head(50)
                performance_trend = {
                    "labels": [str(i + 1) for i in range(len(trend))],
                    "values": trend.round(2).tolist(),
                }

            compensation_efficiency = {"labels": [], "values": []}

            if department_col and salary_col and performance_col:
                temp = df[[department_col, salary_col, performance_col]].dropna()
                temp = temp[temp[salary_col] > 0]

                if not temp.empty:
                    temp["Efficiency"] = (temp[performance_col] / temp[salary_col]) * 1000

                    result = (
                        temp.groupby(department_col)["Efficiency"]
                        .mean()
                        .round(2)
                        .sort_values(ascending=False)
                        .head(10)
                    )

                    compensation_efficiency = {
                        "labels": [str(x) for x in result.index.tolist()],
                        "values": result.values.tolist(),
                    }

            top_employees = []

            if performance_col:
                preferred_columns = [
                    employee_id_col,
                    name_col,
                    department_col,
                    city_col,
                    salary_col,
                    experience_col,
                    performance_col,
                ]

                available_columns = [col for col in preferred_columns if col]

                top_df = (
                    df.sort_values(by=performance_col, ascending=False)
                    .head(10)[available_columns]
                    .fillna("")
                )

                top_employees = top_df.to_dict(orient="records")

            department_table = []

            if department_col:
                agg_data = {
                    "Employees": (department_col, "count"),
                }

                if salary_col:
                    agg_data["Avg Salary"] = (salary_col, "mean")

                if performance_col:
                    agg_data["Avg Performance"] = (performance_col, "mean")

                if experience_col:
                    agg_data["Avg Experience"] = (experience_col, "mean")

                dept_summary = (
                    df.groupby(department_col)
                    .agg(**agg_data)
                    .reset_index()
                    .round(2)
                )

                department_table = dept_summary.to_dict(orient="records")

            insights = []

            if performance_by_department["labels"]:
                insights.append(
                    f"Best performing department is {performance_by_department['labels'][0]} with an average performance of {performance_by_department['values'][0]}."
                )

            if salary_by_department["labels"]:
                insights.append(
                    f"Highest average salary department is {salary_by_department['labels'][0]} with ₹{salary_by_department['values'][0]} average salary."
                )

            if city_performance["labels"]:
                insights.append(
                    f"Top performing city is {city_performance['labels'][0]} with average performance of {city_performance['values'][0]}."
                )

            if salary_performance_corr is not None:
                if salary_performance_corr >= 0.5:
                    insights.append(
                        "Salary and performance have a strong positive relationship."
                    )
                elif salary_performance_corr <= -0.5:
                    insights.append(
                        "Salary and performance have a negative relationship. Higher salary does not guarantee better performance."
                    )
                else:
                    insights.append(
                        "Salary and performance have a weak relationship. Performance may depend more on experience, department, or other factors."
                    )

            if high_performers:
                insights.append(
                    f"There are {high_performers} high-performing employees in this dataset."
                )

            if low_performers:
                insights.append(
                    f"There are {low_performers} low-performing employees who may need training or support."
                )

            if missing_values == 0:
                insights.append("Dataset quality is good because there are no missing values.")
            else:
                insights.append(
                    f"Dataset has {missing_values} missing values. Cleaning is recommended before final business decisions."
                )

            return Response(
                {
                    "message": "Professional business dashboard generated successfully",
                    "filename": file_obj.filename,
                    "kpis": kpis,
                    "business_insights": insights,
                    "salary_by_department": salary_by_department,
                    "performance_by_department": performance_by_department,
                    "department_distribution": department_distribution,
                    "city_performance": city_performance,
                    "city_distribution": city_distribution,
                    "salary_distribution": salary_distribution,
                    "performance_distribution": performance_distribution,
                    "experience_performance": experience_performance,
                    "age_performance": age_performance,
                    "salary_vs_performance": salary_vs_performance,
                    "performance_trend": performance_trend,
                    "compensation_efficiency": compensation_efficiency,
                    "top_employees": top_employees,
                    "department_table": department_table,
                }
            )

        except UploadedFile.DoesNotExist:
            return Response({"error": "Dataset not found"}, status=404)

        except Exception as e:
            return Response({"error": str(e)}, status=500)
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
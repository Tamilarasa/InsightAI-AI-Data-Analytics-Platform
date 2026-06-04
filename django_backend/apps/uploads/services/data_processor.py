import pandas as pd
import os
from PyPDF2 import PdfReader

def analyze_file(file_path):

    file_ext = os.path.splitext(file_path)[1].lower()

    # ---------------- CSV ----------------
    if file_ext == ".csv":
        df = pd.read_csv(file_path)

    # ---------------- EXCEL ----------------
    elif file_ext in [".xls", ".xlsx"]:
        df = pd.read_excel(file_path)

    # ---------------- PDF ----------------
    elif file_ext == ".pdf":
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text()

        return {
            "type": "pdf",
            "content_preview": text[:1000]
        }

    else:
        return {"error": "Unsupported file type"}

    # ---------------- COMMON ANALYSIS ----------------
    return {
        "rows": len(df),
        "columns": len(df.columns),
        "column_names": list(df.columns),
        "missing_values": int(df.isnull().sum().sum()),
        "data_types": df.dtypes.astype(str).to_dict(),
        "preview": df.head(5).to_dict(orient="records")
    }
import { useRef, useState } from "react";
import API from "../services/api";

export default function QuickUpload() {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      const res = await API.post("accounts/uploads/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const fileId = res.data?.data?.id || res.data?.id || res.data?.file_id;

      if (!fileId) {
        alert("Upload completed, but file ID was not found.");
        return;
      }

      localStorage.setItem("file_id", fileId);

      alert("Dataset uploaded successfully ✅");

      window.location.href = "/dashboard";
    } catch (err) {
      console.log("QUICK UPLOAD ERROR:", err.response?.data || err);
      alert("Upload failed. Please try again.");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  return (
    <div style={styles.box}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept=".csv,.xlsx,.xls"
        style={{ display: "none" }}
      />

      <button style={styles.button} onClick={openFilePicker} disabled={loading}>
        {loading ? "Uploading..." : "📤 Upload New Dataset"}
      </button>

      <p style={styles.note}>Upload anytime without logout</p>
    </div>
  );
}

const styles = {
  box: {
    margin: "18px auto 25px",
    padding: "14px",
    width: "115px",
    borderRadius: "18px",
    background: "rgba(37, 99, 235, 0.14)",
    border: "1px solid rgba(96, 165, 250, 0.30)",
    textAlign: "center",
  },

  button: {
    width: "100%",
    padding: "12px 8px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(135deg, #2563eb, #4f46e5)",
    color: "#ffffff",
    fontWeight: "800",
    cursor: "pointer",
    fontSize: "13px",
    lineHeight: "1.25",
  },

  note: {
    margin: "9px 0 0",
    color: "#93c5fd",
    fontSize: "11px",
    lineHeight: "1.3",
  },
};
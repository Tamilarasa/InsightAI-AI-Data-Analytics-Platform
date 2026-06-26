import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Layout from "../components/layout";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a CSV or Excel file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await API.post("accounts/uploads/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const fileId = res.data.data.id;

      localStorage.setItem("file_id", fileId);

      setMessage("File uploaded successfully ✅");

      navigate("/dashboard");
    } catch (err) {
      console.log("UPLOAD ERROR:", err.response?.data);
      setMessage("Upload failed ❌");
    }
  };

  return (
    <Layout>
      <div style={styles.container}>
        <h1>📤 Upload Dataset</h1>
        <p>Upload CSV or Excel file to start analysis.</p>

        <div style={styles.card}>
          <input
            type="file"
            accept=".csv,.xlsx"
            onChange={(e) => setFile(e.target.files[0])}
            style={styles.input}
          />

          <button onClick={handleUpload} style={styles.button}>
            Upload Dataset
          </button>

          {message && <p>{message}</p>}
        </div>
      </div>
    </Layout>
  );
}

const styles = {
  container: {
    padding: "30px",
  },

  card: {
    background: "rgba(255,255,255,0.06)",
    padding: "30px",
    borderRadius: "14px",
    marginTop: "20px",
    maxWidth: "500px",
  },

  input: {
    display: "block",
    marginBottom: "20px",
    color: "#fff",
  },

  button: {
    padding: "12px 20px",
    border: "none",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },
};
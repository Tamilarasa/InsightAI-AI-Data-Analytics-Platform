import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Layout from "../components/layout";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [insights, setInsights] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fileId = localStorage.getItem("file_id");

    if (!fileId) {
      navigate("/upload");
      return;
    }

    API.get(`accounts/analyze/${fileId}/`)
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.log("DASHBOARD ERROR:", err.response?.data);
      });

    API.get(`accounts/insights/${fileId}/`)
      .then((res) => {
        setInsights(res.data);
      })
      .catch((err) => {
        console.log("INSIGHTS ERROR:", err.response?.data);
      });
  }, [navigate]);

  if (!data) {
    return (
      <Layout>
        <h2 style={{ color: "#fff" }}>Loading dashboard...</h2>
      </Layout>
    );
  }

  const analysis = data.analysis;

  const totalMissing = Object.values(
    analysis.missing_values || {}
  ).reduce((a, b) => a + b, 0);

  return (
    <Layout>
      <div style={styles.container}>
        <h1 style={styles.title}>📊 AI Data Analytics Dashboard</h1>
        <p style={styles.subtitle}>File: {data.filename}</p>

        <div style={styles.cardGrid}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Rows</h3>
            <p style={styles.cardValue}>{analysis.rows}</p>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Columns</h3>
            <p style={styles.cardValue}>{analysis.columns.length}</p>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Missing Values</h3>
            <p style={styles.cardValue}>{totalMissing}</p>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📁 Dataset Columns</h2>

          <div style={styles.tagContainer}>
            {analysis.columns.map((col, index) => (
              <span key={index} style={styles.tag}>
                {col}
              </span>
            ))}
          </div>
        </div>

        <div style={styles.insightBox}>
          <h2 style={styles.sectionTitle}>🤖 AI Insights</h2>

          {!insights ? (
            <p style={styles.loadingText}>Generating AI insights...</p>
          ) : (
            <>
              <p style={styles.aiSummary}>{insights.ai_summary}</p>

              <div style={styles.insightList}>
                {insights.insights?.map((item, index) => (
                  <div key={index} style={styles.insightItem}>
                    ✅ {item}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "30px",
    background: "#0f172a",
    color: "#ffffff",
  },

  title: {
    fontSize: "32px",
    marginBottom: "8px",
    color: "#ffffff",
  },

  subtitle: {
    color: "#cbd5e1",
    marginBottom: "30px",
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },

  card: {
    background: "rgba(255,255,255,0.08)",
    padding: "25px",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  cardTitle: {
    color: "#cbd5e1",
    fontSize: "16px",
    marginBottom: "12px",
  },

  cardValue: {
    color: "#ffffff",
    fontSize: "34px",
    fontWeight: "bold",
    margin: 0,
  },

  section: {
    background: "rgba(255,255,255,0.08)",
    padding: "25px",
    borderRadius: "16px",
    marginBottom: "25px",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  sectionTitle: {
    color: "#ffffff",
    marginBottom: "20px",
  },

  tagContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },

  tag: {
    background: "#2563eb",
    color: "#ffffff",
    padding: "8px 14px",
    borderRadius: "20px",
    fontSize: "13px",
  },

  insightBox: {
    background: "linear-gradient(135deg, #1e3a8a, #312e81)",
    padding: "28px",
    borderRadius: "18px",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 10px 35px rgba(0,0,0,0.35)",
  },

  aiSummary: {
    color: "#e5e7eb",
    lineHeight: "1.7",
    fontSize: "15px",
    marginBottom: "20px",
  },

  insightList: {
    display: "grid",
    gap: "12px",
  },

  insightItem: {
    background: "rgba(255,255,255,0.12)",
    padding: "14px",
    borderRadius: "12px",
    color: "#ffffff",
    lineHeight: "1.5",
  },

  loadingText: {
    color: "#cbd5e1",
  },
};
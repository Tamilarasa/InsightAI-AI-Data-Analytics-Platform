import { useEffect, useState } from "react";
import API from "../services/api";
import Layout from "../components/layout";

export default function Analysis() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fileId = localStorage.getItem("file_id");

    if (!fileId) return;

    API.get(`accounts/analyze/${fileId}/`)
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.log("ANALYSIS ERROR:", err.response?.data);
      });
  }, []);

  if (!data) {
    return (
      <Layout>
        <h2 style={{ color: "#fff" }}>Loading analysis...</h2>
      </Layout>
    );
  }

  const analysis = data.analysis;
  const summary = analysis.summary || {};
  const missingValues = analysis.missing_values || {};

  return (
    <Layout>
      <div style={styles.container}>
        <h1 style={styles.title}>📁 Detailed Dataset Analysis</h1>
        <p style={styles.subtitle}>File: {data.filename}</p>

        <div style={styles.reportBox}>
          <h2>📌 Dataset Report</h2>

          <div style={styles.infoGrid}>
            <div style={styles.infoCard}>
              <span>Total Rows</span>
              <strong>{analysis.rows}</strong>
            </div>

            <div style={styles.infoCard}>
              <span>Total Columns</span>
              <strong>{analysis.columns.length}</strong>
            </div>

            <div style={styles.infoCard}>
              <span>Total Missing Values</span>
              <strong>
                {Object.values(missingValues).reduce((a, b) => a + b, 0)}
              </strong>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h2>🧾 Column Details</h2>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Column Name</th>
                <th style={styles.th}>Missing Values</th>
              </tr>
            </thead>

            <tbody>
              {analysis.columns.map((col, index) => (
                <tr key={index}>
                  <td style={styles.td}>{col}</td>
                  <td style={styles.td}>{missingValues[col]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={styles.section}>
          <h2>📊 Statistical Summary</h2>

          <div style={styles.statsGrid}>
            {Object.keys(summary).map((col) => (
              <div key={col} style={styles.statCard}>
                <h3>{col}</h3>

                {Object.entries(summary[col]).map(([key, value]) => (
                  <div key={key} style={styles.statRow}>
                    <span>{key}</span>
                    <strong>{String(value)}</strong>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

const styles = {
  container: {
    padding: "30px",
    color: "#ffffff",
  },

  title: {
    fontSize: "32px",
    marginBottom: "8px",
  },

  subtitle: {
    color: "#cbd5e1",
    marginBottom: "30px",
  },

  reportBox: {
    background: "linear-gradient(135deg, #1e3a8a, #312e81)",
    padding: "25px",
    borderRadius: "18px",
    marginBottom: "30px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "15px",
    marginTop: "20px",
  },

  infoCard: {
    background: "rgba(255,255,255,0.12)",
    padding: "18px",
    borderRadius: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  section: {
    background: "rgba(255,255,255,0.08)",
    padding: "25px",
    borderRadius: "18px",
    marginBottom: "30px",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "15px",
  },

  th: {
    textAlign: "left",
    padding: "12px",
    background: "rgba(255,255,255,0.12)",
    color: "#ffffff",
  },

  td: {
    padding: "12px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    color: "#e5e7eb",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  },

  statCard: {
    background: "rgba(15,23,42,0.9)",
    padding: "20px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  statRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    color: "#cbd5e1",
  },
};
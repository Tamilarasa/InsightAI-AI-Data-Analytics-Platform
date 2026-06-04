import { useEffect, useState } from "react";
import API from "../services/api";
import Layout from "../components/layout";

export default function TablePage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fileId = localStorage.getItem("file_id");

    if (!fileId) return;

    API.get(`accounts/top-employees/${fileId}/`)
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.log("TABLE ERROR:", err.response?.data);
      });
  }, []);

  if (!data) {
    return (
      <Layout>
        <h2 style={{ color: "#fff" }}>Loading top employees...</h2>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={styles.container}>
        <h1 style={styles.title}>🏆 Top 10 Employees by Performance</h1>
        <p style={styles.subtitle}>File: {data.filename}</p>

        <div style={styles.card}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Rank</th>

                {data.columns.map((col) => (
                  <th key={col} style={styles.th}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.rows.map((row, index) => (
                <tr key={index}>
                  <td style={styles.td}>#{index + 1}</td>

                  {data.columns.map((col) => (
                    <td key={col} style={styles.td}>
                      {row[col]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
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

  card: {
    background: "rgba(255,255,255,0.08)",
    padding: "25px",
    borderRadius: "18px",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "14px",
    background: "rgba(37,99,235,0.4)",
    color: "#ffffff",
    fontSize: "14px",
  },

  td: {
    padding: "14px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    color: "#e5e7eb",
    fontSize: "14px",
  },
};
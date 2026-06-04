import Layout from "../components/layout";

export default function Home() {
  const fileId = localStorage.getItem("file_id");

  return (
    <Layout>
      <div style={styles.container}>
        <div style={styles.hero}>
          <h1 style={styles.logo}>🚀 InsightAI</h1>

          <h2 style={styles.heading}>
            AI Data Analytics Platform
          </h2>

          <p style={styles.subtitle}>
            Upload datasets, generate AI insights, chat with your data,
            visualize trends, and analyze employee performance in one place.
          </p>

          <div style={styles.statusBox}>
            <span style={styles.statusDot}></span>

            {fileId ? (
              <span>Dataset active — File ID: {fileId}</span>
            ) : (
              <span>No dataset uploaded yet. Use the sidebar to upload a dataset.</span>
            )}
          </div>
        </div>

        <div style={styles.infoGrid}>
          <div style={styles.infoCard}>
            <h3>🔐 Authentication</h3>
            <p>Login and register system is active.</p>
          </div>

          <div style={styles.infoCard}>
            <h3>📊 Analytics Engine</h3>
            <p>Dataset analysis, charts, and AI insights are ready.</p>
          </div>

          <div style={styles.infoCard}>
            <h3>🤖 AI Assistant</h3>
            <p>Ask questions about your uploaded dataset using AI chat.</p>
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

  hero: {
    background: "linear-gradient(135deg, #1e3a8a, #312e81, #0f172a)",
    padding: "40px",
    borderRadius: "24px",
    marginBottom: "35px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
  },

  logo: {
    color: "#60a5fa",
    fontSize: "28px",
    marginBottom: "10px",
  },

  heading: {
    fontSize: "42px",
    marginBottom: "15px",
  },

  subtitle: {
    color: "#dbeafe",
    maxWidth: "750px",
    lineHeight: "1.7",
    fontSize: "16px",
  },

  statusBox: {
    marginTop: "25px",
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    background: "rgba(255,255,255,0.12)",
    padding: "12px 16px",
    borderRadius: "14px",
    color: "#ffffff",
  },

  statusDot: {
    width: "10px",
    height: "10px",
    background: "#22c55e",
    borderRadius: "50%",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "22px",
  },

  infoCard: {
    background: "rgba(255,255,255,0.08)",
    padding: "25px",
    borderRadius: "18px",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 12px 35px rgba(0,0,0,0.25)",
  },
};
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await API.post("token/", {
        username,
        password,
      });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      navigate("/");
    } catch (err) {
      console.log("LOGIN ERROR:", err.response?.data);
      setError("Invalid username or password");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.logo}>🚀 InsightAI</h1>
        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>
          Login to your AI Data Analytics Platform
        </p>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
          <p style={styles.registerText}>
  Don’t have an account?{" "}
  <span style={styles.link} onClick={() => navigate("/register")}>
    Register
  </span>
</p>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.button}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #020617, #0f172a, #1e3a8a)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Arial",
    color: "#fff",
  },

  card: {
    width: "380px",
    background: "rgba(255,255,255,0.08)",
    padding: "35px",
    borderRadius: "20px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
    border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(15px)",
  },

  logo: {
    textAlign: "center",
    color: "#60a5fa",
    marginBottom: "20px",
  },

  title: {
    textAlign: "center",
    fontSize: "28px",
    marginBottom: "8px",
  },

  subtitle: {
    textAlign: "center",
    color: "#cbd5e1",
    marginBottom: "25px",
    fontSize: "14px",
  },

  input: {
    width: "100%",
    padding: "13px",
    marginBottom: "15px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    outline: "none",
    fontSize: "14px",
  },

  button: {
    width: "100%",
    padding: "13px",
    border: "none",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "15px",
    cursor: "pointer",
    marginTop: "10px",
  },

  error: {
    color: "#f87171",
    fontSize: "14px",
    marginBottom: "10px",
    textAlign: "center",
  },
  registerText: {
  textAlign: "center",
  marginTop: "18px",
  color: "#cbd5e1",
  fontSize: "14px",
},

link: {
  color: "#60a5fa",
  cursor: "pointer",
  fontWeight: "bold",
},
};
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== password2) {
      setError("Passwords do not match");
      return;
    }

    try {
      await API.post("accounts/register/", {
        username,
        email,
        password,
        password2,
      });

      setSuccess("Account created successfully ✅");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      console.log("REGISTER ERROR:", err.response?.data);

      setError(
        err.response?.data?.username?.[0] ||
          err.response?.data?.email?.[0] ||
          err.response?.data?.password?.[0] ||
          err.response?.data?.password2?.[0] ||
          "Registration failed"
      );
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.logo}>🚀 InsightAI</h1>

        <h2 style={styles.title}>Create Account</h2>

        <p style={styles.subtitle}>
          Register to start using AI Data Analytics Platform
        </p>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            style={styles.input}
          />

          {error && <p style={styles.error}>{error}</p>}
          {success && <p style={styles.success}>{success}</p>}

          <button type="submit" style={styles.button}>
            Register
          </button>
        </form>

        <p style={styles.loginText}>
          Already have an account?{" "}
          <span style={styles.link} onClick={() => navigate("/login")}>
            Login
          </span>
        </p>
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
    width: "400px",
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

  success: {
    color: "#4ade80",
    fontSize: "14px",
    marginBottom: "10px",
    textAlign: "center",
  },

  loginText: {
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
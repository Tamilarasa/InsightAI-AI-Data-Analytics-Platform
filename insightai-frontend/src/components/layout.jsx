import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(true);

  const menu = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "Analysis", path: "/analysis", icon: "📁" },
    { name: "Chat", path: "/chat", icon: "💬" },
    { name: "Charts", path: "/charts", icon: "📈" },
    { name: "Top Table", path: "/table", icon: "🏆" },
  ];

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div style={styles.wrapper}>
      {/* SIDEBAR */}
      <div style={{ ...styles.sidebar, width: open ? "240px" : "70px" }}>
        <div style={styles.topBar}>
          {open && <h2 style={styles.logo}>🚀 InsightAI</h2>}

          <button onClick={() => setOpen(!open)} style={styles.toggleBtn}>
            {open ? "⬅" : "➡"}
          </button>
        </div>

        {menu.map((item) => (
          <div
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              ...styles.menuItem,
              background:
                location.pathname === item.path
                  ? "rgba(255,255,255,0.08)"
                  : "transparent",
              backdropFilter: location.pathname === item.path ? "blur(10px)" : "none",
              justifyContent: open ? "flex-start" : "center",
            }}
          >
            <span style={styles.icon}>{item.icon}</span>
            {open && <span>{item.name}</span>}
          </div>
        ))}
      </div>

      {/* MAIN AREA */}
      <div style={styles.main}>
        {/* TOP HEADER */}
        <div style={styles.header}>
          <h3>AI Data Analytics Platform</h3>

          <button onClick={logout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>

        {/* CONTENT */}
        <div style={styles.content}>{children}</div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    height: "100vh",
    fontFamily: "Arial",
    background: "linear-gradient(135deg, #0f172a, #020617)",
    color: "#fff",
  },

  sidebar: {
    background: "rgba(255,255,255,0.03)",
    backdropFilter: "blur(15px)",
    padding: "15px",
    transition: "0.3s ease",
    borderRight: "1px solid rgba(255,255,255,0.05)",
  },

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },

  logo: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#60a5fa",
  },

  toggleBtn: {
    background: "rgba(255,255,255,0.08)",
    border: "none",
    color: "#fff",
    padding: "6px 10px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  menuItem: {
    padding: "12px",
    borderRadius: "12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px",
    transition: "0.2s ease",
  },

  icon: {
    fontSize: "16px",
  },

  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },

  header: {
    height: "60px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 20px",
    background: "rgba(255,255,255,0.03)",
    backdropFilter: "blur(15px)",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },

  logoutBtn: {
    background: "#ef4444",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    color: "#fff",
    cursor: "pointer",
  },

  content: {
    padding: "25px",
    overflowY: "auto",
  },
};
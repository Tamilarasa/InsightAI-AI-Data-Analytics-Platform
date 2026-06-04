import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div style={styles.nav}>
      <Link to="/">Home</Link>
      <Link to="/chat">Chat</Link>
      <Link to="/upload">Upload</Link>

      <button onClick={logout}>Logout</button>
    </div>
  );
}

const styles = {
  nav: {
    display: "flex",
    gap: "15px",
    padding: "10px",
    background: "#222",
    color: "white",
  },
};
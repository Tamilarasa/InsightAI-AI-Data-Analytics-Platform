import { useState } from "react";
import API from "../services/api";
import Layout from "../components/layout";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = { role: "user", text: message };
    const newChat = [...chat, userMsg];

    setChat(newChat);
    setMessage("");
    setLoading(true);

    try {
      const fileId = localStorage.getItem("file_id");

      if (!fileId) {
        setChat([
          ...newChat,
          {
            role: "ai",
            text: "Please upload a dataset first.",
          },
        ]);
        setLoading(false);
        return;
      }

      const res = await API.post(`accounts/chat/${fileId}/`, {
        message: message,
      });

      setChat([
        ...newChat,
        {
          role: "ai",
          text: res.data.reply,
        },
      ]);
    } catch (err) {
      console.log("ERROR:", err.response?.status);
      console.log("DATA:", err.response?.data);

      setChat([
        ...newChat,
        {
          role: "ai",
          text:
            err.response?.data?.error ||
            "Error connecting to server or AI API.",
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <Layout>
      <div style={styles.container}>
        <h1 style={styles.title}>🤖 InsightAI Assistant</h1>
        <p style={styles.subtitle}>
          Ask anything about your dataset or general data science questions.
        </p>

        <div style={styles.chatBox}>
          {chat.map((c, i) => (
            <div
              key={i}
              style={{
                ...styles.messageRow,
                justifyContent: c.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  ...styles.messageBubble,
                  background: c.role === "user" ? "#2563eb" : "#f3f4f6",
                  color: c.role === "user" ? "#fff" : "#111827",
                }}
              >
                {c.text}
              </div>
            </div>
          ))}

          {loading && (
            <div style={styles.messageRow}>
              <div style={styles.loadingBubble}>Thinking...</div>
            </div>
          )}
        </div>

        <div style={styles.inputRow}>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about missing values, summary, averages..."
            style={styles.input}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />

          <button onClick={sendMessage} style={styles.button}>
            Send
          </button>
        </div>
      </div>
    </Layout>
  );
}

const styles = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
  },

  title: {
    fontSize: "32px",
    marginBottom: "8px",
  },

  subtitle: {
    color: "#cbd5e1",
    marginBottom: "20px",
  },

  chatBox: {
    background: "#ffffff",
    height: "430px",
    borderRadius: "14px",
    padding: "18px",
    overflowY: "auto",
    marginBottom: "15px",
  },

  messageRow: {
    display: "flex",
    marginBottom: "14px",
  },

  messageBubble: {
    maxWidth: "75%",
    padding: "12px 15px",
    borderRadius: "14px",
    fontSize: "14px",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },

  loadingBubble: {
    background: "#e5e7eb",
    color: "#111827",
    padding: "12px 15px",
    borderRadius: "14px",
    fontSize: "14px",
  },

  inputRow: {
    display: "flex",
    gap: "10px",
  },

  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #334155",
    outline: "none",
  },

  button: {
    padding: "12px 22px",
    borderRadius: "10px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },
};
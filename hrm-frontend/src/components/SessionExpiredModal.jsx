import { LogIn } from "lucide-react";

function SessionExpiredModal({ message, onSignIn }) {
  return (
    <div style={s.overlay}>
      <div style={s.card}>
        <div style={s.iconWrap}>
          <LogIn size={22} color="#4F46E5" />
        </div>
        <h3 style={s.title}>Session expired</h3>
        <p style={s.message}>{message}</p>
        <button style={s.button} onClick={onSignIn}>
          Sign in again
        </button>
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(17,24,39,0.55)",
    backdropFilter: "blur(3px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    fontFamily: "'DM Sans', sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "360px",
    backgroundColor: "#fff",
    borderRadius: "14px",
    padding: "28px 26px",
    textAlign: "center",
    boxShadow: "0 20px 45px rgba(0,0,0,0.25)",
    margin: "0 16px",
  },
  iconWrap: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    backgroundColor: "#EEF2FF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 14px",
  },
  title: {
    fontSize: "1.15rem",
    fontWeight: 700,
    color: "#111827",
    marginBottom: "8px",
  },
  message: {
    fontSize: "0.875rem",
    color: "#6B7280",
    lineHeight: 1.55,
    marginBottom: "20px",
  },
  button: {
    width: "100%",
    padding: "11px",
    backgroundColor: "#1E1B4B",
    color: "#fff",
    border: "none",
    borderRadius: "9px",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
  },
};

export default SessionExpiredModal;
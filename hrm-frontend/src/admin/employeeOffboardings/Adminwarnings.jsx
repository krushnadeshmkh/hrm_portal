import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../layouts/sidebar";
import MobileTopBar from "../../employee/MobileTopBar";
import { Bell, Search, X, Check, AlertTriangle } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const API = import.meta.env.VITE_API_URL || "https://hrm-backend-vvqg.onrender.com";

const severityColors = {
  low: { bg: "#ECFDF5", text: "#059669", border: "#6EE7B7" },
  medium: { bg: "#FFFBEB", text: "#D97706", border: "#FCD34D" },
  high: { bg: "#FEF2F2", text: "#DC2626", border: "#FCA5A5" },
};

const statusColors = {
  active: { bg: "#FFFBEB", text: "#D97706" },
  acknowledged: { bg: "#EEF2FF", text: "#4F46E5" },
  resolved: { bg: "#ECFDF5", text: "#059669" },
};

export default function AdminWarnings() {
  const [warnings, setWarnings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({
    employee_id: "",
    subject: "",
    description: "",
    severity: "medium",
    warning_date: new Date().toISOString().split("T")[0],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const { isDark } = useTheme();

  const isMobile = window.innerWidth <= 768;
  const sidebarWidth = isMobile ? 0 : isOpen ? 255 : 68;
  const name = localStorage.getItem("name") || "Admin";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const token = localStorage.getItem("token");
  const headers = { "x-auth-token": token };

  const t = {
    bg: isDark ? "#0F1219" : "#F9FAFB",
    card: isDark ? "#161B27" : "#fff",
    border: isDark ? "#1E2535" : "#F1F3F9",
    textPrimary: isDark ? "#F3F4F6" : "#111827",
    textSecondary: isDark ? "#9CA3AF" : "#6B7280",
    textMuted: isDark ? "#6B7280" : "#9CA3AF",
    inputBg: isDark ? "#1E2535" : "#F9FAFB",
    inputBorder: isDark ? "#2D3748" : "#E5E7EB",
    topbar: isDark ? "#161B27" : "#fff",
    modalOverlay: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.45)",
    buttonPrimary: "#4F46E5",
    buttonDanger: "#DC2626",
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) setIsOpen(false);
      else setIsOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchWarnings();
    fetchEmployees();
  }, []);

  const fetchWarnings = async () => {
    try {
      const res = await axios.get(`${API}/api/warnings`, { headers });
      setWarnings(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API}/api/employees`, { headers });
      setEmployees(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    if (!form.employee_id || !form.subject || !form.description) {
      setError("All fields are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await axios.post(`${API}/api/warnings`, form, { headers });
      setShowModal(false);
      setForm({ employee_id: "", subject: "", description: "", severity: "medium", warning_date: new Date().toISOString().split("T")[0] });
      fetchWarnings();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create warning.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this warning?")) return;
    try {
      await axios.delete(`${API}/api/warnings/${id}`, { headers });
      setWarnings((prev) => prev.filter((w) => w._id !== id));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete.");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await axios.patch(`${API}/api/warnings/${id}/status`, { status }, { headers });
      setWarnings((prev) => prev.map((w) => (w._id === id ? res.data.data : w)));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update status.");
    }
  };

  const filtered = filter === "all" ? warnings : warnings.filter((w) => w.severity === filter);
  const getEmployeeName = (warning) => warning.employee_id?.user_id?.name || warning.employee_id?.name || "Unknown";

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: t.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
        .warn-row { transition: transform 0.15s, box-shadow 0.15s; }
        .warn-row:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(15,23,42,0.08) !important; }
        .search-input:focus { outline:none; border-color:#4F46E5 !important; box-shadow:0 0 0 3px rgba(79,70,229,0.10); }
        .topbar-btn:hover { background: ${isDark ? "#1E2535" : "#F3F4F6"} !important; }
        * { box-sizing: border-box; }
        @media (max-width: 768px) {
          .aw-main { padding: 76px 16px 32px !important; }
          .aw-header { flex-direction: column; align-items: flex-start !important; gap: 12px !important; }
          .aw-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .warn-actions { flex-direction: row !important; min-width: unset !important; }
          .aw-page-title { font-size: 1.45rem !important; }
        }
      `}</style>

      <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div
        className="aw-main"
        style={{
          marginLeft: `${sidebarWidth}px`,
          flex: 1,
          transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
          padding: "28px 28px 40px",
        }}
      >
        <div className="aw-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, animation: "fadeUp 0.4s ease both 0.05s" }}>
          <div>
            <p style={{ color: t.textSecondary, fontSize: "0.875rem", margin: "0 0 4px" }}>
              {greeting}, <strong style={{ color: "#4F46E5" }}>{name}</strong> 👋
            </p>
            <h1 className="aw-page-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.5rem, 4vw, 1.85rem)", fontWeight: 700, color: t.textPrimary, margin: 0, lineHeight: 1.2 }}>
              Warnings
            </h1>
            <p style={{ color: t.textMuted, fontSize: "0.85rem", margin: "5px 0 0" }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <button
            onClick={() => { setShowModal(true); setError(""); }}
            style={{
              background: t.buttonPrimary, color: "#fff", border: "none", borderRadius: 8,
              padding: "10px 20px", fontWeight: 600, fontSize: 14, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", transition: "opacity 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            + Issue Warning
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", animation: "fadeUp 0.4s ease both 0.1s" }}>
          {["all", "low", "medium", "high"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "6px 16px", borderRadius: 20,
                border: filter === f ? "2px solid #4F46E5" : `2px solid ${t.inputBorder}`,
                background: filter === f ? "#4F46E5" : t.card,
                color: filter === f ? "#fff" : t.textSecondary,
                fontWeight: 600, fontSize: 13, cursor: "pointer",
                textTransform: "capitalize", fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.15s",
              }}
            >
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 80 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 44, height: 44, border: "3px solid #E5E7EB", borderTop: "3px solid #4F46E5", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
              <p style={{ color: t.textMuted, fontWeight: 500, fontSize: "0.9rem" }}>Loading warnings...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, background: t.card, borderRadius: 14, color: t.textMuted, border: `1px solid ${t.border}`, animation: "fadeUp 0.4s ease both 0.15s" }}>
            <p style={{ fontWeight: 600, margin: 0, fontSize: 15 }}>No warnings found</p>
          </div>
        ) : (
          <div className="aw-table-wrap" style={{ animation: "fadeUp 0.4s ease both 0.15s" }}>
            <div style={{ minWidth: 640, display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map((w, idx) => {
                const sev = severityColors[w.severity] || severityColors.medium;
                const st = statusColors[w.status] || statusColors.active;
                return (
                  <div
                    key={w._id}
                    className="warn-row"
                    style={{
                      background: t.card,
                      borderRadius: 12,
                      padding: "18px 22px",
                      border: `1px solid ${t.border}`,
                      borderLeft: `4px solid ${sev.border}`,
                      boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.04)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 16,
                      animation: `fadeUp 0.4s ease both ${0.15 + idx * 0.04}s`,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: t.textPrimary }}>{getEmployeeName(w)}</span>
                        <span style={{ background: sev.bg, color: sev.text, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
                          {w.severity}
                        </span>
                        <span style={{ background: st.bg, color: st.text, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: "capitalize" }}>
                          {w.status}
                        </span>
                      </div>
                      <p style={{ fontWeight: 600, fontSize: 14, color: t.textSecondary, margin: "0 0 4px" }}>{w.subject}</p>
                      <p style={{ fontSize: 13, color: t.textMuted, margin: "0 0 6px", lineHeight: 1.5 }}>{w.description}</p>
                      <span style={{ fontSize: 12, color: t.textMuted }}>
                        Issued by <strong style={{ color: t.textSecondary }}>{w.issued_by?.name || "Admin"}</strong> · {new Date(w.warning_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <div className="warn-actions" style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 140 }}>
                      <select
                        value={w.status}
                        onChange={(e) => handleStatusChange(w._id, e.target.value)}
                        style={{
                          padding: "7px 10px", borderRadius: 8, border: `1px solid ${t.inputBorder}`,
                          fontSize: 12, background: t.inputBg, cursor: "pointer",
                          fontFamily: "'DM Sans', sans-serif", color: t.textSecondary, fontWeight: 600,
                        }}
                      >
                        <option value="active">Active</option>
                        <option value="acknowledged">Acknowledged</option>
                        <option value="resolved">Resolved</option>
                      </select>
                      <button
                        onClick={() => handleDelete(w._id)}
                        style={{
                          padding: "7px 10px", borderRadius: 8, border: `1px solid ${t.inputBorder}`,
                          background: t.buttonDeleteBg || "#FEF2F2", color: "#DC2626", fontSize: 12, fontWeight: 600,
                          cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div
          style={{ position: "fixed", inset: 0, background: t.modalOverlay, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "0 16px" }}
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div style={{ background: t.card, borderRadius: 16, padding: 32, width: "100%", maxWidth: 500, boxShadow: "0 20px 60px rgba(15,23,42,0.18)", border: `1px solid ${t.border}` }}>
            <h2 style={{ margin: "0 0 24px", fontSize: 20, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: t.textPrimary }}>Issue Warning</h2>

            {error && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FEE2E2", color: "#DC2626", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: t.textSecondary, marginBottom: 6, display: "block" }}>Employee</label>
                <select value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} style={{ width: "100%", padding: "9px 12px", border: `1px solid ${t.inputBorder}`, borderRadius: 8, fontSize: 14, color: t.textPrimary, background: t.inputBg }}>
                  <option value="">Select employee</option>
                  {employees.map((e) => (
                    <option key={e._id} value={e._id}>{e.name} — {e.designation || "Employee"}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: t.textSecondary, marginBottom: 6, display: "block" }}>Subject</label>
                <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Warning subject" className="search-input" style={{ width: "100%", padding: "9px 12px", border: `1px solid ${t.inputBorder}`, borderRadius: 8, fontSize: 14, color: t.textPrimary, background: t.inputBg }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: t.textSecondary, marginBottom: 6, display: "block" }}>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the reason for this warning..." rows={4} className="search-input" style={{ width: "100%", padding: "9px 12px", border: `1px solid ${t.inputBorder}`, borderRadius: 8, fontSize: 14, color: t.textPrimary, background: t.inputBg, resize: "vertical" }} />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: t.textSecondary, marginBottom: 6, display: "block" }}>Severity</label>
                  <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} style={{ width: "100%", padding: "9px 12px", border: `1px solid ${t.inputBorder}`, borderRadius: 8, fontSize: 14, color: t.textPrimary, background: t.inputBg }}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: t.textSecondary, marginBottom: 6, display: "block" }}>Date</label>
                  <input type="date" value={form.warning_date} onChange={(e) => setForm({ ...form, warning_date: e.target.value })} className="search-input" style={{ width: "100%", padding: "9px 12px", border: `1px solid ${t.inputBorder}`, borderRadius: 8, fontSize: 14, color: t.textPrimary, background: t.inputBg }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: "11px", border: `1px solid ${t.inputBorder}`, borderRadius: 8, background: t.card, color: t.textSecondary, fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{ flex: 1, padding: "11px", border: "none", borderRadius: 8, background: t.buttonPrimary, color: "#fff", fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", fontSize: 14, opacity: submitting ? 0.7 : 1, fontFamily: "'DM Sans', sans-serif" }}
                >
                  {submitting ? "Issuing..." : "Issue Warning"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
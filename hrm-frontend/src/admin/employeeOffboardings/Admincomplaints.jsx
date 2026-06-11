import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../layouts/sidebar";
import MobileTopBar from "../../employee/MobileTopBar";
import { Bell, Search, X, Check, AlertCircle } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

const priorityColors = {
  low: { bg: "#ECFDF5", text: "#059669" },
  medium: { bg: "#FFFBEB", text: "#D97706" },
  high: { bg: "#FEF2F2", text: "#DC2626" },
};

const statusConfig = {
  open: { bg: "#EEF2FF", text: "#4F46E5", label: "Open" },
  under_review: { bg: "#FFFBEB", text: "#D97706", label: "Under Review" },
  resolved: { bg: "#ECFDF5", text: "#059669", label: "Resolved" },
  dismissed: { bg: "#F3F4F6", text: "#6B7280", label: "Dismissed" },
};

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [resolveForm, setResolveForm] = useState({ status: "resolved", resolution_note: "" });
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("all");
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
    skeletonBg: isDark ? "#1E2535" : "#F3F4F6",
    rowHover: isDark ? "#1E2535" : "#F5F7FF",
    modalOverlay: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.45)",
    buttonPrimary: "#4F46E5",
    buttonCancel: isDark ? "#1E2535" : "#fff",
    buttonCancelText: isDark ? "#9CA3AF" : "#374151",
    arrowColor: isDark ? "#4B5563" : "#D1D5DB",
    noteBg: isDark ? "#1E2535" : "#F9FAFB",
    noteBorder: isDark ? "#6EE7B7" : "#059669",
    filterActive: "#4F46E5",
    filterInactiveBg: isDark ? "#161B27" : "#fff",
    filterInactiveText: isDark ? "#9CA3AF" : "#374151",
    filterBorder: isDark ? "#2D3748" : "#E5E7EB",
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
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await axios.get(`${API}/api/complaints`, { headers });
      setComplaints(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    setSubmitting(true);
    try {
      await axios.patch(`${API}/api/complaints/${selected._id}/resolve`, resolveForm, { headers });
      setSelected(null);
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update.");
    } finally {
      setSubmitting(false);
    }
  };

  const getName = (emp) => emp?.user_id?.name || emp?.name || "Unknown";
  const filtered = filter === "all" ? complaints : complaints.filter((c) => c.status === filter);

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: t.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
        .complaint-row { transition: transform 0.15s, box-shadow 0.15s; }
        .complaint-row:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(15,23,42,0.08) !important; }
        .filter-btn { transition: all 0.15s; }
        .manage-btn { transition: all 0.15s; }
        .manage-btn:hover { background: ${t.rowHover} !important; }
        .search-input:focus { outline:none; border-color:#4F46E5 !important; box-shadow:0 0 0 3px rgba(79,70,229,0.10); }
        .topbar-btn:hover { background: ${isDark ? "#1E2535" : "#F3F4F6"} !important; }
        * { box-sizing: border-box; }
        @media (max-width: 768px) {
          .ac-main { padding: 76px 16px 32px !important; }
          .ac-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .ac-page-title { font-size: 1.45rem !important; }
          .ac-topbar { display: none !important; }
        }
      `}</style>

      <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div
        className="ac-main"
        style={{
          marginLeft: `${sidebarWidth}px`,
          flex: 1,
          transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <div className="ac-topbar" style={{
          height: "64px", backgroundColor: t.topbar, borderBottom: `1px solid ${t.border}`,
          display: "flex", alignItems: "center", padding: "0 28px", gap: "16px",
          position: "sticky", top: 0, zIndex: 100, boxShadow: isDark ? "0 1px 4px rgba(0,0,0,0.3)" : "0 1px 4px rgba(15,23,42,0.04)",
        }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "380px" }}>
            <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: t.textMuted }} />
            <input
              className="search-input"
              placeholder="Search complaints..."
              style={{ width: "100%", padding: "8px 12px 8px 36px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "10px", fontSize: "0.875rem", color: t.textPrimary, backgroundColor: t.inputBg }}
            />
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
            <button className="topbar-btn" style={{ width: "38px", height: "38px", borderRadius: "10px", border: `1.5px solid ${t.inputBorder}`, background: t.card, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: t.textSecondary, position: "relative" }}>
              <span style={{ position: "absolute", top: "8px", right: "8px", width: "7px", height: "7px", borderRadius: "50%", background: "#EF4444", border: `1.5px solid ${t.card}` }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "9px", padding: "5px 12px 5px 6px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "10px", background: t.card, cursor: "pointer" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #4F46E5, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.72rem", fontWeight: "600" }}>
                {name.slice(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: "0.83rem", fontWeight: "500", color: t.textPrimary }}>{name}</span>
            </div>
          </div>
        </div>

        <div style={{ padding: "28px 28px 40px", flex: 1 }}>
          <div style={{ marginBottom: "28px", animation: "fadeUp 0.4s ease both 0.05s" }}>
            <p style={{ color: t.textSecondary, fontSize: "0.875rem", margin: "0 0 4px" }}>
              {greeting}, <strong style={{ color: "#4F46E5" }}>{name}</strong> 👋
            </p>
            <h1 className="ac-page-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.5rem, 4vw, 1.85rem)", fontWeight: 700, color: t.textPrimary, margin: 0, lineHeight: 1.2 }}>
              Complaints
            </h1>
            <p style={{ color: t.textMuted, fontSize: "0.85rem", margin: "5px 0 0" }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", animation: "fadeUp 0.4s ease both 0.1s" }}>
            {["all", "open", "under_review", "resolved", "dismissed"].map((f) => (
              <button
                key={f}
                className="filter-btn"
                onClick={() => setFilter(f)}
                style={{
                  padding: "6px 16px",
                  borderRadius: 20,
                  border: filter === f ? "2px solid #4F46E5" : `2px solid ${t.filterBorder}`,
                  background: filter === f ? t.filterActive : t.filterInactiveBg,
                  color: filter === f ? "#fff" : t.filterInactiveText,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.15s",
                }}
              >
                {f === "all" ? "All" : statusConfig[f]?.label || f}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 80 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 44, height: 44, border: "3px solid #E5E7EB", borderTop: "3px solid #4F46E5", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
                <p style={{ color: t.textMuted, fontWeight: 500, fontSize: "0.9rem" }}>Loading complaints...</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, background: t.card, borderRadius: 14, color: t.textMuted, border: `1px solid ${t.border}`, animation: "fadeUp 0.4s ease both 0.15s" }}>
              <p style={{ fontWeight: 600, margin: 0, fontSize: 15 }}>No complaints found</p>
            </div>
          ) : (
            <div className="ac-table-wrap" style={{ animation: "fadeUp 0.4s ease both 0.15s" }}>
              <div style={{ minWidth: 680, display: "flex", flexDirection: "column", gap: 10 }}>
                {filtered.map((c, idx) => {
                  const sc = statusConfig[c.status] || statusConfig.open;
                  const pc = priorityColors[c.priority] || priorityColors.medium;
                  return (
                    <div
                      key={c._id}
                      className="complaint-row"
                      style={{
                        background: t.card,
                        borderRadius: 12,
                        padding: "18px 22px",
                        border: `1px solid ${t.border}`,
                        boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.04)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 16,
                        animation: `fadeUp 0.4s ease both ${0.15 + idx * 0.04}s`,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: t.textPrimary }}>{getName(c.raised_by)}</span>
                          <span style={{ color: t.arrowColor, fontSize: 13 }}>→</span>
                          <span style={{ fontWeight: 700, fontSize: 14, color: t.textPrimary }}>{getName(c.against)}</span>
                          <span style={{ background: sc.bg, color: sc.text, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>{sc.label}</span>
                          <span style={{ background: pc.bg, color: pc.text, padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: "capitalize" }}>
                            {c.priority}
                          </span>
                        </div>
                        <p style={{ fontWeight: 600, fontSize: 14, color: t.textSecondary, margin: "0 0 4px" }}>{c.subject}</p>
                        <p style={{ fontSize: 13, color: t.textMuted, margin: "0 0 8px", lineHeight: 1.5 }}>{c.description}</p>
                        <div style={{ display: "flex", gap: 16, fontSize: 12, color: t.textMuted, flexWrap: "wrap" }}>
                          <span>{new Date(c.complaint_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                          {c.resolved_by && <span>Resolved by: <strong style={{ color: t.textSecondary }}>{c.resolved_by.name}</strong></span>}
                        </div>
                        {c.resolution_note && (
                          <p style={{ fontSize: 13, color: t.textSecondary, margin: "8px 0 0", padding: "8px 12px", background: t.noteBg, borderRadius: 8, borderLeft: `3px solid ${t.noteBorder}` }}>
                            {c.resolution_note}
                          </p>
                        )}
                      </div>
                      {(c.status === "open" || c.status === "under_review") && (
                        <button
                          className="manage-btn"
                          onClick={() => { setSelected(c); setResolveForm({ status: "under_review", resolution_note: "" }); }}
                          style={{
                            padding: "8px 16px",
                            border: `1px solid ${t.inputBorder}`,
                            borderRadius: 8,
                            background: t.card,
                            color: t.textSecondary,
                            fontWeight: 600,
                            fontSize: 13,
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                            fontFamily: "'DM Sans', sans-serif",
                            transition: "all 0.15s",
                          }}
                        >
                          Manage
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <div
          style={{ position: "fixed", inset: 0, background: t.modalOverlay, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "0 16px" }}
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}
        >
          <div style={{ background: t.card, borderRadius: 16, padding: 32, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(15,23,42,0.18)", border: `1px solid ${t.border}` }}>
            <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: t.textPrimary }}>Manage Complaint</h2>
            <p style={{ margin: "0 0 4px", color: t.textMuted, fontSize: 13 }}>
              <strong style={{ color: t.textPrimary }}>{getName(selected.raised_by)}</strong> against <strong style={{ color: t.textPrimary }}>{getName(selected.against)}</strong>
            </p>
            <p style={{ margin: "0 0 24px", color: t.textSecondary, fontSize: 13 }}>{selected.subject}</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: t.textSecondary, marginBottom: 6, display: "block" }}>Update Status</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["under_review", "resolved", "dismissed"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setResolveForm({ ...resolveForm, status: s })}
                      style={{
                        padding: "8px 14px",
                        border: resolveForm.status === s ? "2px solid #4F46E5" : `2px solid ${t.inputBorder}`,
                        borderRadius: 8,
                        background: resolveForm.status === s ? "#4F46E5" : t.card,
                        color: resolveForm.status === s ? "#fff" : t.textSecondary,
                        fontWeight: 600,
                        fontSize: 12,
                        cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                        transition: "all 0.15s",
                      }}
                    >
                      {statusConfig[s]?.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: t.textSecondary, marginBottom: 6, display: "block" }}>Resolution Note</label>
                <textarea
                  value={resolveForm.resolution_note}
                  onChange={(e) => setResolveForm({ ...resolveForm, resolution_note: e.target.value })}
                  placeholder="Describe how this was handled..."
                  rows={3}
                  className="search-input"
                  style={{ width: "100%", padding: "9px 12px", border: `1px solid ${t.inputBorder}`, borderRadius: 8, fontSize: 14, color: t.textPrimary, background: t.inputBg, resize: "vertical", fontFamily: "'DM Sans', sans-serif" }}
                />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setSelected(null)}
                  style={{ flex: 1, padding: "11px", border: `1px solid ${t.inputBorder}`, borderRadius: 8, background: t.buttonCancel, fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: t.buttonCancelText }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleResolve}
                  disabled={submitting}
                  style={{
                    flex: 1, padding: "11px", border: "none", borderRadius: 8, background: t.buttonPrimary, color: "#fff",
                    fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", fontSize: 14, opacity: submitting ? 0.7 : 1, fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
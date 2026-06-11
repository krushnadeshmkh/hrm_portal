import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../layouts/sidebar";
import MobileTopBar from "../../employee/MobileTopBar";
import { Bell, Search, X, Check } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const API = import.meta.env.VITE_API_URL || "https://hrm-backend-vvqg.onrender.com";

const statusConfig = {
  pending: { bg: "#FFFBEB", text: "#D97706", label: "Pending" },
  approved: { bg: "#ECFDF5", text: "#059669", label: "Approved" },
  rejected: { bg: "#FEF2F2", text: "#DC2626", label: "Rejected" },
  withdrawn: { bg: "#F3F4F6", text: "#6B7280", label: "Withdrawn" },
};

export default function AdminResignations() {
  const [resignations, setResignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [reviewForm, setReviewForm] = useState({ status: "approved", admin_note: "" });
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
    modalOverlay: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.45)",
    buttonPrimary: "#4F46E5",
    avatarBg: isDark ? "#1E1B4B" : "#EEF2FF",
    avatarText: isDark ? "#818CF8" : "#4F46E5",
    noteBg: isDark ? "#1E2535" : "#F9FAFB",
    noteBorder: isDark ? "#4F46E5" : "#4F46E5",
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
    fetchResignations();
  }, []);

  const fetchResignations = async () => {
    try {
      const res = await axios.get(`${API}/api/resignations`, { headers });
      setResignations(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    setSubmitting(true);
    try {
      await axios.patch(`${API}/api/resignations/${selected._id}/review`, reviewForm, { headers });
      setSelected(null);
      fetchResignations();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to review.");
    } finally {
      setSubmitting(false);
    }
  };

  const getEmployeeName = (r) => r.employee_id?.user_id?.name || r.employee_id?.name || "Unknown";
  const getEmployeeEmail = (r) => r.employee_id?.user_id?.email || r.employee_id?.email || "";
  const filtered = filter === "all" ? resignations : resignations.filter((r) => r.status === filter);

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: t.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
        .res-row { transition: transform 0.15s, box-shadow 0.15s; }
        .res-row:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(15,23,42,0.08) !important; }
        .search-input:focus { outline:none; border-color:#4F46E5 !important; box-shadow:0 0 0 3px rgba(79,70,229,0.10); }
        .topbar-btn:hover { background: ${isDark ? "#1E2535" : "#F3F4F6"} !important; }
        * { box-sizing: border-box; }
        @media (max-width: 768px) {
          .ar-main { padding: 76px 16px 32px !important; }
          .ar-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .ar-filter-row { overflow-x: auto; padding-bottom: 4px; flex-wrap: nowrap !important; }
          .ar-page-title { font-size: 1.45rem !important; }
        }
      `}</style>

      <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div
        className="ar-main"
        style={{
          marginLeft: `${sidebarWidth}px`,
          flex: 1,
          transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
          padding: "28px 28px 40px",
        }}
      >
        <div style={{ marginBottom: "28px", animation: "fadeUp 0.4s ease both 0.05s" }}>
          <p style={{ color: t.textSecondary, fontSize: "0.875rem", margin: "0 0 4px" }}>
            {greeting}, <strong style={{ color: "#4F46E5" }}>{name}</strong> 👋
          </p>
          <h1 className="ar-page-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.5rem, 4vw, 1.85rem)", fontWeight: 700, color: t.textPrimary, margin: 0, lineHeight: 1.2 }}>
            Resignations
          </h1>
          <p style={{ color: t.textMuted, fontSize: "0.85rem", margin: "5px 0 0" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        <div className="ar-filter-row" style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", animation: "fadeUp 0.4s ease both 0.1s" }}>
          {["all", "pending", "approved", "rejected", "withdrawn"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "6px 16px",
                borderRadius: 20,
                border: filter === f ? "2px solid #4F46E5" : `2px solid ${t.inputBorder}`,
                background: filter === f ? "#4F46E5" : t.card,
                color: filter === f ? "#fff" : t.textSecondary,
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                whiteSpace: "nowrap",
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
              <p style={{ color: t.textMuted, fontWeight: 500, fontSize: "0.9rem" }}>Loading resignations...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, background: t.card, borderRadius: 14, color: t.textMuted, border: `1px solid ${t.border}`, animation: "fadeUp 0.4s ease both 0.15s" }}>
            <p style={{ fontWeight: 600, margin: 0, fontSize: 15 }}>No resignations found</p>
          </div>
        ) : (
          <div className="ar-table-wrap" style={{ animation: "fadeUp 0.4s ease both 0.15s" }}>
            <div style={{ minWidth: 620, display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.map((r, idx) => {
                const sc = statusConfig[r.status] || statusConfig.pending;
                return (
                  <div
                    key={r._id}
                    className="res-row"
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
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: "50%", background: t.avatarBg,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 700, fontSize: 15, color: t.avatarText, flexShrink: 0,
                        }}>
                          {getEmployeeName(r)[0]?.toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: t.textPrimary }}>{getEmployeeName(r)}</p>
                          <p style={{ margin: 0, fontSize: 12, color: t.textMuted }}>{getEmployeeEmail(r)}</p>
                        </div>
                        <span style={{ background: sc.bg, color: sc.text, padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: "uppercase", whiteSpace: "nowrap" }}>
                          {sc.label}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: t.textSecondary, margin: "0 0 10px", lineHeight: 1.5 }}>{r.reason}</p>
                      <div style={{ display: "flex", gap: 20, fontSize: 12, color: t.textMuted, flexWrap: "wrap" }}>
                        <span>Notice: <strong style={{ color: t.textSecondary }}>{new Date(r.notice_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</strong></span>
                        <span>Last day: <strong style={{ color: t.textPrimary }}>{new Date(r.last_working_day).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</strong></span>
                        {r.reviewed_by && <span>Reviewed by: <strong style={{ color: t.textSecondary }}>{r.reviewed_by.name}</strong></span>}
                      </div>
                      {r.admin_note && (
                        <p style={{ fontSize: 13, color: t.textMuted, margin: "10px 0 0", padding: "8px 12px", background: t.noteBg, borderRadius: 8, borderLeft: `3px solid ${t.noteBorder}` }}>
                          {r.admin_note}
                        </p>
                      )}
                    </div>
                    {r.status === "pending" && (
                      <button
                        onClick={() => { setSelected(r); setReviewForm({ status: "approved", admin_note: "" }); }}
                        style={{
                          padding: "8px 16px", border: `1px solid ${t.inputBorder}`, borderRadius: 8,
                          background: t.card, color: t.textSecondary, fontWeight: 600, fontSize: 13,
                          cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif",
                          transition: "all 0.15s",
                        }}
                      >
                        Review
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {selected && (
        <div
          style={{ position: "fixed", inset: 0, background: t.modalOverlay, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "0 16px" }}
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}
        >
          <div style={{ background: t.card, borderRadius: 16, padding: 32, width: "100%", maxWidth: 460, boxShadow: "0 20px 60px rgba(15,23,42,0.18)", border: `1px solid ${t.border}` }}>
            <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: t.textPrimary }}>Review Resignation</h2>
            <p style={{ margin: "0 0 24px", color: t.textMuted, fontSize: 13 }}>
              {getEmployeeName(selected)} · Last day: <strong style={{ color: t.textPrimary }}>{new Date(selected.last_working_day).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</strong>
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: t.textSecondary, marginBottom: 6, display: "block" }}>Decision</label>
                <div style={{ display: "flex", gap: 10 }}>
                  {["approved", "rejected"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setReviewForm({ ...reviewForm, status: s })}
                      style={{
                        flex: 1, padding: "10px",
                        border: reviewForm.status === s ? "2px solid #4F46E5" : `2px solid ${t.inputBorder}`,
                        borderRadius: 8,
                        background: reviewForm.status === s ? "#4F46E5" : t.card,
                        color: reviewForm.status === s ? "#fff" : t.textSecondary,
                        fontWeight: 600, fontSize: 13, cursor: "pointer",
                        textTransform: "capitalize", fontFamily: "'DM Sans', sans-serif",
                        transition: "all 0.15s",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: t.textSecondary, marginBottom: 6, display: "block" }}>Admin Note (optional)</label>
                <textarea
                  value={reviewForm.admin_note}
                  onChange={(e) => setReviewForm({ ...reviewForm, admin_note: e.target.value })}
                  placeholder="Add a note for the employee..."
                  rows={3}
                  className="search-input"
                  style={{ width: "100%", padding: "9px 12px", border: `1px solid ${t.inputBorder}`, borderRadius: 8, fontSize: 14, color: t.textPrimary, background: t.inputBg, resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setSelected(null)}
                  style={{ flex: 1, padding: "11px", border: `1px solid ${t.inputBorder}`, borderRadius: 8, background: t.card, fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: t.textSecondary }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReview}
                  disabled={submitting}
                  style={{
                    flex: 1, padding: "11px", border: "none", borderRadius: 8, background: t.buttonPrimary, color: "#fff",
                    fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", fontSize: 14, opacity: submitting ? 0.7 : 1, fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
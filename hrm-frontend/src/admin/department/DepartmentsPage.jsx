import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../layouts/sidebar";
import MobileTopBar from "../../employee/MobileTopBar";
import { Search, Bell, Building2, Plus, Pencil, Trash2, Clock, X, Check } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formName, setFormName] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { isDark } = useTheme();

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
    tableHead: isDark ? "#111827" : "#FAFBFF",
    statIconBg: isDark ? "#1E1B4B" : "#EEF2FF",
    statIconColor: isDark ? "#818CF8" : "#4F46E5",
    modalOverlay: isDark ? "rgba(0,0,0,0.7)" : "rgba(15,23,42,0.5)",
    buttonPrimary: "#4F46E5",
    buttonDanger: "#EF4444",
    buttonEditBg: isDark ? "#1E1B4B" : "#EEF2FF",
    buttonEditColor: isDark ? "#818CF8" : "#4F46E5",
    buttonDeleteBg: isDark ? "#2D0F0F" : "#FFF1F2",
    toastSuccessBg: isDark ? "#064E3B" : "#059669",
    toastErrorBg: isDark ? "#7F1D1D" : "#EF4444",
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarWidth = isMobile ? 0 : isOpen ? 255 : 68;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/departments`, { headers });
      setDepartments(res.data.data || []);
    } catch {
      showToast("Failed to load departments", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepartments(); }, []);

  const openAdd = () => { setEditItem(null); setFormName(""); setFormError(""); setModalOpen(true); };
  const openEdit = (dept) => { setEditItem(dept); setFormName(dept.department_name); setFormError(""); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditItem(null); setFormName(""); setFormError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim()) { setFormError("Department name is required"); return; }
    setSubmitting(true); setFormError("");
    try {
      if (editItem) {
        await axios.put(`${API}/api/departments/${editItem._id}`, { department_name: formName }, { headers });
        showToast("Department updated successfully");
      } else {
        await axios.post(`${API}/api/departments`, { department_name: formName }, { headers });
        showToast("Department created successfully");
      }
      closeModal(); fetchDepartments();
    } catch (err) {
      setFormError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/api/departments/${id}`, { headers });
      showToast("Department deleted");
      setDeleteConfirm(null); fetchDepartments();
    } catch (err) {
      showToast(err.response?.data?.message || "Delete failed", "error");
      setDeleteConfirm(null);
    }
  };

  const filtered = departments.filter((d) =>
    d.department_name.toLowerCase().includes(search.toLowerCase())
  );

  const DEPT_COLORS = ["#4F46E5", "#059669", "#0891B2", "#D97706", "#7C3AED", "#DB2777"];
  const getDeptColor = (name) => DEPT_COLORS[(name?.charCodeAt(0) || 0) % DEPT_COLORS.length];

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: t.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        .dept-row { transition: background 0.12s; }
        .dept-row:hover { background: ${t.rowHover} !important; }
        .search-input:focus { outline: none; border-color: #4F46E5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.10); }
        .topbar-btn:hover { background: ${isDark ? "#1E2535" : "#F3F4F6"} !important; }
        .action-btn { transition: background 0.15s, transform 0.12s; }
        .action-btn:hover { transform: translateY(-1px); }
        * { box-sizing: border-box; }
        .dept-modal-bg { position:fixed; inset:0; background:${t.modalOverlay}; display:flex; align-items:flex-end; justify-content:center; z-index:2000; padding:0; }
        .dept-modal-sheet { background:${t.card}; border-radius:18px 18px 0 0; width:100%; max-height:92vh; overflow-y:auto; padding:24px 20px 32px; animation:slideUp .25s ease both; border-top:1px solid ${t.border}; }
        @media (min-width:600px) {
          .dept-modal-bg { align-items:center; padding:16px; }
          .dept-modal-sheet { border-radius:18px; max-width:420px; padding:32px; animation:slideIn .2s ease both; border:1px solid ${t.border}; }
        }
        @media (max-width: 768px) {
          .dept-topbar { display: none !important; }
          .dept-main { padding: 72px 14px 32px !important; }
          .dept-page-head { flex-direction: column !important; align-items: stretch !important; gap: 12px !important; }
          .dept-h1 { font-size: 1.45rem !important; }
          .dept-add-btn { width: 100% !important; justify-content: center !important; }
          .dept-table-header{ flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
          .dept-search-inp { width: 100% !important; }
          .dept-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .dept-table-wrap table { min-width: 420px; }
          .dept-action-label { display: none !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .dept-main { padding: 24px 20px 32px !important; }
        }
      `}</style>

      {toast && (
        <div style={{ position: "fixed", top: "20px", right: "20px", background: toast.type === "error" ? t.toastErrorBg : t.toastSuccessBg, color: "#fff", padding: "12px 20px", borderRadius: "12px", fontWeight: "500", fontSize: "0.875rem", zIndex: 9999, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", gap: "8px", animation: "slideIn 0.2s ease both" }}>
          {toast.type === "error" ? <X size={15} /> : <Check size={15} />}
          {toast.message}
        </div>
      )}

      <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div style={{ marginLeft: `${sidebarWidth}px`, flex: 1, transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)", display: "flex", flexDirection: "column", minHeight: "100vh", minWidth: 0 }}>
        <div className="dept-topbar" style={{ height: "64px", backgroundColor: t.topbar, borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", padding: "0 28px", gap: "16px", position: "sticky", top: 0, zIndex: 100, boxShadow: isDark ? "0 1px 4px rgba(0,0,0,0.3)" : "0 1px 4px rgba(15,23,42,0.04)" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "380px" }}>
            <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: t.textMuted }} />
            <input className="search-input" placeholder="Search anything..." style={{ width: "100%", padding: "8px 12px 8px 36px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "10px", fontSize: "0.875rem", color: t.textPrimary, backgroundColor: t.inputBg }} />
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

        <div className="dept-main" style={{ padding: "28px 28px 40px", flex: 1 }}>
          <div className="dept-page-head" style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px", animation: "fadeUp 0.4s ease both 0.05s" }}>
            <div>
              <p style={{ color: t.textSecondary, fontSize: "0.875rem", margin: "0 0 4px" }}>
                {greeting}, <strong style={{ color: "#4F46E5" }}>{name}</strong> 👋
              </p>
              <h1 className="dept-h1" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.85rem", fontWeight: "700", color: t.textPrimary, margin: 0, lineHeight: 1.2 }}>
                Departments
              </h1>
              <p style={{ color: t.textMuted, fontSize: "0.85rem", margin: "5px 0 0" }}>
                {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            <button className="dept-add-btn" onClick={openAdd} style={{ display: "flex", alignItems: "center", gap: "7px", background: t.buttonPrimary, color: "#fff", border: "none", borderRadius: "11px", padding: "10px 18px", fontWeight: "600", fontSize: "0.875rem", cursor: "pointer", boxShadow: "0 4px 14px rgba(79,70,229,0.28)", fontFamily: "'DM Sans', sans-serif", transition: "box-shadow 0.18s, transform 0.18s", alignSelf: "flex-start" }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(79,70,229,0.35)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 14px rgba(79,70,229,0.28)"; }}
            >
              <Plus size={15} /> Add Department
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "24px" }}>
            <div style={{ backgroundColor: t.card, borderRadius: "14px", padding: "18px", border: `1px solid ${t.border}`, boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)", animation: "fadeUp 0.4s ease both 0.1s" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: t.statIconBg, display: "flex", alignItems: "center", justifyContent: "center", color: t.statIconColor, marginBottom: "12px" }}>
                <Building2 size={19} />
              </div>
              <div style={{ fontSize: "0.75rem", color: t.textMuted, fontWeight: "500", marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.4px" }}>Total Departments</div>
              <div style={{ fontSize: "2rem", fontWeight: "700", color: t.textPrimary, lineHeight: 1, fontFamily: "'Playfair Display', serif" }}>
                {loading ? <span style={{ display: "inline-block", width: "50px", height: "28px", background: t.skeletonBg, borderRadius: "5px" }} /> : departments.length}
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: t.card, borderRadius: "14px", border: `1px solid ${t.border}`, boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)", overflow: "hidden", animation: "fadeUp 0.4s ease both 0.2s" }}>
            <div className="dept-table-header" style={{ padding: "16px 20px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
              <div>
                <h2 style={{ fontSize: "0.95rem", fontWeight: "600", color: t.textPrimary, margin: "0 0 2px" }}>Department Directory</h2>
                <p style={{ fontSize: "0.75rem", color: t.textMuted, margin: 0 }}>{filtered.length} {filtered.length === 1 ? "record" : "records"} found</p>
              </div>
              <div style={{ position: "relative", flex: isMobile ? "1 1 100%" : "0 0 auto" }}>
                <Search size={13} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: t.textMuted }} />
                <input className="search-input dept-search-inp" placeholder="Search departments..." value={search} onChange={(e) => setSearch(e.target.value)}
                  style={{ padding: "8px 12px 8px 30px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "9px", fontSize: "0.82rem", color: t.textPrimary, backgroundColor: t.inputBg, width: isMobile ? "100%" : "220px" }} />
              </div>
            </div>

            <div className="dept-table-wrap">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: t.tableHead }}>
                    {["#", "Department", "Actions"].map((h, i) => (
                      <th key={i} style={{ padding: "10px 18px", textAlign: i === 2 ? "right" : "left", fontSize: "0.68rem", fontWeight: "600", color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: `1px solid ${t.border}`, whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        {[30, 180, 100].map((w, j) => (
                          <td key={j} style={{ padding: "13px 18px" }}>
                            <div style={{ height: "13px", width: `${w}px`, background: t.skeletonBg, borderRadius: "4px", marginLeft: j === 2 ? "auto" : 0 }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan="3" style={{ padding: "44px", textAlign: "center", color: t.textMuted, fontSize: "0.875rem" }}>
                        {search ? "No departments match your search." : "No departments yet. Add one!"}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((dept, i) => {
                      const color = getDeptColor(dept.department_name);
                      return (
                        <tr key={dept.department_id || dept._id} className="dept-row" style={{ borderBottom: `1px solid ${t.border}` }}>
                          <td style={{ padding: "12px 18px", fontSize: "0.8rem", color: t.textMuted, fontWeight: "500" }}>
                            {String(i + 1).padStart(2, "0")}
                          </td>
                          <td style={{ padding: "12px 18px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: color + "22", display: "flex", alignItems: "center", justifyContent: "center", color: color, fontSize: "0.8rem", fontWeight: "700", flexShrink: 0 }}>
                                {dept.department_name.charAt(0).toUpperCase()}
                              </div>
                              <span style={{ fontSize: "0.875rem", fontWeight: "500", color: t.textPrimary }}>{dept.department_name}</span>
                            </div>
                          </td>
                          <td style={{ padding: "12px 18px", textAlign: "right" }}>
                            <button className="action-btn" onClick={() => openEdit(dept)} style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: t.buttonEditBg, color: t.buttonEditColor, border: "none", borderRadius: "8px", padding: isMobile ? "6px 8px" : "6px 12px", fontSize: "0.78rem", fontWeight: "600", cursor: "pointer", marginRight: "6px", fontFamily: "'DM Sans', sans-serif" }}>
                              <Pencil size={12} />
                              <span className="dept-action-label">Edit</span>
                            </button>
                            <button className="action-btn" onClick={() => setDeleteConfirm(dept)} style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: t.buttonDeleteBg, color: t.buttonDanger, border: "none", borderRadius: "8px", padding: isMobile ? "6px 8px" : "6px 12px", fontSize: "0.78rem", fontWeight: "600", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                              <Trash2 size={12} />
                              <span className="dept-action-label">Delete</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {!loading && filtered.length > 0 && (
              <div style={{ padding: "10px 20px", borderTop: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
                <span style={{ fontSize: "0.75rem", color: t.textMuted }}>Showing {filtered.length} of {departments.length} departments</span>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Clock size={11} style={{ color: t.textMuted }} />
                  <span style={{ fontSize: "0.7rem", color: t.textMuted }}>Updated just now</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="dept-modal-bg" onClick={closeModal}>
          <div className="dept-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", fontWeight: "700", color: t.textPrimary, margin: 0 }}>
                {editItem ? "Edit Department" : "Add Department"}
              </h2>
              <button onClick={closeModal} style={{ background: t.inputBg, border: "none", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: t.textMuted }}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "600", color: t.textSecondary, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                Department Name <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Human Resources" autoFocus
                className="search-input"
                style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "10px", fontSize: "0.875rem", color: t.textPrimary, outline: "none", fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.18s, box-shadow 0.18s", backgroundColor: t.inputBg }}
              />
              {formError && <p style={{ color: "#EF4444", fontSize: "0.78rem", margin: "8px 0 0", fontWeight: "500" }}>{formError}</p>}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "22px" }}>
                <button type="button" onClick={closeModal} style={{ background: t.inputBg, color: t.textSecondary, border: `1px solid ${t.inputBorder}`, borderRadius: "10px", padding: "10px 20px", fontWeight: "600", fontSize: "0.875rem", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ background: t.buttonPrimary, color: "#fff", border: "none", borderRadius: "10px", padding: "10px 20px", fontWeight: "600", fontSize: "0.875rem", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", opacity: submitting ? 0.7 : 1, boxShadow: "0 4px 12px rgba(79,70,229,0.25)" }}>
                  {submitting ? "Saving..." : editItem ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="dept-modal-bg" onClick={() => setDeleteConfirm(null)}>
          <div className="dept-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div style={{ width: "44px", height: "44px", borderRadius: "11px", background: t.buttonDeleteBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
              <Trash2 size={20} style={{ color: t.buttonDanger }} />
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.15rem", fontWeight: "700", color: t.textPrimary, margin: "0 0 8px" }}>Delete Department</h2>
            <p style={{ color: t.textMuted, fontSize: "0.875rem", margin: "0 0 22px", lineHeight: 1.6 }}>
              Are you sure you want to delete <strong style={{ color: t.textPrimary }}>"{deleteConfirm.department_name}"</strong>? This action cannot be undone.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ background: t.inputBg, color: t.textSecondary, border: `1px solid ${t.inputBorder}`, borderRadius: "10px", padding: "10px 20px", fontWeight: "600", fontSize: "0.875rem", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm._id)} style={{ background: t.buttonDanger, color: "#fff", border: "none", borderRadius: "10px", padding: "10px 20px", fontWeight: "600", fontSize: "0.875rem", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", boxShadow: "0 4px 12px rgba(239,68,68,0.25)" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
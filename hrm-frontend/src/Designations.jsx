import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Trash2, Bell, Search, Clock, Briefcase, Building2, X, Check } from "lucide-react";
import { useTheme } from "./context/ThemeContext";

import Sidebar from "../src/layouts/sidebar";
import MobileTopBar from "./employee/MobileTopBar";

const Designations = () => {
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [designationName, setDesignationName] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const { isDark } = useTheme();

  const name = localStorage.getItem("name") || "Admin";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

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
    statIconBg1: isDark ? "#1E1B4B" : "#EEF2FF",
    statIconBg2: isDark ? "#064E3B" : "#ECFDF5",
    statIconBg3: isDark ? "#451A03" : "#FFFBEB",
    statIconColor1: isDark ? "#818CF8" : "#4F46E5",
    statIconColor2: isDark ? "#34D399" : "#059669",
    statIconColor3: isDark ? "#FCD34D" : "#D97706",
    modalOverlay: isDark ? "rgba(0,0,0,0.7)" : "rgba(15,23,42,0.45)",
    buttonPrimary: "#4F46E5",
    buttonDanger: "#DC2626",
    buttonDeleteBg: isDark ? "#2D0F0F" : "#FFF1F2",
    toastSuccessBg: isDark ? "#064E3B" : "#059669",
    toastErrorBg: isDark ? "#7F1D1D" : "#EF4444",
    designationIconBg: isDark ? "#1E2535" : "#F3F4F6",
    companyIconBg: isDark ? "#1E1B4B" : "#EEF2FF",
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

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchDesignations = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5001/api/designations");
      const list = res.data.data || res.data.designations || res.data || [];
      setDesignations(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
      setDesignations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDesignations(); }, []);

  const addDesignation = async (e) => {
    e.preventDefault();
    if (!designationName.trim() || !companyId.trim()) return;
    setIsSubmitting(true);
    try {
      await axios.post("http://localhost:5001/api/designations", {
        designation_name: designationName.trim(),
        company_id: companyId.trim(),
      });
      setDesignationName("");
      setCompanyId("");
      setShowModal(false);
      showToast("Designation added successfully");
      fetchDesignations();
    } catch (err) {
      console.error(err.response?.data || err.message);
      showToast("Failed to add designation", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteDesignation = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/api/designations/${id}`);
      setDeleteConfirm(null);
      showToast("Designation deleted");
      fetchDesignations();
    } catch (err) {
      console.error(err);
      showToast("Failed to delete", "error");
    }
  };

  const filtered = designations.filter(
    (d) =>
      (d.designation_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.company_id?.company_name || "").toLowerCase().includes(search.toLowerCase())
  );
  const uniqueCompanies = [...new Set(designations.map((d) => d.company_id?.company_name).filter(Boolean))].length;

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: t.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        .stat-card { transition: transform 0.18s, box-shadow 0.18s; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(15,23,42,0.15) !important; }
        .des-row { transition: background 0.12s; }
        .des-row:hover { background: ${t.rowHover} !important; }
        .search-input:focus { outline: none; border-color: #4F46E5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.10); }
        .topbar-btn:hover { background: ${isDark ? "#1E2535" : "#F3F4F6"} !important; }
        .del-btn { transition: background 0.12s, transform 0.12s; }
        .del-btn:hover { background: ${t.buttonDeleteBg} !important; transform: scale(1.05); }
        .form-input { width: 100%; padding: 9px 13px; border: 1.5px solid ${t.inputBorder}; border-radius: 9px; font-size: 0.875rem; color: ${t.textPrimary}; background: ${t.inputBg}; font-family: inherit; transition: border-color 0.18s, box-shadow 0.18s; }
        .form-input:focus { outline: none; border-color: #4F46E5; box-shadow: 0 0 0 3px rgba(79,70,229,0.10); }
        * { box-sizing: border-box; }
        .modal-bg { position: fixed; inset: 0; background: ${t.modalOverlay}; display: flex; align-items: flex-end; justify-content: center; z-index: 1000; padding: 0; }
        .modal-box { background: ${t.card}; border-radius: 18px 18px 0 0; width: 100%; max-height: 92vh; overflow-y: auto; padding: 24px 20px 32px; animation: slideUp 0.25s ease both; border-top: 1px solid ${t.border}; }
        @media (min-width: 600px) {
          .modal-bg { align-items: center; padding: 16px; }
          .modal-box { border-radius: 16px; max-width: 440px; padding: 28px; animation: slideIn 0.2s ease both; border: 1px solid ${t.border}; }
        }
        .des-topbar { display: flex !important; }
        @media (max-width: 768px) {
          .des-topbar { display: none !important; }
          .des-main { padding: 72px 14px 32px !important; }
          .des-page-head { flex-direction: column !important; align-items: stretch !important; gap: 12px !important; }
          .des-h1 { font-size: 1.45rem !important; }
          .des-add-btn { width: 100% !important; justify-content: center !important; }
          .des-stats-grid { grid-template-columns: 1fr !important; }
          .des-table-header { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
          .des-table-search { width: 100% !important; }
          .des-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .des-table-wrap table { min-width: 480px; }
          .des-action-label { display: none !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .des-main { padding: 24px 20px 32px !important; }
          .des-stats-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>

      {toast && (
        <div style={{
          position: "fixed", top: "20px", right: "20px", zIndex: 9999,
          background: toast.type === "error" ? t.toastErrorBg : t.toastSuccessBg,
          color: "#fff", padding: "12px 20px", borderRadius: "12px",
          fontWeight: "500", fontSize: "0.875rem",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          display: "flex", alignItems: "center", gap: "8px",
          animation: "slideIn 0.2s ease both",
        }}>
          {toast.type === "error" ? <X size={15} /> : <Check size={15} />}
          {toast.msg}
        </div>
      )}

      <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div style={{
        marginLeft: `${sidebarWidth}px`, flex: 1,
        transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column", minHeight: "100vh", minWidth: 0,
      }}>
        <div className="des-topbar" style={{
          height: "64px", backgroundColor: t.topbar, borderBottom: `1px solid ${t.border}`,
          alignItems: "center", padding: "0 28px", gap: "16px",
          position: "sticky", top: 0, zIndex: 100, boxShadow: isDark ? "0 1px 4px rgba(0,0,0,0.3)" : "0 1px 4px rgba(15,23,42,0.04)",
        }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "380px" }}>
            <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: t.textMuted }} />
            <input className="search-input" placeholder="Search designations..." value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "8px 12px 8px 36px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "10px", fontSize: "0.875rem", color: t.textPrimary, backgroundColor: t.inputBg, transition: "border-color 0.18s, box-shadow 0.18s" }} />
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

        <div className="des-main" style={{ padding: "28px 28px 40px", flex: 1 }}>
          <div className="des-page-head" style={{ marginBottom: "28px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", animation: "fadeUp 0.4s ease both 0.05s" }}>
            <div>
              <p style={{ color: t.textSecondary, fontSize: "0.875rem", margin: "0 0 4px" }}>
                {greeting}, <strong style={{ color: "#4F46E5" }}>{name}</strong> 👋
              </p>
              <h1 className="des-h1" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.85rem", fontWeight: "700", color: t.textPrimary, margin: 0, lineHeight: 1.2 }}>
                Designations
              </h1>
              <p style={{ color: t.textMuted, fontSize: "0.85rem", margin: "5px 0 0" }}>
                {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            <button className="des-add-btn"
              onClick={() => setShowModal(true)}
              style={{ display: "flex", alignItems: "center", gap: "7px", padding: "10px 18px", backgroundColor: t.buttonPrimary, color: "#fff", border: "none", borderRadius: "10px", fontSize: "0.875rem", fontWeight: "500", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(79,70,229,0.25)", flexShrink: 0 }}
            >
              <Plus size={16} /> Add Designation
            </button>
          </div>

          <div className="des-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "28px" }}>
            {[
              { title: "Total Designations", count: designations.length, icon: <Briefcase size={20} />, color: t.statIconColor1, bg: t.statIconBg1, trend: "All roles" },
              { title: "Companies", count: uniqueCompanies, icon: <Building2 size={20} />, color: t.statIconColor2, bg: t.statIconBg2, trend: "Organisations" },
              { title: "Filtered Results", count: filtered.length, icon: <Search size={20} />, color: t.statIconColor3, bg: t.statIconBg3, trend: "Current view" },
            ].map((stat, idx) => (
              <div key={idx} className="stat-card" style={{
                backgroundColor: t.card, borderRadius: "14px", padding: "18px 20px",
                border: `1px solid ${t.border}`, boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)",
                animation: `fadeUp 0.4s ease both ${0.1 + idx * 0.07}s`,
                display: "flex", alignItems: "center", gap: "14px",
              }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "11px", backgroundColor: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", color: stat.color, flexShrink: 0 }}>
                  {stat.icon}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "0.72rem", color: t.textMuted, fontWeight: "500", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{stat.title}</div>
                  <div style={{ fontSize: "1.7rem", fontWeight: "700", color: t.textPrimary, lineHeight: 1, fontFamily: "'Playfair Display', serif" }}>
                    {loading ? <span style={{ display: "inline-block", width: "50px", height: "28px", background: t.skeletonBg, borderRadius: "6px" }} /> : stat.count}
                  </div>
                  <span style={{ fontSize: "0.72rem", color: t.statIconColor2, fontWeight: "500" }}>{stat.trend}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: t.card, borderRadius: "14px", border: `1px solid ${t.border}`, boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)", overflow: "hidden", animation: "fadeUp 0.4s ease both 0.35s" }}>
            <div className="des-table-header" style={{ padding: "18px 22px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
              <div>
                <h2 style={{ fontSize: "1rem", fontWeight: "600", color: t.textPrimary, margin: "0 0 2px" }}>Designation List</h2>
                <p style={{ fontSize: "0.78rem", color: t.textMuted, margin: 0 }}>{filtered.length} {filtered.length === 1 ? "designation" : "designations"} found</p>
              </div>
              <div style={{ position: "relative", flex: isMobile ? "1 1 100%" : "0 0 auto" }}>
                <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: t.textMuted }} />
                <input className="search-input des-table-search" placeholder="Search by name or company..." value={search} onChange={(e) => setSearch(e.target.value)}
                  style={{ padding: "8px 12px 8px 32px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "9px", fontSize: "0.82rem", color: t.textPrimary, backgroundColor: t.inputBg, width: isMobile ? "100%" : "240px", transition: "border-color 0.18s, box-shadow 0.18s" }} />
              </div>
            </div>

            <div className="des-table-wrap">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: t.tableHead }}>
                    {["#", "Designation", "Company", "Action"].map((h, i) => (
                      <th key={i} style={{ padding: "11px 22px", textAlign: i === 3 ? "right" : "left", fontSize: "0.72rem", fontWeight: "600", color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: `1px solid ${t.border}`, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {[40, 180, 160, 60].map((w, j) => (
                          <td key={j} style={{ padding: "14px 22px" }}>
                            <div style={{ height: "14px", width: `${w}px`, background: t.skeletonBg, borderRadius: "4px" }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ padding: "40px", textAlign: "center", color: t.textMuted, fontSize: "0.875rem" }}>
                        No designations found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((d, i) => (
                      <tr key={d._id} className="des-row" style={{ borderBottom: `1px solid ${t.border}` }}>
                        <td style={{ padding: "13px 22px", fontSize: "0.82rem", color: t.textMuted, fontWeight: "500" }}>
                          {String(i + 1).padStart(2, "0")}
                        </td>
                        <td style={{ padding: "13px 22px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: t.designationIconBg, display: "flex", alignItems: "center", justifyContent: "center", color: t.statIconColor1, flexShrink: 0 }}>
                              <Briefcase size={14} />
                            </div>
                            <div>
                              <div style={{ fontSize: "0.875rem", fontWeight: "500", color: t.textPrimary, whiteSpace: "nowrap" }}>{d.designation_name}</div>
                              <div style={{ fontSize: "0.72rem", color: t.textMuted }}>ID: {d._id?.slice(-6)}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "13px 22px" }}>
                          {d.company_id?.company_name ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <div style={{ width: "24px", height: "24px", borderRadius: "6px", backgroundColor: t.companyIconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Building2 size={12} color={t.statIconColor1} />
                              </div>
                              <span style={{ fontSize: "0.855rem", color: t.textSecondary, whiteSpace: "nowrap" }}>{d.company_id.company_name}</span>
                            </div>
                          ) : (
                            <span style={{ fontSize: "0.855rem", color: t.textMuted }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: "13px 22px", textAlign: "right" }}>
                          {deleteConfirm === d._id ? (
                            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ fontSize: "0.75rem", color: t.textMuted }}>Confirm?</span>
                              <button onClick={() => deleteDesignation(d._id)} style={{ padding: "4px 10px", background: t.buttonDanger, color: "#fff", border: "none", borderRadius: "7px", fontSize: "0.75rem", cursor: "pointer", fontFamily: "inherit" }}>Yes</button>
                              <button onClick={() => setDeleteConfirm(null)} style={{ padding: "4px 10px", background: t.inputBg, color: t.textSecondary, border: `1.5px solid ${t.inputBorder}`, borderRadius: "7px", fontSize: "0.75rem", cursor: "pointer", fontFamily: "inherit" }}>No</button>
                            </div>
                          ) : (
                            <button className="del-btn" onClick={() => setDeleteConfirm(d._id)}
                              style={{ width: "32px", height: "32px", borderRadius: "8px", border: `1.5px solid ${t.inputBorder}`, backgroundColor: t.buttonDeleteBg, color: t.buttonDanger, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!loading && filtered.length > 0 && (
              <div style={{ padding: "12px 22px", borderTop: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
                <span style={{ fontSize: "0.78rem", color: t.textMuted }}>Showing {filtered.length} of {designations.length} designations</span>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <Clock size={12} style={{ color: t.textMuted }} />
                  <span style={{ fontSize: "0.72rem", color: t.textMuted }}>Updated just now</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-bg" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: t.textPrimary, margin: "0 0 2px", fontFamily: "'Playfair Display', serif" }}>Add Designation</h2>
                <p style={{ fontSize: "0.78rem", color: t.textMuted, margin: 0 }}>Enter the designation details below</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ width: "32px", height: "32px", borderRadius: "8px", border: `1.5px solid ${t.inputBorder}`, background: t.inputBg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: t.textMuted }}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={addDesignation}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "500", color: t.textSecondary, marginBottom: "6px" }}>Designation Name</label>
                <input className="form-input" placeholder="e.g. Software Engineer" value={designationName} onChange={(e) => setDesignationName(e.target.value)} required />
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "500", color: t.textSecondary, marginBottom: "6px" }}>Company Object ID</label>
                <input className="form-input" placeholder="MongoDB ObjectId" value={companyId} onChange={(e) => setCompanyId(e.target.value)} required />
                <p style={{ fontSize: "0.75rem", color: t.textMuted, margin: "5px 0 0" }}>Enter the company's MongoDB ObjectId</p>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "11px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "10px", background: t.card, fontSize: "0.875rem", fontWeight: "500", color: t.textSecondary, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: "11px", border: "none", borderRadius: "10px", background: t.buttonPrimary, fontSize: "0.875rem", fontWeight: "500", color: "#fff", cursor: isSubmitting ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(79,70,229,0.25)", opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? "Adding..." : "Add Designation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Designations;
import React, { useState, useEffect } from "react";
import Sidebar from "../layouts/sidebar";
import MobileTopBar from "../employee/MobileTopBar";
import { Plus, CalendarDays, Bell, Search, Clock, Pencil, Trash2, X, Check } from "lucide-react";
import axios from "axios";
import { useTheme } from "../../src/context/ThemeContext";

const API = "https://hrm-backend-vvqg.onrender.com/api/holidays";

function Holidays() {
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [description, setDescription] = useState("");
  const [holidayDate, setHolidayDate] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const [editDate, setEditDate] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteName, setDeleteName] = useState("");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const { isDark } = useTheme();

  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name") || "Admin";
  const token = localStorage.getItem("token");
  const isManager = role === "manager" || role === "super_admin";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const isMobile = window.innerWidth <= 768;
  const sidebarWidth = isMobile ? 0 : (isOpen ? 255 : 68);

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
    statIconBg1: isDark ? "#1E1B4B" : "#EEF2FF",
    statIconBg2: isDark ? "#064E3B" : "#ECFDF5",
    statIconBg3: isDark ? "#451A03" : "#FFFBEB",
    statIconColor1: isDark ? "#818CF8" : "#4F46E5",
    statIconColor2: isDark ? "#34D399" : "#059669",
    statIconColor3: isDark ? "#FCD34D" : "#D97706",
    badgeUpcomingBg: isDark ? "#064E3B" : "#ECFDF5",
    badgeUpcomingText: isDark ? "#6EE7B7" : "#059669",
    badgePastBg: isDark ? "#1E2535" : "#F3F4F6",
    badgePastText: isDark ? "#9CA3AF" : "#9CA3AF",
    modalOverlay: isDark ? "rgba(0,0,0,0.7)" : "rgba(15,23,42,0.45)",
    toastSuccessBg: isDark ? "#064E3B" : "#ECFDF5",
    toastSuccessText: isDark ? "#6EE7B7" : "#059669",
    toastErrorBg: isDark ? "#2D0F0F" : "#FEF2F2",
    toastErrorText: isDark ? "#F87171" : "#DC2626",
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const demoHolidays = [
    { _id: "1", description: "New Year", holiday_date: "2026-01-01" },
    { _id: "2", description: "Republic Day", holiday_date: "2026-01-26" },
    { _id: "3", description: "Holi Festival", holiday_date: "2026-03-14" },
    { _id: "4", description: "Independence Day", holiday_date: "2026-08-15" },
    { _id: "5", description: "Diwali Festival", holiday_date: "2026-11-08" },
  ];

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchHolidays = async () => {
    try {
      const res = await axios.get(API, { headers: { "x-auth-token": token } });
      setHolidays(res.data.data.length === 0 ? demoHolidays : res.data.data);
    } catch {
      setHolidays(demoHolidays);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await axios.post(
        `${API}/add`,
        { description, holiday_date: holidayDate },
        { headers: { "x-auth-token": token } }
      );
      setShowModal(false);
      setDescription("");
      setHolidayDate("");
      showToast("Holiday added successfully!");
      fetchHolidays();
    } catch (err) {
      showToast(err.response?.data?.error || "Error adding holiday", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (holiday) => {
    setEditId(holiday._id);
    setEditDescription(holiday.description);
    setEditDate(holiday.holiday_date?.slice(0, 10));
    setEditModal(true);
  };

  const handleEditHoliday = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await axios.put(
        `${API}/${editId}`,
        { description: editDescription, holiday_date: editDate },
        { headers: { "x-auth-token": token } }
      );
      setEditModal(false);
      showToast("Holiday updated successfully!");
      fetchHolidays();
    } catch (err) {
      showToast(err.response?.data?.error || "Error updating holiday", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteModal = (holiday) => {
    setDeleteId(holiday._id);
    setDeleteName(holiday.description);
    setDeleteModal(true);
  };

  const handleDeleteHoliday = async () => {
    setActionLoading(true);
    try {
      await axios.delete(`${API}/${deleteId}`, { headers: { "x-auth-token": token } });
      setDeleteModal(false);
      showToast("Holiday deleted successfully!");
      fetchHolidays();
    } catch (err) {
      showToast(err.response?.data?.error || "Error deleting holiday", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const nextHoliday = holidays.find((h) => new Date(h.holiday_date) >= new Date());
  const daysAway = nextHoliday
    ? Math.ceil((new Date(nextHoliday.holiday_date) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const filtered = holidays.filter((h) =>
    h.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: t.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateY(-16px); } to { opacity:1; transform:translateY(0); } }
        .stat-card { transition:transform .18s,box-shadow .18s; }
        .stat-card:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(15,23,42,.15) !important; }
        .holiday-card { transition:transform .18s,box-shadow .18s; }
        .holiday-card:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(15,23,42,.15) !important; }
        .search-input:focus { outline:none; border-color:#4F46E5 !important; box-shadow:0 0 0 3px rgba(79,70,229,.10); }
        .topbar-btn:hover { background:${isDark ? "#1E2535" : "#F3F4F6"} !important; }
        .icon-btn { border:none; background:transparent; cursor:pointer; padding:6px; border-radius:7px; display:flex; align-items:center; justify-content:center; transition:background .15s; }
        .icon-btn-edit:hover { background:#EEF2FF; }
        .icon-btn-delete:hover { background:#FEF2F2; }
        .modal-overlay { position:fixed; inset:0; background:${t.modalOverlay}; display:flex; align-items:center; justify-content:center; z-index:1000; padding:16px; }
        .modal-box { background:${t.card}; border-radius:16px; padding:28px; width:100%; max-width:440px; box-shadow:0 20px 60px rgba(15,23,42,.15); animation:slideIn .2s ease; border:1px solid ${t.border}; }
        .form-input { width:100%; padding:9px 13px; border:1.5px solid ${t.inputBorder}; border-radius:9px; font-size:.875rem; color:${t.textPrimary}; background:${t.inputBg}; font-family:inherit; transition:border-color .18s,box-shadow .18s; box-sizing:border-box; }
        .form-input:focus { outline:none; border-color:#4F46E5; box-shadow:0 0 0 3px rgba(79,70,229,.10); }
        .toast { position:fixed; bottom:24px; right:24px; z-index:9999; padding:12px 20px; border-radius:10px; font-size:.875rem; font-weight:500; display:flex; align-items:center; gap:8px; box-shadow:0 8px 24px rgba(15,23,42,.15); animation:slideIn .25s ease; }
        * { box-sizing:border-box; }
        @media (max-width:768px) {
          .hol-main { padding:76px 14px 32px !important; }
          .hol-topbar { padding:0 14px !important; }
          .hol-topbar-search,.hol-topbar-name { display:none !important; }
          .hol-heading-row { flex-direction:column !important; align-items:flex-start !important; gap:12px !important; }
          .hol-add-btn { width:100% !important; justify-content:center !important; }
          .hol-stats-grid { grid-template-columns:1fr 1fr !important; gap:10px !important; }
          .hol-stat-val { font-size:1.6rem !important; }
          .hol-next-row { flex-direction:column !important; align-items:flex-start !important; gap:12px !important; }
          .hol-days-badge { align-self:flex-start !important; }
          .hol-grid { grid-template-columns:1fr !important; gap:10px !important; }
          .hol-section-header,.hol-section-content { padding:14px !important; }
          .hol-page-title { font-size:1.5rem !important; }
          .toast { left:16px; right:16px; bottom:16px; }
        }
        @media (min-width:769px) and (max-width:1024px) {
          .hol-main { padding:28px 18px 40px !important; }
          .hol-stats-grid { grid-template-columns:repeat(2,1fr) !important; }
          .hol-grid { grid-template-columns:repeat(2,1fr) !important; }
        }
      `}</style>

      {toast && (
        <div className="toast" style={{
          backgroundColor: toast.type === "error" ? t.toastErrorBg : t.toastSuccessBg,
          color: toast.type === "error" ? t.toastErrorText : t.toastSuccessText,
          border: `1px solid ${toast.type === "error" ? "#FECACA" : "#A7F3D0"}`,
        }}>
          {toast.type === "error" ? <X size={15} /> : <Check size={15} />}
          {toast.msg}
        </div>
      )}

      <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div style={{
        marginLeft: `${sidebarWidth}px`, flex: 1,
        transition: "margin-left .25s cubic-bezier(.4,0,.2,1)",
        display: "flex", flexDirection: "column", minHeight: "100vh", minWidth: 0,
      }}>
        <div className="hol-topbar" style={{
          height: "64px", backgroundColor: t.topbar, borderBottom: `1px solid ${t.border}`,
          display: "flex", alignItems: "center", padding: "0 28px", gap: "16px",
          position: "sticky", top: 0, zIndex: 100, boxShadow: isDark ? "0 1px 4px rgba(0,0,0,0.3)" : "0 1px 4px rgba(15,23,42,.04)",
        }}>
          <div className="hol-topbar-search" style={{ position: "relative", flex: 1, maxWidth: "380px" }}>
            <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: t.textMuted }} />
            <input
              className="search-input"
              placeholder="Search holidays..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "8px 12px 8px 36px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "10px", fontSize: ".875rem", color: t.textPrimary, backgroundColor: t.inputBg }}
            />
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
            <div className="hol-topbar-name" style={{ display: "flex", alignItems: "center", gap: "9px", padding: "5px 12px 5px 6px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "10px", background: t.card, cursor: "pointer" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg,#4F46E5,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: ".72rem", fontWeight: "600" }}>
                {name.slice(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: ".83rem", fontWeight: "500", color: t.textPrimary }}>{name}</span>
            </div>
          </div>
        </div>

        <div className="hol-main" style={{ padding: "28px 28px 40px", flex: 1 }}>
          <div className="hol-heading-row" style={{ marginBottom: "24px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", animation: "fadeUp .4s ease both .05s", gap: "16px" }}>
            <div>
              <p style={{ color: t.textSecondary, fontSize: ".875rem", margin: "0 0 4px" }}>
                {greeting}, <strong style={{ color: "#4F46E5" }}>{name}</strong> 👋
              </p>
              <h1 className="hol-page-title" style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.5rem,4vw,1.85rem)", fontWeight: "700", color: t.textPrimary, margin: 0, lineHeight: 1.2 }}>
                Holiday Calendar 2026
              </h1>
              <p style={{ color: t.textMuted, fontSize: ".85rem", margin: "5px 0 0" }}>
                {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            {isManager && (
              <button className="hol-add-btn" onClick={() => setShowModal(true)} style={{ display: "flex", alignItems: "center", gap: "7px", padding: "10px 18px", backgroundColor: "#4F46E5", color: "#fff", border: "none", borderRadius: "10px", fontSize: ".875rem", fontWeight: "500", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(79,70,229,.25)", whiteSpace: "nowrap", flexShrink: 0 }}>
                <Plus size={16} /> Add Holiday
              </button>
            )}
          </div>

          <div className="hol-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "16px", marginBottom: "24px" }}>
            {[
              { title: "Total Holidays", count: holidays.length, icon: <CalendarDays size={20} />, color: t.statIconColor1, bg: t.statIconBg1, trend: "This year" },
              { title: "Upcoming Holiday", count: daysAway !== null ? `${daysAway}d` : "—", icon: <Clock size={20} />, color: t.statIconColor2, bg: t.statIconBg2, trend: nextHoliday?.description || "—" },
              { title: "Remaining", count: holidays.filter((h) => new Date(h.holiday_date) >= new Date()).length, icon: <CalendarDays size={20} />, color: t.statIconColor3, bg: t.statIconBg3, trend: "Yet to come" },
            ].map((stat, idx) => (
              <div key={idx} className="stat-card" style={{ backgroundColor: t.card, borderRadius: "14px", padding: "20px", border: `1px solid ${t.border}`, boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,.05)", animation: `fadeUp .4s ease both ${0.1 + idx * 0.07}s`, cursor: "default" }}>
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "11px", backgroundColor: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", color: stat.color }}>{stat.icon}</div>
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <div style={{ fontSize: ".75rem", color: t.textMuted, fontWeight: "500", marginBottom: "4px", textTransform: "uppercase", letterSpacing: ".4px" }}>{stat.title}</div>
                  <div className="hol-stat-val" style={{ fontSize: "2rem", fontWeight: "700", color: t.textPrimary, lineHeight: 1, fontFamily: "'Playfair Display',serif" }}>
                    {loading ? <span style={{ display: "inline-block", width: "50px", height: "28px", background: t.skeletonBg, borderRadius: "6px" }} /> : stat.count}
                  </div>
                </div>
                <span style={{ fontSize: ".75rem", color: t.statIconColor2, fontWeight: "500" }}>{stat.trend}</span>
              </div>
            ))}
          </div>

          {nextHoliday && (
            <div className="hol-next-row" style={{ backgroundColor: t.card, borderRadius: "14px", padding: "20px 24px", border: `1px solid ${t.border}`, boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,.05)", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", animation: "fadeUp .4s ease both .28s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: 0 }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: t.statIconBg1, display: "flex", alignItems: "center", justifyContent: "center", color: t.statIconColor1, flexShrink: 0 }}>
                  <CalendarDays size={22} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: ".7rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: ".5px", color: t.statIconColor1, backgroundColor: t.statIconBg1, padding: "2px 8px", borderRadius: "20px", display: "inline-block", marginBottom: "4px" }}>Upcoming Holiday</span>
                  <div style={{ fontSize: "1rem", fontWeight: "600", color: t.textPrimary }}>{nextHoliday.description}</div>
                  <div style={{ fontSize: ".82rem", color: t.textSecondary, marginTop: "2px" }}>
                    {new Date(nextHoliday.holiday_date).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </div>
                </div>
              </div>
              <div className="hol-days-badge" style={{ textAlign: "center", padding: "12px 20px", backgroundColor: t.inputBg, borderRadius: "12px", border: `1px solid ${t.border}`, minWidth: "88px", flexShrink: 0 }}>
                <div style={{ fontSize: ".7rem", color: t.textMuted, fontWeight: "500", textTransform: "uppercase", letterSpacing: ".4px" }}>Days Away</div>
                <div style={{ fontSize: "2rem", fontWeight: "700", color: "#4F46E5", fontFamily: "'Playfair Display',serif", lineHeight: 1.1 }}>{daysAway}</div>
              </div>
            </div>
          )}

          <div style={{ backgroundColor: t.card, borderRadius: "14px", border: `1px solid ${t.border}`, boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,.05)", overflow: "hidden", animation: "fadeUp .4s ease both .35s" }}>
            <div className="hol-section-header" style={{ padding: "18px 22px", borderBottom: `1px solid ${t.border}` }}>
              <h2 style={{ fontSize: "1rem", fontWeight: "600", color: t.textPrimary, margin: "0 0 2px" }}>All Holidays</h2>
              <p style={{ fontSize: ".78rem", color: t.textMuted, margin: 0 }}>{filtered.length} {filtered.length === 1 ? "holiday" : "holidays"} listed</p>
            </div>

            <div className="hol-grid hol-section-content" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "14px", padding: "20px" }}>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} style={{ height: "80px", backgroundColor: t.skeletonBg, borderRadius: "12px", border: `1px solid ${t.border}` }} />
                  ))
                : filtered.length === 0
                  ? <div style={{ gridColumn: "1/-1", padding: "40px", textAlign: "center", color: t.textMuted, fontSize: ".875rem" }}>No holidays found</div>
                  : filtered.map((holiday, i) => {
                      const isPast = new Date(holiday.holiday_date) < new Date();
                      return (
                        <div key={holiday._id || holiday.holiday_id} className="holiday-card" style={{ backgroundColor: isPast ? t.skeletonBg : t.card, borderRadius: "12px", padding: "14px 16px", border: `1px solid ${t.border}`, boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.2)" : "0 2px 8px rgba(15,23,42,.04)", display: "flex", alignItems: "center", gap: "12px", animation: `fadeUp .4s ease both ${0.05 + i * 0.04}s`, opacity: isPast ? 0.65 : 1 }}>
                          <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: isPast ? t.inputBg : t.statIconBg1, display: "flex", alignItems: "center", justifyContent: "center", color: isPast ? t.textMuted : t.statIconColor1, flexShrink: 0 }}>
                            <CalendarDays size={18} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: ".875rem", fontWeight: "600", color: t.textPrimary, marginBottom: "3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{holiday.description}</div>
                            <div style={{ fontSize: ".78rem", color: t.textMuted }}>
                              {new Date(holiday.holiday_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                            </div>
                          </div>
                          {isPast
                            ? <span style={{ fontSize: ".68rem", fontWeight: "600", color: t.badgePastText, backgroundColor: t.badgePastBg, padding: "2px 8px", borderRadius: "20px", flexShrink: 0 }}>Past</span>
                            : <span style={{ fontSize: ".68rem", fontWeight: "600", color: t.badgeUpcomingText, backgroundColor: t.badgeUpcomingBg, padding: "2px 8px", borderRadius: "20px", flexShrink: 0, display: "flex", alignItems: "center", gap: "4px" }}>
                                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: t.badgeUpcomingText, display: "inline-block" }} />
                                Upcoming
                              </span>
                          }
                          {isManager && (
                            <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                              <button className="icon-btn icon-btn-edit" onClick={() => openEditModal(holiday)} title="Edit">
                                <Pencil size={14} color="#4F46E5" />
                              </button>
                              <button className="icon-btn icon-btn-delete" onClick={() => openDeleteModal(holiday)} title="Delete">
                                <Trash2 size={14} color="#DC2626" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
              }
            </div>

            <div style={{ padding: "12px 22px", borderTop: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
              <span style={{ fontSize: ".78rem", color: t.textMuted }}>Showing {filtered.length} of {holidays.length} holidays</span>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <Clock size={12} style={{ color: t.textMuted }} />
                <span style={{ fontSize: ".72rem", color: t.textMuted }}>Updated just now</span>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: t.card, borderRadius: "14px", padding: "16px 20px", border: `1px solid ${t.border}`, boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,.05)", marginTop: "20px", display: "flex", alignItems: "flex-start", gap: "12px", animation: "fadeUp .4s ease both .4s" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "9px", backgroundColor: t.statIconBg2, display: "flex", alignItems: "center", justifyContent: "center", color: t.statIconColor2, flexShrink: 0 }}>
              <CalendarDays size={18} />
            </div>
            <div>
              <div style={{ fontSize: ".875rem", fontWeight: "600", color: t.textPrimary, marginBottom: "3px" }}>Branch Specific Holidays</div>
              <p style={{ fontSize: ".82rem", color: t.textMuted, margin: 0 }}>Holidays listed here apply to all employees. Regional holidays can be added by admins.</p>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: t.textPrimary, margin: "0 0 2px", fontFamily: "'Playfair Display',serif" }}>Add Holiday</h2>
                <p style={{ fontSize: ".78rem", color: t.textMuted, margin: 0 }}>Enter the holiday details below</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ width: "32px", height: "32px", borderRadius: "8px", border: `1.5px solid ${t.inputBorder}`, background: t.inputBg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "1rem", color: t.textSecondary }}>×</button>
            </div>
            <form onSubmit={handleAddHoliday}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: ".82rem", fontWeight: "500", color: t.textSecondary, marginBottom: "6px" }}>Holiday Name</label>
                <input className="form-input" placeholder="e.g. Republic Day" value={description} onChange={(e) => setDescription(e.target.value)} required />
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: ".82rem", fontWeight: "500", color: t.textSecondary, marginBottom: "6px" }}>Date</label>
                <input type="date" className="form-input" value={holidayDate} onChange={(e) => setHolidayDate(e.target.value)} required />
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "10px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "10px", background: t.card, fontSize: ".875rem", fontWeight: "500", color: t.textSecondary, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                <button type="submit" disabled={actionLoading} style={{ flex: 1, padding: "10px", border: "none", borderRadius: "10px", background: "#4F46E5", fontSize: ".875rem", fontWeight: "500", color: "#fff", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(79,70,229,.25)", opacity: actionLoading ? 0.7 : 1 }}>
                  {actionLoading ? "Saving…" : "Save Holiday"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: t.textPrimary, margin: "0 0 2px", fontFamily: "'Playfair Display',serif" }}>Edit Holiday</h2>
                <p style={{ fontSize: ".78rem", color: t.textMuted, margin: 0 }}>Update the holiday details below</p>
              </div>
              <button onClick={() => setEditModal(false)} style={{ width: "32px", height: "32px", borderRadius: "8px", border: `1.5px solid ${t.inputBorder}`, background: t.inputBg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "1rem", color: t.textSecondary }}>×</button>
            </div>
            <form onSubmit={handleEditHoliday}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: ".82rem", fontWeight: "500", color: t.textSecondary, marginBottom: "6px" }}>Holiday Name</label>
                <input className="form-input" placeholder="e.g. Republic Day" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} required />
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: ".82rem", fontWeight: "500", color: t.textSecondary, marginBottom: "6px" }}>Date</label>
                <input type="date" className="form-input" value={editDate} onChange={(e) => setEditDate(e.target.value)} required />
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="button" onClick={() => setEditModal(false)} style={{ flex: 1, padding: "10px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "10px", background: t.card, fontSize: ".875rem", fontWeight: "500", color: t.textSecondary, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                <button type="submit" disabled={actionLoading} style={{ flex: 1, padding: "10px", border: "none", borderRadius: "10px", background: "#4F46E5", fontSize: ".875rem", fontWeight: "500", color: "#fff", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(79,70,229,.25)", opacity: actionLoading ? 0.7 : 1 }}>
                  {actionLoading ? "Updating…" : "Update Holiday"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "380px" }}>
            <div style={{ textAlign: "center", padding: "8px 0 20px" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "50%", backgroundColor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Trash2 size={22} color="#DC2626" />
              </div>
              <h2 style={{ fontSize: "1.05rem", fontWeight: "700", color: t.textPrimary, margin: "0 0 8px", fontFamily: "'Playfair Display',serif" }}>Delete Holiday</h2>
              <p style={{ fontSize: ".875rem", color: t.textSecondary, margin: 0 }}>
                Are you sure you want to delete <strong style={{ color: t.textPrimary }}>{deleteName}</strong>? All employees will be notified. This action cannot be undone.
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setDeleteModal(false)} style={{ flex: 1, padding: "10px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "10px", background: t.card, fontSize: ".875rem", fontWeight: "500", color: t.textSecondary, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={handleDeleteHoliday} disabled={actionLoading} style={{ flex: 1, padding: "10px", border: "none", borderRadius: "10px", background: "#DC2626", fontSize: ".875rem", fontWeight: "500", color: "#fff", cursor: "pointer", fontFamily: "inherit", opacity: actionLoading ? 0.7 : 1 }}>
                {actionLoading ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Holidays;
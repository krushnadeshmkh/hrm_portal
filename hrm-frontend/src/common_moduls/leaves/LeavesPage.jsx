import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../../layouts/sidebar";
import MobileTopBar from "../../employee/MobileTopBar";
import { Send, Loader2, Check, XCircle, AlertCircle, Bell, Search, Clock, FileText, X } from "lucide-react";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";

const Leaves = () => {
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [leaveType, setLeaveType] = useState("Annual");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const { isDark } = useTheme();

  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name") || "Admin";
  const isManager = role === "manager" || role === "super_admin";
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
    tableHead: isDark ? "#111827" : "#FAFBFF",
    rowHover: isDark ? "#1E2535" : "#F5F7FF",
    skeletonBg: isDark ? "#1E2535" : "#F3F4F6",
    modalOverlay: isDark ? "rgba(0,0,0,0.7)" : "rgba(15,23,42,0.5)",
    statusApprovedBg: isDark ? "#064E3B" : "#ECFDF5",
    statusApprovedText: isDark ? "#6EE7B7" : "#059669",
    statusRejectedBg: isDark ? "#2D0F0F" : "#FFF1F2",
    statusRejectedText: isDark ? "#F87171" : "#DC2626",
    statusPendingBg: isDark ? "#451A03" : "#FFFBEB",
    statusPendingText: isDark ? "#FCD34D" : "#D97706",
    statIconBg1: isDark ? "#1E1B4B" : "#EEF2FF",
    statIconBg2: isDark ? "#064E3B" : "#ECFDF5",
    statIconBg3: isDark ? "#451A03" : "#FFFBEB",
    statIconBg4: isDark ? "#2D0F0F" : "#FFF1F2",
    statIconColor1: isDark ? "#818CF8" : "#4F46E5",
    statIconColor2: isDark ? "#34D399" : "#059669",
    statIconColor3: isDark ? "#FCD34D" : "#D97706",
    statIconColor4: isDark ? "#F87171" : "#DC2626",
  };

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(true);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const sidebarWidth = isMobile ? 0 : (isOpen ? 255 : 68);

  const fetchLeaves = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setIsRefreshing(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5001/api/leaves", {
        headers: { "x-auth-token": token },
      });
      setLeaveRequests(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const handleStatusChange = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5001/api/leaves/approve/${id}`,
        { status },
        { headers: { "x-auth-token": token } }
      );
      await fetchLeaves(true);
    } catch (error) {
      alert("Failed to update leave");
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5001/api/leaves/apply",
        { leave_type: leaveType, start_date: startDate, end_date: endDate, reason },
        { headers: { "x-auth-token": token } }
      );
      setShowModal(false);
      setReason("");
      setStartDate("");
      setEndDate("");
      await fetchLeaves(true);
    } catch(err) {
      alert(err);
    }
  };

  const pendingCount = leaveRequests.filter((r) => r.status === "Pending").length;
  const approvedCount = leaveRequests.filter((r) => r.status === "Approved").length;
  const rejectedCount = leaveRequests.filter((r) => r.status === "Rejected").length;

  const filtered = leaveRequests.filter((r) =>
    (r.employee_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.leave_type || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.status || "").toLowerCase().includes(search.toLowerCase())
  );

  const statusConfig = {
    Approved: { color: t.statusApprovedText, bg: t.statusApprovedBg },
    Rejected: { color: t.statusRejectedText, bg: t.statusRejectedBg },
    Pending: { color: t.statusPendingText, bg: t.statusPendingBg },
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: t.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }
        .stat-card { transition: transform .18s, box-shadow .18s; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(15,23,42,0.15) !important; }
        .leave-row { transition: background .12s; }
        .leave-row:hover { background: ${t.rowHover} !important; }
        .search-input:focus { outline:none; border-color:#4F46E5 !important; box-shadow:0 0 0 3px rgba(79,70,229,0.10); }
        .topbar-btn:hover { background:${isDark ? "#1E2535" : "#F3F4F6"} !important; }
        .action-btn { transition: transform .12s, opacity .12s; }
        .action-btn:hover { opacity:.85; transform:scale(1.05); }
        .form-input { width:100%; padding:9px 13px; border:1.5px solid ${t.inputBorder}; border-radius:9px; font-size:0.875rem; color:${t.textPrimary}; background:${t.inputBg}; font-family:inherit; transition:border-color .18s, box-shadow .18s; }
        .form-input:focus { outline:none; border-color:#4F46E5; box-shadow:0 0 0 3px rgba(79,70,229,0.10); }
        * { box-sizing:border-box; }
        .modal-bg { position:fixed; inset:0; background:${t.modalOverlay}; display:flex; align-items:flex-end; justify-content:center; z-index:2000; padding:0; }
        .modal-sheet { background:${t.card}; border-radius:18px 18px 0 0; width:100%; max-height:92vh; overflow-y:auto; padding:24px 20px 32px; animation:slideUp .25s ease both; border-top:1px solid ${t.border}; }
        @media (min-width:600px) {
          .modal-bg { align-items:center; padding:16px; }
          .modal-sheet { border-radius:16px; max-width:480px; padding:28px; animation:fadeUp .2s ease both; border:1px solid ${t.border}; }
        }
        @media (max-width: 768px) {
          .leaves-main { padding: 72px 14px 32px !important; }
          .leaves-topbar { display: none !important; }
          .leaves-page-head { flex-direction: column !important; gap: 12px !important; align-items: flex-start !important; }
          .leaves-stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .leaves-stat-val { font-size: 1.6rem !important; }
          .leaves-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .leaves-table-wrap table { min-width: 600px; }
          .leaves-table-header { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
          .leaves-search-inp { width: 100% !important; }
          .leaves-page-title { font-size: 1.45rem !important; }
          .apply-btn { width: 100% !important; justify-content: center !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .leaves-main { padding: 28px 20px 40px !important; }
          .leaves-stats-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>

      <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div style={{
        marginLeft: `${sidebarWidth}px`,
        flex: 1,
        transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        minWidth: 0,
      }}>
        <div className="leaves-topbar" style={{
          height: "60px", backgroundColor: t.topbar, borderBottom: `1px solid ${t.border}`,
          display: "flex", alignItems: "center", padding: "0 24px", gap: "14px",
          position: "sticky", top: 0, zIndex: 100,
          boxShadow: isDark ? "0 1px 4px rgba(0,0,0,0.3)" : "0 1px 4px rgba(15,23,42,0.04)",
        }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "360px" }}>
            <Search size={14} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: t.textMuted }} />
            <input
              className="search-input"
              placeholder="Search anything..."
              style={{ width: "100%", padding: "8px 12px 8px 34px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "10px", fontSize: "0.875rem", color: t.textPrimary, backgroundColor: t.inputBg }}
            />
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
            <button className="topbar-btn" style={{ width: "36px", height: "36px", borderRadius: "9px", border: `1.5px solid ${t.inputBorder}`, background: t.card, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: t.textSecondary, position: "relative" }}>
              <span style={{ position: "absolute", top: "7px", right: "7px", width: "6px", height: "6px", borderRadius: "50%", background: "#EF4444", border: `1.5px solid ${t.card}` }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 11px 4px 5px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "9px", background: t.card, cursor: "pointer" }}>
              <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "linear-gradient(135deg,#4F46E5,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.7rem", fontWeight: "600" }}>
                {name.slice(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: "0.82rem", fontWeight: "500", color: t.textPrimary }}>{name}</span>
            </div>
          </div>
        </div>

        <div className="leaves-main" style={{ padding: "24px 24px 40px", flex: 1 }}>
          <div className="leaves-page-head" style={{ marginBottom: "24px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", animation: "fadeUp 0.4s ease both 0.05s" }}>
            <div>
              <p style={{ color: t.textSecondary, fontSize: "0.875rem", margin: "0 0 4px" }}>
                {greeting}, <strong style={{ color: "#4F46E5" }}>{name}</strong> 👋
              </p>
              <h1 className="leaves-page-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.85rem", fontWeight: "700", color: t.textPrimary, margin: 0, lineHeight: 1.2 }}>
                Leave Management
                {isRefreshing && <Loader2 size={16} style={{ marginLeft: "8px", verticalAlign: "middle", color: "#4F46E5" }} />}
              </h1>
              <p style={{ color: t.textMuted, fontSize: "0.85rem", margin: "5px 0 0" }}>
                {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            {!isManager && (
              <button
                className="apply-btn"
                onClick={() => setShowModal(true)}
                style={{ display: "flex", alignItems: "center", gap: "7px", padding: "10px 18px", backgroundColor: "#4F46E5", color: "#fff", border: "none", borderRadius: "10px", fontSize: "0.875rem", fontWeight: "500", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(79,70,229,0.25)", whiteSpace: "nowrap" }}
              >
                <Send size={14} /> Apply Leave
              </button>
            )}
          </div>

          <div className="leaves-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: "14px", marginBottom: "24px" }}>
            {[
              { title: "Total Requests", count: leaveRequests.length, icon: <FileText size={19} />, color: t.statIconColor1, bg: t.statIconBg1, trend: "All time" },
              { title: "Approved", count: approvedCount, icon: <Check size={19} />, color: t.statIconColor2, bg: t.statIconBg2, trend: "Cleared" },
              { title: "Pending", count: pendingCount, icon: <Clock size={19} />, color: t.statIconColor3, bg: t.statIconBg3, trend: "Awaiting review" },
              { title: "Rejected", count: rejectedCount, icon: <XCircle size={19} />, color: t.statIconColor4, bg: t.statIconBg4, trend: "Declined" },
            ].map((stat, idx) => (
              <div key={idx} className="stat-card" style={{ backgroundColor: t.card, borderRadius: "14px", padding: "18px", border: `1px solid ${t.border}`, boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)", animation: `fadeUp 0.4s ease both ${0.1 + idx * 0.07}s` }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", color: stat.color, marginBottom: "12px" }}>
                  {stat.icon}
                </div>
                <div style={{ fontSize: "0.75rem", color: t.textMuted, fontWeight: "500", marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.4px" }}>{stat.title}</div>
                <div className="leaves-stat-val" style={{ fontSize: "2rem", fontWeight: "700", color: t.textPrimary, lineHeight: 1, fontFamily: "'Playfair Display', serif", marginBottom: "6px" }}>
                  {loading ? <span style={{ display: "inline-block", width: "50px", height: "28px", background: t.skeletonBg, borderRadius: "5px" }} /> : stat.count}
                </div>
                <div style={{ fontSize: "0.73rem", color: t.textMuted, fontWeight: "500" }}>{stat.trend}</div>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: t.card, borderRadius: "14px", border: `1px solid ${t.border}`, boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)", overflow: "hidden", animation: "fadeUp 0.4s ease both 0.35s" }}>
            <div className="leaves-table-header" style={{ padding: "16px 20px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
              <div>
                <h2 style={{ fontSize: "0.95rem", fontWeight: "600", color: t.textPrimary, margin: "0 0 2px" }}>
                  {isManager ? "All Applications" : "My Leave History"}
                </h2>
                <p style={{ fontSize: "0.75rem", color: t.textMuted, margin: 0 }}>
                  {filtered.length} {filtered.length === 1 ? "record" : "records"} found
                </p>
              </div>
              <div style={{ position: "relative", flex: isMobile ? "1 1 100%" : "0 0 auto" }}>
                <Search size={13} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: t.textMuted }} />
                <input
                  className="search-input leaves-search-inp"
                  placeholder="Search name, type, status..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ padding: "8px 12px 8px 30px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "9px", fontSize: "0.82rem", color: t.textPrimary, backgroundColor: t.inputBg, width: "260px" }}
                />
              </div>
            </div>

            <div className="leaves-table-wrap">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: t.tableHead }}>
                    {["#", ...(isManager ? ["Employee"] : []), "Leave Type", "Period", "Status", ...(isManager ? ["Actions"] : [])].map((h, i) => (
                      <th key={i} style={{ padding: "10px 18px", textAlign: "left", fontSize: "0.68rem", fontWeight: "600", color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: `1px solid ${t.border}`, whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        {[40, ...(isManager ? [140] : []), 100, 160, 80, ...(isManager ? [80] : [])].map((w, j) => (
                          <td key={j} style={{ padding: "13px 18px" }}>
                            <div style={{ height: "13px", width: `${w}px`, background: t.skeletonBg, borderRadius: "4px" }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={isManager ? 6 : 4} style={{ padding: "44px", textAlign: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", color: t.textMuted }}>
                          <AlertCircle size={26} />
                          <span style={{ fontSize: "0.875rem" }}>No leave requests found</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((req, i) => {
                      const sc = statusConfig[req.status] || statusConfig.Pending;
                      return (
                        <tr key={req.leave_id} className="leave-row" style={{ borderBottom: `1px solid ${t.border}` }}>
                          <td style={{ padding: "12px 18px", fontSize: "0.8rem", color: t.textMuted, fontWeight: "500" }}>
                            {String(i + 1).padStart(2, "0")}
                          </td>
                          {isManager && (
                            <td style={{ padding: "12px 18px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                                <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: `hsl(${((req.employee_name || "?").charCodeAt(0) || 65) * 5 % 360},55%,${isDark ? "45%" : "55%"})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.72rem", fontWeight: "600", flexShrink: 0 }}>
                                  {(req.employee_name || "?").slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div style={{ fontSize: "0.855rem", fontWeight: "500", color: t.textPrimary, whiteSpace: "nowrap" }}>{req.employee_name || "Unknown"}</div>
                                  <div style={{ fontSize: "0.7rem", color: t.textMuted }}>#{req.leave_id}</div>
                                </div>
                              </div>
                            </td>
                          )}
                          <td style={{ padding: "12px 18px", fontSize: "0.84rem", color: t.textSecondary, whiteSpace: "nowrap" }}>{req.leave_type}</td>
                          <td style={{ padding: "12px 18px", fontSize: "0.82rem", color: t.textSecondary, whiteSpace: "nowrap" }}>
                            {new Date(req.start_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                            {" – "}
                            {new Date(req.end_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </td>
                          <td style={{ padding: "12px 18px" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 10px", borderRadius: "20px", fontSize: "0.7rem", fontWeight: "600", backgroundColor: sc.bg, color: sc.color, whiteSpace: "nowrap" }}>
                              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: sc.color }} />
                              {req.status || "Pending"}
                            </span>
                          </td>
                          {isManager && (
                            <td style={{ padding: "12px 18px" }}>
                              {req.status === "Pending" ? (
                                <div style={{ display: "inline-flex", gap: "6px" }}>
                                  <button className="action-btn" onClick={() => handleStatusChange(req.leave_id, "Approved")} title="Approve" style={{ width: "30px", height: "30px", borderRadius: "8px", border: "none", backgroundColor: t.statIconBg2, color: t.statIconColor2, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                    <Check size={13} />
                                  </button>
                                  <button className="action-btn" onClick={() => handleStatusChange(req.leave_id, "Rejected")} title="Reject" style={{ width: "30px", height: "30px", borderRadius: "8px", border: "none", backgroundColor: t.statIconBg4, color: t.statIconColor4, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                    <XCircle size={13} />
                                  </button>
                                </div>
                              ) : (
                                <span style={{ fontSize: "0.75rem", color: t.textMuted }}>Processed</span>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {!loading && filtered.length > 0 && (
              <div style={{ padding: "10px 20px", borderTop: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
                <span style={{ fontSize: "0.75rem", color: t.textMuted }}>
                  {filtered.length} of {leaveRequests.length} records
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Clock size={11} style={{ color: t.textMuted }} />
                  <span style={{ fontSize: "0.7rem", color: t.textMuted }}>Updated just now</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-bg" onClick={() => setShowModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "1.05rem", fontWeight: "700", color: t.textPrimary, margin: "0 0 2px", fontFamily: "'Playfair Display', serif" }}>Apply for Leave</h2>
                <p style={{ fontSize: "0.77rem", color: t.textMuted, margin: 0 }}>Fill in the details to submit your request</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ width: "32px", height: "32px", borderRadius: "8px", border: `1.5px solid ${t.inputBorder}`, background: t.inputBg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: t.textSecondary }}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleApplyLeave}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "500", color: t.textSecondary, marginBottom: "6px" }}>Leave Type</label>
                <select className="form-input" value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
                  <option>Annual</option>
                  <option>Sick</option>
                  <option>Casual</option>
                  <option>Maternity/Paternity</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "500", color: t.textSecondary, marginBottom: "6px" }}>Start Date</label>
                  <input type="date" className="form-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "500", color: t.textSecondary, marginBottom: "6px" }}>End Date</label>
                  <input type="date" className="form-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                </div>
              </div>

              <div style={{ marginBottom: "22px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "500", color: t.textSecondary, marginBottom: "6px" }}>Reason</label>
                <textarea className="form-input" rows="3" placeholder="Briefly describe the reason for leave..." value={reason} onChange={(e) => setReason(e.target.value)} required style={{ resize: "vertical", minHeight: "78px" }} />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "10px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "10px", background: t.card, fontSize: "0.875rem", fontWeight: "500", color: t.textSecondary, cursor: "pointer", fontFamily: "inherit" }}>
                  Cancel
                </button>
                <button type="submit" style={{ flex: 1, padding: "10px", border: "none", borderRadius: "10px", background: "#4F46E5", fontSize: "0.875rem", fontWeight: "500", color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaves;
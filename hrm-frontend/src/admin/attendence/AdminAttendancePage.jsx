import React, { useEffect, useState } from "react";
import Sidebar from "../../layouts/sidebar";
import MobileTopBar from "../../employee/MobileTopBar";
import { Search, Clock, CheckCircle2, XCircle, Bell, Calendar } from "lucide-react";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";

const AdminAttendancePage = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
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
    tableHead: isDark ? "#111827" : "#FAFBFF",
    rowHover: isDark ? "#1E2535" : "#F5F7FF",
    skeletonBg: isDark ? "#1E2535" : "#F3F4F6",
    statIconBg1: isDark ? "#1E1B4B" : "#EEF2FF",
    statIconBg2: isDark ? "#064E3B" : "#ECFDF5",
    statIconBg3: isDark ? "#451A03" : "#FFFBEB",
    statIconColor1: isDark ? "#818CF8" : "#4F46E5",
    statIconColor2: isDark ? "#34D399" : "#059669",
    statIconColor3: isDark ? "#FCD34D" : "#D97706",
    presentBadgeBg: isDark ? "#064E3B" : "#ECFDF5",
    presentBadgeText: isDark ? "#6EE7B7" : "#059669",
    presentBadgeDot: isDark ? "#6EE7B7" : "#059669",
    absentBadgeBg: isDark ? "#451A03" : "#FFFBEB",
    absentBadgeText: isDark ? "#FCD34D" : "#D97706",
    absentBadgeDot: isDark ? "#FCD34D" : "#D97706",
    trendPresent: isDark ? "#34D399" : "#059669",
    trendAbsent: isDark ? "#FCD34D" : "#D97706",
    errorBg: isDark ? "#2D0F0F" : "#FFF1F2",
    errorBorder: isDark ? "#7F1D1D" : "#FECDD3",
    errorText: isDark ? "#F87171" : "#BE123C",
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

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5001/api/attendance/all",
        { headers: { "x-auth-token": token } }
      );
      const raw = res.data;
      let list = [];
      if (Array.isArray(raw)) {
        list = raw;
      } else if (Array.isArray(raw?.data)) {
        list = raw.data;
      } else if (Array.isArray(raw?.attendance)) {
        list = raw.attendance;
      }
      setAttendance(list);
      setError("");
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setError("Failed to load attendance records.");
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  const normalized = attendance.map((item) => ({
    name: item.employee?.name || item.name || "Unknown",
    date: item.sessions?.[0]?.session_date || item.date || null,
    status: item.status || "Unknown",
    check_in: item.check_in || "—",
    check_out: item.check_out || "—",
  }));

  const filtered = normalized.filter(
    (item) =>
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.status?.toLowerCase().includes(search.toLowerCase())
  );

  const presentCount = attendance.filter((a) => a.status === "Present").length;
  const absentCount = attendance.filter((a) => a.status !== "Present").length;

  const sidebarWidth = isMobile ? 0 : isOpen ? 255 : 68;

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: t.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .stat-card { transition: transform 0.18s, box-shadow 0.18s; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(15,23,42,0.15) !important; }
        .att-row { transition: background 0.12s; }
        .att-row:hover { background: ${t.rowHover} !important; }
        .att-search-input:focus { outline: none; border-color: #4F46E5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.10); }
        .topbar-btn:hover { background: ${isDark ? "#1E2535" : "#F3F4F6"} !important; }
        * { box-sizing: border-box; }

        @media (max-width: 768px) {
          .att-topbar       { display: none !important; }
          .att-main         { padding: 72px 14px 32px !important; }
          .att-page-head    { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
          .att-page-title   { font-size: 1.45rem !important; }
          .att-stats-grid   { grid-template-columns: 1fr !important; gap: 10px !important; }
          .att-stat-val     { font-size: 1.6rem !important; }
          .att-table-header { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
          .att-search-inp   { width: 100% !important; }
          .att-table-wrap   { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .att-table-wrap table { min-width: 580px; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .att-main { padding: 24px 20px 32px !important; }
          .att-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
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
        <div className="att-topbar" style={{
          height: "64px",
          backgroundColor: t.topbar,
          borderBottom: `1px solid ${t.border}`,
          display: "flex",
          alignItems: "center",
          padding: "0 28px",
          gap: "16px",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: isDark ? "0 1px 4px rgba(0,0,0,0.3)" : "0 1px 4px rgba(15,23,42,0.04)",
        }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "380px" }}>
            <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: t.textMuted }} />
            <input
              className="att-search-input"
              placeholder="Search anything..."
              style={{
                width: "100%",
                padding: "8px 12px 8px 36px",
                border: `1.5px solid ${t.inputBorder}`,
                borderRadius: "10px",
                fontSize: "0.875rem",
                color: t.textPrimary,
                backgroundColor: t.inputBg,
                transition: "border-color 0.18s, box-shadow 0.18s",
              }}
            />
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
            <button className="topbar-btn" style={{
              width: "38px", height: "38px", borderRadius: "10px",
              border: `1.5px solid ${t.inputBorder}`, background: t.card,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: t.textSecondary, position: "relative",
            }}>
              <Bell size={17} />
              <span style={{
                position: "absolute", top: "8px", right: "8px",
                width: "7px", height: "7px", borderRadius: "50%",
                background: "#EF4444", border: `1.5px solid ${t.card}`,
              }} />
            </button>
            <div style={{
              display: "flex", alignItems: "center", gap: "9px",
              padding: "5px 12px 5px 6px",
              border: `1.5px solid ${t.inputBorder}`, borderRadius: "10px",
              background: t.card, cursor: "pointer",
            }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: "0.72rem", fontWeight: "600",
              }}>
                {name.slice(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: "0.83rem", fontWeight: "500", color: t.textPrimary }}>{name}</span>
            </div>
          </div>
        </div>

        <div className="att-main" style={{ padding: "28px 28px 40px", flex: 1 }}>
          <div className="att-page-head" style={{ marginBottom: "24px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", animation: "fadeUp 0.4s ease both 0.05s" }}>
            <div>
              <p style={{ color: t.textSecondary, fontSize: "0.875rem", margin: "0 0 4px" }}>
                {greeting}, <strong style={{ color: "#4F46E5" }}>{name}</strong> 👋
              </p>
              <h1 className="att-page-title" style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.85rem", fontWeight: "700",
                color: t.textPrimary, margin: 0, lineHeight: 1.2,
              }}>
                Attendance Records
              </h1>
              <p style={{ color: t.textMuted, fontSize: "0.85rem", margin: "5px 0 0" }}>
                {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>

          <div className="att-stats-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "14px",
            marginBottom: "24px",
          }}>
            {[
              { title: "Total Records",  count: attendance.length, icon: <Calendar size={19} />,      iconBg: t.statIconBg1, iconColor: t.statIconColor1, trend: "All time",      trendUp: true },
              { title: "Present Today",  count: presentCount,      icon: <CheckCircle2 size={19} />,  iconBg: t.statIconBg2, iconColor: t.statIconColor2, trend: "On track",      trendUp: true },
              { title: "Absent Today",   count: absentCount,       icon: <XCircle size={19} />,       iconBg: t.statIconBg3, iconColor: t.statIconColor3, trend: "Needs review",  trendUp: false },
            ].map((stat, idx) => (
              <div key={idx} className="stat-card" style={{
                backgroundColor: t.card, borderRadius: "14px", padding: "18px",
                border: `1px solid ${t.border}`, boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)",
                animation: `fadeUp 0.4s ease both ${0.1 + idx * 0.07}s`,
              }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "10px",
                  backgroundColor: stat.iconBg, display: "flex", alignItems: "center",
                  justifyContent: "center", color: stat.iconColor, marginBottom: "12px",
                }}>
                  {stat.icon}
                </div>
                <div style={{ fontSize: "0.75rem", color: t.textMuted, fontWeight: "500", marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                  {stat.title}
                </div>
                <div className="att-stat-val" style={{ fontSize: "2rem", fontWeight: "700", color: t.textPrimary, lineHeight: 1, fontFamily: "'Playfair Display', serif", marginBottom: "6px" }}>
                  {loading
                    ? <span style={{ display: "inline-block", width: "50px", height: "28px", background: t.skeletonBg, borderRadius: "5px" }} />
                    : stat.count}
                </div>
                <div style={{ fontSize: "0.73rem", color: stat.trendUp ? t.trendPresent : t.trendAbsent, fontWeight: "500" }}>
                  {stat.trend}
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div style={{
              background: t.errorBg, border: `1px solid ${t.errorBorder}`, color: t.errorText,
              borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", fontSize: "0.875rem",
            }}>
              {error}
            </div>
          )}

          <div style={{
            backgroundColor: t.card, borderRadius: "14px", border: `1px solid ${t.border}`,
            boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)", overflow: "hidden",
            animation: "fadeUp 0.4s ease both 0.35s",
          }}>
            <div className="att-table-header" style={{
              padding: "16px 20px", borderBottom: `1px solid ${t.border}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              gap: "12px", flexWrap: "wrap",
            }}>
              <div>
                <h2 style={{ fontSize: "0.95rem", fontWeight: "600", color: t.textPrimary, margin: "0 0 2px" }}>
                  Attendance Log
                </h2>
                <p style={{ fontSize: "0.75rem", color: t.textMuted, margin: 0 }}>
                  {filtered.length} {filtered.length === 1 ? "record" : "records"} found
                </p>
              </div>
              <div style={{ position: "relative", flex: isMobile ? "1 1 100%" : "0 0 auto" }}>
                <Search size={13} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: t.textMuted }} />
                <input
                  className="att-search-input att-search-inp"
                  placeholder="Search by name or status..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    padding: "8px 12px 8px 30px",
                    border: `1.5px solid ${t.inputBorder}`,
                    borderRadius: "9px",
                    fontSize: "0.82rem",
                    color: t.textPrimary,
                    backgroundColor: t.inputBg,
                    width: "260px",
                    transition: "border-color 0.18s, box-shadow 0.18s",
                  }}
                />
              </div>
            </div>

            <div className="att-table-wrap">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: t.tableHead }}>
                    {["#", "Employee", "Date", "Status", "Check In", "Check Out"].map((h, i) => (
                      <th key={i} style={{
                        padding: "10px 18px", textAlign: "left",
                        fontSize: "0.68rem", fontWeight: "600", color: t.textMuted,
                        textTransform: "uppercase", letterSpacing: "0.5px",
                        borderBottom: `1px solid ${t.border}`, whiteSpace: "nowrap",
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {[30, 130, 90, 70, 70, 70].map((w, j) => (
                          <td key={j} style={{ padding: "13px 18px" }}>
                            <div style={{ height: "13px", width: `${w}px`, background: t.skeletonBg, borderRadius: "4px" }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: "44px", textAlign: "center", color: t.textMuted, fontSize: "0.875rem" }}>
                        No attendance records found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((item, i) => (
                      <tr key={i} className="att-row" style={{ borderBottom: `1px solid ${t.border}` }}>
                        <td style={{ padding: "12px 18px", fontSize: "0.8rem", color: t.textMuted, fontWeight: "500" }}>
                          {String(i + 1).padStart(2, "0")}
                        </td>
                        <td style={{ padding: "12px 18px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                            <div style={{
                              width: "30px", height: "30px", borderRadius: "50%",
                              background: `hsl(${(item.name?.charCodeAt(0) || 65) * 5 % 360}, 55%, ${isDark ? "45%" : "55%"})`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: "#fff", fontSize: "0.72rem", fontWeight: "600", flexShrink: 0,
                            }}>
                              {(item.name || "?").slice(0, 2).toUpperCase()}
                            </div>
                            <span style={{ fontSize: "0.855rem", fontWeight: "500", color: t.textPrimary, whiteSpace: "nowrap" }}>
                              {item.name}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 18px", fontSize: "0.84rem", color: t.textSecondary, whiteSpace: "nowrap" }}>
                          {item.date
                            ? new Date(item.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                            : "—"}
                        </td>
                        <td style={{ padding: "12px 18px" }}>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: "5px",
                            padding: "3px 10px", borderRadius: "20px",
                            fontSize: "0.7rem", fontWeight: "600",
                            backgroundColor: item.status === "Present" ? t.presentBadgeBg : t.absentBadgeBg,
                            color: item.status === "Present" ? t.presentBadgeText : t.absentBadgeText,
                            whiteSpace: "nowrap",
                          }}>
                            <span style={{
                              width: "5px", height: "5px", borderRadius: "50%",
                              background: item.status === "Present" ? t.presentBadgeDot : t.absentBadgeDot,
                            }} />
                            {item.status || "Unknown"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 18px", fontSize: "0.84rem", color: t.textSecondary, whiteSpace: "nowrap" }}>
                          {item.check_in}
                        </td>
                        <td style={{ padding: "12px 18px", fontSize: "0.84rem", color: t.textSecondary, whiteSpace: "nowrap" }}>
                          {item.check_out}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!loading && filtered.length > 0 && (
              <div style={{
                padding: "10px 20px", borderTop: `1px solid ${t.border}`,
                display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px",
              }}>
                <span style={{ fontSize: "0.75rem", color: t.textMuted }}>
                  Showing {filtered.length} of {attendance.length} records
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
    </div>
  );
};

export default AdminAttendancePage;
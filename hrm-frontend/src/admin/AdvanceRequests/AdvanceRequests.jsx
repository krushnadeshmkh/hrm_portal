import React, { useState, useEffect } from "react";
import Sidebar from "../../layouts/sidebar";
import MobileTopBar from "../../employee/MobileTopBar";
import { CheckCircle, XCircle, Clock, Search, DollarSign, Trash2 } from "lucide-react";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";

function AdvanceRequests() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, totalAmount: 0 });
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
    modalOverlay: isDark ? "rgba(0,0,0,0.7)" : "rgba(15,23,42,0.5)",
    badgePendingBg: isDark ? "#451A03" : "#FEF3C7",
    badgePendingText: isDark ? "#FCD34D" : "#D97706",
    badgeApprovedBg: isDark ? "#064E3B" : "#ECFDF5",
    badgeApprovedText: isDark ? "#6EE7B7" : "#059669",
    badgeRejectedBg: isDark ? "#2D0F0F" : "#FEE2E2",
    badgeRejectedText: isDark ? "#F87171" : "#DC2626",
    statIconBg1: isDark ? "#451A03" : "#FFFBEB",
    statIconBg2: isDark ? "#064E3B" : "#ECFDF5",
    statIconBg3: isDark ? "#2D0F0F" : "#FEE2E2",
    statIconBg4: isDark ? "#1E1B4B" : "#EEF2FF",
    statIconColor1: isDark ? "#FCD34D" : "#D97706",
    statIconColor2: isDark ? "#6EE7B7" : "#059669",
    statIconColor3: isDark ? "#F87171" : "#DC2626",
    statIconColor4: isDark ? "#818CF8" : "#4F46E5",
    filterActive: "#4F46E5",
    filterInactiveBg: isDark ? "#1E2535" : "#fff",
    filterInactiveText: isDark ? "#9CA3AF" : "#374151",
    filterInactiveBorder: isDark ? "#2D3748" : "#E5E7EB",
    buttonApprove: isDark ? "#065F46" : "#059669",
    buttonReject: isDark ? "#7F1D1D" : "#DC2626",
    buttonView: isDark ? "#1E2535" : "#F3F4F6",
    buttonViewText: isDark ? "#9CA3AF" : "#374151",
    buttonDelete: isDark ? "#2D0F0F" : "#FEE2E2",
    buttonDeleteText: isDark ? "#F87171" : "#DC2626",
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
  const API_URL = import.meta.env.VITE_API_URL || "https://hrm-backend-vvqg.onrender.com";

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const endpoint = filter === "all" 
        ? `${API_URL}/api/salary-advance/all`
        : `${API_URL}/api/salary-advance/${filter}`;
      
      const res = await axios.get(endpoint, {
        headers: { "x-auth-token": token },
      });
      setRequests(res.data.data || []);
      
      const allRes = await axios.get(`${API_URL}/api/salary-advance/all`, {
        headers: { "x-auth-token": token },
      });
      const allRequests = allRes.data.data || [];
      setStats({
        pending: allRequests.filter(r => r.status === "pending").length,
        approved: allRequests.filter(r => r.status === "approved").length,
        rejected: allRequests.filter(r => r.status === "rejected").length,
        totalAmount: allRequests.reduce((sum, r) => sum + (r.amount || 0), 0)
      });
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const handleStatusUpdate = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/api/salary-advance/update-status/${id}`,
        { status },
        { headers: { "x-auth-token": token } }
      );
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.error || "Error updating request");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/salary-advance/${id}`, {
        headers: { "x-auth-token": token },
      });
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.error || "Error deleting request");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: t.badgePendingBg, color: t.badgePendingText, label: "Pending" },
      approved: { bg: t.badgeApprovedBg, color: t.badgeApprovedText, label: "Approved" },
      rejected: { bg: t.badgeRejectedBg, color: t.badgeRejectedText, label: "Rejected" }
    };
    return badges[status] || badges.pending;
  };

  const filteredRequests = requests.filter(req =>
    (req.employee_id?.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (req.reason || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: t.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } }
        .stat-card { transition: transform 0.18s, box-shadow 0.18s; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(15,23,42,0.15) !important; }
        .request-row { transition: background 0.12s; }
        .request-row:hover { background: ${t.rowHover} !important; }
        .adv-search-input:focus { outline: none; border-color: #4F46E5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.10); }
        .topbar-btn:hover { background: ${isDark ? "#1E2535" : "#F3F4F6"} !important; }
        * { box-sizing: border-box; }

        @media (max-width: 768px) {
          .adv-topbar { display: none !important; }
          .adv-main { padding: 72px 14px 32px !important; }
          .adv-page-head { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
          .adv-page-title { font-size: 1.45rem !important; }
          .adv-stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
          .adv-stat-val { font-size: 1.6rem !important; }
          .adv-filters { gap: 8px !important; }
          .adv-filter-btn { padding: 6px 14px !important; font-size: 0.75rem !important; }
          .adv-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .adv-table-wrap table { min-width: 680px; }
          .adv-table-header { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
          .adv-search-inp { width: 100% !important; }
          .modal-dialog { margin: 16px !important; width: calc(100% - 32px) !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .adv-main { padding: 24px 20px 32px !important; }
          .adv-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
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
        <div className="adv-topbar" style={{
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
              className="adv-search-input"
              placeholder="Search requests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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

        <div className="adv-main" style={{ padding: "28px 28px 40px", flex: 1 }}>
          <div className="adv-page-head" style={{ marginBottom: "24px", animation: "fadeUp 0.4s ease both 0.05s" }}>
            <p style={{ color: t.textSecondary, fontSize: "0.875rem", margin: "0 0 4px" }}>
              {greeting}, <strong style={{ color: "#4F46E5" }}>{name}</strong> 👋
            </p>
            <h1 className="adv-page-title" style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.85rem", fontWeight: "700",
              color: t.textPrimary, margin: 0, lineHeight: 1.2,
            }}>
              Salary Advance Requests
            </h1>
            <p style={{ color: t.textMuted, fontSize: "0.85rem", margin: "5px 0 0" }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          <div className="adv-filters" style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap" }}>
            {["pending", "approved", "rejected", "all"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className="adv-filter-btn"
                style={{
                  padding: "8px 20px",
                  borderRadius: "30px",
                  border: filter === status ? "none" : `1.5px solid ${t.filterInactiveBorder}`,
                  background: filter === status ? t.filterActive : t.filterInactiveBg,
                  color: filter === status ? "#fff" : t.filterInactiveText,
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontFamily: "inherit",
                }}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status !== "all" && (
                  <span style={{
                    marginLeft: "8px",
                    background: filter === status ? "rgba(255,255,255,0.2)" : (isDark ? "#2D3748" : "#F3F4F6"),
                    padding: "2px 8px",
                    borderRadius: "20px",
                    fontSize: "0.7rem"
                  }}>
                    {stats[status]}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="adv-stats-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "14px",
            marginBottom: "24px",
          }}>
            {[
              { title: "Pending Requests", value: stats.pending, icon: <Clock size={19} />, bg: t.statIconBg1, color: t.statIconColor1 },
              { title: "Approved", value: stats.approved, icon: <CheckCircle size={19} />, bg: t.statIconBg2, color: t.statIconColor2 },
              { title: "Rejected", value: stats.rejected, icon: <XCircle size={19} />, bg: t.statIconBg3, color: t.statIconColor3 },
              { title: "Total Amount", value: `₹${stats.totalAmount.toLocaleString()}`, icon: <DollarSign size={19} />, bg: t.statIconBg4, color: t.statIconColor4 },
            ].map((stat, idx) => (
              <div key={idx} className="stat-card" style={{
                backgroundColor: t.card, borderRadius: "14px", padding: "18px",
                border: `1px solid ${t.border}`, boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)",
                animation: `fadeUp 0.4s ease both ${0.1 + idx * 0.07}s`,
              }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "10px",
                  backgroundColor: stat.bg, display: "flex", alignItems: "center",
                  justifyContent: "center", color: stat.color, marginBottom: "12px",
                }}>
                  {stat.icon}
                </div>
                <div style={{ fontSize: "0.75rem", color: t.textMuted, fontWeight: "500", marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                  {stat.title}
                </div>
                <div className="adv-stat-val" style={{
                  fontSize: typeof stat.value === "string" && stat.value.startsWith("₹") ? "1.3rem" : "1.8rem",
                  fontWeight: "700", color: t.textPrimary, lineHeight: 1,
                  fontFamily: "'Playfair Display', serif",
                }}>
                  {loading ? <span style={{ display: "inline-block", width: "60px", height: "28px", background: t.skeletonBg, borderRadius: "5px" }} /> : stat.value}
                </div>
              </div>
            ))}
          </div>

          <div style={{
            backgroundColor: t.card, borderRadius: "14px", border: `1px solid ${t.border}`,
            boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)",
            overflow: "hidden", animation: "fadeUp 0.4s ease both 0.35s",
          }}>
            <div className="adv-table-header" style={{
              padding: "16px 20px", borderBottom: `1px solid ${t.border}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              gap: "12px", flexWrap: "wrap",
            }}>
              <div>
                <h2 style={{ fontSize: "0.95rem", fontWeight: "600", color: t.textPrimary, margin: "0 0 2px" }}>
                  All Requests
                </h2>
                <p style={{ fontSize: "0.75rem", color: t.textMuted, margin: 0 }}>
                  {filteredRequests.length} {filteredRequests.length === 1 ? "request" : "requests"} found
                </p>
              </div>
              <div style={{ position: "relative", flex: isMobile ? "1 1 100%" : "0 0 auto" }}>
                <Search size={13} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: t.textMuted }} />
                <input
                  className="adv-search-input adv-search-inp"
                  placeholder="Search by name or reason..."
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

            <div className="adv-table-wrap">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: t.tableHead }}>
                    {["Employee", "Amount", "Reason", "Requested", "Status", "Actions"].map((h, i) => (
                      <th key={i} style={{
                        padding: "14px 18px", textAlign: i === 5 ? "right" : "left",
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
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        {[140, 80, 180, 100, 90, 100].map((w, j) => (
                          <td key={j} style={{ padding: "16px 18px" }}>
                            <div style={{ height: "12px", width: `${w}px`, background: t.skeletonBg, borderRadius: "4px" }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: "50px", textAlign: "center", color: t.textMuted, fontSize: "0.875rem" }}>
                        No advance requests found
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((req) => {
                      const statusStyle = getStatusBadge(req.status);
                      return (
                        <tr key={req._id} className="request-row" style={{ borderBottom: `1px solid ${t.border}` }}>
                          <td style={{ padding: "12px 18px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                              <div style={{
                                width: "32px", height: "32px", borderRadius: "50%",
                                background: `hsl(${(req.employee_id?.name?.charCodeAt(0) || 65) * 5 % 360}, 55%, ${isDark ? "45%" : "55%"})`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: "#fff", fontSize: "0.72rem", fontWeight: "600", flexShrink: 0,
                              }}>
                                {(req.employee_id?.name || "?").slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: "600", color: t.textPrimary, fontSize: "0.85rem" }}>{req.employee_id?.name || "Unknown"}</div>
                                <div style={{ fontSize: "0.72rem", color: t.textMuted }}>{req.employee_id?.email}</div>
                              </div>
                            </div>
                           </td>
                          <td style={{ padding: "12px 18px", fontWeight: "700", color: t.textPrimary, whiteSpace: "nowrap" }}>
                            ₹{req.amount?.toLocaleString()}
                           </td>
                          <td style={{ padding: "12px 18px", fontSize: "0.8rem", color: t.textSecondary, maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {req.reason}
                           </td>
                          <td style={{ padding: "12px 18px", fontSize: "0.8rem", color: t.textMuted, whiteSpace: "nowrap" }}>
                            {new Date(req.requested_date).toLocaleDateString()}
                           </td>
                          <td style={{ padding: "12px 18px" }}>
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: "5px",
                              padding: "4px 10px", borderRadius: "20px",
                              fontSize: "0.7rem", fontWeight: "600",
                              backgroundColor: statusStyle.bg, color: statusStyle.color,
                              whiteSpace: "nowrap",
                            }}>
                              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: statusStyle.color }} />
                              {statusStyle.label}
                            </span>
                           </td>
                          <td style={{ padding: "12px 18px", textAlign: "right" }}>
                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                              {req.status === "pending" && (
                                <>
                                  <button
                                    onClick={() => handleStatusUpdate(req._id, "approved")}
                                    style={{
                                      background: t.buttonApprove, color: "#fff", border: "none",
                                      padding: "5px 12px", borderRadius: "6px", fontSize: "0.7rem",
                                      fontWeight: "600", cursor: "pointer", transition: "opacity 0.12s",
                                    }}
                                    onMouseEnter={(e) => e.target.style.opacity = "0.85"}
                                    onMouseLeave={(e) => e.target.style.opacity = "1"}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleStatusUpdate(req._id, "rejected")}
                                    style={{
                                      background: t.buttonReject, color: "#fff", border: "none",
                                      padding: "5px 12px", borderRadius: "6px", fontSize: "0.7rem",
                                      fontWeight: "600", cursor: "pointer", transition: "opacity 0.12s",
                                    }}
                                    onMouseEnter={(e) => e.target.style.opacity = "0.85"}
                                    onMouseLeave={(e) => e.target.style.opacity = "1"}
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => setSelectedRequest(req)}
                                style={{
                                  background: t.buttonView, border: "none", padding: "5px 12px",
                                  borderRadius: "6px", fontSize: "0.7rem", fontWeight: "500",
                                  cursor: "pointer", color: t.buttonViewText, transition: "background 0.12s",
                                }}
                                onMouseEnter={(e) => e.target.style.background = isDark ? "#2D3748" : "#E5E7EB"}
                                onMouseLeave={(e) => e.target.style.background = t.buttonView}
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleDelete(req._id)}
                                style={{
                                  background: t.buttonDelete, border: "none", padding: "5px 12px",
                                  borderRadius: "6px", fontSize: "0.7rem", fontWeight: "500",
                                  cursor: "pointer", color: t.buttonDeleteText, display: "flex",
                                  alignItems: "center", gap: "4px", transition: "background 0.12s",
                                }}
                                onMouseEnter={(e) => e.target.style.background = isDark ? "#3D1A1A" : "#FECACA"}
                                onMouseLeave={(e) => e.target.style.background = t.buttonDelete}
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                           </td>
                         </tr>
                      );
                    })
                  )}
                </tbody>
               </table>
            </div>

            {!loading && filteredRequests.length > 0 && (
              <div style={{
                padding: "10px 20px", borderTop: `1px solid ${t.border}`,
                display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px",
              }}>
                <span style={{ fontSize: "0.75rem", color: t.textMuted }}>
                  Showing {filteredRequests.length} of {requests.length} requests
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

      {selectedRequest && (
        <div style={{
          position: "fixed", inset: 0, background: t.modalOverlay,
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 2000, padding: "16px",
        }}>
          <div className="modal-dialog" style={{
            background: t.card, borderRadius: "16px", maxWidth: "500px",
            width: "100%", padding: "24px", animation: "fadeUp 0.2s ease",
            border: `1px solid ${t.border}`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: "700", color: t.textPrimary, margin: 0, fontFamily: "'Playfair Display', serif" }}>
                Request Details
              </h2>
              <button
                onClick={() => setSelectedRequest(null)}
                style={{
                  background: t.buttonView, border: "none", width: "32px", height: "32px",
                  borderRadius: "8px", cursor: "pointer", color: t.textSecondary,
                  fontSize: "1.2rem", display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                ×
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <p style={{ margin: 0, color: t.textSecondary }}>
                <strong style={{ color: t.textPrimary }}>Employee:</strong> {selectedRequest.employee_id?.name}
              </p>
              <p style={{ margin: 0, color: t.textSecondary }}>
                <strong style={{ color: t.textPrimary }}>Amount:</strong> <span style={{ fontWeight: "700", color: t.textPrimary }}>₹{selectedRequest.amount?.toLocaleString()}</span>
              </p>
              <p style={{ margin: 0, color: t.textSecondary }}>
                <strong style={{ color: t.textPrimary }}>Reason:</strong> {selectedRequest.reason}
              </p>
              <p style={{ margin: 0, color: t.textSecondary }}>
                <strong style={{ color: t.textPrimary }}>Repayment:</strong> {selectedRequest.repayment_months} months (₹{selectedRequest.monthly_deduction?.toLocaleString()}/month)
              </p>
              <p style={{ margin: 0, color: t.textSecondary }}>
                <strong style={{ color: t.textPrimary }}>Requested:</strong> {new Date(selectedRequest.requested_date).toLocaleString()}
              </p>
              {selectedRequest.approved_date && (
                <p style={{ margin: 0, color: t.textSecondary }}>
                  <strong style={{ color: t.textPrimary }}>Approved:</strong> {new Date(selectedRequest.approved_date).toLocaleString()}
                </p>
              )}
              {selectedRequest.notes && (
                <p style={{ margin: 0, color: t.textSecondary }}>
                  <strong style={{ color: t.textPrimary }}>Notes:</strong> {selectedRequest.notes}
                </p>
              )}
            </div>
            <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setSelectedRequest(null)}
                style={{
                  background: "#4F46E5", color: "#fff", border: "none",
                  padding: "8px 20px", borderRadius: "8px", cursor: "pointer",
                  fontWeight: "500", transition: "opacity 0.12s",
                }}
                onMouseEnter={(e) => e.target.style.opacity = "0.9"}
                onMouseLeave={(e) => e.target.style.opacity = "1"}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdvanceRequests;
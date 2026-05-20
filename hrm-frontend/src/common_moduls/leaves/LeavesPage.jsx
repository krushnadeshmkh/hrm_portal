import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../../layouts/Sidebar";
import { Send, Loader2, Check, XCircle, AlertCircle, Bell, Search, Clock, FileText } from "lucide-react";
import axios from "axios";

const Leaves = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const [leaveType, setLeaveType] = useState("Annual");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name") || "Admin";
  const isAdmin = role === "company_admin" || role === "super_admin";

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const sidebarWidth = isOpen ? 255 : 68;

  const fetchLeaves = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setIsRefreshing(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5001/api/leaves", {
        headers: { "x-auth-token": token },
      });
      console.log(res)
      setLeaveRequests(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);



  const handleStatusChange = async (id, status) => {
  try {
    const token = localStorage.getItem("token");
    console.log(token)
    console.log(status)
    console.log(id)

    await axios.put(
      `http://localhost:5001/api/leaves/approve/${id}`,
      { status },
      {
        headers: { "x-auth-token": token },
      }
    );

    await fetchLeaves(true);
  } catch (error) {
    console.log(error);
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
      setReason(""); setStartDate(""); setEndDate("");
      await fetchLeaves(true);
    } catch {
      alert("Error applying leave");
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
    Approved: { color: "#059669", bg: "#ECFDF5" },
    Rejected: { color: "#DC2626", bg: "#FFF1F2" },
    Pending: { color: "#D97706", bg: "#FFFBEB" },
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F9FAFB", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .stat-card { transition: transform 0.18s, box-shadow 0.18s; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(15,23,42,0.10) !important; }
        .leave-row { transition: background 0.12s; }
        .leave-row:hover { background: #F5F7FF !important; }
        .search-input:focus { outline: none; border-color: #4F46E5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.10); }
        .topbar-btn:hover { background: #F3F4F6 !important; }
        .action-btn { transition: transform 0.12s, opacity 0.12s; }
        .action-btn:hover { opacity: 0.85; transform: scale(1.05); }
        .modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.45); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-box { background: #fff; border-radius: 16px; padding: 28px; width: 100%; max-width: 480px; box-shadow: 0 20px 60px rgba(15,23,42,0.15); max-height: 90vh; overflow-y: auto; }
        .form-input { width: 100%; padding: 9px 13px; border: 1.5px solid #E5E7EB; border-radius: 9px; font-size: 0.875rem; color: #374151; background: #F9FAFB; font-family: inherit; transition: border-color 0.18s, box-shadow 0.18s; }
        .form-input:focus { outline: none; border-color: #4F46E5; box-shadow: 0 0 0 3px rgba(79,70,229,0.10); }
        * { box-sizing: border-box; }
      `}</style>

      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div style={{
        marginLeft: `${sidebarWidth}px`, flex: 1,
        transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column", minHeight: "100vh",
      }}>
        <div style={{
          height: "64px", backgroundColor: "#fff", borderBottom: "1px solid #F1F3F9",
          display: "flex", alignItems: "center", padding: "0 28px", gap: "16px",
          position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 4px rgba(15,23,42,0.04)",
        }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "380px" }}>
            <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
            <input
              className="search-input"
              placeholder="Search anything..."
              style={{
                width: "100%", padding: "8px 12px 8px 36px", border: "1.5px solid #E5E7EB",
                borderRadius: "10px", fontSize: "0.875rem", color: "#374151", backgroundColor: "#F9FAFB",
                transition: "border-color 0.18s, box-shadow 0.18s",
              }}
            />
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
            <button className="topbar-btn" style={{
              width: "38px", height: "38px", borderRadius: "10px", border: "1.5px solid #E5E7EB",
              background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#6B7280", position: "relative",
            }}>
              <Bell size={17} />
              <span style={{ position: "absolute", top: "8px", right: "8px", width: "7px", height: "7px", borderRadius: "50%", background: "#EF4444", border: "1.5px solid #fff" }} />
            </button>
            <div style={{
              display: "flex", alignItems: "center", gap: "9px",
              padding: "5px 12px 5px 6px", border: "1.5px solid #E5E7EB",
              borderRadius: "10px", background: "#fff", cursor: "pointer",
            }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: "0.72rem", fontWeight: "600",
              }}>
                {name.slice(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: "0.83rem", fontWeight: "500", color: "#374151" }}>{name}</span>
            </div>
          </div>
        </div>
        <div style={{ padding: "28px 28px 40px", flex: 1 }}>
          <div style={{ marginBottom: "28px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", animation: "fadeUp 0.4s ease both 0.05s" }}>
            <div>
              <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0 0 4px" }}>
                {greeting}, <strong style={{ color: "#4F46E5" }}>{name}</strong> 👋
              </p>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.85rem", fontWeight: "700", color: "#111827", margin: 0, lineHeight: 1.2 }}>
                Leave Management
                {isRefreshing && <Loader2 size={18} style={{ marginLeft: "10px", verticalAlign: "middle", color: "#4F46E5" }} />}
              </h1>
              <p style={{ color: "#9CA3AF", fontSize: "0.85rem", margin: "5px 0 0" }}>
                {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            {!isAdmin && (
              <button
                onClick={() => setShowModal(true)}
                style={{
                  display: "flex", alignItems: "center", gap: "7px",
                  padding: "10px 18px", backgroundColor: "#4F46E5", color: "#fff",
                  border: "none", borderRadius: "10px", fontSize: "0.875rem",
                  fontWeight: "500", cursor: "pointer", fontFamily: "inherit",
                  boxShadow: "0 2px 8px rgba(79,70,229,0.25)",
                }}
              >
                <Send size={15} />
                Apply Leave
              </button>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "16px", marginBottom: "28px" }}>
            {[
              { title: "Total Requests", count: leaveRequests.length, icon: <FileText size={20} />, color: "#4F46E5", bg: "#EEF2FF", trend: "All time", trendUp: true },
              { title: "Approved", count: approvedCount, icon: <Check size={20} />, color: "#059669", bg: "#ECFDF5", trend: "Cleared", trendUp: true },
              { title: "Pending", count: pendingCount, icon: <Clock size={20} />, color: "#D97706", bg: "#FFFBEB", trend: "Awaiting review", trendUp: false },
              { title: "Rejected", count: rejectedCount, icon: <XCircle size={20} />, color: "#DC2626", bg: "#FFF1F2", trend: "Declined", trendUp: false },
            ].map((stat, idx) => (
              <div key={idx} className="stat-card" style={{
                backgroundColor: "#fff", borderRadius: "14px", padding: "20px",
                border: "1px solid #F1F3F9", boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
                animation: `fadeUp 0.4s ease both ${0.1 + idx * 0.07}s`, cursor: "default",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                  <div style={{
                    width: "42px", height: "42px", borderRadius: "11px",
                    backgroundColor: stat.bg, display: "flex", alignItems: "center",
                    justifyContent: "center", color: stat.color,
                  }}>
                    {stat.icon}
                  </div>
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <div style={{ fontSize: "0.78rem", color: "#9CA3AF", fontWeight: "500", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                    {stat.title}
                  </div>
                  <div style={{ fontSize: "2rem", fontWeight: "700", color: "#111827", lineHeight: 1, fontFamily: "'Playfair Display', serif" }}>
                    {loading ? <span style={{ display: "inline-block", width: "60px", height: "32px", background: "#F3F4F6", borderRadius: "6px" }} /> : stat.count}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <span style={{ fontSize: "0.75rem", color: stat.trendUp ? "#059669" : "#D97706", fontWeight: "500" }}>{stat.trend}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{
            backgroundColor: "#fff", borderRadius: "14px", border: "1px solid #F1F3F9",
            boxShadow: "0 2px 8px rgba(15,23,42,0.05)", overflow: "hidden",
            animation: "fadeUp 0.4s ease both 0.35s",
          }}>
            <div style={{
              padding: "18px 22px", borderBottom: "1px solid #F1F3F9",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap",
            }}>
              <div>
                <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "#111827", margin: "0 0 2px" }}>
                  {isAdmin ? "All Applications" : "My Leave History"}
                </h2>
                <p style={{ fontSize: "0.78rem", color: "#9CA3AF", margin: 0 }}>
                  {filtered.length} {filtered.length === 1 ? "record" : "records"} found
                </p>
              </div>
              <div style={{ position: "relative" }}>
                <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                <input
                  className="search-input"
                  placeholder="Search by name, type or status..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    padding: "8px 12px 8px 32px", border: "1.5px solid #E5E7EB",
                    borderRadius: "9px", fontSize: "0.82rem", color: "#374151",
                    backgroundColor: "#F9FAFB", width: "260px",
                    transition: "border-color 0.18s, box-shadow 0.18s",
                  }}
                />
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#FAFBFF" }}>
                    {[
                      "#",
                      ...(isAdmin ? ["Employee"] : []),
                      "Leave Type",
                      "Period",
                      "Status",
                      ...(isAdmin ? ["Actions"] : []),
                    ].map((h, i) => (
                      <th key={i} style={{
                        padding: "11px 22px", textAlign: i === (isAdmin ? 5 : 3) ? "right" : "left",
                        fontSize: "0.72rem", fontWeight: "600", color: "#9CA3AF",
                        textTransform: "uppercase", letterSpacing: "0.5px",
                        borderBottom: "1px solid #F1F3F9",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {[40, ...(isAdmin ? [140] : []), 100, 160, 80, ...(isAdmin ? [80] : [])].map((w, j) => (
                          <td key={j} style={{ padding: "14px 22px" }}>
                            <div style={{ height: "14px", width: `${w}px`, background: "#F3F4F6", borderRadius: "4px" }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 6 : 4} style={{ padding: "48px", textAlign: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", color: "#9CA3AF" }}>
                          <AlertCircle size={28} />
                          <span style={{ fontSize: "0.875rem" }}>No leave requests found</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((req, i) => {
                      const sc = statusConfig[req.status] || statusConfig.Pending;
                      return (
                        <tr key={req.leave_id} className="leave-row" style={{ borderBottom: "1px solid #F9FAFB" }}>
                          <td style={{ padding: "13px 22px", fontSize: "0.82rem", color: "#9CA3AF", fontWeight: "500" }}>
                            {String(i + 1).padStart(2, "0")}
                          </td>
                          {isAdmin && (
                            <td style={{ padding: "13px 22px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div style={{
                                  width: "32px", height: "32px", borderRadius: "50%",
                                  background: `hsl(${((req.employee_name || "?").charCodeAt(0) || 65) * 5 % 360}, 55%, 55%)`,
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  color: "#fff", fontSize: "0.75rem", fontWeight: "600", flexShrink: 0,
                                }}>
                                  {(req.employee_name || "?").slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div style={{ fontSize: "0.875rem", fontWeight: "500", color: "#111827" }}>{req.employee_name || "Unknown"}</div>
                                  <div style={{ fontSize: "0.72rem", color: "#9CA3AF" }}>ID #{req.leave_id}</div>
                                </div>
                              </div>
                            </td>
                          )}
                          <td style={{ padding: "13px 22px", fontSize: "0.855rem", color: "#6B7280" }}>{req.leave_type}</td>
                          <td style={{ padding: "13px 22px", fontSize: "0.855rem", color: "#6B7280" }}>
                            {new Date(req.start_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                            {" — "}
                            {new Date(req.end_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </td>
                          <td style={{ padding: "13px 22px" }}>
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: "5px",
                              padding: "3px 10px", borderRadius: "20px", fontSize: "0.72rem", fontWeight: "600",
                              backgroundColor: sc.bg, color: sc.color,
                            }}>
                              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: sc.color }} />
                              {req.status || "Pending"}
                            </span>
                          </td>
                          {isAdmin && (
                            <td style={{ padding: "13px 22px", textAlign: "right" }}>
                              {req.status === "Pending" ? (
                                <div style={{ display: "inline-flex", gap: "6px" }}>
                                  <button
                                    className="action-btn"
                                    onClick={() => handleStatusChange(req.leave_id, "Approved")}
                                    title="Approve"
                                    style={{
                                      width: "32px", height: "32px", borderRadius: "8px",
                                      border: "none", backgroundColor: "#ECFDF5", color: "#059669",
                                      display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                                    }}
                                  >
                                    <Check size={14} />
                                  </button>
                                  <button
                                    className="action-btn"
                                    onClick={() => handleStatusChange(req.leave_id, "Rejected")}
                                    title="Reject"
                                    style={{
                                      width: "32px", height: "32px", borderRadius: "8px",
                                      border: "none", backgroundColor: "#FFF1F2", color: "#DC2626",
                                      display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                                    }}
                                  >
                                    <XCircle size={14} />
                                  </button>
                                </div>
                              ) : (
                                <span style={{ fontSize: "0.78rem", color: "#9CA3AF" }}>Processed</span>
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
              <div style={{ padding: "12px 22px", borderTop: "1px solid #F1F3F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.78rem", color: "#9CA3AF" }}>
                  Showing {filtered.length} of {leaveRequests.length} records
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <Clock size={12} style={{ color: "#9CA3AF" }} />
                  <span style={{ fontSize: "0.72rem", color: "#9CA3AF" }}>Updated just now</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#111827", margin: "0 0 2px", fontFamily: "'Playfair Display', serif" }}>Apply for Leave</h2>
                <p style={{ fontSize: "0.78rem", color: "#9CA3AF", margin: 0 }}>Fill in the details below to submit your request</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1.5px solid #E5E7EB", background: "#F9FAFB", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "1rem", color: "#6B7280" }}>×</button>
            </div>

            <form onSubmit={handleApplyLeave}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>Leave Type</label>
                <select className="form-input" value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
                  <option>Annual</option>
                  <option>Sick</option>
                  <option>Casual</option>
                  <option>Maternity/Paternity</option>
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>Start Date</label>
                  <input type="date" className="form-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>End Date</label>
                  <input type="date" className="form-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                </div>
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>Reason</label>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder="Briefly describe the reason for leave..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  style={{ resize: "vertical", minHeight: "80px" }}
                />
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{
                  flex: 1, padding: "10px", border: "1.5px solid #E5E7EB", borderRadius: "10px",
                  background: "#fff", fontSize: "0.875rem", fontWeight: "500", color: "#374151",
                  cursor: "pointer", fontFamily: "inherit",
                }}>
                  Cancel
                </button>
                <button type="submit" style={{
                  flex: 1, padding: "10px", border: "none", borderRadius: "10px",
                  background: "#4F46E5", fontSize: "0.875rem", fontWeight: "500", color: "#fff",
                  cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(79,70,229,0.25)",
                }}>
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

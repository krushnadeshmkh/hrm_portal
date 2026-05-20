import React, { useState, useEffect } from "react";
import Sidebar from "../layouts/sidebar";
import { Plus, CalendarDays, Bell, Search, Clock } from "lucide-react";
import axios from "axios";

function Holidays() {
  const [isOpen, setIsOpen] = useState(true);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [description, setDescription] = useState("");
  const [holidayDate, setHolidayDate] = useState("");
  const [search, setSearch] = useState("");

  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name") || "Admin";
  const isAdmin = role === "company_admin" || role === "super_admin";

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const sidebarWidth = isOpen ? 255 : 68;

  const demoHolidays = [
    { holiday_id: 1, description: "New Year", holiday_date: "2026-01-01" },
    { holiday_id: 2, description: "Republic Day", holiday_date: "2026-01-26" },
    { holiday_id: 3, description: "Holi Festival", holiday_date: "2026-03-14" },
    { holiday_id: 4, description: "Independence Day", holiday_date: "2026-08-15" },
    { holiday_id: 5, description: "Diwali Festival", holiday_date: "2026-11-08" },
  ];

  const fetchHolidays = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5001/api/holidays", {
        headers: { "x-auth-token": token },
      });
      setHolidays(res.data.data.length === 0 ? demoHolidays : res.data.data);
    } catch {
      setHolidays(demoHolidays);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHolidays(); }, []);

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5001/api/holidays/add",
        { description, holiday_date: holidayDate },
        { headers: { "x-auth-token": token } }
      );
      setShowModal(false);
      setDescription("");
      setHolidayDate("");
      fetchHolidays();
    } catch (err) {
      alert(err.response?.data?.error || "Error adding holiday");
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
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F9FAFB", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .stat-card { transition: transform 0.18s, box-shadow 0.18s; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(15,23,42,0.10) !important; }
        .holiday-card { transition: transform 0.18s, box-shadow 0.18s; }
        .holiday-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(15,23,42,0.10) !important; }
        .search-input:focus { outline: none; border-color: #4F46E5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.10); }
        .topbar-btn:hover { background: #F3F4F6 !important; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.45); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-box { background: #fff; border-radius: 16px; padding: 28px; width: 100%; max-width: 440px; box-shadow: 0 20px 60px rgba(15,23,42,0.15); }
        .form-input { width: 100%; padding: 9px 13px; border: 1.5px solid #E5E7EB; border-radius: 9px; font-size: 0.875rem; color: #374151; background: #F9FAFB; font-family: inherit; transition: border-color 0.18s, box-shadow 0.18s; }
        .form-input:focus { outline: none; border-color: #4F46E5; box-shadow: 0 0 0 3px rgba(79,70,229,0.10); }
        * { box-sizing: border-box; }
      `}</style>

      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div style={{
        marginLeft: `${sidebarWidth}px`,
        flex: 1,
        transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
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
              placeholder="Search holidays..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "8px 12px 8px 36px",
                border: "1.5px solid #E5E7EB", borderRadius: "10px",
                fontSize: "0.875rem", color: "#374151", backgroundColor: "#F9FAFB",
                transition: "border-color 0.18s, box-shadow 0.18s",
              }}
            />
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
            <button className="topbar-btn" style={{
              width: "38px", height: "38px", borderRadius: "10px",
              border: "1.5px solid #E5E7EB", background: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#6B7280", position: "relative",
            }}>
              <Bell size={17} />
              <span style={{
                position: "absolute", top: "8px", right: "8px",
                width: "7px", height: "7px", borderRadius: "50%",
                background: "#EF4444", border: "1.5px solid #fff",
              }} />
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
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.85rem", fontWeight: "700",
                color: "#111827", margin: 0, lineHeight: 1.2,
              }}>
                Holiday Calendar 2026
              </h1>
              <p style={{ color: "#9CA3AF", fontSize: "0.85rem", margin: "5px 0 0" }}>
                {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            {isAdmin && (
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
                <Plus size={16} />
                Add Holiday
              </button>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "16px", marginBottom: "28px" }}>
            {[
              { title: "Total Holidays", count: holidays.length, icon: <CalendarDays size={20} />, color: "#4F46E5", bg: "#EEF2FF", trend: "This year", trendUp: true },
              { title: "Upcoming Holiday", count: daysAway !== null ? `${daysAway}d` : "—", icon: <Clock size={20} />, color: "#059669", bg: "#ECFDF5", trend: nextHoliday?.description || "—", trendUp: true },
              { title: "Remaining", count: holidays.filter((h) => new Date(h.holiday_date) >= new Date()).length, icon: <CalendarDays size={20} />, color: "#D97706", bg: "#FFFBEB", trend: "Yet to come", trendUp: true },
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
          {nextHoliday && (
            <div style={{
              backgroundColor: "#fff", borderRadius: "14px", padding: "22px 24px",
              border: "1px solid #F1F3F9", boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
              marginBottom: "28px", display: "flex", alignItems: "center",
              justifyContent: "space-between", gap: "16px",
              animation: "fadeUp 0.4s ease both 0.28s",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{
                  width: "48px", height: "48px", borderRadius: "12px",
                  backgroundColor: "#EEF2FF", display: "flex", alignItems: "center",
                  justifyContent: "center", color: "#4F46E5",
                }}>
                  <CalendarDays size={22} />
                </div>
                <div>
                  <span style={{
                    fontSize: "0.7rem", fontWeight: "600", textTransform: "uppercase",
                    letterSpacing: "0.5px", color: "#4F46E5", backgroundColor: "#EEF2FF",
                    padding: "2px 8px", borderRadius: "20px", display: "inline-block", marginBottom: "4px",
                  }}>
                    Upcoming Holiday
                  </span>
                  <div style={{ fontSize: "1rem", fontWeight: "600", color: "#111827" }}>{nextHoliday.description}</div>
                  <div style={{ fontSize: "0.82rem", color: "#6B7280", marginTop: "2px" }}>
                    {new Date(nextHoliday.holiday_date).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </div>
                </div>
              </div>
              <div style={{
                textAlign: "center", padding: "12px 20px",
                backgroundColor: "#F9FAFB", borderRadius: "12px",
                border: "1px solid #F1F3F9", minWidth: "90px",
              }}>
                <div style={{ fontSize: "0.7rem", color: "#9CA3AF", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.4px" }}>Days Away</div>
                <div style={{ fontSize: "2rem", fontWeight: "700", color: "#4F46E5", fontFamily: "'Playfair Display', serif", lineHeight: 1.1 }}>{daysAway}</div>
              </div>
            </div>
          )}
          <div style={{
            backgroundColor: "#fff", borderRadius: "14px", border: "1px solid #F1F3F9",
            boxShadow: "0 2px 8px rgba(15,23,42,0.05)", overflow: "hidden",
            animation: "fadeUp 0.4s ease both 0.35s",
          }}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid #F1F3F9" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "#111827", margin: "0 0 2px" }}>All Holidays</h2>
              <p style={{ fontSize: "0.78rem", color: "#9CA3AF", margin: 0 }}>
                {filtered.length} {filtered.length === 1 ? "holiday" : "holidays"} listed
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px", padding: "20px" }}>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{ height: "80px", backgroundColor: "#F9FAFB", borderRadius: "12px", border: "1px solid #F1F3F9" }} />
                ))
              ) : filtered.length === 0 ? (
                <div style={{ gridColumn: "1/-1", padding: "40px", textAlign: "center", color: "#9CA3AF", fontSize: "0.875rem" }}>
                  No holidays found
                </div>
              ) : (
                filtered.map((holiday, i) => {
                  const isPast = new Date(holiday.holiday_date) < new Date();
                  return (
                    <div key={holiday.holiday_id} className="holiday-card" style={{
                      backgroundColor: isPast ? "#FAFAFA" : "#fff",
                      borderRadius: "12px", padding: "16px 18px",
                      border: "1px solid #F1F3F9", boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
                      display: "flex", alignItems: "center", gap: "14px",
                      animation: `fadeUp 0.4s ease both ${0.05 + i * 0.04}s`,
                      opacity: isPast ? 0.65 : 1,
                    }}>
                      <div style={{
                        width: "42px", height: "42px", borderRadius: "11px",
                        backgroundColor: isPast ? "#F3F4F6" : "#EEF2FF",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: isPast ? "#9CA3AF" : "#4F46E5", flexShrink: 0,
                      }}>
                        <CalendarDays size={20} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.875rem", fontWeight: "600", color: "#111827", marginBottom: "3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {holiday.description}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "#9CA3AF" }}>
                          {new Date(holiday.holiday_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </div>
                      </div>
                      {isPast ? (
                        <span style={{ fontSize: "0.68rem", fontWeight: "600", color: "#9CA3AF", backgroundColor: "#F3F4F6", padding: "2px 8px", borderRadius: "20px", flexShrink: 0 }}>Past</span>
                      ) : (
                        <span style={{ fontSize: "0.68rem", fontWeight: "600", color: "#059669", backgroundColor: "#ECFDF5", padding: "2px 8px", borderRadius: "20px", flexShrink: 0 }}>
                          <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#059669", display: "inline-block", marginRight: "4px", verticalAlign: "middle" }} />
                          Upcoming
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ padding: "12px 22px", borderTop: "1px solid #F1F3F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.78rem", color: "#9CA3AF" }}>
                Showing {filtered.length} of {holidays.length} holidays
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <Clock size={12} style={{ color: "#9CA3AF" }} />
                <span style={{ fontSize: "0.72rem", color: "#9CA3AF" }}>Updated just now</span>
              </div>
            </div>
          </div>
          <div style={{
            backgroundColor: "#fff", borderRadius: "14px", padding: "18px 22px",
            border: "1px solid #F1F3F9", boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
            marginTop: "20px", display: "flex", alignItems: "flex-start", gap: "12px",
            animation: "fadeUp 0.4s ease both 0.4s",
          }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "9px", backgroundColor: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669", flexShrink: 0 }}>
              <CalendarDays size={18} />
            </div>
            <div>
              <div style={{ fontSize: "0.875rem", fontWeight: "600", color: "#111827", marginBottom: "3px" }}>Branch Specific Holidays</div>
              <p style={{ fontSize: "0.82rem", color: "#9CA3AF", margin: 0 }}>
                Holidays listed here apply to all employees. Regional holidays can be added by admins.
              </p>
            </div>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#111827", margin: "0 0 2px", fontFamily: "'Playfair Display', serif" }}>Add Holiday</h2>
                <p style={{ fontSize: "0.78rem", color: "#9CA3AF", margin: 0 }}>Enter the holiday details below</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1.5px solid #E5E7EB", background: "#F9FAFB", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "1rem", color: "#6B7280" }}>×</button>
            </div>

            <form onSubmit={handleAddHoliday}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>Holiday Name</label>
                <input
                  className="form-input"
                  placeholder="e.g. Republic Day"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                  required
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
                  Save Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Holidays;
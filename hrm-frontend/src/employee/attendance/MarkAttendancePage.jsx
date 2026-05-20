import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../layouts/sidebar";
import {
  CheckCircle,
  LogOut,
  MapPin,
  Clock,
  ArrowUpRight,
  Timer,
} from "lucide-react";

function MarkAttendance() {
  const [isOpen, setIsOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [hasOpenSession, setHasOpenSession] = useState(false);
  const [marked, setMarked] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [dayCheckIn, setDayCheckIn] = useState(null);
  const [dayCheckOut, setDayCheckOut] = useState(null);
  const getStatus = () => {
    if (!marked) return "NOT_MARKED";
    if (hasOpenSession) return "CHECKED_IN";
    return "CHECKED_OUT";
  };
  const attendanceStatus = getStatus();
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchToday = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5001/api/attendance/today", {
        headers: { "x-auth-token": token },
      });
      const d = res.data;
      setMarked(d.marked || false);
      setHasOpenSession(d.hasOpenSession || false);
      setSessions(d.sessions || []);
      setDayCheckIn(d.check_in || null);
      setDayCheckOut(d.check_out || null);
    } catch (err) {
      console.error("Error fetching today attendance:", err);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchToday();
  }, []);

  const handleAttendance = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5001/api/attendance/mark",
        { status: "present" },
        { headers: { "x-auth-token": token } }
      );
      if (res.data.success) {
        await fetchToday();
      }
    } catch (error) {
      alert(error.response?.data?.msg || "Error marking attendance");
    } finally {
      setLoading(false);
    }
  };

  const calcDuration = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return null;
    const toSec = (t) => {
      const [h, m, s] = t.split(":").map(Number);
      return h * 3600 + m * 60 + (s || 0);
    };
    const diff = toSec(checkOut) - toSec(checkIn);
    if (diff <= 0) return "< 1 min";
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const totalWorked = () => {
    const toSec = (t) => {
      if (!t) return 0;
      const [h, m, s] = t.split(":").map(Number);
      return h * 3600 + m * 60 + (s || 0);
    };
    const totalSec = sessions
      .filter((s) => s.check_in && s.check_out)
      .reduce((acc, s) => acc + Math.max(0, toSec(s.check_out) - toSec(s.check_in)), 0);
    if (totalSec === 0) return "0m";
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const statusConfig = {
    NOT_MARKED:  { label: "Not Marked",  color: "#6B7280", bg: "#F3F4F6", dot: "#9CA3AF" },
    CHECKED_IN:  { label: "Checked In",  color: "#059669", bg: "#ECFDF5", dot: "#059669" },
    CHECKED_OUT: { label: "Checked Out", color: "#4F46E5", bg: "#EEF2FF", dot: "#4F46E5" },
  };
  const status = statusConfig[attendanceStatus];
  const sidebarWidth = isOpen ? 255 : 68;

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F9FAFB", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:0.35; } }
        @keyframes spin    { to { transform:rotate(360deg); } }
        .att-btn { transition:opacity .18s,transform .18s,box-shadow .18s; border:none; cursor:pointer; }
        .att-btn:hover:not(:disabled) { opacity:.88; transform:translateY(-2px); box-shadow:0 8px 20px rgba(0,0,0,.13); }
        .att-btn:disabled { opacity:.38; cursor:not-allowed; transform:none !important; box-shadow:none !important; }
        .sess-row:hover { background:#F5F7FF !important; }
        * { box-sizing:border-box; }
      `}</style>

      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div style={{ marginLeft: `${sidebarWidth}px`, flex:1, transition:"margin-left 0.25s cubic-bezier(0.4,0,0.2,1)", padding:"28px 28px 40px" }}>
        <div style={{ marginBottom:"28px", animation:"fadeUp 0.4s ease both 0.05s" }}>
          <p style={{ color:"#6B7280", fontSize:"0.875rem", margin:"0 0 4px" }}>Daily Tracking</p>
          <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:"1.85rem", fontWeight:"700", color:"#111827", margin:0, lineHeight:1.2 }}>
            Mark Attendance
          </h1>
          <p style={{ color:"#9CA3AF", fontSize:"0.85rem", margin:"5px 0 0" }}>
            {new Date().toLocaleDateString("en-IN", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}
          </p>
        </div>
        {pageLoading ? (
          <div style={{ display:"flex", alignItems:"center", gap:"10px", color:"#6B7280" }}>
            <div style={{ width:"20px", height:"20px", border:"2px solid #E5E7EB", borderTop:"2px solid #4F46E5", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
            <span style={{ fontSize:"0.875rem", fontWeight:"500" }}>Loading attendance…</span>
          </div>
        ) : (
          <div style={{ display:"flex", gap:"20px", flexWrap:"wrap", alignItems:"flex-start" }}>
            <div style={{ flex:"0 0 310px", animation:"fadeUp 0.4s ease both 0.1s" }}>
              <div style={{ backgroundColor:"#fff", borderRadius:"14px", padding:"28px", border:"1px solid #F1F3F9", boxShadow:"0 2px 8px rgba(15,23,42,0.05)", marginBottom:"14px", textAlign:"center" }}>

                <div style={{ width:"56px", height:"56px", borderRadius:"14px", backgroundColor:"#EEF2FF", display:"flex", alignItems:"center", justifyContent:"center", color:"#4F46E5", margin:"0 auto 16px" }}>
                  <Clock size={24} />
                </div>

                <div style={{ fontFamily:"'Playfair Display', serif", fontSize:"2.7rem", fontWeight:"700", color:"#111827", letterSpacing:"1px", lineHeight:1, marginBottom:"14px" }}>
                  {currentTime.toLocaleTimeString()}
                </div>

                <span style={{ display:"inline-flex", alignItems:"center", gap:"6px", padding:"5px 14px", borderRadius:"20px", fontSize:"0.78rem", fontWeight:"600", backgroundColor:status.bg, color:status.color, marginBottom:"22px" }}>
                  <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:status.dot, animation: attendanceStatus==="CHECKED_IN" ? "pulse 1.5s ease infinite" : "none" }} />
                  {status.label}
                </span>

                <div style={{ height:"1px", background:"#F1F3F9", margin:"0 0 20px" }} />

                <div style={{ display:"flex", gap:"10px" }}>
                  <button
                    className="att-btn"
                    onClick={handleAttendance}
                    disabled={loading || attendanceStatus === "CHECKED_IN"}
                    style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:"7px", padding:"12px", borderRadius:"10px", fontWeight:"600", fontSize:"0.875rem", backgroundColor:"#4F46E5", color:"#fff", fontFamily:"'DM Sans',sans-serif" }}
                  >
                    <CheckCircle size={16} />
                    {loading && attendanceStatus !== "CHECKED_IN" ? "Wait…" : "Check In"}
                  </button>
                  <button
                    className="att-btn"
                    onClick={handleAttendance}
                    disabled={loading || attendanceStatus !== "CHECKED_IN"}
                    style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:"7px", padding:"12px", borderRadius:"10px", fontWeight:"600", fontSize:"0.875rem", backgroundColor:"#059669", color:"#fff", fontFamily:"'DM Sans',sans-serif" }}
                  >
                    <LogOut size={16} />
                    {loading && attendanceStatus === "CHECKED_IN" ? "Wait…" : "Check Out"}
                  </button>
                </div>

                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"5px", marginTop:"14px", fontSize:"0.75rem" }}>
                  <MapPin size={12} style={{ color:"#059669" }} />
                  <span style={{ color:"#059669", fontWeight:"500" }}>Location Verified</span>
                </div>
              </div>
              {marked && (
                <div style={{ backgroundColor:"#fff", borderRadius:"14px", padding:"18px 20px", border:"1px solid #F1F3F9", boxShadow:"0 2px 8px rgba(15,23,42,0.05)", marginBottom:"14px" }}>
                  <div style={{ fontSize:"0.70rem", fontWeight:"600", color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.4px", marginBottom:"14px" }}>
                    Today's Summary
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"8px" }}>
                    {[
                      { label:"First In",   value: dayCheckIn  || "—",            color:"#4F46E5", bg:"#EEF2FF"  },
                      { label:"Last Out",   value: dayCheckOut || (hasOpenSession ? "Active" : "—"), color: hasOpenSession ? "#059669" : "#D97706", bg: hasOpenSession ? "#ECFDF5" : "#FFFBEB" },
                      { label:"Sessions",   value: sessions.length,                color:"#0891B2", bg:"#ECFEFF"  },
                      { label:"Total Work", value: totalWorked(),                  color:"#059669", bg:"#ECFDF5"  },
                    ].map((item, i) => (
                      <div key={i} style={{ textAlign:"center" }}>
                        <div style={{ fontSize:"0.8rem", fontWeight:"700", color: item.color, backgroundColor: item.bg, borderRadius:"8px", padding:"6px 4px", marginBottom:"5px" }}>
                          {item.value}
                        </div>
                        <div style={{ fontSize:"0.68rem", color:"#9CA3AF" }}>{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {attendanceStatus === "CHECKED_OUT" && (
                <div style={{ backgroundColor:"#fff", borderRadius:"14px", padding:"14px 18px", border:"1px solid #F1F3F9", boxShadow:"0 2px 8px rgba(15,23,42,0.05)", display:"flex", alignItems:"center", gap:"12px" }}>
                  <div style={{ width:"34px", height:"34px", borderRadius:"8px", backgroundColor:"#EEF2FF", color:"#4F46E5", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <ArrowUpRight size={15} />
                  </div>
                  <div>
                    <div style={{ fontSize:"0.8rem", fontWeight:"600", color:"#374151", marginBottom:"2px" }}>You can Check In again</div>
                    <div style={{ fontSize:"0.73rem", color:"#9CA3AF" }}>Multiple sessions are allowed in a single day.</div>
                  </div>
                </div>
              )}
            </div>
            {sessions.length > 0 && (
              <div style={{ flex:1, minWidth:"300px", animation:"fadeUp 0.4s ease both 0.18s" }}>
                <div style={{ backgroundColor:"#fff", borderRadius:"14px", border:"1px solid #F1F3F9", boxShadow:"0 2px 8px rgba(15,23,42,0.05)", overflow:"hidden" }}>
                  <div style={{ padding:"16px 22px", borderBottom:"1px solid #F1F3F9", display:"flex", alignItems:"center", gap:"10px" }}>
                    <div style={{ width:"34px", height:"34px", borderRadius:"9px", backgroundColor:"#EEF2FF", color:"#4F46E5", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Timer size={16} />
                    </div>
                    <div>
                      <h2 style={{ fontSize:"0.95rem", fontWeight:"600", color:"#111827", margin:0 }}>Session History</h2>
                      <p style={{ fontSize:"0.75rem", color:"#9CA3AF", margin:0 }}>
                        {sessions.length} session{sessions.length !== 1 ? "s" : ""} recorded today
                      </p>
                    </div>
                    <div style={{ marginLeft:"auto" }}>
                      <span style={{ display:"inline-flex", alignItems:"center", gap:"5px", padding:"4px 12px", borderRadius:"20px", fontSize:"0.75rem", fontWeight:"600", backgroundColor:"#ECFDF5", color:"#059669" }}>
                        <Clock size={11} />{totalWorked()} worked
                      </span>
                    </div>
                  </div>
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse" }}>
                      <thead>
                        <tr style={{ backgroundColor:"#FAFBFF" }}>
                          {["#","Check In","Check Out","Duration","Status"].map((h,i) => (
                            <th key={i} style={{ padding:"10px 20px", textAlign:"left", fontSize:"0.70rem", fontWeight:"600", color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.5px", borderBottom:"1px solid #F1F3F9", whiteSpace:"nowrap" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.map((session, i) => {
                          const sessionOpen = !session.check_out;
                          const duration = calcDuration(session.check_in, session.check_out);
                          return (
                            <tr key={session._id} className="sess-row" style={{ borderBottom:"1px solid #F9FAFB" }}>
                              <td style={{ padding:"12px 20px", fontSize:"0.78rem", color:"#9CA3AF", fontWeight:"500" }}>
                                {String(i + 1).padStart(2, "0")}
                              </td>
                              <td style={{ padding:"12px 20px" }}>
                                <span style={{ display:"inline-flex", alignItems:"center", gap:"6px", fontSize:"0.855rem", fontWeight:"500", color:"#111827" }}>
                                  <span style={{ width:"7px", height:"7px", borderRadius:"50%", background:"#4F46E5", flexShrink:0 }} />
                                  {session.check_in}
                                </span>
                              </td>
                              <td style={{ padding:"12px 20px" }}>
                                {sessionOpen ? (
                                  <span style={{ display:"inline-flex", alignItems:"center", gap:"5px", fontSize:"0.78rem", fontWeight:"600", color:"#059669" }}>
                                    <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#059669", animation:"pulse 1.5s ease infinite" }} />
                                    Active
                                  </span>
                                ) : (
                                  <span style={{ display:"inline-flex", alignItems:"center", gap:"6px", fontSize:"0.855rem", fontWeight:"500", color:"#374151" }}>
                                    <span style={{ width:"7px", height:"7px", borderRadius:"50%", background:"#D97706", flexShrink:0 }} />
                                    {session.check_out}
                                  </span>
                                )}
                              </td>
                              <td style={{ padding:"12px 20px" }}>
                                <span style={{ fontSize:"0.82rem", color:"#6B7280", fontWeight:"500" }}>
                                  {sessionOpen ? "—" : (duration || "< 1 min")}
                                </span>
                              </td>
                              <td style={{ padding:"12px 20px" }}>
                                <span style={{ display:"inline-flex", alignItems:"center", gap:"5px", padding:"3px 10px", borderRadius:"20px", fontSize:"0.70rem", fontWeight:"600", backgroundColor: sessionOpen ? "#ECFDF5" : "#F3F4F6", color: sessionOpen ? "#059669" : "#6B7280" }}>
                                  <span style={{ width:"5px", height:"5px", borderRadius:"50%", background: sessionOpen ? "#059669" : "#9CA3AF" }} />
                                  {sessionOpen ? "Active" : "Done"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ padding:"11px 20px", borderTop:"1px solid #F1F3F9", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <span style={{ fontSize:"0.75rem", color:"#9CA3AF" }}>
                      Showing all {sessions.length} sessions for today
                    </span>
                    <div style={{ display:"flex", alignItems:"center", gap:"5px" }}>
                      <Clock size={11} style={{ color:"#9CA3AF" }} />
                      <span style={{ fontSize:"0.70rem", color:"#9CA3AF" }}>Updated just now</span>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

export default MarkAttendance;
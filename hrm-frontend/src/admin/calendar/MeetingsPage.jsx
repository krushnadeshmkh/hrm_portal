import React, { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, Video, Phone, MapPin, Clock, Users,
  Calendar, MoreHorizontal, Edit2, Trash2, Link,
  CheckCircle, XCircle, Clock as ClockIcon, Filter,
  ChevronDown, Play, Copy
} from "lucide-react";
import axios from "axios";
import Sidebar from "../../layouts/sidebar";
import MobileTopBar from "../../employee/MobileTopBar";
import { useTheme } from "../../context/ThemeContext";
import CreateMeetingModal from "../meetings/CreateMeetingModal";
import MeetingDetails from "../meetings/MeetingDetails";
import { useNavigate } from "react-router-dom";

const MeetingsPage = () => {
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const t = {
    bg: isDark ? "#0F1219" : "#F9FAFB",
    card: isDark ? "#161B27" : "#fff",
    border: isDark ? "#1E2535" : "#F1F3F9",
    textPrimary: isDark ? "#F3F4F6" : "#111827",
    textSecondary: isDark ? "#9CA3AF" : "#6B7280",
    textMuted: isDark ? "#6B7280" : "#9CA3AF",
    inputBg: isDark ? "#1E2535" : "#F9FAFB",
    inputBorder: isDark ? "#2D3748" : "#E5E7EB",
    hoverBg: isDark ? "rgba(99,102,241,0.08)" : "#F3F4F6",
    activeBg: isDark ? "#312E81" : "#EEF2FF",
    activeText: isDark ? "#818CF8" : "#4F46E5",
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: isDark ? "#38BDF8" : "#0891B2",
      ongoing: isDark ? "#34D399" : "#059669",
      completed: isDark ? "#6B7280" : "#6B7280",
      cancelled: isDark ? "#F87171" : "#DC2626",
    };
    return colors[status] || colors.scheduled;
  };

  const getStatusBg = (status) => {
    const colors = {
      scheduled: isDark ? "rgba(56,189,248,0.15)" : "#ECFEFF",
      ongoing: isDark ? "rgba(52,211,153,0.15)" : "#ECFDF5",
      completed: isDark ? "rgba(107,114,128,0.15)" : "#F9FAFB",
      cancelled: isDark ? "rgba(248,113,113,0.15)" : "#FEF2F2",
    };
    return colors[status] || colors.scheduled;
  };

  const getStatusIcon = (status) => {
    const icons = {
      scheduled: <ClockIcon size={14} />,
      ongoing: <Play size={14} />,
      completed: <CheckCircle size={14} />,
      cancelled: <XCircle size={14} />,
    };
    return icons[status] || icons.scheduled;
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

  const fetchMeetings = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://hrm-backend-vvqg.onrender.com/api/meetings",
        { headers: { "x-auth-token": token } }
      );
      setMeetings(response.data.data || []);
    } catch (error) {
      console.error("Error fetching meetings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const handleJoinMeeting = async (meeting) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `https://hrm-backend-vvqg.onrender.com/api/meetings/${meeting._id}/join`,
        {},
        { headers: { "x-auth-token": token } }
      );
      
      const meetingCode = meeting.meeting_code || response.data.data?.meeting_code;
      
      if (meetingCode) {
        navigate(`/meeting-room/${meetingCode}`);
      } else {
        const link = response.data.data?.meeting_link || meeting.meeting_link;
        if (link && link !== "") {
          window.open(link, "_blank");
        } else {
          alert("Meeting link not available. Please try again.");
        }
      }
      
      fetchMeetings();
    } catch (error) {
      console.error("Error joining meeting:", error);
      alert(error.response?.data?.message || "Failed to join meeting");
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (!window.confirm("Are you sure you want to delete this meeting?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `https://hrm-backend-vvqg.onrender.com/api/meetings/${meetingId}`,
        { headers: { "x-auth-token": token } }
      );
      fetchMeetings();
    } catch (error) {
      console.error("Error deleting meeting:", error);
    }
  };

  const handleCopyLink = (meeting) => {
    const link = `${window.location.origin}/meeting-room/${meeting.meeting_code}`;
    navigator.clipboard.writeText(link);
    alert("Meeting link copied to clipboard!");
  };

  const filteredMeetings = meetings.filter(meeting => {
    if (filterStatus !== "all" && meeting.status !== filterStatus) return false;
    if (search) {
      const s = search.toLowerCase();
      return meeting.title.toLowerCase().includes(s) ||
        meeting.description?.toLowerCase().includes(s) ||
        meeting.agenda?.toLowerCase().includes(s);
    }
    return true;
  });

  const sidebarWidth = isMobile ? 0 : isOpen ? 255 : 68;

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: t.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .meeting-card { transition: all 0.15s; }
        .meeting-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(79,70,229,0.1); }
        .meeting-btn { transition: all 0.15s; }
        .meeting-btn:hover { background: ${t.hoverBg} !important; }
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px); z-index: 9999;
          display: flex; align-items: center; justify-content: center;
          animation: fadeUp 0.2s ease;
        }
        .modal-content {
          background: ${t.card}; border-radius: 16px;
          max-width: 640px; width: 92%; max-height: 90vh;
          overflow-y: auto; padding: 24px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.3);
          animation: slideIn 0.2s ease;
        }
        @media (max-width: 768px) {
          .meeting-topbar { display: none !important; }
          .meeting-main { padding: 72px 12px 24px !important; }
          .meeting-header { flex-direction: column !important; gap: 10px !important; }
          .meeting-actions { width: 100% !important; flex-wrap: wrap !important; }
          .meeting-search { width: 100% !important; }
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
        <div className="meeting-topbar" style={{
          height: "64px", backgroundColor: t.card,
          borderBottom: `1px solid ${t.border}`,
          display: "flex", alignItems: "center",
          padding: "0 28px", gap: "16px",
          position: "sticky", top: 0, zIndex: 100,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
            <Video size={20} style={{ color: "#4F46E5" }} />
            <h1 style={{ fontSize: "1rem", fontWeight: "600", color: t.textPrimary, margin: 0 }}>Meetings</h1>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: "8px 18px", borderRadius: "9px",
              border: "none", background: "#4F46E5",
              color: "#fff", cursor: "pointer",
              display: "flex", alignItems: "center",
              gap: "6px", fontSize: "0.85rem",
              fontWeight: "600", fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <Plus size={16} /> Schedule Meeting
          </button>
        </div>

        <main className="meeting-main" style={{ padding: "24px 28px 40px", flex: 1 }}>
          <div className="meeting-header" style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: "20px",
            gap: "12px", flexWrap: "wrap",
          }}>
            <div className="meeting-actions" style={{ display: "flex", gap: "10px", alignItems: "center", flex: 1 }}>
              <div className="meeting-search" style={{ position: "relative", flex: 1, maxWidth: "300px" }}>
                <Search size={15} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: t.textMuted }} />
                <input
                  placeholder="Search meetings..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: "100%", padding: "8px 12px 8px 34px",
                    border: `1.5px solid ${t.inputBorder}`,
                    borderRadius: "9px", fontSize: "0.82rem",
                    color: t.textPrimary, backgroundColor: t.inputBg,
                    outline: "none", fontFamily: "'DM Sans', sans-serif",
                  }}
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  padding: "8px 12px", borderRadius: "9px",
                  border: `1.5px solid ${t.inputBorder}`,
                  fontSize: "0.82rem", color: t.textPrimary,
                  backgroundColor: t.inputBg, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <span style={{ fontSize: "0.82rem", color: t.textMuted }}>
              {filteredMeetings.length} {filteredMeetings.length === 1 ? "meeting" : "meetings"}
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{
                width: 36, height: 36, border: "3px solid #EEF2FF",
                borderTop: "3px solid #4F46E5", borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
                margin: "0 auto 12px",
              }} />
              <p style={{ color: t.textMuted }}>Loading meetings...</p>
            </div>
          ) : filteredMeetings.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "80px 20px",
              backgroundColor: t.card, borderRadius: "14px",
              border: `1px solid ${t.border}`,
            }}>
              <Video size={48} style={{ color: t.textMuted, marginBottom: "12px" }} />
              <h3 style={{ color: t.textPrimary, fontSize: "1.1rem", marginBottom: "4px" }}>
                No meetings found
              </h3>
              <p style={{ color: t.textMuted, fontSize: "0.9rem", marginBottom: "16px" }}>
                Schedule your first meeting
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  padding: "10px 24px", borderRadius: "9px",
                  border: "none", background: "#4F46E5",
                  color: "#fff", cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.9rem", fontWeight: "500",
                }}
              >
                Schedule Meeting
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {filteredMeetings.map((meeting) => (
                <div
                  key={meeting._id}
                  className="meeting-card"
                  style={{
                    backgroundColor: t.card,
                    borderRadius: "12px",
                    border: `1px solid ${t.border}`,
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    cursor: "pointer",
                    boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.2)" : "0 2px 8px rgba(15,23,42,0.04)",
                  }}
                  onClick={() => {
                    setSelectedMeeting(meeting);
                    setShowDetails(true);
                  }}
                >
                  <div style={{
                    width: "48px", height: "48px", borderRadius: "10px",
                    backgroundColor: getStatusBg(meeting.status),
                    color: getStatusColor(meeting.status),
                    display: "flex", alignItems: "center",
                    justifyContent: "center", flexShrink: 0,
                  }}>
                    {getStatusIcon(meeting.status)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <h3 style={{
                        fontSize: "0.95rem", fontWeight: "600",
                        color: t.textPrimary, margin: 0,
                      }}>
                        {meeting.title}
                      </h3>
                      <span style={{
                        fontSize: "0.6rem", padding: "2px 10px",
                        borderRadius: "12px",
                        backgroundColor: getStatusBg(meeting.status),
                        color: getStatusColor(meeting.status),
                        fontWeight: "600", textTransform: "capitalize",
                      }}>
                        {meeting.status}
                      </span>
                      {meeting.meeting_code && (
                        <span style={{
                          fontSize: "0.6rem", padding: "2px 8px",
                          borderRadius: "12px",
                          backgroundColor: isDark ? "rgba(99,102,241,0.15)" : "#EEF2FF",
                          color: "#4F46E5", fontWeight: "600",
                          fontFamily: "monospace",
                        }}>
                          {meeting.meeting_code}
                        </span>
                      )}
                    </div>
                    <div style={{
                      display: "flex", alignItems: "center",
                      gap: "12px", flexWrap: "wrap",
                      marginTop: "4px",
                    }}>
                      <span style={{
                        fontSize: "0.78rem", color: t.textSecondary,
                        display: "flex", alignItems: "center", gap: "4px",
                      }}>
                        <Clock size={12} />
                        {meeting.time} {meeting.duration && `(${meeting.duration}min)`}
                      </span>
                      {meeting.location && (
                        <span style={{
                          fontSize: "0.78rem", color: t.textSecondary,
                          display: "flex", alignItems: "center", gap: "4px",
                        }}>
                          {meeting.is_virtual ? <Video size={12} /> : <MapPin size={12} />}
                          {meeting.location}
                        </span>
                      )}
                      <span style={{
                        fontSize: "0.78rem", color: t.textSecondary,
                        display: "flex", alignItems: "center", gap: "4px",
                      }}>
                        <Users size={12} />
                        {meeting.attendees?.length || 0} attendees
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                    {meeting.status !== "completed" && meeting.status !== "cancelled" && meeting.meeting_code && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinMeeting(meeting);
                        }}
                        style={{
                          padding: "6px 14px", borderRadius: "8px",
                          border: "none", background: "#4F46E5",
                          color: "#fff", cursor: "pointer",
                          fontSize: "0.78rem", fontWeight: "500",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        Join
                      </button>
                    )}
                    {meeting.meeting_code && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyLink(meeting);
                        }}
                        style={{
                          padding: "6px 10px", borderRadius: "8px",
                          border: `1px solid ${t.border}`,
                          background: "transparent", color: t.textSecondary,
                          cursor: "pointer",
                        }}
                      >
                        <Copy size={15} />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm("Delete this meeting?")) {
                          handleDeleteMeeting(meeting._id);
                        }
                      }}
                      style={{
                        padding: "6px 10px", borderRadius: "8px",
                        border: "none", background: "transparent",
                        color: "#EF4444", cursor: "pointer",
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <CreateMeetingModal
              onClose={() => {
                setShowCreateModal(false);
                fetchMeetings();
              }}
              onSuccess={fetchMeetings}
            />
          </div>
        </div>
      )}

      {showDetails && selectedMeeting && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <MeetingDetails
              meeting={selectedMeeting}
              onClose={() => setShowDetails(false)}
              onJoin={handleJoinMeeting}
              onDelete={handleDeleteMeeting}
              onRefresh={fetchMeetings}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingsPage;
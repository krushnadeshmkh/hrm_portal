import React, { useState, useEffect } from "react";
import { Video, Clock, Users, MapPin, ChevronRight } from "lucide-react";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";

const UpcomingMeetings = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  const t = {
    card: isDark ? "#161B27" : "#fff",
    border: isDark ? "#1E2535" : "#F1F3F9",
    textPrimary: isDark ? "#F3F4F6" : "#111827",
    textSecondary: isDark ? "#9CA3AF" : "#6B7280",
    textMuted: isDark ? "#6B7280" : "#9CA3AF",
    hoverBg: isDark ? "rgba(99,102,241,0.08)" : "#F3F4F6",
    activeText: isDark ? "#818CF8" : "#4F46E5",
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const today = new Date().toISOString().split("T")[0];
      const response = await axios.get(
        `https://hrm-backend-vvqg.onrender.com/api/meetings?date=${today}`,
        { headers: { "x-auth-token": token } }
      );
      const allMeetings = response.data.data || [];
      const upcoming = allMeetings
        .filter(m => m.status === "scheduled" || m.status === "ongoing")
        .sort((a, b) => a.time.localeCompare(b.time))
        .slice(0, 5);
      setMeetings(upcoming);
    } catch (error) {
      console.error("Error fetching meetings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMeeting = async (meetingId, link) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `https://hrm-backend-vvqg.onrender.com/api/meetings/${meetingId}/join`,
        {},
        { headers: { "x-auth-token": token } }
      );
      window.open(link, "_blank");
    } catch (error) {
      console.error("Error joining meeting:", error);
    }
  };

  const getStatusColor = (status) => {
    return status === "ongoing" ? (isDark ? "#34D399" : "#059669") : (isDark ? "#38BDF8" : "#0891B2");
  };

  return (
    <div style={{
      backgroundColor: t.card,
      borderRadius: "14px",
      border: `1px solid ${t.border}`,
      padding: "16px",
      boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: "12px",
      }}>
        <div style={{
          fontSize: "0.8rem", fontWeight: "600",
          color: t.textPrimary,
          display: "flex", alignItems: "center",
          gap: "6px",
        }}>
          <Video size={16} style={{ color: "#4F46E5" }} />
          Upcoming Meetings
        </div>
        <button
          onClick={() => navigate("/meetings")}
          style={{
            fontSize: "0.7rem", color: t.activeText,
            background: "none", border: "none",
            cursor: "pointer", display: "flex",
            alignItems: "center", gap: "4px",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          View all <ChevronRight size={14} />
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <div style={{
            width: 24, height: 24, border: "2px solid #EEF2FF",
            borderTop: "2px solid #4F46E5", borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
            margin: "0 auto",
          }} />
        </div>
      ) : meetings.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "24px 0",
          color: t.textMuted, fontSize: "0.85rem",
        }}>
          No upcoming meetings today
        </div>
      ) : (
        meetings.map((meeting, idx) => (
          <div
            key={idx}
            style={{
              padding: "10px 0",
              borderBottom: idx < meetings.length - 1 ? `1px solid ${t.border}` : "none",
            }}
          >
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "flex-start", gap: "8px",
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: "flex", alignItems: "center",
                  gap: "6px", flexWrap: "wrap",
                }}>
                  <span style={{
                    fontSize: "0.82rem", fontWeight: "500",
                    color: t.textPrimary,
                  }}>
                    {meeting.title}
                  </span>
                  <span style={{
                    fontSize: "0.55rem", padding: "1px 6px",
                    borderRadius: "10px",
                    backgroundColor: isDark ? "rgba(99,102,241,0.15)" : "#EEF2FF",
                    color: getStatusColor(meeting.status),
                    fontWeight: "600",
                    textTransform: "capitalize",
                  }}>
                    {meeting.status}
                  </span>
                </div>
                <div style={{
                  display: "flex", alignItems: "center",
                  gap: "8px", marginTop: "4px",
                  flexWrap: "wrap",
                }}>
                  <span style={{
                    fontSize: "0.7rem", color: t.textMuted,
                    display: "flex", alignItems: "center",
                    gap: "3px",
                  }}>
                    <Clock size={11} />
                    {meeting.time}
                  </span>
                  {meeting.location && (
                    <span style={{
                      fontSize: "0.7rem", color: t.textMuted,
                      display: "flex", alignItems: "center",
                      gap: "3px",
                    }}>
                      {meeting.is_virtual ? <Video size={11} /> : <MapPin size={11} />}
                      {meeting.location}
                    </span>
                  )}
                  <span style={{
                    fontSize: "0.7rem", color: t.textMuted,
                    display: "flex", alignItems: "center",
                    gap: "3px",
                  }}>
                    <Users size={11} />
                    {meeting.attendees?.length || 0}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleJoinMeeting(meeting._id, meeting.meeting_link)}
                style={{
                  padding: "4px 12px", borderRadius: "6px",
                  border: "none", background: "#4F46E5",
                  color: "#fff", fontSize: "0.7rem",
                  fontWeight: "500", cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  whiteSpace: "nowrap",
                }}
              >
                Join
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default UpcomingMeetings;
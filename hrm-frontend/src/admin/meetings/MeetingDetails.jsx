// src/admin/meetings/MeetingDetails.jsx
import React from "react";
import {
  X, Video, Clock, MapPin, Users, Calendar, Link,
  Edit2, Trash2, Copy, CheckCircle, XCircle, Play,
  User, Mail, Calendar as CalendarIcon
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const MeetingDetails = ({ meeting, onClose, onJoin, onDelete, onRefresh }) => {
  const { isDark } = useTheme();

  const t = {
    card: isDark ? "#161B27" : "#fff",
    border: isDark ? "#1E2535" : "#F1F3F9",
    textPrimary: isDark ? "#F3F4F6" : "#111827",
    textSecondary: isDark ? "#9CA3AF" : "#6B7280",
    textMuted: isDark ? "#6B7280" : "#9CA3AF",
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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(meeting.meeting_link);
    alert("Meeting link copied!");
  };

  return (
    <div>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "20px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "4px", height: "40px", borderRadius: "2px",
            backgroundColor: getStatusColor(meeting.status),
          }} />
          <div>
            <h2 style={{
              fontSize: "1.2rem", fontWeight: "700",
              color: t.textPrimary, margin: 0,
            }}>
              {meeting.title}
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
              <span style={{
                fontSize: "0.7rem", padding: "2px 10px",
                borderRadius: "12px",
                backgroundColor: getStatusBg(meeting.status),
                color: getStatusColor(meeting.status),
                fontWeight: "600", textTransform: "capitalize",
              }}>
                {meeting.status}
              </span>
              {meeting.meeting_code && (
                <span style={{
                  fontSize: "0.65rem", padding: "2px 8px",
                  borderRadius: "12px",
                  backgroundColor: isDark ? "rgba(99,102,241,0.15)" : "#EEF2FF",
                  color: "#4F46E5", fontWeight: "600",
                  fontFamily: "monospace",
                }}>
                  {meeting.meeting_code}
                </span>
              )}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            onClick={onClose}
            style={{
              padding: "6px 10px", borderRadius: "8px",
              border: "none", background: "transparent",
              color: t.textMuted, cursor: "pointer",
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: "12px", marginBottom: "12px",
        }}>
          <div style={{
            padding: "12px 16px", borderRadius: "10px",
            backgroundColor: isDark ? "#1E2535" : "#F9FAFB",
            border: `1px solid ${t.border}`,
          }}>
            <div style={{ fontSize: "0.7rem", color: t.textMuted, marginBottom: "4px" }}>
              <CalendarIcon size={12} style={{ display: "inline", marginRight: "4px" }} />
              Date
            </div>
            <div style={{ fontSize: "0.9rem", fontWeight: "500", color: t.textPrimary }}>
              {new Date(meeting.date).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
          <div style={{
            padding: "12px 16px", borderRadius: "10px",
            backgroundColor: isDark ? "#1E2535" : "#F9FAFB",
            border: `1px solid ${t.border}`,
          }}>
            <div style={{ fontSize: "0.7rem", color: t.textMuted, marginBottom: "4px" }}>
              <Clock size={12} style={{ display: "inline", marginRight: "4px" }} />
              Time
            </div>
            <div style={{ fontSize: "0.9rem", fontWeight: "500", color: t.textPrimary }}>
              {meeting.time} {meeting.duration && `(${meeting.duration} min)`}
            </div>
          </div>
        </div>

        {meeting.location && (
          <div style={{
            padding: "12px 16px", borderRadius: "10px",
            backgroundColor: isDark ? "#1E2535" : "#F9FAFB",
            border: `1px solid ${t.border}`,
            marginBottom: "12px",
          }}>
            <div style={{ fontSize: "0.7rem", color: t.textMuted, marginBottom: "4px" }}>
              {meeting.is_virtual ? <Video size={12} style={{ display: "inline", marginRight: "4px" }} /> : <MapPin size={12} style={{ display: "inline", marginRight: "4px" }} />}
              {meeting.is_virtual ? "Meeting Link" : "Location"}
            </div>
            <div style={{
              fontSize: "0.9rem", fontWeight: "500",
              color: "#4F46E5", display: "flex",
              alignItems: "center", gap: "8px",
            }}>
              {meeting.meeting_link || meeting.location}
              {meeting.meeting_link && (
                <button
                  onClick={handleCopyLink}
                  style={{
                    padding: "4px 8px", borderRadius: "6px",
                    border: "none", background: isDark ? "rgba(99,102,241,0.15)" : "#EEF2FF",
                    color: "#4F46E5", cursor: "pointer",
                  }}
                >
                  <Copy size={14} />
                </button>
              )}
            </div>
          </div>
        )}

        {meeting.agenda && (
          <div style={{
            padding: "12px 16px", borderRadius: "10px",
            backgroundColor: isDark ? "#1E2535" : "#F9FAFB",
            border: `1px solid ${t.border}`,
            marginBottom: "12px",
          }}>
            <div style={{ fontSize: "0.7rem", color: t.textMuted, marginBottom: "4px" }}>
              Agenda
            </div>
            <div style={{ fontSize: "0.9rem", color: t.textSecondary, whiteSpace: "pre-wrap" }}>
              {meeting.agenda}
            </div>
          </div>
        )}

        {meeting.description && (
          <div style={{
            padding: "12px 16px", borderRadius: "10px",
            backgroundColor: isDark ? "#1E2535" : "#F9FAFB",
            border: `1px solid ${t.border}`,
            marginBottom: "12px",
          }}>
            <div style={{ fontSize: "0.7rem", color: t.textMuted, marginBottom: "4px" }}>
              Description
            </div>
            <div style={{ fontSize: "0.9rem", color: t.textSecondary }}>
              {meeting.description}
            </div>
          </div>
        )}

        {meeting.attendees && meeting.attendees.length > 0 && (
          <div style={{
            padding: "12px 16px", borderRadius: "10px",
            backgroundColor: isDark ? "#1E2535" : "#F9FAFB",
            border: `1px solid ${t.border}`,
          }}>
            <div style={{ fontSize: "0.7rem", color: t.textMuted, marginBottom: "8px" }}>
              <Users size={12} style={{ display: "inline", marginRight: "4px" }} />
              Attendees ({meeting.attendees.length})
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {meeting.attendees.map((attendee, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex", alignItems: "center",
                    gap: "6px", padding: "4px 12px",
                    borderRadius: "16px",
                    backgroundColor: isDark ? "rgba(99,102,241,0.15)" : "#EEF2FF",
                    color: "#4F46E5", fontSize: "0.8rem",
                  }}
                >
                  <Mail size={12} />
                  {attendee.email || attendee}
                  {attendee.response_status && (
                    <span style={{
                      fontSize: "0.6rem",
                      color: t.textMuted,
                      fontWeight: "400",
                    }}>
                      ({attendee.response_status})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{
        display: "flex", gap: "10px",
        justifyContent: "flex-end",
        borderTop: `1px solid ${t.border}`,
        paddingTop: "16px",
      }}>
        <button
          onClick={onClose}
          style={{
            padding: "8px 20px", borderRadius: "9px",
            border: `1.5px solid ${t.border}`,
            background: "transparent", color: t.textSecondary,
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.85rem", fontWeight: "500",
          }}
        >
          Close
        </button>
        {meeting.status !== "completed" && meeting.status !== "cancelled" && (
          <button
            onClick={() => onJoin(meeting)}
            style={{
              padding: "8px 20px", borderRadius: "9px",
              border: "none", background: "#4F46E5",
              color: "#fff", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.85rem", fontWeight: "600",
              display: "flex", alignItems: "center", gap: "6px",
            }}
          >
            <Video size={16} /> Join Meeting
          </button>
        )}
        <button
          onClick={() => {
            if (window.confirm("Delete this meeting?")) {
              onDelete(meeting._id);
              onClose();
            }
          }}
          style={{
            padding: "8px 20px", borderRadius: "9px",
            border: "none", background: "#EF4444",
            color: "#fff", cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.85rem", fontWeight: "600",
            display: "flex", alignItems: "center", gap: "6px",
          }}
        >
          <Trash2 size={16} /> Delete
        </button>
      </div>
    </div>
  );
};

export default MeetingDetails;
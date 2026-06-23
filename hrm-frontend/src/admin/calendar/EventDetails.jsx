import React from "react";
import { X, Clock, MapPin, Users, Calendar, Edit2, Trash2, Mail, Check, X as XIcon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { parseLocalDate } from "./dateUtils";

const EventDetails = ({ event, onClose, onDelete, onEdit, isEmployee, onUpdateStatus }) => {
  const { isDark } = useTheme();

  const t = {
    card: isDark ? "#161B27" : "#fff",
    border: isDark ? "#1E2535" : "#F1F3F9",
    textPrimary: isDark ? "#F3F4F6" : "#111827",
    textSecondary: isDark ? "#9CA3AF" : "#6B7280",
    textMuted: isDark ? "#6B7280" : "#9CA3AF",
  };

  const userEmail = localStorage.getItem("email") || "";
  const myGuestEntry = event.guests?.find((g) => g.email === userEmail);

  const getEventColor = (type) => {
    const colors = {
      task: isDark ? "#818CF8" : "#4F46E5",
      reminder: isDark ? "#34D399" : "#059669",
      birthday: isDark ? "#FCD34D" : "#D97706",
      holiday: isDark ? "#F87171" : "#DC2626",
      other: isDark ? "#38BDF8" : "#0891B2",
    };
    return colors[type] || colors.task;
  };

  const getEventBg = (type) => {
    const colors = {
      task: isDark ? "rgba(99,102,241,0.15)" : "#EEF2FF",
      reminder: isDark ? "rgba(52,211,153,0.15)" : "#ECFDF5",
      birthday: isDark ? "rgba(252,211,77,0.15)" : "#FFFBEB",
      holiday: isDark ? "rgba(248,113,113,0.15)" : "#FEF2F2",
      other: isDark ? "rgba(56,189,248,0.15)" : "#ECFEFF",
    };
    return colors[type] || colors.task;
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
            backgroundColor: getEventColor(event.event_type),
          }} />
          <div>
            <h2 style={{
              fontSize: "1.2rem", fontWeight: "700",
              color: t.textPrimary, margin: 0,
            }}>
              {event.title}
            </h2>
            <span style={{
              fontSize: "0.7rem", padding: "2px 10px",
              borderRadius: "12px",
              backgroundColor: getEventBg(event.event_type),
              color: getEventColor(event.event_type),
              fontWeight: "600", textTransform: "capitalize",
              display: "inline-block", marginTop: "4px",
            }}>
              {event.event_type}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          {!isEmployee && (
            <>
              <button
                onClick={onEdit}
                style={{
                  padding: "6px 10px", borderRadius: "8px",
                  border: "none", background: "transparent",
                  color: t.textSecondary, cursor: "pointer",
                }}
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => onDelete(event._id)}
                style={{
                  padding: "6px 10px", borderRadius: "8px",
                  border: "none", background: "transparent",
                  color: "#EF4444", cursor: "pointer",
                }}
              >
                <Trash2 size={18} />
              </button>
            </>
          )}
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
              <Calendar size={12} style={{ display: "inline", marginRight: "4px" }} />
              Date
            </div>
            <div style={{ fontSize: "0.9rem", fontWeight: "500", color: t.textPrimary }}>
              {parseLocalDate(event.date).toLocaleDateString("en-US", {
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
              {event.time} {event.end_time && `- ${event.end_time}`}
            </div>
          </div>
        </div>

        {event.location && (
          <div style={{
            padding: "12px 16px", borderRadius: "10px",
            backgroundColor: isDark ? "#1E2535" : "#F9FAFB",
            border: `1px solid ${t.border}`,
            marginBottom: "12px",
          }}>
            <div style={{ fontSize: "0.7rem", color: t.textMuted, marginBottom: "4px" }}>
              <MapPin size={12} style={{ display: "inline", marginRight: "4px" }} />
              Location
            </div>
            <div style={{ fontSize: "0.9rem", fontWeight: "500", color: t.textPrimary }}>
              {event.location}
            </div>
          </div>
        )}

        {event.description && (
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
              {event.description}
            </div>
          </div>
        )}

        {isEmployee && myGuestEntry && (
          <div style={{
            padding: "12px 16px", borderRadius: "10px",
            backgroundColor: isDark ? "#1E2535" : "#F9FAFB",
            border: `1px solid ${t.border}`,
            marginBottom: "12px",
          }}>
            <div style={{ fontSize: "0.7rem", color: t.textMuted, marginBottom: "8px" }}>
              Your response
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => onUpdateStatus(event._id, "accepted")}
                style={{
                  flex: 1, padding: "8px 12px", borderRadius: "8px",
                  border: `1.5px solid ${myGuestEntry.response_status === "accepted" ? "#059669" : t.border}`,
                  background: myGuestEntry.response_status === "accepted" ? (isDark ? "rgba(52,211,153,0.15)" : "#ECFDF5") : "transparent",
                  color: myGuestEntry.response_status === "accepted" ? "#059669" : t.textSecondary,
                  cursor: "pointer", display: "flex", alignItems: "center",
                  justifyContent: "center", gap: "6px",
                  fontSize: "0.82rem", fontWeight: "600",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <Check size={14} /> Accept
              </button>
              <button
                onClick={() => onUpdateStatus(event._id, "tentative")}
                style={{
                  flex: 1, padding: "8px 12px", borderRadius: "8px",
                  border: `1.5px solid ${myGuestEntry.response_status === "tentative" ? "#D97706" : t.border}`,
                  background: myGuestEntry.response_status === "tentative" ? (isDark ? "rgba(252,211,77,0.15)" : "#FFFBEB") : "transparent",
                  color: myGuestEntry.response_status === "tentative" ? "#D97706" : t.textSecondary,
                  cursor: "pointer",
                  fontSize: "0.82rem", fontWeight: "600",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Maybe
              </button>
              <button
                onClick={() => onUpdateStatus(event._id, "declined")}
                style={{
                  flex: 1, padding: "8px 12px", borderRadius: "8px",
                  border: `1.5px solid ${myGuestEntry.response_status === "declined" ? "#DC2626" : t.border}`,
                  background: myGuestEntry.response_status === "declined" ? (isDark ? "rgba(248,113,113,0.15)" : "#FEF2F2") : "transparent",
                  color: myGuestEntry.response_status === "declined" ? "#DC2626" : t.textSecondary,
                  cursor: "pointer", display: "flex", alignItems: "center",
                  justifyContent: "center", gap: "6px",
                  fontSize: "0.82rem", fontWeight: "600",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <XIcon size={14} /> Decline
              </button>
            </div>
          </div>
        )}

        {event.guests && event.guests.length > 0 && (
          <div style={{
            padding: "12px 16px", borderRadius: "10px",
            backgroundColor: isDark ? "#1E2535" : "#F9FAFB",
            border: `1px solid ${t.border}`,
          }}>
            <div style={{ fontSize: "0.7rem", color: t.textMuted, marginBottom: "8px" }}>
              <Users size={12} style={{ display: "inline", marginRight: "4px" }} />
              Guests ({event.guests.length})
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {event.guests.map((guest, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: "4px 10px", borderRadius: "16px",
                    backgroundColor: isDark ? "rgba(99,102,241,0.15)" : "#EEF2FF",
                    color: "#4F46E5", fontSize: "0.8rem",
                    display: "flex", alignItems: "center", gap: "4px",
                  }}
                >
                  <Mail size={12} />
                  {guest.email}
                  <span style={{
                    fontSize: "0.6rem",
                    color: t.textMuted,
                    fontWeight: "400",
                  }}>
                    ({guest.response_status || "needsAction"})
                  </span>
                </span>
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
        {!isEmployee && (
          <button
            onClick={onEdit}
            style={{
              padding: "8px 20px", borderRadius: "9px",
              border: "none", background: "#4F46E5",
              color: "#fff", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.85rem", fontWeight: "600",
            }}
          >
            Edit Event
          </button>
        )}
      </div>
    </div>
  );
};

export default EventDetails;
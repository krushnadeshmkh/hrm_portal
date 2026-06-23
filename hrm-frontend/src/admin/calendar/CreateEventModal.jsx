import React, { useState } from "react";
import { X, Users, Repeat } from "lucide-react";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";
import { toLocalDateStr } from "./dateUtils";

const CreateEventModal = ({ onClose, onSuccess, initialDate }) => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    date: initialDate ? toLocalDateStr(initialDate) : toLocalDateStr(new Date()),
    end_date: "",
    time: "",
    end_time: "",
    all_day: false,
    event_type: "task",
    location: "",
    description: "",
    color: "#4F46E5",
    recurrence: {
      frequency: "none",
      interval: 1,
      end_date: "",
      days_of_week: [],
    },
    guests: [],
    reminders: [{ method: "notification", minutes: 15 }],
    visibility: "company",
  });
  const [guestEmail, setGuestEmail] = useState("");

  const t = {
    card: isDark ? "#161B27" : "#fff",
    border: isDark ? "#1E2535" : "#F1F3F9",
    textPrimary: isDark ? "#F3F4F6" : "#111827",
    textSecondary: isDark ? "#9CA3AF" : "#6B7280",
    textMuted: isDark ? "#6B7280" : "#9CA3AF",
    inputBg: isDark ? "#1E2535" : "#F9FAFB",
    inputBorder: isDark ? "#2D3748" : "#E5E7EB",
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleRecurrenceChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      recurrence: { ...prev.recurrence, [name]: value },
    }));
  };

  const handleAddGuest = () => {
    if (guestEmail && !formData.guests.find((g) => g.email === guestEmail)) {
      setFormData((prev) => ({
        ...prev,
        guests: [...prev.guests, { email: guestEmail, name: guestEmail.split("@")[0] }],
      }));
      setGuestEmail("");
    }
  };

  const handleRemoveGuest = (email) => {
    setFormData((prev) => ({
      ...prev,
      guests: prev.guests.filter((g) => g.email !== email),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date || (!formData.all_day && !formData.time)) {
      alert("Please fill all required fields");
      return;
    }

    const payload = {
      ...formData,
      time: formData.all_day ? "00:00" : formData.time,
      end_time: formData.all_day ? "23:59" : formData.end_time,
    };

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.post(
        "https://hrm-backend-vvqg.onrender.com/api/calendar/events",
        payload,
        { headers: { "x-auth-token": token } }
      );
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating event:", error);
      alert(error.response?.data?.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: "20px",
      }}>
        <h2 style={{
          fontSize: "1.2rem", fontWeight: "700",
          color: t.textPrimary, margin: 0,
        }}>
          Create New Event
        </h2>
        <button
          onClick={onClose}
          style={{
            padding: "4px", borderRadius: "8px",
            border: "none", background: "transparent",
            color: t.textMuted, cursor: "pointer",
          }}
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "16px" }}>
          <label style={{
            display: "block", fontSize: "0.85rem",
            fontWeight: "500", color: t.textSecondary,
            marginBottom: "4px",
          }}>
            Event Title *
          </label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter event title"
            style={{
              width: "100%", padding: "10px 14px",
              borderRadius: "9px", border: `1.5px solid ${t.inputBorder}`,
              fontSize: "0.95rem", color: t.textPrimary,
              backgroundColor: t.inputBg, outline: "none",
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
        </div>

        <label style={{
          display: "flex", alignItems: "center", gap: "8px",
          fontSize: "0.85rem", color: t.textSecondary,
          marginBottom: "16px", cursor: "pointer",
        }}>
          <input
            type="checkbox"
            name="all_day"
            checked={formData.all_day}
            onChange={handleChange}
          />
          All day
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
          <div>
            <label style={{
              display: "block", fontSize: "0.85rem",
              fontWeight: "500", color: t.textSecondary,
              marginBottom: "4px",
            }}>
              Date *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              style={{
                width: "100%", padding: "10px 14px",
                borderRadius: "9px", border: `1.5px solid ${t.inputBorder}`,
                fontSize: "0.95rem", color: t.textPrimary,
                backgroundColor: t.inputBg, outline: "none",
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
          </div>
          {!formData.all_day && (
            <div>
              <label style={{
                display: "block", fontSize: "0.85rem",
                fontWeight: "500", color: t.textSecondary,
                marginBottom: "4px",
              }}>
                Time *
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                style={{
                  width: "100%", padding: "10px 14px",
                  borderRadius: "9px", border: `1.5px solid ${t.inputBorder}`,
                  fontSize: "0.95rem", color: t.textPrimary,
                  backgroundColor: t.inputBg, outline: "none",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
          {!formData.all_day && (
            <div>
              <label style={{
                display: "block", fontSize: "0.85rem",
                fontWeight: "500", color: t.textSecondary,
                marginBottom: "4px",
              }}>
                End Time
              </label>
              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                style={{
                  width: "100%", padding: "10px 14px",
                  borderRadius: "9px", border: `1.5px solid ${t.inputBorder}`,
                  fontSize: "0.95rem", color: t.textPrimary,
                  backgroundColor: t.inputBg, outline: "none",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
            </div>
          )}
          <div>
            <label style={{
              display: "block", fontSize: "0.85rem",
              fontWeight: "500", color: t.textSecondary,
              marginBottom: "4px",
            }}>
              Event Type
            </label>
            <select
              name="event_type"
              value={formData.event_type}
              onChange={handleChange}
              style={{
                width: "100%", padding: "10px 14px",
                borderRadius: "9px", border: `1.5px solid ${t.inputBorder}`,
                fontSize: "0.95rem", color: t.textPrimary,
                backgroundColor: t.inputBg, outline: "none",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <option value="task">Task</option>
              <option value="reminder">Reminder</option>
              <option value="birthday">Birthday</option>
              <option value="holiday">Holiday</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{
            display: "block", fontSize: "0.85rem",
            fontWeight: "500", color: t.textSecondary,
            marginBottom: "4px",
          }}>
            Location
          </label>
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Enter location"
            style={{
              width: "100%", padding: "10px 14px",
              borderRadius: "9px", border: `1.5px solid ${t.inputBorder}`,
              fontSize: "0.95rem", color: t.textPrimary,
              backgroundColor: t.inputBg, outline: "none",
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{
            display: "block", fontSize: "0.85rem",
            fontWeight: "500", color: t.textSecondary,
            marginBottom: "4px",
          }}>
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter description"
            rows="3"
            style={{
              width: "100%", padding: "10px 14px",
              borderRadius: "9px", border: `1.5px solid ${t.inputBorder}`,
              fontSize: "0.95rem", color: t.textPrimary,
              backgroundColor: t.inputBg, outline: "none",
              fontFamily: "'DM Sans', sans-serif",
              resize: "vertical",
            }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{
            display: "block", fontSize: "0.85rem",
            fontWeight: "500", color: t.textSecondary,
            marginBottom: "8px",
          }}>
            <Repeat size={14} style={{ display: "inline", marginRight: "4px" }} />
            Recurrence
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
            <select
              name="frequency"
              value={formData.recurrence.frequency}
              onChange={handleRecurrenceChange}
              style={{
                padding: "8px 12px", borderRadius: "8px",
                border: `1.5px solid ${t.inputBorder}`,
                fontSize: "0.85rem", color: t.textPrimary,
                backgroundColor: t.inputBg, outline: "none",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <option value="none">None</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            {formData.recurrence.frequency !== "none" && (
              <>
                <input
                  type="number"
                  name="interval"
                  value={formData.recurrence.interval}
                  onChange={handleRecurrenceChange}
                  min="1"
                  placeholder="Interval"
                  style={{
                    padding: "8px 12px", borderRadius: "8px",
                    border: `1.5px solid ${t.inputBorder}`,
                    fontSize: "0.85rem", color: t.textPrimary,
                    backgroundColor: t.inputBg, outline: "none",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                />
                <input
                  type="date"
                  name="end_date"
                  value={formData.recurrence.end_date}
                  onChange={handleRecurrenceChange}
                  style={{
                    padding: "8px 12px", borderRadius: "8px",
                    border: `1.5px solid ${t.inputBorder}`,
                    fontSize: "0.85rem", color: t.textPrimary,
                    backgroundColor: t.inputBg, outline: "none",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                />
              </>
            )}
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{
            display: "block", fontSize: "0.85rem",
            fontWeight: "500", color: t.textSecondary,
            marginBottom: "8px",
          }}>
            <Users size={14} style={{ display: "inline", marginRight: "4px" }} />
            Guests
          </label>
          <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
            <input
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="Enter guest email"
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddGuest())}
              style={{
                flex: 1, padding: "8px 12px",
                borderRadius: "8px", border: `1.5px solid ${t.inputBorder}`,
                fontSize: "0.85rem", color: t.textPrimary,
                backgroundColor: t.inputBg, outline: "none",
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
            <button
              type="button"
              onClick={handleAddGuest}
              style={{
                padding: "8px 16px", borderRadius: "8px",
                border: "none", background: "#4F46E5",
                color: "#fff", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: "500",
              }}
            >
              Add
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {formData.guests.map((guest) => (
              <span
                key={guest.email}
                style={{
                  padding: "4px 10px", borderRadius: "16px",
                  backgroundColor: isDark ? "rgba(99,102,241,0.15)" : "#EEF2FF",
                  color: "#4F46E5", fontSize: "0.8rem",
                  display: "flex", alignItems: "center",
                  gap: "6px",
                }}
              >
                {guest.email}
                <button
                  type="button"
                  onClick={() => handleRemoveGuest(guest.email)}
                  style={{
                    padding: "0", border: "none",
                    background: "transparent", cursor: "pointer",
                    color: "#4F46E5",
                  }}
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "10px 20px", borderRadius: "9px",
              border: `1.5px solid ${t.inputBorder}`,
              background: "transparent", color: t.textSecondary,
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.9rem", fontWeight: "500",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 24px", borderRadius: "9px",
              border: "none", background: "#4F46E5",
              color: "#fff", cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.9rem", fontWeight: "600",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Creating..." : "Create Event"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateEventModal;
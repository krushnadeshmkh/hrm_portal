import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin } from "lucide-react";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { toLocalDateStr, isSameDay } from "./dateUtils";

const CalendarWidget = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const t = {
    card: isDark ? "#161B27" : "#fff",
    border: isDark ? "#1E2535" : "#F1F3F9",
    textPrimary: isDark ? "#F3F4F6" : "#111827",
    textSecondary: isDark ? "#9CA3AF" : "#6B7280",
    textMuted: isDark ? "#6B7280" : "#9CA3AF",
    hoverBg: isDark ? "rgba(99,102,241,0.08)" : "#F3F4F6",
    activeBg: isDark ? "#312E81" : "#EEF2FF",
    activeText: isDark ? "#818CF8" : "#4F46E5",
  };

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const start = `${year}-${month}-01`;
      const end = `${year}-${month}-${new Date(year, currentDate.getMonth() + 1, 0).getDate()}`;

      const response = await axios.get(
        `https://hrm-backend-vvqg.onrender.com/api/calendar/events?start=${start}&end=${end}`,
        { headers: { "x-auth-token": token } }
      );
      setEvents(response.data.data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    const dateStr = toLocalDateStr(date);
    return events.filter((event) => event.date === dateStr);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (date) => {
    if (date) {
      navigate("/calendar");
    }
  };

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

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString("en-US", { month: "long" });
  const year = currentDate.getFullYear();
  const today = new Date();
  const todayEvents = getEventsForDate(today);

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
        <span style={{
          fontSize: "0.85rem", fontWeight: "600",
          color: t.textPrimary,
        }}>
          {monthName} {year}
        </span>
        <div style={{ display: "flex", gap: "4px" }}>
          <button
            onClick={handlePrevMonth}
            style={{
              padding: "2px 6px", borderRadius: "6px",
              border: "none", background: "transparent",
              color: t.textMuted, cursor: "pointer",
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={handleNextMonth}
            style={{
              padding: "2px 6px", borderRadius: "6px",
              border: "none", background: "transparent",
              color: t.textMuted, cursor: "pointer",
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: "2px",
        marginBottom: "12px",
      }}>
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div key={day} style={{
            textAlign: "center",
            fontSize: "0.6rem",
            fontWeight: "600",
            color: t.textMuted,
            padding: "4px 0",
          }}>
            {day}
          </div>
        ))}
        {days.map((day, index) => {
          const isToday = day && isSameDay(day, today);
          const dayEvents = day ? getEventsForDate(day) : [];

          return (
            <div
              key={index}
              onClick={() => handleDateClick(day)}
              style={{
                textAlign: "center",
                padding: "4px 0",
                borderRadius: "6px",
                cursor: day ? "pointer" : "default",
                backgroundColor: isToday ? t.activeBg : "transparent",
                color: isToday ? t.activeText : t.textSecondary,
                fontWeight: isToday ? "700" : "400",
                fontSize: "0.75rem",
                position: "relative",
                transition: "background 0.15s",
              }}
            >
              {day ? day.getDate() : ""}
              {dayEvents.length > 0 && (
                <span style={{
                  display: "block",
                  width: "4px",
                  height: "4px",
                  borderRadius: "50%",
                  backgroundColor: getEventColor(dayEvents[0].event_type),
                  margin: "2px auto 0",
                }} />
              )}
            </div>
          );
        })}
      </div>

      {todayEvents.length > 0 && (
        <div style={{
          borderTop: `1px solid ${t.border}`,
          paddingTop: "12px",
          marginTop: "4px",
        }}>
          <div style={{
            fontSize: "0.7rem",
            fontWeight: "600",
            color: t.textMuted,
            marginBottom: "8px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}>
            Today's Events
          </div>
          {todayEvents.slice(0, 3).map((event, idx) => (
            <div
              key={idx}
              onClick={() => navigate("/calendar")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "4px 0",
                cursor: "pointer",
                borderBottom: idx < todayEvents.length - 1 ? `1px solid ${t.border}` : "none",
              }}
            >
              <div style={{
                width: "3px",
                height: "20px",
                borderRadius: "2px",
                backgroundColor: getEventColor(event.event_type),
                flexShrink: 0,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: "0.78rem",
                  fontWeight: "500",
                  color: t.textPrimary,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {event.title}
                </div>
                <div style={{
                  fontSize: "0.65rem",
                  color: t.textMuted,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}>
                  <Clock size={10} />
                  {event.time}
                  {event.location && (
                    <>
                      <MapPin size={10} />
                      {event.location}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          {todayEvents.length > 3 && (
            <div style={{
              fontSize: "0.7rem",
              color: t.activeText,
              textAlign: "center",
              paddingTop: "6px",
              cursor: "pointer",
            }}
            onClick={() => navigate("/calendar")}
            >
              +{todayEvents.length - 3} more events
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarWidget;
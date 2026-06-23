import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ChevronLeft, ChevronRight, Search,
  Calendar as CalendarIcon, List, Clock, MapPin, MoreHorizontal
} from "lucide-react";
import axios from "axios";
import Sidebar from "../../layouts/sidebar";
import MobileTopBar from "../../employee/MobileTopBar";
import { useTheme } from "../../context/ThemeContext";
import EventDetails from "../../admin/calendar/EventDetails";
import {
  toLocalDateStr, parseLocalDate, isSameDay, getWeekDays,
  addDays, addMonths, HOURS, formatHourLabel, timeToMinutes,
  eventDurationMinutes,
} from "../../admin/calendar/dateUtils";

const HOUR_HEIGHT = 56;

const EmployeeCalendarPage = () => {
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const { isDark } = useTheme();
  const scrollRef = useRef(null);

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

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getRangeForView = useCallback(() => {
    if (viewMode === "day") {
      const d = toLocalDateStr(currentDate);
      return { start: d, end: d };
    }
    if (viewMode === "week") {
      const weekDays = getWeekDays(currentDate);
      return { start: toLocalDateStr(weekDays[0]), end: toLocalDateStr(weekDays[6]) };
    }
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const start = new Date(year, month, 1);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(year, month + 1, 0);
    end.setDate(end.getDate() + (6 - end.getDay()));
    return { start: toLocalDateStr(start), end: toLocalDateStr(end) };
  }, [currentDate, viewMode]);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { start, end } = getRangeForView();

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
  }, [getRangeForView]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (viewMode !== "month" && scrollRef.current) {
      scrollRef.current.scrollTop = Math.max(0, 7 * HOUR_HEIGHT - 80);
    }
  }, [viewMode, currentDate]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
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

  const handlePrev = () => {
    if (viewMode === "day") setCurrentDate(addDays(currentDate, -1));
    else if (viewMode === "week") setCurrentDate(addDays(currentDate, -7));
    else setCurrentDate(addMonths(currentDate, -1));
  };

  const handleNext = () => {
    if (viewMode === "day") setCurrentDate(addDays(currentDate, 1));
    else if (viewMode === "week") setCurrentDate(addDays(currentDate, 7));
    else setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleDayNumberClick = (date) => {
    setCurrentDate(date);
    setViewMode("day");
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleCloseModal = () => {
    setShowEventDetails(false);
    setSelectedEvent(null);
    fetchEvents();
  };

  const handleUpdateGuestStatus = async (eventId, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `https://hrm-backend-vvqg.onrender.com/api/calendar/events/${eventId}/guest-status`,
        { status },
        { headers: { "x-auth-token": token } }
      );
      fetchEvents();
      setShowEventDetails(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error("Error updating guest status:", error);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredEvents = events.filter((event) => {
    if (filterType !== "all" && event.event_type !== filterType) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return event.title.toLowerCase().includes(search) ||
        event.description?.toLowerCase().includes(search) ||
        event.location?.toLowerCase().includes(search);
    }
    return true;
  });

  const sidebarWidth = isMobile ? 0 : isOpen ? 255 : 68;
  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString("en-US", { month: "long" });
  const year = currentDate.getFullYear();
  const today = new Date();
  const userEmail = localStorage.getItem("email") || "";

  const headerLabel = () => {
    if (viewMode === "day") {
      return currentDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    }
    if (viewMode === "week") {
      const weekDays = getWeekDays(currentDate);
      const first = weekDays[0];
      const last = weekDays[6];
      if (first.getMonth() === last.getMonth()) {
        return `${first.toLocaleDateString("en-US", { month: "long" })} ${first.getDate()} - ${last.getDate()}, ${last.getFullYear()}`;
      }
      return `${first.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${last.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${last.getFullYear()}`;
    }
    return `${monthName} ${year}`;
  };

  const renderTimeGrid = (gridDays) => {
    const isWeek = gridDays.length > 1;
    return (
      <div style={{
        backgroundColor: t.card,
        borderRadius: "14px",
        border: `1px solid ${t.border}`,
        overflow: "hidden",
        boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: `64px repeat(${gridDays.length}, 1fr)`,
          borderBottom: `1px solid ${t.border}`,
        }}>
          <div />
          {gridDays.map((d, idx) => {
            const isToday = isSameDay(d, today);
            return (
              <div key={idx} style={{
                padding: "10px 6px",
                textAlign: "center",
                borderLeft: idx > 0 || isWeek ? `1px solid ${t.border}` : "none",
              }}>
                <div style={{ fontSize: "0.65rem", color: t.textMuted, fontWeight: 600, textTransform: "uppercase" }}>
                  {d.toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div
                  onClick={() => handleDayNumberClick(d)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    margin: "2px auto 0",
                    cursor: "pointer",
                    fontSize: "1rem",
                    fontWeight: isToday ? 700 : 500,
                    color: isToday ? "#fff" : t.textPrimary,
                    backgroundColor: isToday ? "#4F46E5" : "transparent",
                  }}
                >
                  {d.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        <div ref={scrollRef} style={{ maxHeight: "560px", overflowY: "auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: `64px repeat(${gridDays.length}, 1fr)`,
            position: "relative",
          }}>
            <div>
              {HOURS.map((hour) => (
                <div key={hour} style={{
                  height: `${HOUR_HEIGHT}px`,
                  fontSize: "0.65rem",
                  color: t.textMuted,
                  textAlign: "right",
                  paddingRight: "8px",
                  transform: "translateY(-7px)",
                }}>
                  {hour !== 0 && formatHourLabel(hour)}
                </div>
              ))}
            </div>

            {gridDays.map((d, dayIdx) => {
              const dayEvents = getEventsForDate(d);
              const isToday = isSameDay(d, today);
              return (
                <div
                  key={dayIdx}
                  style={{
                    position: "relative",
                    borderLeft: `1px solid ${t.border}`,
                    backgroundColor: isToday ? (isDark ? "rgba(99,102,241,0.04)" : "#FAFBFF") : "transparent",
                  }}
                >
                  {HOURS.map((hour) => (
                    <div key={hour} style={{
                      height: `${HOUR_HEIGHT}px`,
                      borderTop: `1px solid ${t.border}`,
                    }} />
                  ))}
                  {dayEvents.map((event, idx) => {
                    const top = (timeToMinutes(event.time) / 60) * HOUR_HEIGHT;
                    const height = (eventDurationMinutes(event) / 60) * HOUR_HEIGHT;
                    return (
                      <div
                        key={idx}
                        onClick={() => handleEventClick(event)}
                        style={{
                          position: "absolute",
                          top: `${top}px`,
                          left: "4px",
                          right: "4px",
                          height: `${Math.max(height, 22)}px`,
                          backgroundColor: getEventBg(event.event_type),
                          borderLeft: `3px solid ${getEventColor(event.event_type)}`,
                          color: getEventColor(event.event_type),
                          borderRadius: "6px",
                          padding: "3px 6px",
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          overflow: "hidden",
                          cursor: "pointer",
                          zIndex: 2,
                        }}
                      >
                        <div style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                          {event.title}
                        </div>
                        <div style={{ fontSize: "0.62rem", opacity: 0.85, fontWeight: 500 }}>
                          {event.time}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: t.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .cal-day:hover { background: ${t.hoverBg} !important; }
        .cal-day-today { background: ${t.activeBg} !important; border-color: #4F46E5 !important; }
        .cal-event { transition: transform 0.15s, box-shadow 0.15s; }
        .cal-event:hover { transform: scale(1.02); box-shadow: 0 4px 12px rgba(79,70,229,0.2); }
        .cal-btn { transition: all 0.15s; }
        .cal-btn:hover { background: ${t.hoverBg} !important; }
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
          .cal-topbar { display: none !important; }
          .cal-main { padding: 72px 12px 24px !important; }
          .cal-grid { grid-template-columns: repeat(7, 1fr) !important; gap: 2px !important; }
          .cal-day-cell { min-height: 60px !important; padding: 4px !important; }
          .cal-day-number { font-size: 0.75rem !important; }
          .cal-event-item { font-size: 0.6rem !important; padding: 1px 4px !important; }
          .cal-header { flex-direction: column !important; gap: 10px !important; }
          .cal-actions { width: 100% !important; flex-wrap: wrap !important; }
          .cal-search { width: 100% !important; }
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
        <div className="cal-topbar" style={{
          height: "64px", backgroundColor: t.card,
          borderBottom: `1px solid ${t.border}`,
          display: "flex", alignItems: "center",
          padding: "0 28px", gap: "16px",
          position: "sticky", top: 0, zIndex: 100,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
            <CalendarIcon size={20} style={{ color: "#4F46E5" }} />
            <h1 style={{ fontSize: "1rem", fontWeight: "600", color: t.textPrimary, margin: 0 }}>My Calendar</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={handleToday}
              className="cal-btn"
              style={{
                padding: "6px 14px", borderRadius: "8px",
                border: `1px solid ${t.border}`, background: "transparent",
                color: t.textSecondary, fontSize: "0.8rem",
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Today
            </button>
            <button
              onClick={handlePrev}
              className="cal-btn"
              style={{
                padding: "6px 10px", borderRadius: "8px",
                border: `1px solid ${t.border}`, background: "transparent",
                color: t.textSecondary, cursor: "pointer",
                display: "flex", alignItems: "center",
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={handleNext}
              className="cal-btn"
              style={{
                padding: "6px 10px", borderRadius: "8px",
                border: `1px solid ${t.border}`, background: "transparent",
                color: t.textSecondary, cursor: "pointer",
                display: "flex", alignItems: "center",
              }}
            >
              <ChevronRight size={18} />
            </button>
            <span style={{
              fontSize: "0.95rem", fontWeight: "600",
              color: t.textPrimary, minWidth: "180px",
              textAlign: "center",
            }}>
              {headerLabel()}
            </span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
            {[
              { key: "day", label: "Day" },
              { key: "week", label: "Week" },
              { key: "month", label: "Month" },
              { key: "list", label: "List" },
            ].map((view) => (
              <button
                key={view.key}
                onClick={() => setViewMode(view.key)}
                className="cal-btn"
                style={{
                  padding: "6px 12px", borderRadius: "8px",
                  border: viewMode === view.key ? `2px solid #4F46E5` : `1px solid ${t.border}`,
                  background: viewMode === view.key ? t.activeBg : "transparent",
                  color: viewMode === view.key ? t.activeText : t.textSecondary,
                  cursor: "pointer", fontSize: "0.78rem", fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>

        <main className="cal-main" style={{ padding: "24px 28px 40px", flex: 1 }}>
          <div className="cal-header" style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: "20px",
            gap: "12px", flexWrap: "wrap",
          }}>
            <div className="cal-actions" style={{ display: "flex", gap: "10px", alignItems: "center", flex: 1 }}>
              <div className="cal-search" style={{ position: "relative", flex: 1, maxWidth: "300px" }}>
                <Search size={15} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: t.textMuted }} />
                <input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{
                  padding: "8px 12px", borderRadius: "9px",
                  border: `1.5px solid ${t.inputBorder}`,
                  fontSize: "0.82rem", color: t.textPrimary,
                  backgroundColor: t.inputBg, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <option value="all">All Types</option>
                <option value="task">Task</option>
                <option value="reminder">Reminder</option>
                <option value="birthday">Birthday</option>
                <option value="holiday">Holiday</option>
                <option value="other">Other</option>
              </select>
            </div>
            {selectedDate && viewMode === "month" && (
              <span style={{
                fontSize: "0.85rem", color: t.textSecondary,
                fontWeight: "500",
              }}>
                {formatDate(selectedDate)}
              </span>
            )}
          </div>

          {viewMode === "month" && (
            <div style={{
              backgroundColor: t.card,
              borderRadius: "14px",
              border: `1px solid ${t.border}`,
              overflow: "hidden",
              boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)",
            }}>
              <div className="cal-grid" style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "1px",
                backgroundColor: t.border,
              }}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} style={{
                    padding: "10px 8px",
                    backgroundColor: t.card,
                    textAlign: "center",
                    fontSize: "0.7rem",
                    fontWeight: "600",
                    color: t.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}>
                    {day}
                  </div>
                ))}
                {days.map((day, index) => {
                  const isToday = day && isSameDay(day, today);
                  const dayEvents = day ? getEventsForDate(day) : [];
                  const isSelected = day && selectedDate && isSameDay(day, selectedDate);

                  return (
                    <div
                      key={index}
                      className={`cal-day cal-day-cell ${isToday ? "cal-day-today" : ""}`}
                      onClick={() => day && handleDateClick(day)}
                      onDoubleClick={() => day && handleDayNumberClick(day)}
                      style={{
                        minHeight: "100px",
                        padding: "6px 8px",
                        backgroundColor: isSelected ? t.activeBg : t.card,
                        cursor: day ? "pointer" : "default",
                        opacity: day ? 1 : 0.3,
                        transition: "background 0.15s",
                        border: isToday ? `2px solid #4F46E5` : "none",
                      }}
                    >
                      {day && (
                        <>
                          <div className="cal-day-number" style={{
                            fontSize: "0.85rem",
                            fontWeight: isToday ? "700" : "500",
                            color: isToday ? "#4F46E5" : t.textPrimary,
                            marginBottom: "4px",
                          }}>
                            {day.getDate()}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            {dayEvents.slice(0, 3).map((event, idx) => (
                              <div
                                key={idx}
                                className="cal-event cal-event-item"
                                onClick={(e) => { e.stopPropagation(); handleEventClick(event); }}
                                style={{
                                  fontSize: "0.65rem",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  backgroundColor: getEventBg(event.event_type),
                                  color: getEventColor(event.event_type),
                                  cursor: "pointer",
                                  overflow: "hidden",
                                  whiteSpace: "nowrap",
                                  textOverflow: "ellipsis",
                                  fontWeight: "500",
                                  borderLeft: `3px solid ${getEventColor(event.event_type)}`,
                                }}
                              >
                                {event.time} {event.title}
                              </div>
                            ))}
                            {dayEvents.length > 3 && (
                              <div style={{
                                fontSize: "0.6rem",
                                color: t.textMuted,
                                padding: "1px 6px",
                              }}>
                                +{dayEvents.length - 3} more
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {viewMode === "week" && renderTimeGrid(getWeekDays(currentDate))}
          {viewMode === "day" && renderTimeGrid([currentDate])}

          {viewMode === "list" && (
            <div style={{
              backgroundColor: t.card,
              borderRadius: "14px",
              border: `1px solid ${t.border}`,
              overflow: "hidden",
              boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)",
            }}>
              <div style={{ padding: "16px 20px", borderBottom: `1px solid ${t.border}` }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: "600", color: t.textPrimary, margin: 0 }}>
                  My Events {filteredEvents.length > 0 && `(${filteredEvents.length})`}
                </h3>
              </div>
              {loading ? (
                <div style={{ padding: "40px", textAlign: "center" }}>
                  <div style={{
                    width: 36, height: 36, border: "3px solid #EEF2FF",
                    borderTop: "3px solid #4F46E5", borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                    margin: "0 auto 12px",
                  }} />
                  <p style={{ color: t.textMuted, fontSize: "0.875rem" }}>Loading events...</p>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div style={{ padding: "60px 20px", textAlign: "center" }}>
                  <CalendarIcon size={40} style={{ color: t.textMuted, marginBottom: "12px" }} />
                  <p style={{ color: t.textMuted, fontSize: "0.95rem", margin: 0 }}>
                    No events found
                  </p>
                  <p style={{ color: t.textMuted, fontSize: "0.8rem", marginTop: "4px" }}>
                    Your calendar is empty
                  </p>
                </div>
              ) : (
                filteredEvents.map((event, idx) => (
                  <div
                    key={idx}
                    className="cal-event"
                    onClick={() => handleEventClick(event)}
                    style={{
                      padding: "14px 20px",
                      borderBottom: idx < filteredEvents.length - 1 ? `1px solid ${t.border}` : "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      transition: "background 0.12s",
                    }}
                  >
                    <div style={{
                      width: "4px",
                      height: "40px",
                      borderRadius: "2px",
                      backgroundColor: getEventColor(event.event_type),
                      flexShrink: 0,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span style={{
                          fontSize: "0.9rem", fontWeight: "600",
                          color: t.textPrimary,
                        }}>
                          {event.title}
                        </span>
                        <span style={{
                          fontSize: "0.6rem", padding: "2px 8px",
                          borderRadius: "12px",
                          backgroundColor: getEventBg(event.event_type),
                          color: getEventColor(event.event_type),
                          fontWeight: "600",
                          textTransform: "capitalize",
                        }}>
                          {event.event_type}
                        </span>
                        {event.guests?.some((g) => g.email === userEmail) && (
                          <span style={{
                            fontSize: "0.6rem", padding: "2px 8px",
                            borderRadius: "12px",
                            backgroundColor: isDark ? "rgba(99,102,241,0.15)" : "#EEF2FF",
                            color: "#4F46E5",
                            fontWeight: "600",
                          }}>
                            Invited
                          </span>
                        )}
                      </div>
                      <div style={{
                        display: "flex", alignItems: "center",
                        gap: "12px", flexWrap: "wrap",
                        marginTop: "4px",
                      }}>
                        <span style={{
                          fontSize: "0.78rem",
                          color: t.textSecondary,
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}>
                          <Clock size={12} />
                          {event.time}
                        </span>
                        {event.location && (
                          <span style={{
                            fontSize: "0.78rem",
                            color: t.textSecondary,
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}>
                            <MapPin size={12} />
                            {event.location}
                          </span>
                        )}
                        <span style={{
                          fontSize: "0.78rem",
                          color: t.textSecondary,
                        }}>
                          {parseLocalDate(event.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEventClick(event); }}
                        style={{
                          padding: "4px 8px", borderRadius: "6px",
                          border: "none", background: "transparent",
                          color: t.textMuted, cursor: "pointer",
                        }}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>

      {showEventDetails && selectedEvent && (
        <div className="modal-overlay" onClick={() => setShowEventDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <EventDetails
              event={selectedEvent}
              onClose={handleCloseModal}
              onDelete={() => {}}
              onEdit={() => {}}
              isEmployee={true}
              onUpdateStatus={handleUpdateGuestStatus}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeCalendarPage;
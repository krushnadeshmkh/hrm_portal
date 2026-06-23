import { useState, useEffect, useRef } from "react";
import { Bell, Check, X, Users, Mail } from "lucide-react";
import { useNotification } from "../hooks/useNotification";

export default function NotificationBell({ t, isDark }) {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const dropdownRef = useRef(null);
  const bellRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && 
          !dropdownRef.current.contains(event.target) &&
          bellRef.current &&
          !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getIcon = (notification) => {
    if (notification.is_group) {
      return <Users size={14} color={isDark ? "#9CA3AF" : "#6B7280"} />;
    }
    return <Mail size={14} color={isDark ? "#9CA3AF" : "#6B7280"} />;
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        ref={bellRef}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "relative",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 8,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.13s",
          color: isOpen ? "#4F46E5" : (isDark ? "#9CA3AF" : "#6B7280")
        }}
        onMouseEnter={(e) => {
          if (!isOpen) e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.background = "none";
        }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: 2,
              right: 2,
              width: 18,
              height: 18,
              background: "#EF4444",
              color: "#fff",
              borderRadius: "50%",
              fontSize: 10,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `2px solid ${isDark ? "#161B27" : "#fff"}`
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          style={{
            position: "absolute",
            top: 48,
            right: 0,
            width: 360,
            maxWidth: "calc(100vw - 32px)",
            background: isDark ? "#161B27" : "#fff",
            borderRadius: 16,
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            border: `1px solid ${isDark ? "#1E2535" : "#E8EAED"}`,
            zIndex: 1000,
            overflow: "hidden",
            animation: "fadeIn 0.15s ease"
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              borderBottom: `1px solid ${isDark ? "#1E2535" : "#E8EAED"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <span style={{ fontWeight: 700, fontSize: "0.95rem", color: isDark ? "#F3F4F6" : "#111827" }}>
              Notifications
            </span>
            {notifications.length > 0 && (
              <button
                onClick={() => { markAllAsRead(); setIsOpen(false); }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  color: "#4F46E5",
                  fontWeight: 500,
                  padding: "4px 8px",
                  borderRadius: 6,
                  transition: "background 0.13s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = isDark ? "rgba(79,70,229,0.1)" : "rgba(79,70,229,0.08)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "none"}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div style={{ maxHeight: 480, overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: "48px 20px",
                  textAlign: "center",
                  color: isDark ? "#9CA3AF" : "#6B7280"
                }}
              >
                <Bell size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                <p style={{ margin: 0, fontSize: "0.85rem" }}>No notifications</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (!notif.read) markAsRead(notif.id);
                    setIsOpen(false);
                    if (notif.is_group && notif.group_id) {
                      window.dispatchEvent(new CustomEvent("openGroupChat", { detail: { groupId: notif.group_id } }));
                    } else if (!notif.is_group && notif.sender_id) {
                      window.dispatchEvent(new CustomEvent("openDirectChat", { detail: { userId: notif.sender_id } }));
                    }
                  }}
                  style={{
                    padding: "12px 16px",
                    borderBottom: `1px solid ${isDark ? "#1E2535" : "#E8EAED"}`,
                    cursor: "pointer",
                    transition: "background 0.13s",
                    background: !notif.read ? (isDark ? "rgba(79,70,229,0.08)" : "rgba(79,70,229,0.04)") : "transparent"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = isDark ? "#1E2535" : "#F5F7FF"}
                  onMouseLeave={(e) => {
                    if (!notif.read) {
                      e.currentTarget.style.background = isDark ? "rgba(79,70,229,0.08)" : "rgba(79,70,229,0.04)";
                    } else {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  <div style={{ display: "flex", gap: 12 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: !notif.read ? (isDark ? "rgba(79,70,229,0.15)" : "rgba(79,70,229,0.1)") : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0
                      }}
                    >
                      {getIcon(notif)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          color: isDark ? "#F3F4F6" : "#111827",
                          marginBottom: 2,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}
                      >
                        {notif.sender_name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: isDark ? "#9CA3AF" : "#6B7280",
                          marginBottom: 4,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical"
                        }}
                      >
                        {notif.content}
                      </div>
                      <div
                        style={{
                          fontSize: "0.65rem",
                          color: isDark ? "#6B7280" : "#9CA3AF",
                          display: "flex",
                          alignItems: "center",
                          gap: 4
                        }}
                      >
                        {formatTime(notif.created_at)}
                        {!notif.read && (
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: "#4F46E5",
                              display: "inline-block"
                            }}
                          />
                        )}
                      </div>
                    </div>
                    {!notif.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notif.id);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 4,
                          borderRadius: 6,
                          color: isDark ? "#9CA3AF" : "#6B7280",
                          flexShrink: 0
                        }}
                      >
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
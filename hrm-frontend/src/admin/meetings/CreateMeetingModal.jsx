import React, { useState, useEffect } from "react";
import { X, Video, Users, User, Send, Check, Calendar, Clock, MapPin, Link, FileText, Plus } from "lucide-react";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";

const CreateMeetingModal = ({ onClose, onSuccess }) => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [notificationType, setNotificationType] = useState("contacts");
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    end_time: "",
    duration: 60,
    location: "",
    description: "",
    is_virtual: true,
    meeting_link: "",
    agenda: "",
    notify_groups: false,
    notify_contacts: true,
  });

  const t = {
    card: isDark ? "#161B27" : "#fff",
    border: isDark ? "#1E2535" : "#F1F3F9",
    textPrimary: isDark ? "#F3F4F6" : "#111827",
    textSecondary: isDark ? "#9CA3AF" : "#6B7280",
    textMuted: isDark ? "#6B7280" : "#9CA3AF",
    inputBg: isDark ? "#1E2535" : "#F9FAFB",
    inputBorder: isDark ? "#2D3748" : "#E5E7EB",
    accent: "#1A73E8",
    accentLight: isDark ? "#1E2A3A" : "#E8F0FE",
    accentHover: "#1557B0",
    success: "#34A853",
    warning: "#FBBC04",
    danger: "#EA4335",
  };

  useEffect(() => {
    fetchGroups();
    fetchContacts();
  }, []);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("https://hrm-backend-vvqg.onrender.com/api/groups", {
        headers: { "x-auth-token": token }
      });
      setGroups(response.data.data || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("https://hrm-backend-vvqg.onrender.com/api/chat/contacts", {
        headers: { "x-auth-token": token }
      });
      setContacts(response.data.data || []);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleGroup = (groupId) => {
    setSelectedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const toggleContact = (contactId) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const selectAllGroups = () => {
    if (selectedGroups.length === groups.length) {
      setSelectedGroups([]);
    } else {
      setSelectedGroups(groups.map(g => g._id));
    }
  };

  const selectAllContacts = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(c => c.user_id));
    }
  };

  const handleNotificationTypeChange = (type) => {
    setNotificationType(type);
    if (type === "groups") {
      setFormData(prev => ({ ...prev, notify_groups: true, notify_contacts: false }));
    } else {
      setFormData(prev => ({ ...prev, notify_groups: false, notify_contacts: true }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.time) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const payload = {
        ...formData,
        selected_groups: selectedGroups,
        selected_contacts: selectedContacts,
        notification_type: notificationType,
      };

      const response = await axios.post(
        "https://hrm-backend-vvqg.onrender.com/api/meetings",
        payload,
        { headers: { "x-auth-token": token } }
      );
      
      if (response.data.success) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Error creating meeting:", error);
      alert(error.response?.data?.message || "Failed to create meeting");
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = groups.filter(g =>
    g.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredContacts = contacts.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getColorFromName = (name) => {
    const colors = ["#1A73E8", "#34A853", "#FBBC04", "#EA4335", "#9C27B0", "#00BCD4", "#FF5722", "#795548"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div style={{ maxHeight: "90vh", overflowY: "auto", padding: "4px" }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: "24px",
        position: "sticky", top: 0,
        backgroundColor: t.card,
        padding: "12px 0",
        zIndex: 10,
        borderBottom: `1px solid ${t.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px", height: "40px",
            borderRadius: "50%",
            background: t.accentLight,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Video size={20} color={t.accent} />
          </div>
          <div>
            <h2 style={{
              fontSize: "1.1rem", fontWeight: "600",
              color: t.textPrimary, margin: 0,
            }}>
              New meeting
            </h2>
            <p style={{
              fontSize: "0.75rem",
              color: t.textSecondary,
              margin: 0,
            }}>
              Create a new Google Meet style meeting
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            padding: "8px", borderRadius: "50%",
            border: "none", background: "transparent",
            color: t.textMuted, cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.08)" : "#F1F3F9"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "24px" }}>
          <label style={{
            display: "block", fontSize: "0.8rem",
            fontWeight: "500", color: t.textSecondary,
            marginBottom: "6px",
          }}>
            Meeting title *
          </label>
          <div style={{
            display: "flex", alignItems: "center",
            border: `2px solid ${t.inputBorder}`,
            borderRadius: "12px",
            padding: "0 16px",
            transition: "border-color 0.15s",
            background: t.inputBg,
          }}>
            <Video size={16} color={t.textMuted} style={{ marginRight: "12px" }} />
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter meeting title"
              style={{
                width: "100%", padding: "14px 0",
                border: "none", fontSize: "0.95rem",
                color: t.textPrimary,
                background: "transparent",
                outline: "none",
                fontFamily: "'Inter', sans-serif",
              }}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
          <div>
            <label style={{
              display: "block", fontSize: "0.8rem",
              fontWeight: "500", color: t.textSecondary,
              marginBottom: "6px",
            }}>
              <Calendar size={14} style={{ display: "inline", marginRight: "4px" }} />
              Date *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              style={{
                width: "100%", padding: "12px 14px",
                borderRadius: "12px", border: `2px solid ${t.inputBorder}`,
                fontSize: "0.9rem", color: t.textPrimary,
                backgroundColor: t.inputBg, outline: "none",
                fontFamily: "'Inter', sans-serif",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = t.accent}
              onBlur={(e) => e.currentTarget.style.borderColor = t.inputBorder}
            />
          </div>
          <div>
            <label style={{
              display: "block", fontSize: "0.8rem",
              fontWeight: "500", color: t.textSecondary,
              marginBottom: "6px",
            }}>
              <Clock size={14} style={{ display: "inline", marginRight: "4px" }} />
              Time *
            </label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              style={{
                width: "100%", padding: "12px 14px",
                borderRadius: "12px", border: `2px solid ${t.inputBorder}`,
                fontSize: "0.9rem", color: t.textPrimary,
                backgroundColor: t.inputBg, outline: "none",
                fontFamily: "'Inter', sans-serif",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = t.accent}
              onBlur={(e) => e.currentTarget.style.borderColor = t.inputBorder}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
          <div>
            <label style={{
              display: "block", fontSize: "0.8rem",
              fontWeight: "500", color: t.textSecondary,
              marginBottom: "6px",
            }}>
              Duration (minutes)
            </label>
            <div style={{
              display: "flex", alignItems: "center",
              border: `2px solid ${t.inputBorder}`,
              borderRadius: "12px",
              padding: "0 16px",
              background: t.inputBg,
            }}>
              <Clock size={16} color={t.textMuted} style={{ marginRight: "12px" }} />
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="15"
                step="15"
                style={{
                  width: "100%", padding: "12px 0",
                  border: "none", fontSize: "0.9rem",
                  color: t.textPrimary,
                  background: "transparent",
                  outline: "none",
                  fontFamily: "'Inter', sans-serif",
                }}
              />
            </div>
          </div>
          <div>
            <label style={{
              display: "block", fontSize: "0.8rem",
              fontWeight: "500", color: t.textSecondary,
              marginBottom: "6px",
            }}>
              Meeting type
            </label>
            <div style={{
              display: "flex", gap: "8px",
              padding: "4px",
              background: isDark ? "#1E2535" : "#F1F3F9",
              borderRadius: "12px",
              border: `2px solid ${t.inputBorder}`,
            }}>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, is_virtual: true }))}
                style={{
                  flex: 1, padding: "8px 12px", borderRadius: "8px",
                  border: "none",
                  background: formData.is_virtual ? t.accent : "transparent",
                  color: formData.is_virtual ? "#fff" : t.textSecondary,
                  cursor: "pointer", fontWeight: "500",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.82rem",
                  transition: "all 0.15s",
                }}
              >
                <Video size={14} style={{ display: "inline", marginRight: "4px" }} />
                Virtual
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, is_virtual: false }))}
                style={{
                  flex: 1, padding: "8px 12px", borderRadius: "8px",
                  border: "none",
                  background: !formData.is_virtual ? t.accent : "transparent",
                  color: !formData.is_virtual ? "#fff" : t.textSecondary,
                  cursor: "pointer", fontWeight: "500",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "0.82rem",
                  transition: "all 0.15s",
                }}
              >
                <MapPin size={14} style={{ display: "inline", marginRight: "4px" }} />
                In-person
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{
            display: "block", fontSize: "0.8rem",
            fontWeight: "500", color: t.textSecondary,
            marginBottom: "6px",
          }}>
            {formData.is_virtual ? (
              <><Link size={14} style={{ display: "inline", marginRight: "4px" }} /> Meeting link</>
            ) : (
              <><MapPin size={14} style={{ display: "inline", marginRight: "4px" }} /> Location</>
            )}
          </label>
          <div style={{
            display: "flex", alignItems: "center",
            border: `2px solid ${t.inputBorder}`,
            borderRadius: "12px",
            padding: "0 16px",
            background: t.inputBg,
          }}>
            {formData.is_virtual ? (
              <Link size={16} color={t.textMuted} style={{ marginRight: "12px" }} />
            ) : (
              <MapPin size={16} color={t.textMuted} style={{ marginRight: "12px" }} />
            )}
            <input
              name={formData.is_virtual ? "meeting_link" : "location"}
              value={formData.is_virtual ? formData.meeting_link : formData.location}
              onChange={handleChange}
              placeholder={formData.is_virtual ? "Enter meeting link (optional)" : "Enter location"}
              style={{
                width: "100%", padding: "12px 0",
                border: "none", fontSize: "0.9rem",
                color: t.textPrimary,
                background: "transparent",
                outline: "none",
                fontFamily: "'Inter', sans-serif",
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{
            display: "block", fontSize: "0.8rem",
            fontWeight: "500", color: t.textSecondary,
            marginBottom: "6px",
          }}>
            <FileText size={14} style={{ display: "inline", marginRight: "4px" }} />
            Agenda
          </label>
          <textarea
            name="agenda"
            value={formData.agenda}
            onChange={handleChange}
            placeholder="Enter meeting agenda"
            rows="3"
            style={{
              width: "100%", padding: "12px 16px",
              borderRadius: "12px", border: `2px solid ${t.inputBorder}`,
              fontSize: "0.9rem", color: t.textPrimary,
              backgroundColor: t.inputBg, outline: "none",
              fontFamily: "'Inter', sans-serif",
              resize: "vertical",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = t.accent}
            onBlur={(e) => e.currentTarget.style.borderColor = t.inputBorder}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{
            display: "block", fontSize: "0.8rem",
            fontWeight: "500", color: t.textSecondary,
            marginBottom: "6px",
          }}>
            <FileText size={14} style={{ display: "inline", marginRight: "4px" }} />
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter meeting description"
            rows="2"
            style={{
              width: "100%", padding: "12px 16px",
              borderRadius: "12px", border: `2px solid ${t.inputBorder}`,
              fontSize: "0.9rem", color: t.textPrimary,
              backgroundColor: t.inputBg, outline: "none",
              fontFamily: "'Inter', sans-serif",
              resize: "vertical",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = t.accent}
            onBlur={(e) => e.currentTarget.style.borderColor = t.inputBorder}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <div
            onClick={() => setShowNotificationSettings(!showNotificationSettings)}
            style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", cursor: "pointer",
              padding: "12px 16px",
              border: `2px solid ${t.inputBorder}`,
              borderRadius: "12px",
              background: t.inputBg,
              transition: "border-color 0.15s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Send size={18} color={t.textMuted} />
              <span style={{ fontSize: "0.9rem", fontWeight: "500", color: t.textPrimary }}>
                Notification settings
              </span>
              <span style={{
                fontSize: "0.7rem",
                background: t.success,
                color: "#fff",
                padding: "2px 10px",
                borderRadius: "12px",
              }}>
                {notificationType === "groups" ? "Groups" : "Personal"}
              </span>
            </div>
            <div style={{
              transition: "transform 0.2s",
              transform: showNotificationSettings ? "rotate(180deg)" : "rotate(0deg)",
            }}>
              <ChevronDown size={18} color={t.textMuted} />
            </div>
          </div>

          {showNotificationSettings && (
            <div style={{
              marginTop: "12px",
              padding: "16px",
              border: `2px solid ${t.inputBorder}`,
              borderRadius: "12px",
              background: t.inputBg,
            }}>
              <label style={{
                display: "block", fontSize: "0.85rem",
                fontWeight: "600", color: t.textPrimary,
                marginBottom: "12px",
              }}>
                Send meeting link to:
              </label>

              <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                <button
                  type="button"
                  onClick={() => handleNotificationTypeChange("contacts")}
                  style={{
                    flex: 1, padding: "10px 12px", borderRadius: "10px",
                    border: notificationType === "contacts" ? `2px solid ${t.accent}` : `2px solid ${t.inputBorder}`,
                    background: notificationType === "contacts" ? t.accentLight : "transparent",
                    color: notificationType === "contacts" ? t.accent : t.textSecondary,
                    cursor: "pointer", fontWeight: "500",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.82rem",
                    transition: "all 0.15s",
                  }}
                >
                  <User size={14} style={{ display: "inline", marginRight: "4px" }} />
                  Personal
                </button>
                <button
                  type="button"
                  onClick={() => handleNotificationTypeChange("groups")}
                  style={{
                    flex: 1, padding: "10px 12px", borderRadius: "10px",
                    border: notificationType === "groups" ? `2px solid ${t.accent}` : `2px solid ${t.inputBorder}`,
                    background: notificationType === "groups" ? t.accentLight : "transparent",
                    color: notificationType === "groups" ? t.accent : t.textSecondary,
                    cursor: "pointer", fontWeight: "500",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.82rem",
                    transition: "all 0.15s",
                  }}
                >
                  <Users size={14} style={{ display: "inline", marginRight: "4px" }} />
                  Groups
                </button>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <div style={{
                  display: "flex", alignItems: "center",
                  border: `2px solid ${t.inputBorder}`,
                  borderRadius: "10px",
                  padding: "0 14px",
                  background: t.card,
                }}>
                  <Search size={16} color={t.textMuted} style={{ marginRight: "10px" }} />
                  <input
                    type="text"
                    placeholder="Search groups or contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: "100%", padding: "10px 0",
                      border: "none", fontSize: "0.85rem",
                      color: t.textPrimary,
                      background: "transparent",
                      outline: "none",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  />
                </div>
              </div>

              {notificationType === "groups" && (
                <div style={{ marginBottom: "12px" }}>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center", marginBottom: "8px",
                  }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: "600", color: t.textSecondary }}>
                      <Users size={14} style={{ display: "inline", marginRight: "4px" }} />
                      Groups ({filteredGroups.length})
                    </span>
                    {filteredGroups.length > 0 && (
                      <button
                        type="button"
                        onClick={selectAllGroups}
                        style={{
                          fontSize: "0.75rem", color: t.accent,
                          background: "none", border: "none",
                          cursor: "pointer", fontFamily: "'Inter', sans-serif",
                          fontWeight: "500",
                        }}
                      >
                        {selectedGroups.length === filteredGroups.length ? "Deselect All" : "Select All"}
                      </button>
                    )}
                  </div>
                  <div style={{
                    maxHeight: "200px", overflowY: "auto",
                    border: `2px solid ${t.inputBorder}`,
                    borderRadius: "10px",
                    padding: "4px",
                    background: t.card,
                  }}>
                    {filteredGroups.length === 0 ? (
                      <div style={{ padding: "12px", textAlign: "center", color: t.textMuted, fontSize: "0.85rem" }}>
                        No groups found
                      </div>
                    ) : (
                      filteredGroups.map((group) => (
                        <div
                          key={group._id}
                          onClick={() => toggleGroup(group._id)}
                          style={{
                            padding: "8px 12px", borderRadius: "8px",
                            display: "flex", alignItems: "center", gap: "12px",
                            cursor: "pointer",
                            background: selectedGroups.includes(group._id) ? t.accentLight : "transparent",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            if (!selectedGroups.includes(group._id)) {
                              e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "#F8F9FA";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!selectedGroups.includes(group._id)) {
                              e.currentTarget.style.background = "transparent";
                            }
                          }}
                        >
                          <div style={{
                            width: "20px", height: "20px", borderRadius: "4px",
                            border: `2px solid ${selectedGroups.includes(group._id) ? t.accent : t.inputBorder}`,
                            background: selectedGroups.includes(group._id) ? t.accent : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                            transition: "all 0.15s",
                          }}>
                            {selectedGroups.includes(group._id) && <Check size={14} color="#fff" />}
                          </div>
                          <div style={{
                            width: "32px", height: "32px",
                            borderRadius: "8px",
                            background: getColorFromName(group.name),
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#fff", fontSize: "0.7rem", fontWeight: "600",
                            flexShrink: 0,
                          }}>
                            {getInitials(group.name)}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "0.85rem", fontWeight: "500", color: t.textPrimary }}>
                              {group.name}
                            </div>
                            <div style={{ fontSize: "0.7rem", color: t.textMuted }}>
                              {group.members?.length || 0} members
                            </div>
                          </div>
                          <Users size={14} color={t.textMuted} />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {notificationType === "contacts" && (
                <div>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center", marginBottom: "8px",
                  }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: "600", color: t.textSecondary }}>
                      <User size={14} style={{ display: "inline", marginRight: "4px" }} />
                      Personal Chats ({filteredContacts.length})
                    </span>
                    {filteredContacts.length > 0 && (
                      <button
                        type="button"
                        onClick={selectAllContacts}
                        style={{
                          fontSize: "0.75rem", color: t.accent,
                          background: "none", border: "none",
                          cursor: "pointer", fontFamily: "'Inter', sans-serif",
                          fontWeight: "500",
                        }}
                      >
                        {selectedContacts.length === filteredContacts.length ? "Deselect All" : "Select All"}
                      </button>
                    )}
                  </div>
                  <div style={{
                    maxHeight: "200px", overflowY: "auto",
                    border: `2px solid ${t.inputBorder}`,
                    borderRadius: "10px",
                    padding: "4px",
                    background: t.card,
                  }}>
                    {filteredContacts.length === 0 ? (
                      <div style={{ padding: "12px", textAlign: "center", color: t.textMuted, fontSize: "0.85rem" }}>
                        No contacts found
                      </div>
                    ) : (
                      filteredContacts.map((contact) => (
                        <div
                          key={contact.user_id}
                          onClick={() => toggleContact(contact.user_id)}
                          style={{
                            padding: "8px 12px", borderRadius: "8px",
                            display: "flex", alignItems: "center", gap: "12px",
                            cursor: "pointer",
                            background: selectedContacts.includes(contact.user_id) ? t.accentLight : "transparent",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            if (!selectedContacts.includes(contact.user_id)) {
                              e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "#F8F9FA";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!selectedContacts.includes(contact.user_id)) {
                              e.currentTarget.style.background = "transparent";
                            }
                          }}
                        >
                          <div style={{
                            width: "20px", height: "20px", borderRadius: "4px",
                            border: `2px solid ${selectedContacts.includes(contact.user_id) ? t.accent : t.inputBorder}`,
                            background: selectedContacts.includes(contact.user_id) ? t.accent : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                            transition: "all 0.15s",
                          }}>
                            {selectedContacts.includes(contact.user_id) && <Check size={14} color="#fff" />}
                          </div>
                          <div style={{
                            width: "32px", height: "32px",
                            borderRadius: "50%",
                            background: getColorFromName(contact.name),
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#fff", fontSize: "0.7rem", fontWeight: "600",
                            flexShrink: 0,
                          }}>
                            {getInitials(contact.name)}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "0.85rem", fontWeight: "500", color: t.textPrimary }}>
                              {contact.name}
                            </div>
                            <div style={{ fontSize: "0.7rem", color: t.textMuted }}>
                              {contact.email}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{
          display: "flex", gap: "10px",
          justifyContent: "flex-end",
          borderTop: `1px solid ${t.border}`,
          paddingTop: "20px",
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "10px 24px", borderRadius: "10px",
              border: `2px solid ${t.inputBorder}`,
              background: "transparent", color: t.textSecondary,
              cursor: "pointer", fontFamily: "'Inter', sans-serif",
              fontSize: "0.9rem", fontWeight: "500",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "#F8F9FA";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 28px", borderRadius: "10px",
              border: "none", background: t.accent,
              color: "#fff", cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.9rem", fontWeight: "600",
              opacity: loading ? 0.6 : 1,
              display: "flex", alignItems: "center", gap: "8px",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.background = t.accentHover;
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.background = t.accent;
            }}
          >
            {loading ? (
              <>
                <span style={{
                  display: "inline-block",
                  width: "18px", height: "18px",
                  border: `2px solid #fff`,
                  borderTop: "2px solid transparent",
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                }} />
                Creating...
              </>
            ) : (
              <>
                <Send size={16} />
                Create meeting
              </>
            )}
          </button>
        </div>
      </form>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: ${isDark ? "#2D3748" : "#D1D5DB"};
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${isDark ? "#4A5568" : "#9CA3AF"};
        }
      `}</style>
    </div>
  );
};

const ChevronDown = ({ size, color }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
};

const Search = ({ size, color }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
};

export default CreateMeetingModal;
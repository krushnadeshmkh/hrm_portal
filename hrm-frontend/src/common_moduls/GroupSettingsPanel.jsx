import { useState, useRef } from "react";
import axios from "axios";
import {
  X, Crown, UserMinus, UserPlus, Trash2, LogOut,
  Camera, ChevronDown, ChevronUp, Shield, Users, Search, Check, Loader
} from "lucide-react";

const API = "https://hrm-backend-vvqg.onrender.com/api";
const BASE_URL = "https://hrm-backend-vvqg.onrender.com";

function authHeaders() {
  return { "x-auth-token": localStorage.getItem("token") };
}

function Avatar({ name = "?", src = null, size = 36 }) {
  const hue = ((name.charCodeAt(0) || 65) * 17 + (name.charCodeAt(1) || 65) * 5) % 360;
  if (src) {
    return (
      <img
        src={`${BASE_URL}${src}`}
        alt={name}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
      />
    );
  }
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: `hsl(${hue},50%,46%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontWeight: 600, fontSize: size * 0.36, flexShrink: 0, userSelect: "none",
      }}
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

function GroupAvatar({ name = "?", src = null, size = 60 }) {
  const hue = ((name.charCodeAt(0) || 71) * 13 + (name.charCodeAt(1) || 71) * 7) % 360;
  if (src) {
    return (
      <img
        src={`${BASE_URL}${src}`}
        alt={name}
        style={{ width: size, height: size, borderRadius: 14, objectFit: "cover", flexShrink: 0 }}
      />
    );
  }
  return (
    <div
      style={{
        width: size, height: size, borderRadius: 14,
        background: `hsl(${hue},45%,42%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", flexShrink: 0,
      }}
    >
      <Users size={size * 0.42} />
    </div>
  );
}

export default function GroupSettingsPanel({
  group, currentUserId, t, isDark,
  onClose, onUpdate, onLeave, onDelete
}) {
  const [showMembers, setShowMembers] = useState(true);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [addSearch, setAddSearch] = useState("");
  const [selectedToAdd, setSelectedToAdd] = useState([]);
  const [adding, setAdding] = useState(false);

  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(group?.name || "");
  const [savingName, setSavingName] = useState(false);

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [savingAvatar, setSavingAvatar] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); 

  const avatarInputRef = useRef(null);

  const isAdmin = group?.members?.find(
    m => String(m.user_id?._id || m.user_id) === String(currentUserId)
  )?.role === "admin";

  const isCreator = String(group?.created_by?._id || group?.created_by) === String(currentUserId);

  const getMemberName = (m) => m.user_id?.name || "Unknown";
  const getMemberId = (m) => String(m.user_id?._id || m.user_id);

  const openAddMembers = () => {
    if (!showAddMembers) {
      setLoadingContacts(true);
      axios.get(`${API}/groups/contacts`, { headers: authHeaders() })
        .then(r => {
          const existingIds = group.members.map(m => getMemberId(m));
          setContacts((r.data.data || []).filter(c => !existingIds.includes(String(c.user_id))));
        })
        .catch(() => setContacts([]))
        .finally(() => setLoadingContacts(false));
    }
    setShowAddMembers(p => !p);
    setSelectedToAdd([]);
    setAddSearch("");
  };

  const toggleAddSelect = (c) => {
    const uid = c.user_id?.toString();
    setSelectedToAdd(prev =>
      prev.find(s => s.user_id?.toString() === uid)
        ? prev.filter(s => s.user_id?.toString() !== uid)
        : [...prev, c]
    );
  };

  const handleAddMembers = async () => {
    if (selectedToAdd.length === 0) return;
    setAdding(true);
    try {
      const res = await axios.post(
        `${API}/groups/${group._id}/members`,
        { member_ids: selectedToAdd.map(s => s.user_id?.toString()) },
        { headers: authHeaders() }
      );
      if (res.data.success) {
        onUpdate(res.data.data);
        setShowAddMembers(false);
        setSelectedToAdd([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    setActionLoading(memberId);
    try {
      const res = await axios.delete(`${API}/groups/${group._id}/members/${memberId}`, { headers: authHeaders() });
      if (res.data.success) onUpdate(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleAdmin = async (memberId) => {
    setActionLoading(memberId);
    try {
      const res = await axios.put(`${API}/groups/${group._id}/members/${memberId}/admin`, {}, { headers: authHeaders() });
      if (res.data.success) onUpdate(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveName = async () => {
    if (!nameVal.trim() || nameVal === group.name) { setEditingName(false); return; }
    setSavingName(true);
    try {
      const form = new FormData();
      form.append("name", nameVal.trim());
      const res = await axios.put(`${API}/groups/${group._id}`, form, { headers: authHeaders() });
      if (res.data.success) onUpdate(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingName(false);
      setEditingName(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setSavingAvatar(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await axios.put(`${API}/groups/${group._id}`, form, {
        headers: { ...authHeaders(), "Content-Type": "multipart/form-data" }
      });
      if (res.data.success) onUpdate(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleLeave = async () => {
    setActionLoading("leave");
    try {
      await axios.delete(`${API}/groups/${group._id}/members/${currentUserId}`, { headers: authHeaders() });
      onLeave();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    setActionLoading("delete");
    try {
      await axios.delete(`${API}/groups/${group._id}`, { headers: authHeaders() });
      onDelete();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredContacts = contacts.filter(c =>
    c.name?.toLowerCase().includes(addSearch.toLowerCase()) ||
    c.email?.toLowerCase().includes(addSearch.toLowerCase())
  );

  return (
    <div
      style={{
        width: 280, borderLeft: `1px solid ${t.border}`,
        background: t.sidebarPanel, display: "flex", flexDirection: "column",
        overflowY: "auto", flexShrink: 0, animation: "slideIn 0.2s ease",
      }}
    >
      <style>{`
        @keyframes slideIn { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
        .gsp-row:hover { background: ${t.rowHover} !important; }
        .gsp-btn:hover { opacity: 0.85; }
        .gsp-input:focus { outline: none; border-color: #4F46E5 !important; }
      `}</style>

      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <span style={{ fontWeight: 700, fontSize: "0.9rem", color: t.textPrimary }}>Group Info</span>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted, padding: 4, borderRadius: 8, display: "flex" }}>
          <X size={16} />
        </button>
      </div>


      <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", alignItems: "center", borderBottom: `1px solid ${t.border}` }}>
        <div style={{ position: "relative", marginBottom: 12 }}>
          <GroupAvatar name={group?.name} src={avatarPreview ? null : group?.avatar_url} size={72} />
          {avatarPreview && (
            <img src={avatarPreview} alt="" style={{ position: "absolute", inset: 0, width: 72, height: 72, borderRadius: 14, objectFit: "cover" }} />
          )}
          {isAdmin && (
            <div
              onClick={() => avatarInputRef.current?.click()}
              style={{
                position: "absolute", bottom: -4, right: -4,
                width: 24, height: 24, borderRadius: "50%",
                background: t.accent, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", border: `2px solid ${t.sidebarPanel}`,
              }}
            >
              {savingAvatar
                ? <Loader size={10} color="#fff" style={{ animation: "spin 0.7s linear infinite" }} />
                : <Camera size={10} color="#fff" />
              }
            </div>
          )}
          <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
        </div>

        {editingName ? (
          <div style={{ display: "flex", gap: 6, alignItems: "center", width: "100%" }}>
            <input
              className="gsp-input"
              value={nameVal}
              onChange={e => setNameVal(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSaveName(); if (e.key === "Escape") setEditingName(false); }}
              autoFocus
              maxLength={60}
              style={{
                flex: 1, padding: "6px 10px", borderRadius: 8,
                border: `1.5px solid ${t.inputBorder}`, fontSize: "0.875rem",
                color: t.textPrimary, background: t.inputBg,
                fontFamily: "'DM Sans', sans-serif", textAlign: "center",
              }}
            />
            <button
              onClick={handleSaveName}
              style={{ background: t.accent, border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center" }}
            >
              {savingName ? <Loader size={13} style={{ animation: "spin 0.7s linear infinite" }} /> : <Check size={13} />}
            </button>
            <button onClick={() => setEditingName(false)} style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted }}>
              <X size={14} />
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontWeight: 700, fontSize: "0.95rem", color: t.textPrimary }}>{group?.name}</span>
            {isAdmin && (
              <button
                onClick={() => { setNameVal(group?.name); setEditingName(true); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted, fontSize: "0.72rem", padding: "2px 4px", borderRadius: 4 }}
              >
                ✏️
              </button>
            )}
          </div>
        )}

        {group?.description && (
          <p style={{ margin: "6px 0 0", fontSize: "0.78rem", color: t.textMuted, textAlign: "center", lineHeight: 1.5 }}>
            {group.description}
          </p>
        )}
        <div style={{ marginTop: 6, fontSize: "0.75rem", color: t.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
          <Users size={12} />
          {group?.members?.length} members
        </div>
      </div>

      <div style={{ borderBottom: `1px solid ${t.border}` }}>
        <button
          onClick={() => setShowMembers(p => !p)}
          style={{
            width: "100%", background: "none", border: "none", cursor: "pointer",
            padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
            color: t.textPrimary, fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <span style={{ fontWeight: 600, fontSize: "0.82rem" }}>Members ({group?.members?.length})</span>
          {showMembers ? <ChevronUp size={15} color={t.textMuted} /> : <ChevronDown size={15} color={t.textMuted} />}
        </button>

        {showMembers && (
          <div>
            {group?.members?.map(m => {
              const mid = getMemberId(m);
              const isMe = mid === String(currentUserId);
              const memberIsAdmin = m.role === "admin";
              const loading = actionLoading === mid;

              return (
                <div
                  key={mid}
                  className="gsp-row"
                  style={{
                    padding: "8px 16px", display: "flex", alignItems: "center", gap: 10,
                    transition: "background 0.12s",
                  }}
                >
                  <Avatar name={getMemberName(m)} src={m.user_id?.avatar_url} size={34} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: 600, color: t.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {getMemberName(m)} {isMe && <span style={{ color: t.textMuted, fontWeight: 400 }}>(you)</span>}
                    </div>
                    {memberIsAdmin && (
                      <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 1 }}>
                        <Crown size={10} color="#F59E0B" />
                        <span style={{ fontSize: "0.68rem", color: "#F59E0B", fontWeight: 600 }}>Admin</span>
                      </div>
                    )}
                  </div>

                  {loading ? (
                    <Loader size={14} color={t.textMuted} style={{ animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
                  ) : isAdmin && !isMe ? (
                    <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                      <button
                        onClick={() => handleToggleAdmin(mid)}
                        title={memberIsAdmin ? "Remove admin" : "Make admin"}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, color: memberIsAdmin ? "#F59E0B" : t.textMuted, display: "flex" }}
                      >
                        <Shield size={13} />
                      </button>
                      <button
                        onClick={() => handleRemoveMember(mid)}
                        title="Remove from group"
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, color: "#EF4444", display: "flex" }}
                      >
                        <UserMinus size={13} />
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}

            {isAdmin && (
              <div>
                <button
                  onClick={openAddMembers}
                  style={{
                    width: "100%", background: "none", border: "none", cursor: "pointer",
                    padding: "10px 16px", display: "flex", alignItems: "center", gap: 10,
                    color: t.accent, fontFamily: "'DM Sans', sans-serif",
                    borderTop: `1px solid ${t.border}`,
                  }}
                  className="gsp-row"
                >
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: t.accentLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <UserPlus size={15} color={t.accent} />
                  </div>
                  <span style={{ fontWeight: 600, fontSize: "0.82rem" }}>Add members</span>
                  {showAddMembers ? <ChevronUp size={13} style={{ marginLeft: "auto" }} /> : <ChevronDown size={13} style={{ marginLeft: "auto" }} />}
                </button>

                {showAddMembers && (
                  <div style={{ padding: "8px 12px 12px", borderTop: `1px solid ${t.border}` }}>
                    <div style={{ position: "relative", marginBottom: 8 }}>
                      <Search size={12} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: t.textMuted, pointerEvents: "none" }} />
                      <input
                        className="gsp-input"
                        placeholder="Search..."
                        value={addSearch}
                        onChange={e => setAddSearch(e.target.value)}
                        style={{
                          width: "100%", padding: "7px 10px 7px 28px", borderRadius: 8,
                          border: `1.5px solid ${t.inputBorder}`, fontSize: "0.8rem",
                          color: t.textPrimary, background: t.searchBg,
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      />
                    </div>

                    <div style={{ maxHeight: 160, overflowY: "auto" }}>
                      {loadingContacts ? (
                        <div style={{ textAlign: "center", padding: "12px", color: t.textMuted, fontSize: "0.8rem" }}>Loading...</div>
                      ) : filteredContacts.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "12px", color: t.textMuted, fontSize: "0.8rem" }}>No contacts available</div>
                      ) : filteredContacts.map(c => {
                        const sel = !!selectedToAdd.find(s => s.user_id?.toString() === c.user_id?.toString());
                        return (
                          <div
                            key={c.user_id}
                            className="gsp-row"
                            onClick={() => toggleAddSelect(c)}
                            style={{
                              padding: "7px 6px", display: "flex", alignItems: "center", gap: 8,
                              cursor: "pointer", borderRadius: 8, background: sel ? t.activeRow : "transparent",
                            }}
                          >
                            <Avatar name={c.name} size={28} />
                            <span style={{ flex: 1, fontSize: "0.8rem", color: t.textPrimary, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</span>
                            <div style={{
                              width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                              border: `2px solid ${sel ? t.accent : t.inputBorder}`,
                              background: sel ? t.accent : "transparent",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              {sel && <Check size={10} color="#fff" strokeWidth={3} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {selectedToAdd.length > 0 && (
                      <button
                        onClick={handleAddMembers}
                        disabled={adding}
                        style={{
                          width: "100%", marginTop: 8, padding: "8px", borderRadius: 8, border: "none",
                          background: t.accent, color: "#fff", fontSize: "0.8rem", fontWeight: 600,
                          cursor: adding ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        }}
                      >
                        {adding ? <Loader size={13} style={{ animation: "spin 0.7s linear infinite" }} /> : <UserPlus size={13} />}
                        Add {selectedToAdd.length} member{selectedToAdd.length > 1 ? "s" : ""}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ padding: "12px 12px 20px", marginTop: "auto" }}>
        {!confirmLeave && !confirmDelete ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <button
              onClick={() => setConfirmLeave(true)}
              style={{
                width: "100%", padding: "9px", borderRadius: 9, border: `1px solid ${t.border}`,
                background: "none", color: "#EF4444", fontSize: "0.82rem", fontWeight: 600,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              }}
              className="gsp-btn"
            >
              <LogOut size={14} /> Leave Group
            </button>
            {isAdmin && (
              <button
                onClick={() => setConfirmDelete(true)}
                style={{
                  width: "100%", padding: "9px", borderRadius: 9, border: "none",
                  background: "rgba(239,68,68,0.1)", color: "#EF4444", fontSize: "0.82rem", fontWeight: 600,
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                }}
                className="gsp-btn"
              >
                <Trash2 size={14} /> Delete Group
              </button>
            )}
          </div>
        ) : confirmLeave ? (
          <div style={{ background: isDark ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "12px" }}>
            <p style={{ margin: "0 0 10px", fontSize: "0.82rem", color: t.textPrimary, fontWeight: 600 }}>Leave this group?</p>
            <p style={{ margin: "0 0 12px", fontSize: "0.76rem", color: t.textMuted }}>You'll need to be re-added by an admin to rejoin.</p>
            <div style={{ display: "flex", gap: 7 }}>
              <button onClick={() => setConfirmLeave(false)} style={{ flex: 1, padding: "7px", borderRadius: 8, border: `1px solid ${t.border}`, background: "none", color: t.textSecondary, fontSize: "0.8rem", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
              <button
                onClick={handleLeave}
                disabled={actionLoading === "leave"}
                style={{ flex: 1, padding: "7px", borderRadius: 8, border: "none", background: "#EF4444", color: "#fff", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
              >
                {actionLoading === "leave" ? <Loader size={12} style={{ animation: "spin 0.7s linear infinite" }} /> : null}
                Leave
              </button>
            </div>
          </div>
        ) : (
          <div style={{ background: isDark ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "12px" }}>
            <p style={{ margin: "0 0 10px", fontSize: "0.82rem", color: t.textPrimary, fontWeight: 600 }}>Delete this group?</p>
            <p style={{ margin: "0 0 12px", fontSize: "0.76rem", color: t.textMuted }}>All messages will be permanently deleted. This cannot be undone.</p>
            <div style={{ display: "flex", gap: 7 }}>
              <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: "7px", borderRadius: 8, border: `1px solid ${t.border}`, background: "none", color: t.textSecondary, fontSize: "0.8rem", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
              <button
                onClick={handleDelete}
                disabled={actionLoading === "delete"}
                style={{ flex: 1, padding: "7px", borderRadius: 8, border: "none", background: "#EF4444", color: "#fff", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
              >
                {actionLoading === "delete" ? <Loader size={12} style={{ animation: "spin 0.7s linear infinite" }} /> : null}
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { X, Users, Search, Check, Camera, Loader } from "lucide-react";

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

export default function CreateGroupModal({ t, isDark, onClose, onCreate }) {
  const [step, setStep] = useState(1); // 1 = select members, 2 = group details
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [searchQ, setSearchQ] = useState("");
  const [selected, setSelected] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const avatarInputRef = useRef(null);

  useEffect(() => {
    setLoadingContacts(true);
    axios.get(`${API}/groups/contacts`, { headers: authHeaders() })
      .then(r => setContacts(r.data.data || []))
      .catch(() => setContacts([]))
      .finally(() => setLoadingContacts(false));
  }, []);

  const filtered = contacts.filter(c =>
    c.name?.toLowerCase().includes(searchQ.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQ.toLowerCase())
  );

  const toggleSelect = (c) => {
    const uid = c.user_id?.toString();
    setSelected(prev =>
      prev.find(s => s.user_id?.toString() === uid)
        ? prev.filter(s => s.user_id?.toString() !== uid)
        : [...prev, c]
    );
  };

  const isSelected = (c) => !!selected.find(s => s.user_id?.toString() === c.user_id?.toString());

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleCreate = async () => {
    if (!groupName.trim()) { setError("Group name is required."); return; }
    if (selected.length === 0) { setError("Add at least one member."); return; }
    setError("");
    setCreating(true);
    try {
      const form = new FormData();
      form.append("name", groupName.trim());
      form.append("description", description);
      form.append("member_ids", JSON.stringify(selected.map(s => s.user_id?.toString())));
      if (avatarFile) form.append("file", avatarFile);

      const res = await axios.post(`${API}/groups`, form, {
        headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        onCreate(res.data.data);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create group.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "rgba(0,0,0,0.55)", display: "flex",
        alignItems: "center", justifyContent: "center", padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: t.card, borderRadius: 16, width: "100%", maxWidth: 440,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column",
          maxHeight: "88vh", overflow: "hidden",
          border: `1px solid ${t.border}`,
          animation: "modalIn 0.18s ease",
        }}
      >
        <style>{`
          @keyframes modalIn { from{opacity:0;transform:scale(0.96) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
          .cgm-contact-row:hover { background: ${t.rowHover} !important; }
          .cgm-input:focus { outline: none; border-color: #4F46E5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.12); }
        `}</style>
        <div style={{
          padding: "16px 18px", borderBottom: `1px solid ${t.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                style={{ background: "none", border: "none", cursor: "pointer", color: t.accent, padding: 2, display: "flex", alignItems: "center" }}
              >
                ←
              </button>
            )}
            <div style={{ width: 32, height: 32, borderRadius: 8, background: t.accentLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={16} color={t.accent} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: t.textPrimary }}>
                {step === 1 ? "New Group" : "Group Details"}
              </div>
              <div style={{ fontSize: "0.72rem", color: t.textMuted }}>
                {step === 1 ? `${selected.length} selected` : "Name your group"}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted, padding: 4, borderRadius: 8, display: "flex", alignItems: "center" }}
          >
            <X size={18} />
          </button>
        </div>

        {step === 1 ? (
          <>
            {selected.length > 0 && (
              <div style={{
                padding: "10px 16px", display: "flex", flexWrap: "wrap", gap: 6,
                borderBottom: `1px solid ${t.border}`, flexShrink: 0,
              }}>
                {selected.map(c => (
                  <div
                    key={c.user_id}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      background: t.accentLight, borderRadius: 20,
                      padding: "3px 10px 3px 4px", fontSize: "0.78rem", color: t.accent,
                    }}
                  >
                    <Avatar name={c.name} size={20} />
                    <span style={{ fontWeight: 500 }}>{c.name.split(" ")[0]}</span>
                    <button
                      onClick={() => toggleSelect(c)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: t.accent, padding: 0, display: "flex", alignItems: "center", marginLeft: 2 }}
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ padding: "10px 16px", borderBottom: `1px solid ${t.border}`, flexShrink: 0 }}>
              <div style={{ position: "relative" }}>
                <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: t.textMuted, pointerEvents: "none" }} />
                <input
                  className="cgm-input"
                  placeholder="Search contacts..."
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  style={{
                    width: "100%", padding: "8px 12px 8px 32px", borderRadius: 10,
                    border: `1.5px solid ${t.inputBorder}`, fontSize: "0.83rem",
                    color: t.textPrimary, background: t.searchBg,
                    fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.15s",
                  }}
                />
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto" }}>
              {loadingContacts ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: t.skeletonBg, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 11, width: "50%", background: t.skeletonBg, borderRadius: 4, marginBottom: 6 }} />
                      <div style={{ height: 9, width: "35%", background: t.skeletonBg, borderRadius: 4 }} />
                    </div>
                  </div>
                ))
              ) : filtered.length === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center", color: t.textMuted, fontSize: "0.85rem" }}>
                  No contacts found
                </div>
              ) : filtered.map(c => {
                const sel = isSelected(c);
                return (
                  <div
                    key={c.user_id}
                    className="cgm-contact-row"
                    onClick={() => toggleSelect(c)}
                    style={{
                      padding: "10px 16px", display: "flex", alignItems: "center", gap: 12,
                      cursor: "pointer", transition: "background 0.12s",
                      background: sel ? t.activeRow : "transparent",
                    }}
                  >
                    <Avatar name={c.name} size={36} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem", color: t.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                      <div style={{ fontSize: "0.75rem", color: t.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.email}</div>
                    </div>
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                      border: `2px solid ${sel ? t.accent : t.inputBorder}`,
                      background: sel ? t.accent : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.12s",
                    }}>
                      {sel && <Check size={12} color="#fff" strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ padding: "12px 16px", borderTop: `1px solid ${t.border}`, flexShrink: 0 }}>
              <button
                onClick={() => { if (selected.length > 0) setStep(2); }}
                disabled={selected.length === 0}
                style={{
                  width: "100%", padding: "11px", borderRadius: 10, border: "none",
                  background: selected.length > 0 ? t.accent : (isDark ? "#2D3748" : "#E5E7EB"),
                  color: selected.length > 0 ? "#fff" : t.textMuted,
                  fontSize: "0.875rem", fontWeight: 600, cursor: selected.length > 0 ? "pointer" : "not-allowed",
                  fontFamily: "'DM Sans', sans-serif", transition: "background 0.15s",
                }}
              >
                Next → {selected.length > 0 && `(${selected.length} member${selected.length > 1 ? "s" : ""})`}
              </button>
            </div>
          </>
        ) : (
          <>

            <div style={{ flex: 1, overflowY: "auto", padding: "20px 18px" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                <div style={{ position: "relative" }}>
                  <div
                    onClick={() => avatarInputRef.current?.click()}
                    style={{
                      width: 80, height: 80, borderRadius: 16,
                      background: avatarPreview ? "transparent" : t.accentLight,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", overflow: "hidden",
                      border: `2px dashed ${t.accent}`,
                    }}
                  >
                    {avatarPreview
                      ? <img src={avatarPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <Camera size={28} color={t.accent} />
                    }
                  </div>
                  <div style={{
                    position: "absolute", bottom: -4, right: -4,
                    width: 22, height: 22, borderRadius: "50%",
                    background: t.accent, display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", border: `2px solid ${t.card}`,
                  }}
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    <Camera size={10} color="#fff" />
                  </div>
                  <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: "0.78rem", fontWeight: 600, color: t.textSecondary, display: "block", marginBottom: 6 }}>
                  Group Name *
                </label>
                <input
                  className="cgm-input"
                  placeholder="e.g. Project Alpha, Marketing Team..."
                  value={groupName}
                  onChange={e => { setGroupName(e.target.value); setError(""); }}
                  maxLength={60}
                  style={{
                    width: "100%", padding: "10px 13px", borderRadius: 10,
                    border: `1.5px solid ${error && !groupName.trim() ? "#EF4444" : t.inputBorder}`,
                    fontSize: "0.875rem", color: t.textPrimary, background: t.inputBg,
                    fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.15s",
                  }}
                />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: "0.78rem", fontWeight: 600, color: t.textSecondary, display: "block", marginBottom: 6 }}>
                  Description <span style={{ color: t.textMuted, fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea
                  className="cgm-input"
                  placeholder="What's this group about?"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                  maxLength={200}
                  style={{
                    width: "100%", padding: "10px 13px", borderRadius: 10,
                    border: `1.5px solid ${t.inputBorder}`,
                    fontSize: "0.875rem", color: t.textPrimary, background: t.inputBg,
                    fontFamily: "'DM Sans', sans-serif", resize: "none", transition: "border-color 0.15s",
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 600, color: t.textSecondary, display: "block", marginBottom: 8 }}>
                  Members ({selected.length + 1})
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {selected.map(c => (
                    <div key={c.user_id} style={{ display: "flex", alignItems: "center", gap: 5, background: t.accentLight, borderRadius: 20, padding: "3px 10px 3px 4px", fontSize: "0.78rem", color: t.accent }}>
                      <Avatar name={c.name} size={20} />
                      <span style={{ fontWeight: 500 }}>{c.name.split(" ")[0]}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", alignItems: "center", gap: 5, background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", borderRadius: 20, padding: "3px 10px 3px 4px", fontSize: "0.78rem", color: t.textMuted }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: t.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: "0.6rem", color: "#fff", fontWeight: 700 }}>You</span>
                    </div>
                    <span>You (admin)</span>
                  </div>
                </div>
              </div>

              {error && (
                <div style={{ marginTop: 14, padding: "8px 12px", background: "rgba(239,68,68,0.1)", borderRadius: 8, fontSize: "0.8rem", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                  {error}
                </div>
              )}
            </div>
            <div style={{ padding: "12px 18px", borderTop: `1px solid ${t.border}`, flexShrink: 0 }}>
              <button
                onClick={handleCreate}
                disabled={creating || !groupName.trim()}
                style={{
                  width: "100%", padding: "11px", borderRadius: 10, border: "none",
                  background: !groupName.trim() ? (isDark ? "#2D3748" : "#E5E7EB") : t.accent,
                  color: !groupName.trim() ? t.textMuted : "#fff",
                  fontSize: "0.875rem", fontWeight: 600,
                  cursor: creating || !groupName.trim() ? "not-allowed" : "pointer",
                  fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 8, transition: "background 0.15s",
                }}
              >
                {creating ? <><Loader size={15} style={{ animation: "spin 0.7s linear infinite" }} /> Creating...</> : "Create Group"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
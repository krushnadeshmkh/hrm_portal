import React, { useEffect, useState, useCallback, useRef } from "react";
import Sidebar from "../../layouts/sidebar";
import MobileTopBar from "../MobileTopBar";
import axios from "axios";
import { KeyRound, User, Mail, Phone, Building2, Camera, Trash2, Bell } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const API = "https://hrm-backend-vvqg.onrender.com/api/employee";

const Profile = () => {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    department: "General",
    role: "Employee",
    avatar: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [removingAvatar, setRemovingAvatar] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);
  const profileRef = useRef(profile);
  useEffect(() => { profileRef.current = profile; }, [profile]);

  const token = localStorage.getItem("token");
  const name = localStorage.getItem("name") || "Employee";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const isMobile = window.innerWidth <= 768;
  const sidebarWidth = isMobile ? 0 : (isOpen ? 255 : 68);

  const t = {
    bg: isDark ? "#0F1219" : "#F9FAFB",
    card: isDark ? "#161B27" : "#fff",
    border: isDark ? "#1E2535" : "#F1F3F9",
    textPrimary: isDark ? "#F3F4F6" : "#111827",
    textSecondary: isDark ? "#9CA3AF" : "#6B7280",
    textMuted: isDark ? "#6B7280" : "#9CA3AF",
    inputBg: isDark ? "#1E2535" : "#F9FAFB",
    inputBorder: isDark ? "#2D3748" : "#E5E7EB",
    topbar: isDark ? "#161B27" : "#fff",
    skeletonBg: isDark ? "#1E2535" : "#F3F4F6",
    avatarGradient: "linear-gradient(135deg, #4F46E5, #7C3AED)",
    avatarBorder: isDark ? "#1E1B4B" : "#EEF2FF",
    roleBadgeBg: isDark ? "#1E1B4B" : "#EEF2FF",
    roleBadgeColor: isDark ? "#818CF8" : "#4F46E5",
    infoCardBg: isDark ? "#1E2535" : "#fff",
    changePhotoBg: isDark ? "#1E1B4B" : "#EEF2FF",
    changePhotoColor: isDark ? "#818CF8" : "#4F46E5",
    removePhotoBg: isDark ? "#2D0F0F" : "#FEF2F2",
    removePhotoColor: "#DC2626",
    headerIconBg1: isDark ? "#1E1B4B" : "#EEF2FF",
    headerIconColor1: isDark ? "#818CF8" : "#4F46E5",
    headerIconBg2: isDark ? "#064E3B" : "#ECFDF5",
    headerIconColor2: isDark ? "#6EE7B7" : "#059669",
    toastSuccessBg: isDark ? "#064E3B" : "#ECFDF5",
    toastSuccessText: isDark ? "#6EE7B7" : "#059669",
    toastErrorBg: isDark ? "#2D0F0F" : "#FEF2F2",
    toastErrorText: isDark ? "#F87171" : "#DC2626",
    disabledInputBg: isDark ? "#1E2535" : "#F3F4F6",
    disabledInputText: isDark ? "#6B7280" : "#9CA3AF",
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      if (!mobile && !isOpen) setIsOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const persistAvatarToStorage = (url) => {
    if (url) {
      localStorage.setItem("avatar", url);
    } else {
      localStorage.removeItem("avatar");
    }
    window.dispatchEvent(new Event("storage"));
  };

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/user-profile`, {
        headers: { "x-auth-token": token },
      });
      const data = res.data?.data || {};
      const avatarUrl = data.avatar || null;

      setProfile({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        department: data.department || "General",
        role: data.role || "Employee",
        avatar: avatarUrl,
      });

      persistAvatarToStorage(avatarUrl);
      setAvatarPreview(null);
    } catch (err) {
      console.error("Profile load error:", err);
      showToast("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Only image files are allowed", "error");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      showToast("Image must be under 3 MB", "error");
      return;
    }

    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);

    try {
      setUploadingAvatar(true);

      const cur = profileRef.current;
      const formData = new FormData();
      formData.append("name", cur.name);
      formData.append("email", cur.email);
      formData.append("phone", cur.phone || "");
      formData.append("department", cur.department || "General");
      formData.append("avatar", file);

      const res = await axios.put(`${API}/profile`, formData, {
        headers: { "x-auth-token": token },
      });

      const newAvatar = res.data?.avatar || null;

      if (newAvatar) {
        setProfile((prev) => ({ ...prev, avatar: newAvatar }));
        persistAvatarToStorage(newAvatar);
        setAvatarPreview(null);
      } else {
        await loadProfile();
      }

      localStorage.setItem("name", cur.name);
      window.dispatchEvent(new Event("storage"));
      showToast("Profile photo updated!");
    } catch (err) {
      console.error("Avatar upload error:", err.response?.data || err.message);
      setAvatarPreview(null);
      showToast(err.response?.data?.message || "Failed to upload photo", "error");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const updateProfile = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("name", profile.name);
      formData.append("email", profile.email);
      formData.append("phone", profile.phone);
      formData.append("department", profile.department);

      const res = await axios.put(`${API}/profile`, formData, {
        headers: { "x-auth-token": token },
      });

      const newAvatar = res.data?.avatar || profile.avatar;
      localStorage.setItem("name", profile.name);
      setProfile((prev) => ({ ...prev, avatar: newAvatar }));
      persistAvatarToStorage(newAvatar);
      window.dispatchEvent(new Event("storage"));
      showToast("Profile updated successfully");
    } catch (err) {
      console.error("Update error:", err.response?.data || err.message);
      showToast(err.response?.data?.message || "Error updating profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const removeAvatar = async () => {
    if (!profile.avatar && !avatarPreview) return;

    if (avatarPreview && !profile.avatar) {
      setAvatarPreview(null);
      return;
    }

    try {
      setRemovingAvatar(true);
      await axios.delete(`${API}/avatar`, {
        headers: { "x-auth-token": token },
      });
      setProfile((prev) => ({ ...prev, avatar: null }));
      setAvatarPreview(null);
      persistAvatarToStorage(null);
      showToast("Avatar removed");
    } catch (err) {
      showToast(err.response?.data?.message || "Error removing avatar", "error");
    } finally {
      setRemovingAvatar(false);
    }
  };

  const changePassword = async () => {
    if (!passwordData.current_password || !passwordData.new_password) {
      showToast("Please fill in both password fields", "error");
      return;
    }
    try {
      setChangingPassword(true);
      await axios.put(`${API}/change-password`, passwordData, {
        headers: { "x-auth-token": token },
      });
      showToast("Password changed successfully");
      setPasswordData({ current_password: "", new_password: "" });
    } catch (err) {
      showToast(err.response?.data?.message || "Error changing password", "error");
    } finally {
      setChangingPassword(false);
    }
  };

  const displayAvatar = avatarPreview || profile.avatar;

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    border: `1.5px solid ${t.inputBorder}`,
    borderRadius: "9px",
    fontSize: "0.875rem",
    color: t.textPrimary,
    backgroundColor: t.inputBg,
    fontFamily: "'DM Sans', sans-serif",
    transition: "border-color 0.18s, box-shadow 0.18s",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "0.78rem",
    fontWeight: "600",
    color: t.textMuted,
    textTransform: "uppercase",
    letterSpacing: "0.4px",
    marginBottom: "6px",
  };

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      backgroundColor: t.bg,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes spin    { to { transform:rotate(360deg); } }
        .profile-input:focus { border-color:#4F46E5 !important; box-shadow:0 0 0 3px rgba(79,70,229,.10); }
        .profile-btn { transition:opacity .18s,transform .18s,box-shadow .18s; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; }
        .profile-btn:hover:not(:disabled) { opacity:.88; transform:translateY(-1px); }
        .profile-btn:disabled { opacity:.6; cursor:not-allowed; }
        .avatar-overlay { opacity:0; transition:opacity .2s; }
        .avatar-wrapper:hover .avatar-overlay { opacity:1; }
        .topbar-btn:hover { background: ${isDark ? "#1E2535" : "#F3F4F6"} !important; }
        * { box-sizing:border-box; }
        @media (max-width: 768px) {
          .prof-main { padding: 76px 14px 32px !important; }
          .prof-fields-grid { grid-template-columns: 1fr !important; gap: 14px !important; }
          .prof-pwd-grid    { grid-template-columns: 1fr !important; gap: 14px !important; }
          .prof-page-title  { font-size: 1.5rem !important; }
          .prof-card-header { padding: 14px 16px !important; }
          .prof-card-body   { padding: 16px !important; }
          .prof-avatar-row  { flex-direction: column !important; align-items: center !important; text-align: center !important; }
          .prof-avatar-actions { flex-direction: column !important; align-items: stretch !important; }
          .prof-topbar { display: none !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .prof-main { padding: 28px 18px 40px !important; }
          .prof-fields-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .prof-pwd-grid    { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {toast && (
        <div style={{
          position: "fixed", top: "20px", right: "20px", zIndex: 9999,
          padding: "12px 20px", borderRadius: "10px",
          backgroundColor: toast.type === "error" ? t.toastErrorBg : t.toastSuccessBg,
          color: toast.type === "error" ? t.toastErrorText : t.toastSuccessText,
          border: `1px solid ${toast.type === "error" ? "#FECACA" : "#A7F3D0"}`,
          fontWeight: "500", fontSize: "0.875rem",
          animation: "slideIn 0.3s ease both",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          maxWidth: "calc(100vw - 40px)",
        }}>
          {toast.message}
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleAvatarChange}
      />

      <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <main
        className="prof-main"
        style={{
          marginLeft: `${sidebarWidth}px`,
          flex: 1,
          transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
          padding: "28px 28px 40px",
          minWidth: 0,
        }}
      >
        <div className="prof-topbar" style={{ marginBottom: "24px", animation: "fadeUp 0.4s ease both 0.05s" }}>
          <p style={{ color: t.textSecondary, fontSize: "0.875rem", margin: "0 0 4px" }}>{greeting}, <strong style={{ color: "#4F46E5" }}>{name}</strong> 👋</p>
          <p style={{ color: t.textSecondary, fontSize: "0.875rem", margin: "0 0 4px" }}>Account Settings</p>
          <h1
            className="prof-page-title"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(1.5rem, 4vw, 1.85rem)",
              fontWeight: "700", color: t.textPrimary, margin: 0, lineHeight: 1.2,
            }}
          >
            My Profile
          </h1>
          <p style={{ color: t.textMuted, fontSize: "0.85rem", margin: "5px 0 0" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: "44px", height: "44px",
                border: "3px solid #E5E7EB", borderTop: "3px solid #4F46E5",
                borderRadius: "50%", animation: "spin 0.8s linear infinite",
                margin: "0 auto 16px",
              }} />
              <p style={{ color: t.textMuted, fontWeight: "500", fontSize: "0.9rem" }}>Loading profile...</p>
            </div>
          </div>
        ) : (
          <>
            <div
              style={{
                backgroundColor: t.card, borderRadius: "14px",
                border: `1px solid ${t.border}`, boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)",
                padding: "20px 24px", marginBottom: "16px",
                animation: "fadeUp 0.4s ease both 0.07s",
                display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap",
              }}
              className="prof-avatar-row"
            >
              <div
                className="avatar-wrapper"
                style={{ position: "relative", flexShrink: 0, cursor: uploadingAvatar ? "wait" : "pointer" }}
                onClick={() => !uploadingAvatar && fileInputRef.current?.click()}
                title="Click to change photo"
              >
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt="Profile"
                    style={{
                      width: "72px", height: "72px", borderRadius: "50%",
                      objectFit: "cover", border: `3px solid ${t.avatarBorder}`, display: "block",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div style={{
                  width: "72px", height: "72px", borderRadius: "50%",
                  background: t.avatarGradient,
                  display: displayAvatar ? "none" : "flex",
                  alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: "1.4rem", fontWeight: "700",
                }}>
                  {(profile.name || "U").slice(0, 2).toUpperCase()}
                </div>
                {uploadingAvatar ? (
                  <div style={{
                    position: "absolute", inset: 0, borderRadius: "50%",
                    backgroundColor: "rgba(0,0,0,0.55)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <div style={{
                      width: "24px", height: "24px",
                      border: "2.5px solid rgba(255,255,255,0.3)",
                      borderTop: "2.5px solid #fff",
                      borderRadius: "50%", animation: "spin 0.7s linear infinite",
                    }} />
                  </div>
                ) : (
                  <div
                    className="avatar-overlay"
                    style={{
                      position: "absolute", inset: 0, borderRadius: "50%",
                      backgroundColor: "rgba(0,0,0,0.45)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff",
                    }}
                  >
                    <Camera size={20} />
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "1rem", fontWeight: "600", color: t.textPrimary }}>{profile.name || "—"}</div>
                <div style={{ fontSize: "0.82rem", color: t.textMuted, marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {profile.email || "—"}
                </div>
                <span style={{
                  display: "inline-block", marginTop: "6px",
                  fontSize: "0.7rem", fontWeight: "600", color: t.roleBadgeColor,
                  backgroundColor: t.roleBadgeBg, padding: "2px 10px", borderRadius: "20px",
                }}>
                  {profile.role}
                </span>
              </div>
              <div className="prof-avatar-actions" style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                <button
                  className="profile-btn"
                  onClick={() => !uploadingAvatar && fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "8px 14px", borderRadius: "8px",
                    backgroundColor: t.changePhotoBg, color: t.changePhotoColor,
                    fontSize: "0.8rem", fontWeight: "600",
                  }}
                >
                  <Camera size={14} />
                  {uploadingAvatar ? "Uploading..." : "Change Photo"}
                </button>

                {displayAvatar && !uploadingAvatar && (
                  <button
                    className="profile-btn"
                    onClick={removeAvatar}
                    disabled={removingAvatar}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      padding: "8px 14px", borderRadius: "8px",
                      backgroundColor: t.removePhotoBg, color: t.removePhotoColor,
                      fontSize: "0.8rem", fontWeight: "600",
                    }}
                  >
                    <Trash2 size={14} />
                    {removingAvatar ? "Removing..." : "Remove"}
                  </button>
                )}
              </div>
            </div>
            <div style={{
              backgroundColor: t.card, borderRadius: "14px",
              border: `1px solid ${t.border}`, boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)",
              overflow: "hidden", marginBottom: "16px",
              animation: "fadeUp 0.4s ease both 0.1s",
            }}>
              <div
                className="prof-card-header"
                style={{ padding: "18px 24px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: "10px" }}
              >
                <div style={{ width: "36px", height: "36px", borderRadius: "9px", backgroundColor: t.headerIconBg1, display: "flex", alignItems: "center", justifyContent: "center", color: t.headerIconColor1, flexShrink: 0 }}>
                  <User size={17} />
                </div>
                <div>
                  <h2 style={{ fontSize: "1rem", fontWeight: "600", color: t.textPrimary, margin: 0 }}>Personal Information</h2>
                  <p style={{ fontSize: "0.78rem", color: t.textMuted, margin: 0 }}>Update your profile details</p>
                </div>
              </div>

              <div className="prof-card-body" style={{ padding: "24px" }}>
                <div
                  className="prof-fields-grid"
                  style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "18px" }}
                >
                  {[
                    { label: "Full Name", name: "name", icon: <User size={13} />, type: "text" },
                    { label: "Email Address", name: "email", icon: <Mail size={13} />, type: "email" },
                    { label: "Phone Number", name: "phone", icon: <Phone size={13} />, type: "text" },
                    { label: "Department", name: "department", icon: <Building2 size={13} />, type: "text" },
                  ].map((field) => (
                    <div key={field.name}>
                      <label htmlFor={field.name} style={labelStyle}>{field.icon} {field.label}</label>
                      <input
                        id={field.name}
                        className="profile-input"
                        type={field.type}
                        name={field.name}
                        value={profile[field.name]}
                        onChange={handleChange}
                        style={inputStyle}
                      />
                    </div>
                  ))}

                  <div>
                    <label htmlFor="role" style={labelStyle}><User size={13} /> Role</label>
                    <input
                      id="role"
                      style={{ ...inputStyle, backgroundColor: t.disabledInputBg, color: t.disabledInputText, cursor: "not-allowed" }}
                      value={profile.role}
                      readOnly
                    />
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <button
                      className="profile-btn"
                      onClick={updateProfile}
                      disabled={saving}
                      style={{
                        width: "100%", padding: "12px", borderRadius: "10px",
                        fontWeight: "600", fontSize: "0.9rem",
                        backgroundColor: t.headerIconColor1, color: "#fff",
                      }}
                    >
                      {saving ? "Saving..." : "Update Profile"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div style={{
              backgroundColor: t.card, borderRadius: "14px",
              border: `1px solid ${t.border}`, boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)",
              overflow: "hidden", animation: "fadeUp 0.4s ease both 0.2s",
            }}>
              <div
                className="prof-card-header"
                style={{ padding: "18px 24px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: "10px" }}
              >
                <div style={{ width: "36px", height: "36px", borderRadius: "9px", backgroundColor: t.headerIconBg2, display: "flex", alignItems: "center", justifyContent: "center", color: t.headerIconColor2, flexShrink: 0 }}>
                  <KeyRound size={17} />
                </div>
                <div>
                  <h2 style={{ fontSize: "1rem", fontWeight: "600", color: t.textPrimary, margin: 0 }}>Change Password</h2>
                  <p style={{ fontSize: "0.78rem", color: t.textMuted, margin: 0 }}>Update your account password</p>
                </div>
              </div>

              <div className="prof-card-body" style={{ padding: "24px" }}>
                <div
                  className="prof-pwd-grid"
                  style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "18px" }}
                >
                  <div>
                    <label htmlFor="current_password" style={labelStyle}>Current Password</label>
                    <input
                      id="current_password"
                      className="profile-input" type="password"
                      placeholder="Enter current password"
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label htmlFor="new_password" style={labelStyle}>New Password</label>
                    <input
                      id="new_password"
                      className="profile-input" type="password"
                      placeholder="Enter new password"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                      style={inputStyle}
                    />
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <button
                      className="profile-btn"
                      onClick={changePassword}
                      disabled={changingPassword}
                      style={{
                        width: "100%", padding: "12px", borderRadius: "10px",
                        fontWeight: "600", fontSize: "0.9rem",
                        backgroundColor: t.headerIconColor2, color: "#fff",
                      }}
                    >
                      {changingPassword ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Profile;
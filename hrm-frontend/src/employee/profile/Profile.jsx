import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "../../layouts/sidebar";
import axios from "axios";
import { KeyRound, User, Mail, Phone, Building2 } from "lucide-react";

const API = "http://localhost:5001/api/employee";

const Profile = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    department: "General",
    role: "Employee",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
  });
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem("token");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/user-profile`, {
        headers: { "x-auth-token": token },
      });
      const data = res.data?.data || {};
      setProfile({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        department: data.department || "General",
        role: data.role || "Employee",
      });
    } catch (err) {
      console.error("Profile load error:", err);
      showToast("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const updateProfile = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("name", profile.name);
      formData.append("email", profile.email);
      formData.append("phone", profile.phone);
      formData.append("department", profile.department);

      await axios.put(`${API}/profile`, formData, {
        headers: { "x-auth-token": token },
      });

      localStorage.setItem("name", profile.name);
      window.dispatchEvent(new Event("storage"));
      showToast("Profile updated successfully");
      loadProfile();
    } catch (err) {
      console.error("Update error:", err.response?.data || err.message);
      showToast(err.response?.data?.message || "Error updating profile", "error");
    } finally {
      setSaving(false);
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

  const sidebarWidth = isOpen ? 255 : 68;

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    border: "1.5px solid #E5E7EB",
    borderRadius: "9px",
    fontSize: "0.875rem",
    color: "#374151",
    backgroundColor: "#F9FAFB",
    fontFamily: "'DM Sans', sans-serif",
    transition: "border-color 0.18s, box-shadow 0.18s",
    outline: "none",
  };

  const labelStyle = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "0.78rem",
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
    marginBottom: "6px",
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#F9FAFB",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes spin    { to { transform:rotate(360deg); } }
        .profile-input:focus { border-color:#4F46E5 !important; box-shadow:0 0 0 3px rgba(79,70,229,.10); }
        .profile-btn { transition:opacity .18s,transform .18s,box-shadow .18s; border:none; cursor:pointer; }
        .profile-btn:hover:not(:disabled) { opacity:.88; transform:translateY(-1px); }
        .profile-btn:disabled { opacity:.6; cursor:not-allowed; }
        * { box-sizing:border-box; }
      `}</style>

      {toast && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 9999,
            padding: "12px 20px",
            borderRadius: "10px",
            backgroundColor: toast.type === "error" ? "#FEF2F2" : "#ECFDF5",
            color: toast.type === "error" ? "#DC2626" : "#059669",
            border: `1px solid ${toast.type === "error" ? "#FECACA" : "#A7F3D0"}`,
            fontWeight: "500",
            fontSize: "0.875rem",
            animation: "slideIn 0.3s ease both",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          {toast.message}
        </div>
      )}

      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div
        style={{
          marginLeft: `${sidebarWidth}px`,
          flex: 1,
          transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
          padding: "28px 28px 40px",
        }}
      >
        <div style={{ marginBottom: "28px", animation: "fadeUp 0.4s ease both 0.05s" }}>
          <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0 0 4px" }}>
            Account Settings
          </p>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.85rem",
              fontWeight: "700",
              color: "#111827",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            My Profile
          </h1>
          <p style={{ color: "#9CA3AF", fontSize: "0.85rem", margin: "5px 0 0" }}>
            Manage your personal information and account settings.
          </p>
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px" }}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  border: "3px solid #E5E7EB",
                  borderTop: "3px solid #4F46E5",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  margin: "0 auto 16px",
                }}
              />
              <p style={{ color: "#6B7280", fontWeight: "500", fontSize: "0.9rem" }}>
                Loading profile...
              </p>
            </div>
          </div>
        ) : (
          <>
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "14px",
                border: "1px solid #F1F3F9",
                boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
                overflow: "hidden",
                marginBottom: "20px",
                animation: "fadeUp 0.4s ease both 0.1s",
              }}
            >
              <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F3F9", display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "9px", backgroundColor: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#4F46E5" }}>
                  <User size={17} />
                </div>
                <div>
                  <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "#111827", margin: 0 }}>
                    Personal Information
                  </h2>
                  <p style={{ fontSize: "0.78rem", color: "#9CA3AF", margin: 0 }}>
                    Update your profile details
                  </p>
                </div>
              </div>

              <div style={{ padding: "24px" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "18px",
                  }}
                >
                  {[
                    { label: "Full Name",     name: "name",       icon: <User size={13} />,      type: "text"  },
                    { label: "Email Address", name: "email",      icon: <Mail size={13} />,      type: "email" },
                    { label: "Phone Number",  name: "phone",      icon: <Phone size={13} />,     type: "text"  },
                    { label: "Department",    name: "department", icon: <Building2 size={13} />, type: "text"  },
                  ].map((field) => (
                    <div key={field.name}>
                      <label style={labelStyle}>
                        {field.icon} {field.label}
                      </label>
                      <input
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
                    <label style={labelStyle}>
                      <User size={13} /> Role
                    </label>
                    <input
                      style={{ ...inputStyle, backgroundColor: "#F3F4F6", color: "#9CA3AF", cursor: "not-allowed" }}
                      value={profile.role}
                      readOnly
                    />
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <button
                      className="profile-btn"
                      onClick={updateProfile}
                      disabled={saving}
                      style={{ width: "100%", padding: "12px", borderRadius: "10px", fontWeight: "600", fontSize: "0.9rem", backgroundColor: "#4F46E5", color: "#fff" }}
                    >
                      {saving ? "Saving..." : "Update Profile"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "14px",
                border: "1px solid #F1F3F9",
                boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
                overflow: "hidden",
                animation: "fadeUp 0.4s ease both 0.2s",
              }}
            >
              <div style={{ padding: "18px 24px", borderBottom: "1px solid #F1F3F9", display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "9px", backgroundColor: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", color: "#059669" }}>
                  <KeyRound size={17} />
                </div>
                <div>
                  <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "#111827", margin: 0 }}>
                    Change Password
                  </h2>
                  <p style={{ fontSize: "0.78rem", color: "#9CA3AF", margin: 0 }}>
                    Update your account password
                  </p>
                </div>
              </div>

              <div
                style={{
                  padding: "24px",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "18px",
                }}
              >
                <div>
                  <label style={labelStyle}>Current Password</label>
                  <input
                    className="profile-input"
                    type="password"
                    placeholder="Enter current password"
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>New Password</label>
                  <input
                    className="profile-input"
                    type="password"
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
                    style={{ width: "100%", padding: "12px", borderRadius: "10px", fontWeight: "600", fontSize: "0.9rem", backgroundColor: "#059669", color: "#fff" }}
                  >
                    {changingPassword ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../layouts/sidebar";
import { UserPlus, Eye, EyeOff, Bell, Search, MoreHorizontal } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function AddSuperadminPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "super_admin", company_id: "" });
  const [companies, setCompanies] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [superadmins, setSuperadmins] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const [search, setSearch] = useState("");

  const name = localStorage.getItem("name") || "Superadmin";
  const token = localStorage.getItem("token");
  const headers = { "x-auth-token": token };
  const sidebarWidth = isOpen ? 255 : 68;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCompanies = async () => {
    try {
      const res = await axios.get(`${API}/api/saas/companies`, { headers });
      setCompanies(res.data.data || []);
    } catch (err) { console.error("Failed to load companies"); }
  };

  const fetchSuperadmins = async () => {
    try {
      setLoadingList(true);
      const res = await axios.get(`${API}/api/saas/users`, { headers });
      const all = res.data.data || [];
      setSuperadmins(all.filter((u) => u.role === "super_admin" || u.role === "software_owner"));
    } catch (err) { console.error("Failed to load superadmins"); }
    finally { setLoadingList(false); }
  };

  useEffect(() => { fetchCompanies(); fetchSuperadmins(); }, []);

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required"); return; }
    if (!form.email.trim()) { setError("Email is required"); return; }
    if (!form.password || form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setSubmitting(true); setError("");
    try {
      await axios.post(`${API}/api/auth/register`, {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
        company_id: form.company_id || null,
      }, { headers });
      showToast(`${form.role === "software_owner" ? "Software Owner" : "Super Admin"} created successfully!`);
      setForm({ name: "", email: "", password: "", role: "super_admin", company_id: "" });
      fetchSuperadmins();
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.msg || "Something went wrong");
    } finally { setSubmitting(false); }
  };

  const roleStyle = {
    super_admin:    { bg: "#EEF2FF", color: "#4F46E5" },
    software_owner: { bg: "#FFFBEB", color: "#D97706" },
  };

  const filteredAdmins = superadmins.filter(
    (u) => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F9FAFB", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        .admin-row { transition: background 0.12s; }
        .admin-row:hover { background: #F5F7FF !important; }
        .form-field { transition: border-color 0.18s, box-shadow 0.18s; }
        .form-field:focus { outline: none; border-color: #4F46E5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.10); }
        .search-input:focus { outline: none; border-color: #4F46E5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.10); }
        .topbar-btn:hover { background: #F3F4F6 !important; }
        .submit-btn { transition: background 0.18s, transform 0.12s, box-shadow 0.18s; }
        .submit-btn:hover:not(:disabled) { background: #4338CA !important; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(79,70,229,0.3); }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        * { box-sizing: border-box; }
      `}</style>
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: toast.type === "error" ? "#EF4444" : "#059669",
          color: "#fff", padding: "12px 20px", borderRadius: "10px",
          fontWeight: 500, fontSize: "0.875rem",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          animation: "slideIn 0.25s ease both",
        }}>
          {toast.message}
        </div>
      )}

      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div style={{
        marginLeft: `${sidebarWidth}px`,
        flex: 1,
        transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column", minHeight: "100vh",
      }}>
        <div style={{
          height: "64px", backgroundColor: "#fff",
          borderBottom: "1px solid #F1F3F9",
          display: "flex", alignItems: "center",
          padding: "0 28px", gap: "16px",
          position: "sticky", top: 0, zIndex: 100,
          boxShadow: "0 1px 4px rgba(15,23,42,0.04)",
        }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "380px" }}>
            <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
            <input
              className="search-input"
              placeholder="Search anything..."
              style={{
                width: "100%", padding: "8px 12px 8px 36px",
                border: "1.5px solid #E5E7EB", borderRadius: "10px",
                fontSize: "0.875rem", color: "#374151", backgroundColor: "#F9FAFB",
                transition: "border-color 0.18s, box-shadow 0.18s",
              }}
            />
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
            <button className="topbar-btn" style={{
              width: "38px", height: "38px", borderRadius: "10px",
              border: "1.5px solid #E5E7EB", background: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#6B7280",
            }}>
              <Bell size={17} />
            </button>
            <div style={{
              display: "flex", alignItems: "center", gap: "9px",
              padding: "5px 12px 5px 6px",
              border: "1.5px solid #E5E7EB", borderRadius: "10px",
              background: "#fff", cursor: "pointer",
            }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                background: "linear-gradient(135deg, #DC2626, #B91C1C)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: "0.72rem", fontWeight: "600",
              }}>
                {name.slice(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: "0.83rem", fontWeight: "500", color: "#374151" }}>{name}</span>
            </div>
          </div>
        </div>
        <div style={{ padding: "28px 28px 40px", flex: 1 }}>
          <div style={{ marginBottom: "28px", animation: "fadeUp 0.4s ease both 0.05s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "8px",
                background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <UserPlus size={16} color="#fff" />
              </div>
              <span style={{ fontSize: "0.78rem", fontWeight: "600", color: "#4F46E5", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                User Management
              </span>
            </div>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.85rem", fontWeight: "700",
              color: "#111827", margin: 0, lineHeight: 1.2,
            }}>
              Add Super Admin
            </h1>
            <p style={{ color: "#9CA3AF", fontSize: "0.85rem", margin: "5px 0 0" }}>
              Create new super admin or software owner accounts
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "20px", alignItems: "start" }}>
            <div style={{
              backgroundColor: "#fff", borderRadius: "14px",
              border: "1px solid #F1F3F9",
              boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
              overflow: "hidden",
              animation: "fadeUp 0.4s ease both 0.1s",
            }}>
              <div style={{
                padding: "18px 22px", borderBottom: "1px solid #F1F3F9",
                display: "flex", alignItems: "center", gap: "10px",
              }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "9px",
                  background: "#EEF2FF",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <UserPlus size={17} color="#4F46E5" />
                </div>
                <div>
                  <h2 style={{ fontSize: "0.95rem", fontWeight: "600", color: "#111827", margin: 0 }}>New Account</h2>
                  <p style={{ fontSize: "0.75rem", color: "#9CA3AF", margin: 0 }}>Fill in the details below</p>
                </div>
              </div>

              <div style={{ padding: "22px" }}>
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "600", color: "#374151", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                      Full Name *
                    </label>
                    <input
                      className="form-field"
                      name="name" value={form.name} onChange={handleChange}
                      placeholder="e.g. John Doe" autoFocus
                      style={{
                        width: "100%", padding: "9px 12px",
                        border: "1.5px solid #E5E7EB", borderRadius: "9px",
                        fontSize: "0.875rem", color: "#374151", backgroundColor: "#F9FAFB",
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "600", color: "#374151", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                      Email Address *
                    </label>
                    <input
                      className="form-field"
                      type="email" name="email" value={form.email} onChange={handleChange}
                      placeholder="admin@company.com"
                      style={{
                        width: "100%", padding: "9px 12px",
                        border: "1.5px solid #E5E7EB", borderRadius: "9px",
                        fontSize: "0.875rem", color: "#374151", backgroundColor: "#F9FAFB",
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "600", color: "#374151", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                      Password *
                    </label>
                    <div style={{ display: "flex", gap: "0" }}>
                      <input
                        className="form-field"
                        type={showPassword ? "text" : "password"}
                        name="password" value={form.password} onChange={handleChange}
                        placeholder="Min. 6 characters"
                        style={{
                          flex: 1, padding: "9px 12px",
                          border: "1.5px solid #E5E7EB",
                          borderRight: "none",
                          borderRadius: "9px 0 0 9px",
                          fontSize: "0.875rem", color: "#374151", backgroundColor: "#F9FAFB",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          padding: "0 12px",
                          border: "1.5px solid #E5E7EB",
                          borderLeft: "none",
                          borderRadius: "0 9px 9px 0",
                          background: "#F9FAFB",
                          cursor: "pointer", color: "#6B7280",
                          display: "flex", alignItems: "center",
                        }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "600", color: "#374151", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                      Role *
                    </label>
                    <select
                      className="form-field"
                      name="role" value={form.role} onChange={handleChange}
                      style={{
                        width: "100%", padding: "9px 12px",
                        border: "1.5px solid #E5E7EB", borderRadius: "9px",
                        fontSize: "0.875rem", color: "#374151", backgroundColor: "#F9FAFB",
                        appearance: "none", cursor: "pointer",
                      }}
                    >
                      <option value="super_admin">Super Admin</option>
                      <option value="software_owner">Software Owner</option>
                    </select>
                    <p style={{ fontSize: "0.75rem", color: form.role === "software_owner" ? "#D97706" : "#9CA3AF", margin: "6px 0 0" }}>
                      {form.role === "software_owner"
                        ? "Software Owner has full system access."
                        : "Super Admin can manage all companies and users."}
                    </p>
                  </div>
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "600", color: "#374151", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                      Company <span style={{ color: "#9CA3AF", textTransform: "none", fontWeight: 400 }}>(optional)</span>
                    </label>
                    <select
                      className="form-field"
                      name="company_id" value={form.company_id} onChange={handleChange}
                      style={{
                        width: "100%", padding: "9px 12px",
                        border: "1.5px solid #E5E7EB", borderRadius: "9px",
                        fontSize: "0.875rem", color: "#374151", backgroundColor: "#F9FAFB",
                        appearance: "none", cursor: "pointer",
                      }}
                    >
                      <option value="">No specific company</option>
                      {companies.map((c) => (
                        <option key={c.company_id} value={c.company_id}>{c.company_name}</option>
                      ))}
                    </select>
                  </div>
                  {error && (
                    <div style={{
                      padding: "10px 14px", borderRadius: "9px",
                      background: "#FEF2F2", border: "1px solid #FECACA",
                      color: "#DC2626", fontSize: "0.82rem",
                      marginBottom: "16px",
                    }}>
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={submitting}
                    style={{
                      width: "100%", padding: "11px",
                      background: submitting ? "#9CA3AF" : "#4F46E5",
                      color: "#fff", border: "none",
                      borderRadius: "9px", fontSize: "0.875rem",
                      fontWeight: "600", cursor: submitting ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    }}
                  >
                    <UserPlus size={16} />
                    {submitting ? "Creating..." : "Create Account"}
                  </button>
                </form>
              </div>
            </div>
            <div style={{
              backgroundColor: "#fff", borderRadius: "14px",
              border: "1px solid #F1F3F9",
              boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
              overflow: "hidden",
              animation: "fadeUp 0.4s ease both 0.18s",
            }}>
              <div style={{
                padding: "18px 22px", borderBottom: "1px solid #F1F3F9",
                display: "flex", alignItems: "center",
                justifyContent: "space-between", gap: "12px", flexWrap: "wrap",
              }}>
                <div>
                  <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "#111827", margin: "0 0 2px" }}>
                    Existing Super Admins
                  </h2>
                  <p style={{ fontSize: "0.78rem", color: "#9CA3AF", margin: 0 }}>
                    {filteredAdmins.length} {filteredAdmins.length === 1 ? "record" : "records"} found
                  </p>
                </div>
                <div style={{ position: "relative" }}>
                  <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                  <input
                    className="search-input"
                    placeholder="Search admins..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                      padding: "8px 12px 8px 32px",
                      border: "1.5px solid #E5E7EB", borderRadius: "9px",
                      fontSize: "0.82rem", color: "#374151",
                      backgroundColor: "#F9FAFB", width: "200px",
                      transition: "border-color 0.18s, box-shadow 0.18s",
                    }}
                  />
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#FAFBFF" }}>
                      {["#", "Admin", "Email", "Role", "Company", "Created"].map((h, i) => (
                        <th key={i} style={{
                          padding: "11px 22px", textAlign: "left",
                          fontSize: "0.72rem", fontWeight: "600",
                          color: "#9CA3AF", textTransform: "uppercase",
                          letterSpacing: "0.5px", borderBottom: "1px solid #F1F3F9",
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loadingList ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i}>
                          {[30, 140, 180, 100, 100, 90].map((w, j) => (
                            <td key={j} style={{ padding: "14px 22px" }}>
                              <div style={{ height: "14px", width: `${w}px`, background: "#F3F4F6", borderRadius: "4px" }} />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : filteredAdmins.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ padding: "40px", textAlign: "center", color: "#9CA3AF", fontSize: "0.875rem" }}>
                          No super admins found
                        </td>
                      </tr>
                    ) : (
                      filteredAdmins.map((u, i) => {
                        const rs = roleStyle[u.role] || { bg: "#F1F5F9", color: "#64748B" };
                        return (
                          <tr key={u.user_id} className="admin-row" style={{ borderBottom: "1px solid #F9FAFB" }}>
                            <td style={{ padding: "13px 22px", fontSize: "0.82rem", color: "#9CA3AF", fontWeight: "500" }}>
                              {String(i + 1).padStart(2, "0")}
                            </td>
                            <td style={{ padding: "13px 22px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div style={{
                                  width: "32px", height: "32px", borderRadius: "50%",
                                  background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  color: "#fff", fontSize: "0.75rem", fontWeight: "600", flexShrink: 0,
                                }}>
                                  {(u.name || "U").charAt(0).toUpperCase()}
                                </div>
                                <span style={{ fontSize: "0.875rem", fontWeight: "500", color: "#111827" }}>{u.name}</span>
                              </div>
                            </td>
                            <td style={{ padding: "13px 22px", fontSize: "0.855rem", color: "#6B7280" }}>{u.email}</td>
                            <td style={{ padding: "13px 22px" }}>
                              <span style={{
                                padding: "3px 10px", borderRadius: "20px",
                                fontSize: "0.72rem", fontWeight: "600",
                                backgroundColor: rs.bg, color: rs.color,
                              }}>
                                {u.role}
                              </span>
                            </td>
                            <td style={{ padding: "13px 22px", fontSize: "0.855rem", color: "#6B7280" }}>
                              {u.company_name || "—"}
                            </td>
                            <td style={{ padding: "13px 22px", fontSize: "0.855rem", color: "#6B7280" }}>
                              {u.created_at
                                ? new Date(u.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                                : "—"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {!loadingList && filteredAdmins.length > 0 && (
                <div style={{
                  padding: "12px 22px", borderTop: "1px solid #F1F3F9",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <span style={{ fontSize: "0.78rem", color: "#9CA3AF" }}>
                    Showing {filteredAdmins.length} of {superadmins.length} admins
                  </span>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
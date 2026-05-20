import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../../layouts/sidebar";
import { Search, Bell, Building2, Plus, Pencil, Trash2, Clock, X, Check } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formName, setFormName] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  const name = localStorage.getItem("name") || "Admin";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const token = localStorage.getItem("token");
  const headers = { "x-auth-token": token };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/departments`, { headers });
      setDepartments(res.data.data || []);
    } catch {
      showToast("Failed to load departments", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepartments(); }, []);

  const openAdd = () => { setEditItem(null); setFormName(""); setFormError(""); setModalOpen(true); };
  const openEdit = (dept) => { setEditItem(dept); setFormName(dept.department_name); setFormError(""); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditItem(null); setFormName(""); setFormError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim()) { setFormError("Department name is required"); return; }
    setSubmitting(true); setFormError("");
    try {
      if (editItem) {
        console.log(editItem)
        await axios.put(`${API}/api/departments/${editItem._id}`, { department_name: formName }, { headers });
        showToast("Department updated successfully");
      } else {
        await axios.post(`${API}/api/departments`, { department_name: formName }, { headers });
        showToast("Department created successfully");
      }
      closeModal(); fetchDepartments();
    } catch (err) {
      setFormError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/api/departments/${id}`, { headers });
      showToast("Department deleted");
      setDeleteConfirm(null); fetchDepartments();
    } catch (err) {
      showToast(err.response?.data?.message || "Delete failed", "error");
      setDeleteConfirm(null);
    }
  };

  const filtered = departments.filter((d) =>
    d.department_name.toLowerCase().includes(search.toLowerCase())
  );

  const sidebarWidth = isOpen ? 255 : 68;

  const DEPT_COLORS = ["#4F46E5","#059669","#0891B2","#D97706","#7C3AED","#DB2777"];
  const getDeptColor = (name) => DEPT_COLORS[(name?.charCodeAt(0) || 0) % DEPT_COLORS.length];

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F9FAFB", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        .dept-row { transition: background 0.12s; }
        .dept-row:hover { background: #F5F7FF !important; }
        .search-input:focus { outline: none; border-color: #4F46E5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.10); }
        .topbar-btn:hover { background: #F3F4F6 !important; }
        .action-btn { transition: background 0.15s, transform 0.12s; }
        .action-btn:hover { transform: translateY(-1px); }
        * { box-sizing: border-box; }
      `}</style>
      {toast && (
        <div style={{
          position: "fixed", top: "20px", right: "20px",
          background: toast.type === "error" ? "#EF4444" : "#059669",
          color: "#fff", padding: "12px 20px", borderRadius: "12px",
          fontWeight: "500", fontSize: "0.875rem", zIndex: 9999,
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", gap: "8px",
          animation: "slideIn 0.2s ease both",
        }}>
          {toast.type === "error" ? <X size={15} /> : <Check size={15} />}
          {toast.message}
        </div>
      )}

      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div style={{
        marginLeft: `${sidebarWidth}px`, flex: 1,
        transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column", minHeight: "100vh",
      }}>
        <div style={{
          height: "64px", backgroundColor: "#fff", borderBottom: "1px solid #F1F3F9",
          display: "flex", alignItems: "center", padding: "0 28px", gap: "16px",
          position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 4px rgba(15,23,42,0.04)",
        }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "380px" }}>
            <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
            <input className="search-input" placeholder="Search anything..." style={{
              width: "100%", padding: "8px 12px 8px 36px", border: "1.5px solid #E5E7EB",
              borderRadius: "10px", fontSize: "0.875rem", color: "#374151", backgroundColor: "#F9FAFB",
            }} />
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
            <button className="topbar-btn" style={{
              width: "38px", height: "38px", borderRadius: "10px", border: "1.5px solid #E5E7EB",
              background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#6B7280", position: "relative",
            }}>
              <Bell size={17} />
              <span style={{ position: "absolute", top: "8px", right: "8px", width: "7px", height: "7px", borderRadius: "50%", background: "#EF4444", border: "1.5px solid #fff" }} />
            </button>
            <div style={{
              display: "flex", alignItems: "center", gap: "9px", padding: "5px 12px 5px 6px",
              border: "1.5px solid #E5E7EB", borderRadius: "10px", background: "#fff", cursor: "pointer",
            }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
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
          <div style={{ marginBottom: "28px", animation: "fadeUp 0.4s ease both 0.05s", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0 0 4px" }}>
                {greeting}, <strong style={{ color: "#4F46E5" }}>{name}</strong> 👋
              </p>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.85rem", fontWeight: "700", color: "#111827", margin: 0, lineHeight: 1.2 }}>
                Departments
              </h1>
              <p style={{ color: "#9CA3AF", fontSize: "0.85rem", margin: "5px 0 0" }}>
                {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            <button
              onClick={openAdd}
              style={{
                display: "flex", alignItems: "center", gap: "7px",
                background: "#4F46E5", color: "#fff", border: "none",
                borderRadius: "11px", padding: "10px 18px",
                fontWeight: "600", fontSize: "0.875rem", cursor: "pointer",
                boxShadow: "0 4px 14px rgba(79,70,229,0.28)",
                fontFamily: "'DM Sans', sans-serif",
                transition: "box-shadow 0.18s, transform 0.18s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(79,70,229,0.35)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 14px rgba(79,70,229,0.28)"; }}
            >
              <Plus size={16} /> Add Department
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "16px", marginBottom: "28px" }}>
            <div className="stat-card" style={{
              backgroundColor: "#fff", borderRadius: "14px", padding: "20px",
              border: "1px solid #F1F3F9", boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
              animation: "fadeUp 0.4s ease both 0.1s",
            }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "11px", backgroundColor: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#4F46E5", marginBottom: "14px" }}>
                <Building2 size={20} />
              </div>
              <div style={{ fontSize: "0.78rem", color: "#9CA3AF", fontWeight: "500", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.4px" }}>Total Departments</div>
              <div style={{ fontSize: "2rem", fontWeight: "700", color: "#111827", lineHeight: 1, fontFamily: "'Playfair Display', serif" }}>
                {loading ? <span style={{ display: "inline-block", width: "60px", height: "32px", background: "#F3F4F6", borderRadius: "6px" }} /> : departments.length}
              </div>
            </div>
          </div>
          <div style={{
            backgroundColor: "#fff", borderRadius: "14px", border: "1px solid #F1F3F9",
            boxShadow: "0 2px 8px rgba(15,23,42,0.05)", overflow: "hidden",
            animation: "fadeUp 0.4s ease both 0.2s",
          }}>
            <div style={{
              padding: "18px 22px", borderBottom: "1px solid #F1F3F9",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap",
            }}>
              <div>
                <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "#111827", margin: "0 0 2px" }}>Department Directory</h2>
                <p style={{ fontSize: "0.78rem", color: "#9CA3AF", margin: 0 }}>{filtered.length} {filtered.length === 1 ? "record" : "records"} found</p>
              </div>
              <div style={{ position: "relative" }}>
                <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                <input
                  className="search-input"
                  placeholder="Search departments..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    padding: "8px 12px 8px 32px", border: "1.5px solid #E5E7EB",
                    borderRadius: "9px", fontSize: "0.82rem", color: "#374151",
                    backgroundColor: "#F9FAFB", width: "220px",
                    transition: "border-color 0.18s, box-shadow 0.18s",
                  }}
                />
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#FAFBFF" }}>
                    {["#", "Department", "Actions"].map((h, i) => (
                      <th key={i} style={{
                        padding: "11px 22px", textAlign: i === 2 ? "right" : "left",
                        fontSize: "0.72rem", fontWeight: "600", color: "#9CA3AF",
                        textTransform: "uppercase", letterSpacing: "0.5px",
                        borderBottom: "1px solid #F1F3F9",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        {[40, 200, 120].map((w, j) => (
                          <td key={j} style={{ padding: "14px 22px" }}>
                            <div style={{ height: "14px", width: `${w}px`, background: "#F3F4F6", borderRadius: "4px", marginLeft: j === 2 ? "auto" : 0 }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan="3" style={{ padding: "40px", textAlign: "center", color: "#9CA3AF", fontSize: "0.875rem" }}>
                        {search ? "No departments match your search." : "No departments yet. Add one!"}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((dept, i) => {
                      const color = getDeptColor(dept.department_name);
                      return (
                        <tr key={dept.department_id} className="dept-row" style={{ borderBottom: "1px solid #F9FAFB" }}>
                          <td style={{ padding: "13px 22px", fontSize: "0.82rem", color: "#9CA3AF", fontWeight: "500" }}>
                            {String(i + 1).padStart(2, "0")}
                          </td>
                          <td style={{ padding: "13px 22px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <div style={{
                                width: "32px", height: "32px", borderRadius: "50%",
                                background: color + "22",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: color, fontSize: "0.8rem", fontWeight: "700", flexShrink: 0,
                              }}>
                                {dept.department_name.charAt(0).toUpperCase()}
                              </div>
                              <span style={{ fontSize: "0.875rem", fontWeight: "500", color: "#111827" }}>
                                {dept.department_name}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: "13px 22px", textAlign: "right" }}>
                            <button
                              className="action-btn"
                              onClick={() => openEdit(dept)}
                              style={{
                                display: "inline-flex", alignItems: "center", gap: "5px",
                                background: "#EEF2FF", color: "#4F46E5", border: "none",
                                borderRadius: "8px", padding: "6px 12px",
                                fontSize: "0.78rem", fontWeight: "600", cursor: "pointer",
                                marginRight: "6px", fontFamily: "'DM Sans', sans-serif",
                              }}
                            >
                              <Pencil size={13} /> Edit
                            </button>
                            <button
                              className="action-btn"
                              onClick={() => setDeleteConfirm(dept)}
                              style={{
                                display: "inline-flex", alignItems: "center", gap: "5px",
                                background: "#FFF1F2", color: "#EF4444", border: "none",
                                borderRadius: "8px", padding: "6px 12px",
                                fontSize: "0.78rem", fontWeight: "600", cursor: "pointer",
                                fontFamily: "'DM Sans', sans-serif",
                              }}
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {!loading && filtered.length > 0 && (
              <div style={{ padding: "12px 22px", borderTop: "1px solid #F1F3F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.78rem", color: "#9CA3AF" }}>Showing {filtered.length} of {departments.length} departments</span>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <Clock size={12} style={{ color: "#9CA3AF" }} />
                  <span style={{ fontSize: "0.72rem", color: "#9CA3AF" }}>Updated just now</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {modalOpen && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div style={{
            background: "#fff", borderRadius: "18px", padding: "32px", width: "420px",
            boxShadow: "0 24px 64px rgba(15,23,42,0.18)", animation: "slideIn 0.2s ease both",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.25rem", fontWeight: "700", color: "#111827", margin: 0 }}>
                {editItem ? "Edit Department" : "Add Department"}
              </h2>
              <button onClick={closeModal} style={{ background: "#F1F3F9", border: "none", borderRadius: "8px", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280" }}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "600", color: "#374151", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                Department Name <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Human Resources"
                autoFocus
                style={{
                  width: "100%", padding: "11px 14px", border: "1.5px solid #E5E7EB",
                  borderRadius: "10px", fontSize: "0.875rem", color: "#111827",
                  outline: "none", fontFamily: "'DM Sans', sans-serif",
                  transition: "border-color 0.18s, box-shadow 0.18s",
                }}
                onFocus={(e) => { e.target.style.borderColor = "#4F46E5"; e.target.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.10)"; }}
                onBlur={(e) => { e.target.style.borderColor = "#E5E7EB"; e.target.style.boxShadow = "none"; }}
              />
              {formError && (
                <p style={{ color: "#EF4444", fontSize: "0.78rem", margin: "8px 0 0", fontWeight: "500" }}>{formError}</p>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
                <button type="button" onClick={closeModal} style={{
                  background: "#F1F5F9", color: "#64748b", border: "none", borderRadius: "10px",
                  padding: "10px 20px", fontWeight: "600", fontSize: "0.875rem", cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{
                  background: "#4F46E5", color: "#fff", border: "none", borderRadius: "10px",
                  padding: "10px 20px", fontWeight: "600", fontSize: "0.875rem", cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", opacity: submitting ? 0.7 : 1,
                  boxShadow: "0 4px 12px rgba(79,70,229,0.25)",
                }}>
                  {submitting ? "Saving..." : editItem ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteConfirm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div style={{
            background: "#fff", borderRadius: "18px", padding: "32px", width: "400px",
            boxShadow: "0 24px 64px rgba(15,23,42,0.18)", animation: "slideIn 0.2s ease both",
          }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "12px", background: "#FFF1F2",
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px",
            }}>
              <Trash2 size={22} style={{ color: "#EF4444" }} />
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.15rem", fontWeight: "700", color: "#111827", margin: "0 0 8px" }}>
              Delete Department
            </h2>
            <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0 0 24px", lineHeight: 1.6 }}>
              Are you sure you want to delete <strong style={{ color: "#111827" }}>"{deleteConfirm.department_name}"</strong>? This action cannot be undone.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={() => setDeleteConfirm(null)} style={{
                background: "#F1F5F9", color: "#64748b", border: "none", borderRadius: "10px",
                padding: "10px 20px", fontWeight: "600", fontSize: "0.875rem", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm._id)} style={{
                background: "#EF4444", color: "#fff", border: "none", borderRadius: "10px",
                padding: "10px 20px", fontWeight: "600", fontSize: "0.875rem", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", boxShadow: "0 4px 12px rgba(239,68,68,0.25)",
              }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../src/layouts/sidebar";
import { Plus, Trash2, Bell, Search, Clock, Briefcase, Building2 } from "lucide-react";

const Designations = () => {
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [designationName, setDesignationName] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const name = localStorage.getItem("name") || "Admin";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const sidebarWidth = isOpen ? 255 : 68;

  const fetchDesignations = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5001/api/designations");
      const list = res.data.data || res.data.designations || res.data || [];
      setDesignations(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
      setDesignations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDesignations(); }, []);

  const addDesignation = async (e) => {
    e.preventDefault();
    if (!designationName.trim() || !companyId.trim()) return;
    setIsSubmitting(true);
    try {
      await axios.post("http://localhost:5001/api/designations", {
        designation_name: designationName.trim(),
        company_id: companyId.trim(),
      });
      setDesignationName("");
      setCompanyId("");
      setShowModal(false);
      fetchDesignations();
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Failed to add designation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteDesignation = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/api/designations/${id}`);
      setDeleteConfirm(null);
      fetchDesignations();
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    }
  };

  const filtered = designations.filter(
    (d) =>
      (d.designation_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (d.company_id?.company_name || "").toLowerCase().includes(search.toLowerCase())
  );
  const uniqueCompanies = [...new Set(designations.map((d) => d.company_id?.company_name).filter(Boolean))].length;

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F9FAFB", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .stat-card { transition: transform 0.18s, box-shadow 0.18s; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(15,23,42,0.10) !important; }
        .des-row { transition: background 0.12s; }
        .des-row:hover { background: #F5F7FF !important; }
        .search-input:focus { outline: none; border-color: #4F46E5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.10); }
        .topbar-btn:hover { background: #F3F4F6 !important; }
        .del-btn { transition: background 0.12s, transform 0.12s; }
        .del-btn:hover { background: #FFF1F2 !important; transform: scale(1.05); }
        .modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.45); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-box { background: #fff; border-radius: 16px; padding: 28px; width: 100%; max-width: 440px; box-shadow: 0 20px 60px rgba(15,23,42,0.15); }
        .form-input { width: 100%; padding: 9px 13px; border: 1.5px solid #E5E7EB; border-radius: 9px; font-size: 0.875rem; color: #374151; background: #F9FAFB; font-family: inherit; transition: border-color 0.18s, box-shadow 0.18s; }
        .form-input:focus { outline: none; border-color: #4F46E5; box-shadow: 0 0 0 3px rgba(79,70,229,0.10); }
        * { box-sizing: border-box; }
      `}</style>

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
            <input
              className="search-input"
              placeholder="Search designations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "8px 12px 8px 36px", border: "1.5px solid #E5E7EB",
                borderRadius: "10px", fontSize: "0.875rem", color: "#374151", backgroundColor: "#F9FAFB",
                transition: "border-color 0.18s, box-shadow 0.18s",
              }}
            />
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
          <div style={{ marginBottom: "28px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", animation: "fadeUp 0.4s ease both 0.05s" }}>
            <div>
              <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0 0 4px" }}>
                {greeting}, <strong style={{ color: "#4F46E5" }}>{name}</strong> 👋
              </p>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.85rem", fontWeight: "700", color: "#111827", margin: 0, lineHeight: 1.2 }}>
                Designations
              </h1>
              <p style={{ color: "#9CA3AF", fontSize: "0.85rem", margin: "5px 0 0" }}>
                {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              style={{
                display: "flex", alignItems: "center", gap: "7px",
                padding: "10px 18px", backgroundColor: "#4F46E5", color: "#fff",
                border: "none", borderRadius: "10px", fontSize: "0.875rem",
                fontWeight: "500", cursor: "pointer", fontFamily: "inherit",
                boxShadow: "0 2px 8px rgba(79,70,229,0.25)",
              }}
            >
              <Plus size={16} />
              Add Designation
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "16px", marginBottom: "28px" }}>
            {[
              { title: "Total Designations", count: designations.length, icon: <Briefcase size={20} />, color: "#4F46E5", bg: "#EEF2FF", trend: "All roles", trendUp: true },
              { title: "Companies", count: uniqueCompanies, icon: <Building2 size={20} />, color: "#059669", bg: "#ECFDF5", trend: "Organisations", trendUp: true },
              { title: "Filtered Results", count: filtered.length, icon: <Search size={20} />, color: "#D97706", bg: "#FFFBEB", trend: "Current view", trendUp: true },
            ].map((stat, idx) => (
              <div key={idx} className="stat-card" style={{
                backgroundColor: "#fff", borderRadius: "14px", padding: "20px",
                border: "1px solid #F1F3F9", boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
                animation: `fadeUp 0.4s ease both ${0.1 + idx * 0.07}s`,
              }}>
                <div style={{ marginBottom: "14px" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "11px", backgroundColor: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", color: stat.color }}>
                    {stat.icon}
                  </div>
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <div style={{ fontSize: "0.78rem", color: "#9CA3AF", fontWeight: "500", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.4px" }}>{stat.title}</div>
                  <div style={{ fontSize: "2rem", fontWeight: "700", color: "#111827", lineHeight: 1, fontFamily: "'Playfair Display', serif" }}>
                    {loading ? <span style={{ display: "inline-block", width: "60px", height: "32px", background: "#F3F4F6", borderRadius: "6px" }} /> : stat.count}
                  </div>
                </div>
                <span style={{ fontSize: "0.75rem", color: stat.trendUp ? "#059669" : "#D97706", fontWeight: "500" }}>{stat.trend}</span>
              </div>
            ))}
          </div>
          <div style={{
            backgroundColor: "#fff", borderRadius: "14px", border: "1px solid #F1F3F9",
            boxShadow: "0 2px 8px rgba(15,23,42,0.05)", overflow: "hidden",
            animation: "fadeUp 0.4s ease both 0.35s",
          }}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid #F1F3F9", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
              <div>
                <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "#111827", margin: "0 0 2px" }}>Designation List</h2>
                <p style={{ fontSize: "0.78rem", color: "#9CA3AF", margin: 0 }}>
                  {filtered.length} {filtered.length === 1 ? "designation" : "designations"} found
                </p>
              </div>
              <div style={{ position: "relative" }}>
                <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                <input
                  className="search-input"
                  placeholder="Search by name or company..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    padding: "8px 12px 8px 32px", border: "1.5px solid #E5E7EB",
                    borderRadius: "9px", fontSize: "0.82rem", color: "#374151",
                    backgroundColor: "#F9FAFB", width: "240px",
                    transition: "border-color 0.18s, box-shadow 0.18s",
                  }}
                />
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#FAFBFF" }}>
                    {["#", "Designation", "Company", "Action"].map((h, i) => (
                      <th key={i} style={{
                        padding: "11px 22px",
                        textAlign: i === 3 ? "right" : "left",
                        fontSize: "0.72rem", fontWeight: "600", color: "#9CA3AF",
                        textTransform: "uppercase", letterSpacing: "0.5px",
                        borderBottom: "1px solid #F1F3F9",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {[40, 180, 160, 60].map((w, j) => (
                          <td key={j} style={{ padding: "14px 22px" }}>
                            <div style={{ height: "14px", width: `${w}px`, background: "#F3F4F6", borderRadius: "4px" }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ padding: "40px", textAlign: "center", color: "#9CA3AF", fontSize: "0.875rem" }}>
                        No designations found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((d, i) => (
                      <tr key={d._id} className="des-row" style={{ borderBottom: "1px solid #F9FAFB" }}>
                        <td style={{ padding: "13px 22px", fontSize: "0.82rem", color: "#9CA3AF", fontWeight: "500" }}>
                          {String(i + 1).padStart(2, "0")}
                        </td>
                        <td style={{ padding: "13px 22px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{
                              width: "32px", height: "32px", borderRadius: "9px",
                              background: `hsl(${(d.designation_name?.charCodeAt(0) || 65) * 5 % 360}, 55%, 92%)`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: `hsl(${(d.designation_name?.charCodeAt(0) || 65) * 5 % 360}, 55%, 38%)`,
                              flexShrink: 0,
                            }}>
                              <Briefcase size={14} />
                            </div>
                            <div>
                              <div style={{ fontSize: "0.875rem", fontWeight: "500", color: "#111827" }}>{d.designation_name}</div>
                              <div style={{ fontSize: "0.72rem", color: "#9CA3AF" }}>ID: {d._id?.slice(-6)}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "13px 22px" }}>
                          {d.company_id?.company_name ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <div style={{ width: "24px", height: "24px", borderRadius: "6px", backgroundColor: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Building2 size={12} color="#4F46E5" />
                              </div>
                              <span style={{ fontSize: "0.855rem", color: "#374151" }}>{d.company_id.company_name}</span>
                            </div>
                          ) : (
                            <span style={{ fontSize: "0.855rem", color: "#9CA3AF" }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: "13px 22px", textAlign: "right" }}>
                          {deleteConfirm === d._id ? (
                            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ fontSize: "0.75rem", color: "#6B7280" }}>Confirm?</span>
                              <button
                                onClick={() => deleteDesignation(d._id)}
                                style={{ padding: "4px 10px", background: "#DC2626", color: "#fff", border: "none", borderRadius: "7px", fontSize: "0.75rem", cursor: "pointer", fontFamily: "inherit" }}
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                style={{ padding: "4px 10px", background: "#F9FAFB", color: "#374151", border: "1.5px solid #E5E7EB", borderRadius: "7px", fontSize: "0.75rem", cursor: "pointer", fontFamily: "inherit" }}
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button
                              className="del-btn"
                              onClick={() => setDeleteConfirm(d._id)}
                              style={{
                                width: "32px", height: "32px", borderRadius: "8px",
                                border: "1.5px solid #FECDD3", backgroundColor: "#FFF1F2",
                                color: "#DC2626", display: "inline-flex", alignItems: "center",
                                justifyContent: "center", cursor: "pointer",
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!loading && filtered.length > 0 && (
              <div style={{ padding: "12px 22px", borderTop: "1px solid #F1F3F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.78rem", color: "#9CA3AF" }}>
                  Showing {filtered.length} of {designations.length} designations
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <Clock size={12} style={{ color: "#9CA3AF" }} />
                  <span style={{ fontSize: "0.72rem", color: "#9CA3AF" }}>Updated just now</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#111827", margin: "0 0 2px", fontFamily: "'Playfair Display', serif" }}>Add Designation</h2>
                <p style={{ fontSize: "0.78rem", color: "#9CA3AF", margin: 0 }}>Enter the designation details below</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ width: "32px", height: "32px", borderRadius: "8px", border: "1.5px solid #E5E7EB", background: "#F9FAFB", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "1rem", color: "#6B7280" }}>×</button>
            </div>

            <form onSubmit={addDesignation}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>Designation Name</label>
                <input
                  className="form-input"
                  placeholder="e.g. Software Engineer"
                  value={designationName}
                  onChange={(e) => setDesignationName(e.target.value)}
                  required
                />
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "500", color: "#374151", marginBottom: "6px" }}>Company Object ID</label>
                <input
                  className="form-input"
                  placeholder="MongoDB ObjectId"
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  required
                />
                <p style={{ fontSize: "0.75rem", color: "#9CA3AF", margin: "5px 0 0" }}>Enter the company's MongoDB ObjectId</p>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{
                  flex: 1, padding: "10px", border: "1.5px solid #E5E7EB", borderRadius: "10px",
                  background: "#fff", fontSize: "0.875rem", fontWeight: "500", color: "#374151",
                  cursor: "pointer", fontFamily: "inherit",
                }}>
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} style={{
                  flex: 1, padding: "10px", border: "none", borderRadius: "10px",
                  background: "#4F46E5", fontSize: "0.875rem", fontWeight: "500", color: "#fff",
                  cursor: isSubmitting ? "not-allowed" : "pointer", fontFamily: "inherit",
                  boxShadow: "0 2px 8px rgba(79,70,229,0.25)", opacity: isSubmitting ? 0.7 : 1,
                }}>
                  {isSubmitting ? "Adding..." : "Add Designation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Designations;
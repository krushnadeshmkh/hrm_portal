import React, { useEffect, useState } from "react";
import Sidebar from "../../layouts/sidebar";
import axios from "axios";
import { Star, Award, Search, Heart } from "lucide-react";

const API = "http://localhost:5001/api/appreciations";

const typeColors = {
  general:          { bg: "#FFFBEB", color: "#F59E0B", label: "General"          },
  performance:      { bg: "#EEF2FF", color: "#6366F1", label: "Performance"      },
  teamwork:         { bg: "#ECFDF5", color: "#10B981", label: "Teamwork"         },
  innovation:       { bg: "#EFF6FF", color: "#3B82F6", label: "Innovation"       },
  leadership:       { bg: "#F5F3FF", color: "#8B5CF6", label: "Leadership"       },
  customer_service: { bg: "#FDF2F8", color: "#EC4899", label: "Customer Service" },
};

const getTypeStyle = (t) => typeColors[t] || typeColors.general;

const EmployeeAppreciations = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [appreciations, setAppreciations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem("token");
  const sidebarWidth = isOpen ? 255 : 68;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadAppreciations = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/my`, {
        headers: { "x-auth-token": token },
      });
      const raw = res.data?.data || [];
      setAppreciations(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error("Appreciations load error:", err);
      showToast("Failed to load appreciations", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppreciations();
  }, []);

  const filtered = appreciations.filter((a) => {
    const text = `${a.title || ""} ${a.message || ""} ${a.employee_name || ""} ${a.appreciation_type || ""}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const inputStyle = {
    padding: "9px 14px 9px 38px",
    border: "1.5px solid #E5E7EB",
    borderRadius: "9px",
    fontSize: "0.875rem",
    color: "#374151",
    backgroundColor: "#F9FAFB",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    width: "260px",
    transition: "border-color 0.18s, box-shadow 0.18s",
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
        @keyframes pulse   { 0%,100%{ transform:scale(1); } 50%{ transform:scale(1.12); } }
        .appr-search:focus { border-color:#4F46E5 !important; box-shadow:0 0 0 3px rgba(79,70,229,.10); }
        .appr-card { transition: box-shadow 0.2s, transform 0.2s; }
        .appr-card:hover { box-shadow: 0 6px 24px rgba(79,70,229,0.10); transform: translateY(-2px); }
        .heart { animation: pulse 2.4s ease-in-out infinite; display:inline-block; }
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
          <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0 0 4px" }}>Recognition</p>
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
            My Appreciations
          </h1>
          <p style={{ color: "#9CA3AF", fontSize: "0.85rem", margin: "5px 0 0" }}>
            Recognition awarded to you by your team.
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "14px",
            border: "1px solid #F1F3F9",
            boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
            overflow: "hidden",
            animation: "fadeUp 0.4s ease both 0.1s",
          }}
        >
          <div
            style={{
              padding: "18px 24px",
              borderBottom: "1px solid #F1F3F9",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "9px",
                  backgroundColor: "#FEF3C7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#D97706",
                }}
              >
                <Award size={17} />
              </div>
              <div>
                <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "#111827", margin: 0 }}>
                  Wall of Recognition
                </h2>
                <p style={{ fontSize: "0.78rem", color: "#9CA3AF", margin: 0 }}>
                  {appreciations.length} appreciation{appreciations.length !== 1 ? "s" : ""} received
                </p>
              </div>
            </div>

            <div style={{ position: "relative" }}>
              <Search
                size={14}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9CA3AF",
                  pointerEvents: "none",
                }}
              />
              <input
                className="appr-search"
                placeholder="Search appreciations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ padding: "24px" }}>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "240px" }}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      border: "3px solid #E5E7EB",
                      borderTop: "3px solid #D97706",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                      margin: "0 auto 14px",
                    }}
                  />
                  <p style={{ color: "#6B7280", fontWeight: "500", fontSize: "0.875rem" }}>
                    Loading appreciations...
                  </p>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: "40px 24px", textAlign: "center" }}>
                <Heart size={40} style={{ color: "#E5E7EB", marginBottom: "12px" }} />
                <p style={{ color: "#9CA3AF", fontSize: "0.9rem", margin: 0 }}>
                  {search ? "No appreciations match your search." : "No appreciations have been received yet."}
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "16px",
                }}
              >
                {filtered.map((item, i) => {
                  const cs = getTypeStyle(item.appreciation_type);
                  return (
                    <div
                      key={item._id}
                      className="appr-card"
                      style={{
                        backgroundColor: "#fff",
                        border: "1px solid #F1F3F9",
                        borderRadius: "12px",
                        padding: "20px",
                        boxShadow: "0 1px 4px rgba(15,23,42,0.05)",
                        animation: `fadeUp 0.4s ease both ${0.05 + i * 0.04}s`,
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              backgroundColor: cs.bg,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <Star size={15} style={{ color: cs.color }} />
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: "600", fontSize: "0.875rem", color: "#111827" }}>
                              {item.title || "Recognition"}
                            </p>
                            <span
                              style={{
                                fontSize: "0.7rem",
                                fontWeight: "600",
                                padding: "2px 8px",
                                borderRadius: "20px",
                                backgroundColor: cs.bg,
                                color: cs.color,
                              }}
                            >
                              {cs.label}
                            </span>
                          </div>
                        </div>
                        <span className="heart">
                          <Heart size={16} style={{ color: "#F87171", flexShrink: 0, marginTop: "2px" }} />
                        </span>
                      </div>

                      {item.message && (
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.855rem",
                            color: "#4B5563",
                            lineHeight: 1.6,
                            borderLeft: `3px solid ${cs.color}`,
                            paddingLeft: "10px",
                            fontStyle: "italic",
                          }}
                        >
                          {item.message}
                        </p>
                      )}

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          paddingTop: "10px",
                          borderTop: "1px solid #F1F3F9",
                        }}
                      >
                        <p style={{ margin: 0, fontSize: "0.78rem", color: "#374151", fontWeight: "500" }}>
                          {item.employee_name || "—"}
                        </p>
                        <span style={{ fontSize: "0.72rem", color: "#9CA3AF" }}>
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAppreciations;
import React, { useEffect, useState } from "react";
import Sidebar from "../../layouts/sidebar";
import axios from "axios";
import { ShieldCheck, FileText, Download, Eye, Search } from "lucide-react";

const API = "http://localhost:5001/api/policies";
const BASE_URL = "http://localhost:5001";

const EmployeePolicies = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem("token");
  const sidebarWidth = isOpen ? 255 : 68;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API, {
        headers: { "x-auth-token": token },
      });
      setPolicies(res.data || []);
    } catch (err) {
      console.error("Policies load error:", err);
      showToast("Failed to load policies", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  const filtered = policies.filter((p) =>
    p.title?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
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
        .policy-search:focus { border-color:#4F46E5 !important; box-shadow:0 0 0 3px rgba(79,70,229,.10); }
        .policy-row { transition: background 0.15s; }
        .policy-row:hover { background: #F5F7FF !important; }
        .icon-btn { border:none; cursor:pointer; transition: opacity 0.15s, transform 0.15s; background: transparent; }
        .icon-btn:hover { opacity:0.75; transform:scale(1.08); }
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
            Company Documents
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
            Policies
          </h1>
          <p style={{ color: "#9CA3AF", fontSize: "0.85rem", margin: "5px 0 0" }}>
            View and download all company policies shared with you.
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
                  backgroundColor: "#EEF2FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#4F46E5",
                }}
              >
                <ShieldCheck size={17} />
              </div>
              <div>
                <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "#111827", margin: 0 }}>
                  Company Policies
                </h2>
                <p style={{ fontSize: "0.78rem", color: "#9CA3AF", margin: 0 }}>
                  {policies.length} document{policies.length !== 1 ? "s" : ""} available
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
                className="policy-search"
                placeholder="Search policies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "260px" }}>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    border: "3px solid #E5E7EB",
                    borderTop: "3px solid #4F46E5",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                    margin: "0 auto 14px",
                  }}
                />
                <p style={{ color: "#6B7280", fontWeight: "500", fontSize: "0.875rem" }}>
                  Loading policies...
                </p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "60px 24px", textAlign: "center" }}>
              <ShieldCheck size={40} style={{ color: "#E5E7EB", marginBottom: "12px" }} />
              <p style={{ color: "#9CA3AF", fontSize: "0.9rem", margin: 0 }}>
                {search ? "No policies match your search." : "No policies have been shared yet."}
              </p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#F9FAFB" }}>
                  {["Policy Title", "Uploaded On", "Actions"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "11px 20px",
                        textAlign: "left",
                        fontSize: "0.72rem",
                        fontWeight: "600",
                        color: "#6B7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        borderBottom: "1px solid #F1F3F9",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((policy, i) => (
                  <tr
                    key={policy._id}
                    className="policy-row"
                    style={{
                      backgroundColor: i % 2 === 0 ? "#fff" : "#FAFAFA",
                      borderBottom: "1px solid #F1F3F9",
                    }}
                  >
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            backgroundColor: "#FEF3C7",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <FileText size={14} style={{ color: "#D97706" }} />
                        </div>
                        <span style={{ fontWeight: "500", color: "#111827", fontSize: "0.875rem" }}>
                          {policy.title}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px", color: "#6B7280", fontSize: "0.85rem" }}>
                      {formatDate(policy.createdAt)}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="icon-btn"
                          title="View"
                          onClick={() =>
                            window.open(`${BASE_URL}/api/policies/view/${policy.file}`, "_blank")
                          }
                          style={{
                            padding: "6px 12px",
                            borderRadius: "7px",
                            backgroundColor: "#EEF2FF",
                            color: "#4F46E5",
                            fontSize: "0.78rem",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <Eye size={13} /> View
                        </button>
                        <a
                          href={`${BASE_URL}/api/policies/view/${policy.file}`}
                          download
                          style={{
                            padding: "6px 12px",
                            borderRadius: "7px",
                            backgroundColor: "#ECFDF5",
                            color: "#059669",
                            fontSize: "0.78rem",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            textDecoration: "none",
                            transition: "opacity 0.15s",
                          }}
                        >
                          <Download size={13} /> Download
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeePolicies;
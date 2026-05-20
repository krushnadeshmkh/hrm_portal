import React, { useEffect, useState } from "react";
import Sidebar from "../../layouts/sidebar";
import axios from "axios";
import { Mail, FileText, Eye, Search, BadgeCheck } from "lucide-react";

const API = "http://localhost:5001/api/letters";

const letterTypeLabel = {
  offer:      "Offer Letter",
  experience: "Experience Certificate",
  salary:     "Salary Slip",
  relieving:  "Relieving Letter",
};

const letterTypeColor = {
  offer:      { bg: "#EEF2FF", color: "#4F46E5" },
  experience: { bg: "#FEF3C7", color: "#D97706" },
  salary:     { bg: "#ECFDF5", color: "#059669" },
  relieving:  { bg: "#FEF2F2", color: "#DC2626" },
};

const EmployeeLetters = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState(null);
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem("token");
  const sidebarWidth = isOpen ? 255 : 68;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadLetters = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/my-letters`, {
        headers: { "x-auth-token": token },
      });
      console.log(res)
      setLetters(res.data?.data || []);
    } catch (err) {
      console.error("Letters load error:", err);
      showToast("Failed to load letters", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLetters();
  }, []);

  const getType = (l) => l.letterType || l.letter_type || "";
  const getHtml = (l) => l.htmlContent || l.html_content || "";
  const getSentAt = (l) => l.sent_at || l.createdAt || l.created_at;
  const getName = (l) => l.employeeName || l.employee_name || "—";
  const getEmail = (l) => l.employeeEmail || l.employee_email || "";

  const filtered = letters.filter((l) => {
    const type = getType(l);
    const label = letterTypeLabel[type] || type;
    return label.toLowerCase().includes(search.toLowerCase());
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
        .letter-search:focus { border-color:#4F46E5 !important; box-shadow:0 0 0 3px rgba(79,70,229,.10); }
        .letter-row { transition: background 0.15s; }
        .letter-row:hover { background: #F5F7FF !important; }
        .icon-btn { border:none; cursor:pointer; transition:opacity 0.15s, transform 0.15s; }
        .icon-btn:hover { opacity:0.75; transform:scale(1.06); }
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.45); z-index:9998; display:flex; align-items:center; justify-content:center; animation:fadeUp 0.2s ease both; }
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

      {preview && (
        <div className="modal-overlay" onClick={() => setPreview(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#fff",
              borderRadius: "16px",
              width: "min(760px, 92vw)",
              maxHeight: "88vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                padding: "16px 24px",
                borderBottom: "1px solid #F1F3F9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: "600", color: "#111827" }}>
                  {letterTypeLabel[getType(preview)] || getType(preview)}
                </h3>
                <p style={{ margin: 0, fontSize: "0.78rem", color: "#9CA3AF" }}>
                  Issued on {formatDate(getSentAt(preview))}
                </p>
              </div>
              <button
                className="icon-btn"
                onClick={() => setPreview(null)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: "#F3F4F6",
                  color: "#6B7280",
                  fontSize: "1.2rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#F3F4F6",
                }}
              >
                ×
              </button>
            </div>
            <div
              style={{ overflowY: "auto", padding: "28px 32px" }}
              dangerouslySetInnerHTML={{ __html: getHtml(preview) }}
            />
          </div>
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
          <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0 0 4px" }}>My Documents</p>
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
            My Letters
          </h1>
          <p style={{ color: "#9CA3AF", fontSize: "0.85rem", margin: "5px 0 0" }}>
            All official letters and certificates issued to you.
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
                <Mail size={17} />
              </div>
              <div>
                <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "#111827", margin: 0 }}>
                  Issued Letters
                </h2>
                <p style={{ fontSize: "0.78rem", color: "#9CA3AF", margin: 0 }}>
                  {letters.length} letter{letters.length !== 1 ? "s" : ""} on record
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
                className="letter-search"
                placeholder="Search letters..."
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
                  Loading letters...
                </p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "60px 24px", textAlign: "center" }}>
              <Mail size={40} style={{ color: "#E5E7EB", marginBottom: "12px" }} />
              <p style={{ color: "#9CA3AF", fontSize: "0.9rem", margin: 0 }}>
                {search ? "No letters match your search." : "No letters have been issued to you yet."}
              </p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#F9FAFB" }}>
                  {["Letter Type", "Recipient", "Issued On", "Status", "Action"].map((h) => (
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
                {filtered.map((letter, i) => {
                  const type = getType(letter);
                  const typeStyle = letterTypeColor[type] || { bg: "#F3F4F6", color: "#6B7280" };
                  return (
                    <tr
                      key={letter._id}
                      className="letter-row"
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
                              backgroundColor: typeStyle.bg,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <FileText size={14} style={{ color: typeStyle.color }} />
                          </div>
                          <span style={{ fontWeight: "500", color: "#111827", fontSize: "0.875rem" }}>
                            {letterTypeLabel[type] || type || "—"}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <p style={{ margin: 0, fontWeight: "500", fontSize: "0.875rem", color: "#111827" }}>
                          {getName(letter)}
                        </p>
                        <p style={{ margin: 0, fontSize: "0.78rem", color: "#9CA3AF" }}>
                          {getEmail(letter)}
                        </p>
                      </td>
                      <td style={{ padding: "14px 20px", color: "#6B7280", fontSize: "0.85rem" }}>
                        {formatDate(getSentAt(letter))}
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "3px 10px",
                            borderRadius: "20px",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            backgroundColor: "#ECFDF5",
                            color: "#059669",
                          }}
                        >
                          <BadgeCheck size={12} /> Sent
                        </span>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <button
                          className="icon-btn"
                          onClick={() => setPreview(letter)}
                          style={{
                            padding: "6px 14px",
                            borderRadius: "7px",
                            backgroundColor: "#EEF2FF",
                            color: "#4F46E5",
                            fontSize: "0.78rem",
                            fontWeight: "600",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            border: "none",
                          }}
                        >
                          <Eye size={13} /> View Letter
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeLetters;
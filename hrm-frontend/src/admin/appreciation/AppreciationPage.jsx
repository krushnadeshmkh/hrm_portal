

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Send,
  Save,
  Award,
  Clock,
  Star,
  Users,
  Lightbulb,
  Crown,
  Heart,
  Search,
  Bell,
  Inbox,
  CheckCircle2,
  FileText,
  Filter,
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
const API = `${BASE_URL}/api/appreciations`;
import Sidebar from "../../layouts/sidebar";
const appreciationTypes = [
  { value: "general",          label: "General",          icon: Award,    color: "#D97706", bg: "#FFFBEB" },
  { value: "performance",      label: "Performance",      icon: Star,     color: "#4F46E5", bg: "#EEF2FF" },
  { value: "teamwork",         label: "Teamwork",         icon: Users,    color: "#059669", bg: "#ECFDF5" },
  { value: "innovation",       label: "Innovation",       icon: Lightbulb,color: "#0891B2", bg: "#ECFEFF" },
  { value: "leadership",       label: "Leadership",       icon: Crown,    color: "#7C3AED", bg: "#F5F3FF" },
  { value: "customer_service", label: "Customer Service", icon: Heart,    color: "#DB2777", bg: "#FDF2F8" },
];

const getType = (value) =>
  appreciationTypes.find((t) => t.value === value) || appreciationTypes[0];

const AppreciationPage = () => {
  const [formData, setFormData] = useState({
    employeeName: "",
    employeeEmail: "",
    title: "",
    message: "",
    appreciationType: "general",
  });
  const [history, setHistory] = useState([]);
    const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [histLoading, setHistLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const name = localStorage.getItem("name") || "Admin";
    const sidebarWidth = isOpen ? 255 : 68;

  const token = localStorage.getItem("token");
  const config = {  headers: {
    "x-auth-token": token
  } };

  const showToast = (msg, success = true) => {
    setToast({ msg, success });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchHistory = async () => {
    try {
      setHistLoading(true);
      const res = await axios.get(`${API}/history`, config);
      setHistory(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setHistLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = (requireName = false) => {
    const e = {};
    if (requireName && !formData.employeeName.trim()) e.employeeName = "Name is required";
    if (!formData.employeeEmail.trim()) e.employeeEmail = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.employeeEmail))
      e.employeeEmail = "Enter a valid email";
    if (!formData.title.trim()) e.title = "Title is required";
    if (!formData.message.trim()) e.message = "Message is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSend = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      await axios.post(`${API}/send`, {
        toEmail: formData.employeeEmail,
        subject: formData.title,
        message: formData.message,
        appreciationType: formData.appreciationType,
      }, config);
      showToast("Appreciation sent successfully!");
      fetchHistory();
      setFormData({ employeeName: "", employeeEmail: "", title: "", message: "", appreciationType: "general" });
    } catch (err) {
      console.error(err);
      showToast(err?.response?.data?.message || "Failed to send appreciation", false);
    } finally {
      setLoading(false);
    }
  };

  const handleDraft = async () => {
    if (!validate(true)) return;
    try {
      setLoading(true);
      await axios.post(`${API}/draft`, {
        employeeName: formData.employeeName,
        employeeEmail: formData.employeeEmail,
        title: formData.title,
        message: formData.message,
        appreciationType: formData.appreciationType,
      }, config);
      showToast("Draft saved successfully!");
      fetchHistory();
    } catch (err) {
      console.error(err);
      showToast(err?.response?.data?.message || "Failed to save draft", false);
    } finally {
      setLoading(false);
    }
  };

  const filtered = history.filter((item) => {
    const matchType = filterType === "all" || item.appreciation_type === filterType;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      item.title?.toLowerCase().includes(q) ||
      item.employee_name?.toLowerCase().includes(q) ||
      item.employee_email?.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  const sentCount  = history.filter((h) => h.status === "sent").length;
  const draftCount = history.filter((h) => h.status === "draft").length;
  const selectedType = getType(formData.appreciationType);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F9FAFB", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(24px); } to { opacity:1; transform:translateX(0); } }
        @keyframes toastIn { from { opacity:0; transform:translateY(-12px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); } }
        .form-input { width:100%; padding:10px 14px; border:1.5px solid #E5E7EB; border-radius:10px; font-size:0.875rem; color:#374151; background:#F9FAFB; font-family:'DM Sans',sans-serif; transition:border-color 0.18s, box-shadow 0.18s, background 0.18s; outline:none; }
        .form-input:focus { border-color:#4F46E5; box-shadow:0 0 0 3px rgba(79,70,229,0.10); background:#fff; }
        .form-input.error { border-color:#EF4444; box-shadow:0 0 0 3px rgba(239,68,68,0.08); }
        .type-chip { padding:6px 12px; border-radius:8px; font-size:0.75rem; font-weight:600; display:inline-flex; align-items:center; gap:5px; cursor:pointer; border:1.5px solid transparent; transition:all 0.15s; }
        .type-chip:hover { filter:brightness(0.97); transform:translateY(-1px); }
        .hist-row { transition:background 0.12s; border-bottom:1px solid #F9FAFB; }
        .hist-row:hover { background:#F5F7FF; }
        .btn-primary { display:flex; align-items:center; justify-content:center; gap:7px; padding:11px 0; border-radius:10px; font-size:0.875rem; font-weight:600; cursor:pointer; border:none; transition:all 0.18s; font-family:'DM Sans',sans-serif; }
        .btn-primary:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 6px 16px rgba(79,70,229,0.25); }
        .btn-primary:disabled { opacity:0.55; cursor:not-allowed; }
        .btn-secondary { display:flex; align-items:center; justify-content:center; gap:7px; padding:11px 0; border-radius:10px; font-size:0.875rem; font-weight:600; cursor:pointer; border:1.5px solid #E5E7EB; background:#fff; color:#374151; transition:all 0.18s; font-family:'DM Sans',sans-serif; }
        .btn-secondary:hover:not(:disabled) { background:#F9FAFB; transform:translateY(-1px); box-shadow:0 4px 12px rgba(15,23,42,0.08); }
        .btn-secondary:disabled { opacity:0.55; cursor:not-allowed; }
        .search-input:focus { outline:none; border-color:#4F46E5 !important; box-shadow:0 0 0 3px rgba(79,70,229,0.10); }
        select.form-input { appearance:none; -webkit-appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%239CA3AF' d='M1 1l5 5 5-5'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 12px center; padding-right:32px; }
        .stat-mini { transition:transform 0.15s, box-shadow 0.15s; }
        .stat-mini:hover { transform:translateY(-2px); box-shadow:0 8px 20px rgba(15,23,42,0.08) !important; }
        * { box-sizing:border-box; }
      `}</style>

      {toast && (
        <div style={{
          position: "fixed", top: "20px", right: "24px", zIndex: 9999,
          background: toast.success ? "#059669" : "#EF4444",
          color: "#fff", borderRadius: "12px", padding: "12px 18px",
          fontSize: "0.875rem", fontWeight: "500", fontFamily: "'DM Sans', sans-serif",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          display: "flex", alignItems: "center", gap: "8px",
          animation: "toastIn 0.25s ease",
        }}>
          {toast.success ? <CheckCircle2 size={16} /> : <Bell size={16} />}
          {toast.msg}
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
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 1px 4px rgba(15,23,42,0.04)",
      }}>
        <div style={{ position: "relative", flex: 1, maxWidth: "380px" }}>
          <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
          <input
            className="search-input"
            placeholder="Search anything..."
            style={{
              width: "100%", padding: "8px 12px 8px 36px", border: "1.5px solid #E5E7EB",
              borderRadius: "10px", fontSize: "0.875rem", color: "#374151",
              background: "#F9FAFB", fontFamily: "'DM Sans', sans-serif",
              outline: "none", transition: "border-color 0.18s, box-shadow 0.18s",
            }}
          />
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
          <button style={{
            width: "38px", height: "38px", borderRadius: "10px",
            border: "1.5px solid #E5E7EB", background: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#6B7280", position: "relative",
          }}>
            <Bell size={17} />
            <span style={{
              position: "absolute", top: "8px", right: "8px",
              width: "7px", height: "7px", borderRadius: "50%",
              background: "#EF4444", border: "1.5px solid #fff",
            }} />
          </button>
          <div style={{
            display: "flex", alignItems: "center", gap: "9px",
            padding: "5px 12px 5px 6px",
            border: "1.5px solid #E5E7EB", borderRadius: "10px",
            background: "#fff", cursor: "pointer",
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

      <div style={{ padding: "28px 28px 48px" }}>
        <div style={{ marginBottom: "24px", animation: "fadeUp 0.4s ease both 0.05s" }}>
          <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0 0 4px" }}>
            Recognize your team's hard work
          </p>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.85rem", fontWeight: "700", color: "#111827",
            margin: 0, lineHeight: 1.2,
          }}>
            Employee Appreciation
          </h1>
          <p style={{ color: "#9CA3AF", fontSize: "0.85rem", margin: "5px 0 0" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "24px" }}>
          {[
            { label: "Total Sent",    count: sentCount,       icon: Send,      color: "#4F46E5", bg: "#EEF2FF" },
            { label: "Drafts Saved",  count: draftCount,      icon: FileText,  color: "#D97706", bg: "#FFFBEB" },
            { label: "All Records",   count: history.length,  icon: Inbox,     color: "#059669", bg: "#ECFDF5" },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="stat-mini" style={{
                background: "#fff", borderRadius: "14px", padding: "18px 20px",
                border: "1px solid #F1F3F9", boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
                display: "flex", alignItems: "center", gap: "14px",
                animation: `fadeUp 0.4s ease both ${0.1 + i * 0.06}s`,
              }}>
                <div style={{
                  width: "42px", height: "42px", borderRadius: "11px",
                  background: s.bg, display: "flex", alignItems: "center",
                  justifyContent: "center", color: s.color, flexShrink: 0,
                }}>
                  <Icon size={20} />
                </div>
                <div>
                  <div style={{ fontSize: "1.6rem", fontWeight: "700", color: "#111827", lineHeight: 1, fontFamily: "'Playfair Display', serif" }}>
                    {histLoading ? <span style={{ display: "inline-block", width: "40px", height: "26px", background: "#F3F4F6", borderRadius: "5px" }} /> : s.count}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#9CA3AF", fontWeight: "500", marginTop: "3px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                    {s.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: "20px", alignItems: "start" }}>
          <div style={{
            background: "#fff", borderRadius: "16px",
            border: "1px solid #F1F3F9", boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
            overflow: "hidden", animation: "fadeUp 0.4s ease both 0.22s",
          }}>
            <div style={{
              padding: "20px 22px 16px", borderBottom: "1px solid #F1F3F9",
              background: "linear-gradient(135deg, #FAFBFF 0%, #fff 100%)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "38px", height: "38px", borderRadius: "10px",
                  background: "#EEF2FF", display: "flex", alignItems: "center",
                  justifyContent: "center", color: "#4F46E5",
                }}>
                  <Award size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "#111827", margin: 0 }}>
                    Send Appreciation
                  </h2>
                  <p style={{ fontSize: "0.75rem", color: "#9CA3AF", margin: "2px 0 0" }}>
                    Recognize a teammate today
                  </p>
                </div>
              </div>
            </div>
            <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: "600", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "8px" }}>
                  Appreciation Type
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
                  {appreciationTypes.map((t) => {
                    const Icon = t.icon;
                    const active = formData.appreciationType === t.value;
                    return (
                      <button
                        key={t.value}
                        className="type-chip"
                        onClick={() => setFormData({ ...formData, appreciationType: t.value })}
                        style={{
                          background: active ? t.bg : "#F9FAFB",
                          color: active ? t.color : "#6B7280",
                          borderColor: active ? t.color : "transparent",
                          opacity: active ? 1 : 0.8,
                        }}
                      >
                        <Icon size={13} />
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              {[
                { name: "employeeName",  placeholder: "Employee Name",         type: "text"  },
                { name: "employeeEmail", placeholder: "Employee Email",         type: "email" },
                { name: "title",         placeholder: "Appreciation Title",     type: "text"  },
              ].map((f) => (
                <div key={f.name}>
                  <input
                    type={f.type}
                    name={f.name}
                    placeholder={f.placeholder}
                    value={formData[f.name]}
                    onChange={handleChange}
                    className={`form-input ${errors[f.name] ? "error" : ""}`}
                  />
                  {errors[f.name] && (
                    <p style={{ color: "#EF4444", fontSize: "0.72rem", margin: "4px 0 0 2px" }}>{errors[f.name]}</p>
                  )}
                </div>
              ))}

              <div>
                <textarea
                  rows={5}
                  name="message"
                  placeholder="Write a heartfelt appreciation message..."
                  value={formData.message}
                  onChange={handleChange}
                  className={`form-input ${errors.message ? "error" : ""}`}
                  style={{ resize: "vertical", lineHeight: "1.55" }}
                />
                {errors.message && (
                  <p style={{ color: "#EF4444", fontSize: "0.72rem", margin: "4px 0 0 2px" }}>{errors.message}</p>
                )}
              </div>
              <div style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "10px 14px", borderRadius: "10px",
                background: selectedType.bg, color: selectedType.color,
                fontSize: "0.8rem", fontWeight: "500",
              }}>
                {React.createElement(selectedType.icon, { size: 15 })}
                <span>Will be tagged as <strong>{selectedType.label}</strong> appreciation</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", paddingTop: "4px" }}>
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="btn-primary"
                  style={{ background: "linear-gradient(135deg, #4F46E5, #6366F1)", color: "#fff" }}
                >
                  <Send size={15} />
                  {loading ? "Sending…" : "Send Now"}
                </button>
                <button
                  onClick={handleDraft}
                  disabled={loading}
                  className="btn-secondary"
                >
                  <Save size={15} />
                  {loading ? "Saving…" : "Save Draft"}
                </button>
              </div>
            </div>
          </div>
          <div style={{
            background: "#fff", borderRadius: "16px",
            border: "1px solid #F1F3F9", boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
            overflow: "hidden", animation: "fadeUp 0.4s ease both 0.28s",
          }}>
            <div style={{
              padding: "18px 22px", borderBottom: "1px solid #F1F3F9",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              gap: "12px", flexWrap: "wrap",
            }}>
              <div>
                <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "#111827", margin: "0 0 2px" }}>
                  Appreciation History
                </h2>
                <p style={{ fontSize: "0.78rem", color: "#9CA3AF", margin: 0, display: "flex", alignItems: "center", gap: "5px" }}>
                  <Clock size={12} />
                  {filtered.length} {filtered.length === 1 ? "record" : "records"} found
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ position: "relative" }}>
                  <Filter size={13} style={{ position: "absolute", left: "9px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", pointerEvents: "none" }} />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    style={{
                      padding: "7px 12px 7px 28px", border: "1.5px solid #E5E7EB",
                      borderRadius: "9px", fontSize: "0.78rem", color: "#374151",
                      background: "#F9FAFB", fontFamily: "'DM Sans', sans-serif",
                      outline: "none", cursor: "pointer",
                      appearance: "none", WebkitAppearance: "none",
                    }}
                  >
                    <option value="all">All Types</option>
                    {appreciationTypes.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div style={{ position: "relative" }}>
                  <Search size={13} style={{ position: "absolute", left: "9px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                  <input
                    className="search-input"
                    placeholder="Search history..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                      padding: "7px 12px 7px 28px", border: "1.5px solid #E5E7EB",
                      borderRadius: "9px", fontSize: "0.78rem", color: "#374151",
                      background: "#F9FAFB", fontFamily: "'DM Sans', sans-serif",
                      width: "190px", outline: "none",
                      transition: "border-color 0.18s, box-shadow 0.18s",
                    }}
                  />
                </div>
              </div>
            </div>
            <div style={{ maxHeight: "620px", overflowY: "auto" }}>
              {histLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{ padding: "18px 22px", borderBottom: "1px solid #F9FAFB" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                      <div style={{ height: "14px", width: "180px", background: "#F3F4F6", borderRadius: "4px" }} />
                      <div style={{ height: "22px", width: "90px", background: "#F3F4F6", borderRadius: "20px" }} />
                    </div>
                    <div style={{ height: "12px", width: "240px", background: "#F3F4F6", borderRadius: "4px", marginBottom: "10px" }} />
                    <div style={{ height: "12px", width: "100%", background: "#F3F4F6", borderRadius: "4px", marginBottom: "6px" }} />
                    <div style={{ height: "12px", width: "80%", background: "#F3F4F6", borderRadius: "4px" }} />
                  </div>
                ))
              ) : filtered.length === 0 ? (
                <div style={{ padding: "60px 20px", textAlign: "center" }}>
                  <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "#D1D5DB" }}>
                    <Inbox size={24} />
                  </div>
                  <p style={{ color: "#9CA3AF", fontSize: "0.875rem", margin: 0, fontWeight: "500" }}>No appreciations found</p>
                  <p style={{ color: "#D1D5DB", fontSize: "0.78rem", margin: "4px 0 0" }}>Try adjusting filters or send one!</p>
                </div>
              ) : (
                filtered.map((item, idx) => {
                  const type = getType(item.appreciation_type);
                  const Icon = type.icon;
                  return (
                    <div
                      key={item._id || idx}
                      className="hist-row"
                      style={{ padding: "18px 22px", animation: `slideIn 0.3s ease both ${idx * 0.04}s` }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", minWidth: 0 }}>
                          <div style={{
                            width: "38px", height: "38px", borderRadius: "10px",
                            background: type.bg, display: "flex", alignItems: "center",
                            justifyContent: "center", color: type.color, flexShrink: 0,
                          }}>
                            <Icon size={17} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <h3 style={{ fontSize: "0.9rem", fontWeight: "600", color: "#111827", margin: "0 0 3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {item.title}
                            </h3>
                            <p style={{ fontSize: "0.78rem", color: "#9CA3AF", margin: 0 }}>
                              {item.employee_name && <span style={{ color: "#6B7280", fontWeight: "500" }}>{item.employee_name}</span>}
                              {item.employee_name && " • "}
                              {item.employee_email}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 }}>
                          <span style={{
                            padding: "3px 10px", borderRadius: "20px",
                            fontSize: "0.7rem", fontWeight: "600",
                            background: type.bg, color: type.color,
                            display: "inline-flex", alignItems: "center", gap: "4px",
                          }}>
                            <Icon size={11} />
                            {type.label}
                          </span>
                          <span style={{
                            padding: "2px 9px", borderRadius: "20px",
                            fontSize: "0.68rem", fontWeight: "600",
                            background: item.status === "sent" ? "#ECFDF5" : "#FFFBEB",
                            color: item.status === "sent" ? "#059669" : "#D97706",
                          }}>
                            {item.status === "sent" ? "✓ Sent" : "⏳ Draft"}
                          </span>
                        </div>
                      </div>

                      <p style={{
                        marginTop: "12px", fontSize: "0.855rem", color: "#374151",
                        lineHeight: "1.6", borderLeft: `3px solid ${type.bg}`,
                        paddingLeft: "12px", borderRadius: "1px",
                        borderLeftColor: type.color,
                      }}>
                        {item.message}
                      </p>

                      <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "5px", color: "#9CA3AF", fontSize: "0.72rem" }}>
                        <Clock size={11} />
                        {new Date(item.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {!histLoading && filtered.length > 0 && (
              <div style={{
                padding: "11px 22px", borderTop: "1px solid #F1F3F9",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>
                  Showing {filtered.length} of {history.length} records
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#9CA3AF", fontSize: "0.72rem" }}>
                  <CheckCircle2 size={11} />
                  Up to date
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
    </div>
  );
};

export default AppreciationPage;
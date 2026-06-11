import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Send, Save, Award, Clock, Star, Users, Lightbulb,
  Crown, Heart, Search, Bell, Inbox, CheckCircle2,
  FileText, Filter, X, Check,
} from "lucide-react";
import Sidebar from "../../layouts/sidebar";
import MobileTopBar from "../../employee/MobileTopBar";
import { useTheme } from "../../context/ThemeContext";

const BASE_URL = import.meta.env.VITE_API_URL || "https://hrm-backend-vvqg.onrender.com";
const API = `${BASE_URL}/api/appreciations`;

const appreciationTypes = [
  { value: "general",          label: "General",          icon: Award,     color: "#D97706", bg: "#FFFBEB" },
  { value: "performance",      label: "Performance",      icon: Star,      color: "#4F46E5", bg: "#EEF2FF" },
  { value: "teamwork",         label: "Teamwork",         icon: Users,     color: "#059669", bg: "#ECFDF5" },
  { value: "innovation",       label: "Innovation",       icon: Lightbulb, color: "#0891B2", bg: "#ECFEFF" },
  { value: "leadership",       label: "Leadership",       icon: Crown,     color: "#7C3AED", bg: "#F5F3FF" },
  { value: "customer_service", label: "Customer Service", icon: Heart,     color: "#DB2777", bg: "#FDF2F8" },
];

const getType = (value) => appreciationTypes.find((t) => t.value === value) || appreciationTypes[0];

const AppreciationPage = () => {
  const [formData, setFormData] = useState({ employeeName: "", employeeEmail: "", title: "", message: "", appreciationType: "general" });
  const [history, setHistory] = useState([]);
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [loading, setLoading] = useState(false);
  const [histLoading, setHistLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const { isDark } = useTheme();

  const name = localStorage.getItem("name") || "Admin";
  const token = localStorage.getItem("token");
  const config = { headers: { "x-auth-token": token } };
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

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
    rowHover: isDark ? "#1E2535" : "#F5F7FF",
    statIconBg1: isDark ? "#1E1B4B" : "#EEF2FF",
    statIconBg2: isDark ? "#064E3B" : "#ECFDF5",
    statIconBg3: isDark ? "#451A03" : "#FFFBEB",
    statIconColor1: isDark ? "#818CF8" : "#4F46E5",
    statIconColor2: isDark ? "#34D399" : "#059669",
    statIconColor3: isDark ? "#FCD34D" : "#D97706",
    badgeSentBg: isDark ? "#064E3B" : "#ECFDF5",
    badgeSentText: isDark ? "#6EE7B7" : "#059669",
    badgeDraftBg: isDark ? "#451A03" : "#FFFBEB",
    badgeDraftText: isDark ? "#FCD34D" : "#D97706",
    modalOverlay: isDark ? "rgba(0,0,0,0.7)" : "rgba(15,23,42,0.5)",
    buttonPrimary: "linear-gradient(135deg,#4F46E5,#6366F1)",
    buttonSecondaryBg: isDark ? "#1E2535" : "#fff",
    buttonSecondaryText: isDark ? "#9CA3AF" : "#374151",
    buttonSecondaryBorder: isDark ? "#2D3748" : "#E5E7EB",
    toastSuccessBg: isDark ? "#064E3B" : "#059669",
    toastErrorBg: isDark ? "#7F1D1D" : "#EF4444",
    sectionBg: isDark ? "#1E2535" : "#F9FAFB",
    typeChipBg: isDark ? "#1E2535" : "#F9FAFB",
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarWidth = isMobile ? 0 : isOpen ? 255 : 68;

  const showToast = (msg, success = true) => {
    setToast({ msg, success });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchHistory = async () => {
    try {
      setHistLoading(true);
      const res = await axios.get(`${API}/history`, config);
      setHistory(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setHistLoading(false); }
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
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.employeeEmail)) e.employeeEmail = "Enter a valid email";
    if (!formData.title.trim()) e.title = "Title is required";
    if (!formData.message.trim()) e.message = "Message is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSend = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      await axios.post(`${API}/send`, { toEmail: formData.employeeEmail, subject: formData.title, message: formData.message, appreciationType: formData.appreciationType }, config);
      showToast("Appreciation sent successfully!");
      fetchHistory();
      setFormData({ employeeName: "", employeeEmail: "", title: "", message: "", appreciationType: "general" });
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to send appreciation", false);
    } finally { setLoading(false); }
  };

  const handleDraft = async () => {
    if (!validate(true)) return;
    try {
      setLoading(true);
      await axios.post(`${API}/draft`, { employeeName: formData.employeeName, employeeEmail: formData.employeeEmail, title: formData.title, message: formData.message, appreciationType: formData.appreciationType }, config);
      showToast("Draft saved successfully!");
      fetchHistory();
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to save draft", false);
    } finally { setLoading(false); }
  };

  const filtered = history.filter((item) => {
    const matchType = filterType === "all" || item.appreciation_type === filterType;
    const q = search.toLowerCase();
    const matchSearch = !q || item.title?.toLowerCase().includes(q) || item.employee_name?.toLowerCase().includes(q) || item.employee_email?.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  const sentCount = history.filter((h) => h.status === "sent").length;
  const draftCount = history.filter((h) => h.status === "draft").length;
  const selectedType = getType(formData.appreciationType);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: t.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:translateX(0)} }
        @keyframes toastIn { from{opacity:0;transform:translateY(-12px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes spin { to { transform: rotate(360deg); } }
        .form-input{width:100%;padding:10px 14px;border:1.5px solid ${t.inputBorder};border-radius:10px;font-size:0.875rem;color:${t.textPrimary};background:${t.inputBg};font-family:'DM Sans',sans-serif;transition:border-color .18s,box-shadow .18s,background .18s;outline:none}
        .form-input:focus{border-color:#4F46E5;box-shadow:0 0 0 3px rgba(79,70,229,.10);background:${isDark ? "#1E2535" : "#fff"}}
        .form-input.error{border-color:#EF4444;box-shadow:0 0 0 3px rgba(239,68,68,.08)}
        .type-chip{padding:6px 12px;border-radius:8px;font-size:0.75rem;font-weight:600;display:inline-flex;align-items:center;gap:5px;cursor:pointer;border:1.5px solid transparent;transition:all .15s}
        .type-chip:hover{filter:brightness(.97);transform:translateY(-1px)}
        .hist-row{transition:background .12s;border-bottom:1px solid ${t.border}}
        .hist-row:hover{background:${t.rowHover} !important}
        .btn-primary{display:flex;align-items:center;justify-content:center;gap:7px;padding:11px 0;border-radius:10px;font-size:0.875rem;font-weight:600;cursor:pointer;border:none;transition:all .18s;font-family:'DM Sans',sans-serif}
        .btn-primary:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 6px 16px rgba(79,70,229,.25)}
        .btn-primary:disabled{opacity:.55;cursor:not-allowed}
        .btn-secondary{display:flex;align-items:center;justify-content:center;gap:7px;padding:11px 0;border-radius:10px;font-size:0.875rem;font-weight:600;cursor:pointer;border:1.5px solid ${t.buttonSecondaryBorder};background:${t.buttonSecondaryBg};color:${t.buttonSecondaryText};transition:all .18s;font-family:'DM Sans',sans-serif}
        .btn-secondary:hover:not(:disabled){background:${t.rowHover};transform:translateY(-1px)}
        .btn-secondary:disabled{opacity:.55;cursor:not-allowed}
        .search-inp:focus{outline:none;border-color:#4F46E5!important;box-shadow:0 0 0 3px rgba(79,70,229,.10)}
        .appr-topbar{display:flex!important}
        *{box-sizing:border-box}

        @media(max-width:768px){
          .appr-topbar{display:none!important}
          .appr-main{padding:72px 14px 32px!important}
          .appr-page-head{margin-bottom:18px!important}
          .appr-h1{font-size:1.45rem!important}
          .appr-stats-grid{grid-template-columns:1fr!important}
          .appr-content-grid{grid-template-columns:1fr!important}
          .appr-hist-filters{flex-direction:column!important;align-items:stretch!important}
          .appr-hist-search{width:100%!important}
          .appr-hist-select{width:100%!important}
        }
        @media(min-width:769px) and (max-width:1024px){
          .appr-main{padding:24px 20px 32px!important}
          .appr-content-grid{grid-template-columns:340px 1fr!important}
          .appr-stats-grid{grid-template-columns:repeat(3,1fr)!important}
        }
      `}</style>

      {toast && (
        <div style={{ position:"fixed", top:"20px", right:"24px", zIndex:9999, background: toast.success ? t.toastSuccessBg : t.toastErrorBg, color:"#fff", borderRadius:"12px", padding:"12px 18px", fontSize:"0.875rem", fontWeight:"500", boxShadow:"0 8px 24px rgba(0,0,0,.15)", display:"flex", alignItems:"center", gap:"8px", animation:"toastIn .25s ease" }}>
          {toast.success ? <CheckCircle2 size={16}/> : <X size={16}/>}
          {toast.msg}
        </div>
      )}

      <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div style={{ marginLeft:`${sidebarWidth}px`, flex:1, transition:"margin-left 0.25s cubic-bezier(0.4,0,0.2,1)", display:"flex", flexDirection:"column", minHeight:"100vh", minWidth:0 }}>
        <div className="appr-topbar" style={{ height:"64px", backgroundColor:t.topbar, borderBottom:`1px solid ${t.border}`, alignItems:"center", padding:"0 28px", gap:"16px", position:"sticky", top:0, zIndex:100, boxShadow:isDark ? "0 1px 4px rgba(0,0,0,0.3)" : "0 1px 4px rgba(15,23,42,.04)" }}>
          <div style={{ position:"relative", flex:1, maxWidth:"380px" }}>
            <Search size={15} style={{ position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", color:t.textMuted }}/>
            <input className="search-inp" placeholder="Search anything..." style={{ width:"100%", padding:"8px 12px 8px 36px", border:`1.5px solid ${t.inputBorder}`, borderRadius:"10px", fontSize:"0.875rem", color:t.textPrimary, background:t.inputBg, fontFamily:"'DM Sans',sans-serif", outline:"none" }}/>
          </div>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:"8px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"9px", padding:"5px 12px 5px 6px", border:`1.5px solid ${t.inputBorder}`, borderRadius:"10px", background:t.card, cursor:"pointer" }}>
              <div style={{ width:"28px", height:"28px", borderRadius:"50%", background:"linear-gradient(135deg,#4F46E5,#7C3AED)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:"0.72rem", fontWeight:"600" }}>{name.slice(0,2).toUpperCase()}</div>
              <span style={{ fontSize:"0.83rem", fontWeight:"500", color:t.textPrimary }}>{name}</span>
            </div>
          </div>
        </div>

        <main className="appr-main" style={{ padding:"28px 28px 48px" }}>
          <div className="appr-page-head" style={{ marginBottom:"24px", animation:"fadeUp .4s ease both .05s" }}>
            <p style={{ color:t.textSecondary, fontSize:"0.875rem", margin:"0 0 4px" }}>{greeting}, <strong style={{ color:"#4F46E5" }}>{name}</strong> 👋</p>
            <h1 className="appr-h1" style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.85rem", fontWeight:"700", color:t.textPrimary, margin:0, lineHeight:1.2 }}>Employee Appreciation</h1>
            <p style={{ color:t.textMuted, fontSize:"0.85rem", margin:"5px 0 0" }}>{new Date().toLocaleDateString("en-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
          </div>

          <div className="appr-stats-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"14px", marginBottom:"24px" }}>
            {[
              { label:"Total Sent", count:sentCount, icon:Send, bg:t.statIconBg1, color:t.statIconColor1 },
              { label:"Drafts Saved", count:draftCount, icon:FileText, bg:t.statIconBg2, color:t.statIconColor2 },
              { label:"All Records", count:history.length, icon:Inbox, bg:t.statIconBg3, color:t.statIconColor3 },
            ].map((s,i) => {
              const Icon = s.icon;
              return (
                <div key={i} style={{ background:t.card, borderRadius:"14px", padding:"18px 20px", border:`1px solid ${t.border}`, boxShadow:isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,.05)", display:"flex", alignItems:"center", gap:"14px", animation:`fadeUp .4s ease both ${.1+i*.06}s` }}>
                  <div style={{ width:"42px", height:"42px", borderRadius:"11px", background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", color:s.color, flexShrink:0 }}><Icon size={20}/></div>
                  <div>
                    <div style={{ fontSize:"1.6rem", fontWeight:"700", color:t.textPrimary, lineHeight:1, fontFamily:"'Playfair Display',serif" }}>
                      {histLoading ? <span style={{ display:"inline-block", width:"40px", height:"26px", background:t.skeletonBg, borderRadius:"5px" }}/> : s.count}
                    </div>
                    <div style={{ fontSize:"0.72rem", color:t.textMuted, fontWeight:"500", marginTop:"3px", textTransform:"uppercase", letterSpacing:"0.4px" }}>{s.label}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="appr-content-grid" style={{ display:"grid", gridTemplateColumns:"360px 1fr", gap:"20px", alignItems:"start" }}>
            <div style={{ background:t.card, borderRadius:"16px", border:`1px solid ${t.border}`, boxShadow:isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,.05)", overflow:"hidden", animation:"fadeUp .4s ease both .22s" }}>
              <div style={{ padding:"20px 22px 16px", borderBottom:`1px solid ${t.border}`, background:isDark ? "#0F1219" : "linear-gradient(135deg,#FAFBFF 0%,#fff 100%)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                  <div style={{ width:"38px", height:"38px", borderRadius:"10px", background:t.statIconBg1, display:"flex", alignItems:"center", justifyContent:"center", color:t.statIconColor1 }}><Award size={20}/></div>
                  <div>
                    <h2 style={{ fontSize:"1rem", fontWeight:"600", color:t.textPrimary, margin:0 }}>Send Appreciation</h2>
                    <p style={{ fontSize:"0.75rem", color:t.textMuted, margin:"2px 0 0" }}>Recognize a teammate today</p>
                  </div>
                </div>
              </div>
              <div style={{ padding:"20px 22px", display:"flex", flexDirection:"column", gap:"14px" }}>
                <div>
                  <label style={{ fontSize:"0.72rem", fontWeight:"600", color:t.textSecondary, textTransform:"uppercase", letterSpacing:"0.5px", display:"block", marginBottom:"8px" }}>Appreciation Type</label>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"7px" }}>
                    {appreciationTypes.map((t) => {
                      const Icon = t.icon;
                      const active = formData.appreciationType === t.value;
                      return (
                        <button key={t.value} className="type-chip" onClick={() => setFormData({...formData, appreciationType:t.value})}
                          style={{ background:active ? t.bg : t.typeChipBg, color:active ? t.color : t.textMuted, borderColor:active ? t.color : "transparent" }}>
                          <Icon size={13}/>{t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {[
                  { name:"employeeName", placeholder:"Employee Name", type:"text" },
                  { name:"employeeEmail", placeholder:"Employee Email", type:"email" },
                  { name:"title", placeholder:"Appreciation Title", type:"text" },
                ].map((f) => (
                  <div key={f.name}>
                    <input type={f.type} name={f.name} placeholder={f.placeholder} value={formData[f.name]} onChange={handleChange} className={`form-input ${errors[f.name]?"error":""}`}/>
                    {errors[f.name] && <p style={{ color:"#EF4444", fontSize:"0.72rem", margin:"4px 0 0 2px" }}>{errors[f.name]}</p>}
                  </div>
                ))}
                <div>
                  <textarea rows={5} name="message" placeholder="Write a heartfelt appreciation message..." value={formData.message} onChange={handleChange} className={`form-input ${errors.message?"error":""}`} style={{ resize:"vertical", lineHeight:"1.55" }}/>
                  {errors.message && <p style={{ color:"#EF4444", fontSize:"0.72rem", margin:"4px 0 0 2px" }}>{errors.message}</p>}
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:"8px", padding:"10px 14px", borderRadius:"10px", background:selectedType.bg, color:selectedType.color, fontSize:"0.8rem", fontWeight:"500" }}>
                  {React.createElement(selectedType.icon, { size:15 })}
                  <span>Will be tagged as <strong>{selectedType.label}</strong> appreciation</span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", paddingTop:"4px" }}>
                  <button onClick={handleSend} disabled={loading} className="btn-primary" style={{ background:t.buttonPrimary, color:"#fff" }}>
                    <Send size={15}/>{loading ? "Sending…" : "Send Now"}
                  </button>
                  <button onClick={handleDraft} disabled={loading} className="btn-secondary">
                    <Save size={15}/>{loading ? "Saving…" : "Save Draft"}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ background:t.card, borderRadius:"16px", border:`1px solid ${t.border}`, boxShadow:isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,.05)", overflow:"hidden", animation:"fadeUp .4s ease both .28s" }}>
              <div style={{ padding:"18px 22px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px", flexWrap:"wrap" }}>
                <div>
                  <h2 style={{ fontSize:"1rem", fontWeight:"600", color:t.textPrimary, margin:"0 0 2px" }}>Appreciation History</h2>
                  <p style={{ fontSize:"0.78rem", color:t.textMuted, margin:0, display:"flex", alignItems:"center", gap:"5px" }}>
                    <Clock size={12}/>{filtered.length} {filtered.length===1 ? "record" : "records"} found
                  </p>
                </div>
                <div className="appr-hist-filters" style={{ display:"flex", gap:"8px", alignItems:"center", flexWrap:"wrap" }}>
                  <div style={{ position:"relative" }}>
                    <Filter size={13} style={{ position:"absolute", left:"9px", top:"50%", transform:"translateY(-50%)", color:t.textMuted, pointerEvents:"none" }}/>
                    <select value={filterType} onChange={(e)=>setFilterType(e.target.value)} className="appr-hist-select"
                      style={{ padding:"7px 12px 7px 28px", border:`1.5px solid ${t.inputBorder}`, borderRadius:"9px", fontSize:"0.78rem", color:t.textPrimary, background:t.inputBg, fontFamily:"'DM Sans',sans-serif", outline:"none", cursor:"pointer", appearance:"none" }}>
                      <option value="all">All Types</option>
                      {appreciationTypes.map((t)=><option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div style={{ position:"relative" }}>
                    <Search size={13} style={{ position:"absolute", left:"9px", top:"50%", transform:"translateY(-50%)", color:t.textMuted }}/>
                    <input className="search-inp appr-hist-search" placeholder="Search history..." value={search} onChange={(e)=>setSearch(e.target.value)}
                      style={{ padding:"7px 12px 7px 28px", border:`1.5px solid ${t.inputBorder}`, borderRadius:"9px", fontSize:"0.78rem", color:t.textPrimary, background:t.inputBg, fontFamily:"'DM Sans',sans-serif", width:"190px", outline:"none" }}/>
                  </div>
                </div>
              </div>
              <div style={{ maxHeight:"620px", overflowY:"auto" }}>
                {histLoading ? (
                  Array.from({length:4}).map((_,i)=>(
                    <div key={i} style={{ padding:"18px 22px", borderBottom:`1px solid ${t.border}` }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"10px" }}>
                        <div style={{ height:"14px", width:"180px", background:t.skeletonBg, borderRadius:"4px" }}/>
                        <div style={{ height:"22px", width:"90px", background:t.skeletonBg, borderRadius:"20px" }}/>
                      </div>
                      <div style={{ height:"12px", width:"100%", background:t.skeletonBg, borderRadius:"4px" }}/>
                    </div>
                  ))
                ) : filtered.length === 0 ? (
                  <div style={{ padding:"60px 20px", textAlign:"center" }}>
                    <div style={{ width:"52px", height:"52px", borderRadius:"14px", background:t.skeletonBg, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px", color:t.textMuted }}><Inbox size={24}/></div>
                    <p style={{ color:t.textMuted, fontSize:"0.875rem", margin:0, fontWeight:"500" }}>No appreciations found</p>
                    <p style={{ color:t.textMuted, fontSize:"0.78rem", margin:"4px 0 0" }}>Try adjusting filters or send one!</p>
                  </div>
                ) : (
                  filtered.map((item, idx) => {
                    const type = getType(item.appreciation_type);
                    const Icon = type.icon;
                    return (
                      <div key={item._id||idx} className="hist-row" style={{ padding:"18px 22px", animation:`slideIn .3s ease both ${idx*.04}s` }}>
                        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"12px" }}>
                          <div style={{ display:"flex", gap:"12px", alignItems:"flex-start", minWidth:0 }}>
                            <div style={{ width:"38px", height:"38px", borderRadius:"10px", background:type.bg, display:"flex", alignItems:"center", justifyContent:"center", color:type.color, flexShrink:0 }}><Icon size={17}/></div>
                            <div style={{ minWidth:0 }}>
                              <h3 style={{ fontSize:"0.9rem", fontWeight:"600", color:t.textPrimary, margin:"0 0 3px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{item.title}</h3>
                              <p style={{ fontSize:"0.78rem", color:t.textMuted, margin:0 }}>
                                {item.employee_name && <span style={{ color:t.textSecondary, fontWeight:"500" }}>{item.employee_name}</span>}
                                {item.employee_name && " • "}
                                {item.employee_email}
                              </p>
                            </div>
                          </div>
                          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"6px", flexShrink:0 }}>
                            <span style={{ padding:"3px 10px", borderRadius:"20px", fontSize:"0.7rem", fontWeight:"600", background:type.bg, color:type.color, display:"inline-flex", alignItems:"center", gap:"4px" }}>
                              <Icon size={11}/>{type.label}
                            </span>
                            <span style={{ padding:"2px 9px", borderRadius:"20px", fontSize:"0.68rem", fontWeight:"600", background:item.status==="sent" ? t.badgeSentBg : t.badgeDraftBg, color:item.status==="sent" ? t.badgeSentText : t.badgeDraftText }}>
                              {item.status==="sent" ? "✓ Sent" : "⏳ Draft"}
                            </span>
                          </div>
                        </div>
                        <p style={{ marginTop:"12px", fontSize:"0.855rem", color:t.textSecondary, lineHeight:"1.6", borderLeft:`3px solid ${type.color}`, paddingLeft:"12px" }}>{item.message}</p>
                        <div style={{ marginTop:"10px", display:"flex", alignItems:"center", gap:"5px", color:t.textMuted, fontSize:"0.72rem" }}>
                          <Clock size={11}/>
                          {new Date(item.createdAt).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {!histLoading && filtered.length > 0 && (
                <div style={{ padding:"11px 22px", borderTop:`1px solid ${t.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:"0.75rem", color:t.textMuted }}>Showing {filtered.length} of {history.length} records</span>
                  <div style={{ display:"flex", alignItems:"center", gap:"5px", color:t.textMuted, fontSize:"0.72rem" }}><CheckCircle2 size={11}/> Up to date</div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppreciationPage;
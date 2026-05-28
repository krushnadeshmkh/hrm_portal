import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import {
  FileText, Send, Save, Clock, Search, Bell,
  Eye, CheckCircle2, Inbox, Filter, X,
  FileCheck, FilePen, Mail, User, Hash, StickyNote,
  RefreshCw, Users, ChevronRight, Pencil,
  Bold, Italic, Underline, List, AlignLeft, AlignCenter,
  AlignRight, Type, Minus,
} from "lucide-react";
import Sidebar from "../../layouts/sidebar";
import MobileTopBar from "../../employee/MobileTopBar";

// const API = "https://hrm-backend-vvqg.onrender.com/api/letters";
// const EMP_API = "https://hrm-backend-vvqg.onrender.com/api/employees";

const API = "http://localhost:5001/api/letters";
const EMP_API = "http://localhost:5001/api/employees";

const letterTypes = [
  { value: "offer",      label: "Offer Letter",     color: "#4F46E5", bg: "#EEF2FF", icon: FileCheck },
  { value: "experience", label: "Experience Cert.", color: "#059669", bg: "#ECFDF5", icon: FileText  },
  { value: "salary",     label: "Salary Slip",      color: "#D97706", bg: "#FFFBEB", icon: FilePen   },
  { value: "relieving",  label: "Relieving Letter", color: "#DB2777", bg: "#FDF2F8", icon: Mail      },
  { value: "custom",     label: "Custom Letter",    color: "#7C3AED", bg: "#F5F3FF", icon: Pencil    },
];

const getType = (v) => letterTypes.find((t) => t.value === v) || letterTypes[0];

const templates = {
  offer: (name) => `<h2 style="color:#4F46E5">Offer Letter</h2><p>Dear <strong>${name || "[Employee Name]"}</strong>,</p><p>We are pleased to offer you the position of <strong>[Job Title]</strong> at SHNOOR INTERNATIONAL LLC, effective <strong>[Start Date]</strong>.</p><p>Your compensation will be <strong>[Salary]</strong> per month.</p><br/><p>Warm regards,<br/><strong>HR Department</strong><br/>SHNOOR INTERNATIONAL LLC</p>`,
  experience: (name) => `<h2 style="color:#059669">Experience Certificate</h2><p>To Whom It May Concern,</p><p>This is to certify that <strong>${name || "[Employee Name]"}</strong> was employed with SHNOOR INTERNATIONAL LLC from <strong>[Start Date]</strong> to <strong>[End Date]</strong> as a <strong>[Designation]</strong>.</p><br/><p>Sincerely,<br/><strong>HR Department</strong><br/>SHNOOR INTERNATIONAL LLC</p>`,
  salary: (name) => `<h2 style="color:#D97706">Salary Slip — [Month Year]</h2><p>Employee: <strong>${name || "[Employee Name]"}</strong></p><table style="width:100%;border-collapse:collapse;margin-top:12px"><tr style="background:#FFFBEB"><th style="padding:8px;text-align:left;border:1px solid #FDE68A">Component</th><th style="padding:8px;text-align:right;border:1px solid #FDE68A">Amount (INR)</th></tr><tr><td style="padding:8px;border:1px solid #F3F4F6">Basic Salary</td><td style="padding:8px;text-align:right;border:1px solid #F3F4F6">[Amount]</td></tr><tr style="background:#FFFBEB;font-weight:bold"><td style="padding:8px;border:1px solid #FDE68A">Net Pay</td><td style="padding:8px;text-align:right;border:1px solid #FDE68A">[Net Amount]</td></tr></table><br/><p><strong>HR Department</strong><br/>SHNOOR INTERNATIONAL LLC</p>`,
  relieving: (name) => `<h2 style="color:#DB2777">Relieving Letter</h2><p>Dear <strong>${name || "[Employee Name]"}</strong>,</p><p>This letter confirms that you have been relieved from your duties as <strong>[Designation]</strong> at SHNOOR INTERNATIONAL LLC effective <strong>[Last Working Day]</strong>.</p><br/><p>Best wishes,<br/><strong>HR Department</strong><br/>SHNOOR INTERNATIONAL LLC</p>`,
  custom: (name, title) => `<h2 style="color:#7C3AED">${title || "[Letter Title]"}</h2><p>Dear <strong>${name || "[Employee Name]"}</strong>,</p><p>Write your letter content here…</p><br/><p>Regards,<br/><strong>HR Department</strong><br/>SHNOOR INTERNATIONAL LLC</p>`,
};

const SHARED = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideIn{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:translateX(0)}}
  @keyframes toastIn{from{opacity:0;transform:translateY(-10px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}
  @keyframes dropIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  .form-input{width:100%;padding:10px 14px;border:1.5px solid #E5E7EB;border-radius:10px;font-size:.875rem;color:#374151;background:#F9FAFB;font-family:'DM Sans',sans-serif;transition:border-color .18s,box-shadow .18s,background .18s;outline:none}
  .form-input:focus{border-color:#4F46E5;box-shadow:0 0 0 3px rgba(79,70,229,.10);background:#fff}
  .form-input.err{border-color:#EF4444}
  .btn-blue{display:flex;align-items:center;justify-content:center;gap:7px;padding:10px 18px;border-radius:10px;font-size:.875rem;font-weight:600;cursor:pointer;border:none;background:linear-gradient(135deg,#4F46E5,#6366F1);color:#fff;font-family:'DM Sans',sans-serif;transition:all .18s}
  .btn-blue:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 6px 16px rgba(79,70,229,.28)}
  .btn-blue:disabled{opacity:.55;cursor:not-allowed}
  .btn-ghost{display:flex;align-items:center;justify-content:center;gap:7px;padding:10px 18px;border-radius:10px;font-size:.875rem;font-weight:600;cursor:pointer;border:1.5px solid #E5E7EB;background:#fff;color:#374151;font-family:'DM Sans',sans-serif;transition:all .18s}
  .btn-ghost:hover:not(:disabled){background:#F9FAFB;transform:translateY(-1px)}
  .btn-ghost:disabled{opacity:.55;cursor:not-allowed}
  .hist-row{transition:background .12s;border-bottom:1px solid #F9FAFB}
  .hist-row:hover{background:#F5F7FF!important}
  .type-chip{padding:6px 12px;border-radius:8px;font-size:.75rem;font-weight:600;display:inline-flex;align-items:center;gap:5px;cursor:pointer;border:1.5px solid transparent;transition:all .15s}
  .type-chip:hover{filter:brightness(.97);transform:translateY(-1px)}
  .search-inp:focus{outline:none;border-color:#4F46E5!important;box-shadow:0 0 0 3px rgba(79,70,229,.10)}
  .emp-dropdown{position:absolute;top:calc(100% + 4px);left:0;right:0;background:#fff;border:1.5px solid #E5E7EB;border-radius:10px;box-shadow:0 8px 24px rgba(15,23,42,.12);z-index:500;overflow:hidden;animation:dropIn .15s ease}
  .emp-option{padding:10px 14px;cursor:pointer;transition:background .1s;display:flex;align-items:center;gap:10px;border-bottom:1px solid #F9FAFB}
  .emp-option:last-child{border-bottom:none}
  .emp-option:hover{background:#F5F7FF}
  .letter-topbar{display:flex!important}
  .rich-editor [data-placeholder]:empty:before{content:attr(data-placeholder);color:#9CA3AF;pointer-events:none}
  *{box-sizing:border-box}

  @media(max-width:768px){
    .letter-topbar{display:none!important}
    .letter-main{padding:72px 14px 32px!important}
    .letter-h1{font-size:1.45rem!important}
    .letter-stats-grid{grid-template-columns:1fr!important}
    .letter-content-grid{grid-template-columns:1fr!important}
    .letter-hist-filters{flex-direction:column!important;align-items:stretch!important;gap:8px!important}
    .letter-hist-search{width:100%!important}
    .letter-hist-select{width:100%!important}
  }
  @media(min-width:769px) and (max-width:1024px){
    .letter-main{padding:24px 20px 32px!important}
    .letter-stats-grid{grid-template-columns:repeat(3,1fr)!important}
    .letter-content-grid{grid-template-columns:320px 1fr!important}
  }
`;
function RichEditor({ value, onChange, accentColor = "#4F46E5" }) {
  const editorRef       = useRef(null);
  const skipSyncRef     = useRef(false);
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (skipSyncRef.current) { skipSyncRef.current = false; return; }
    if (el.innerHTML !== value) el.innerHTML = value || "";
  }, [value]);

  const exec = (cmd, val = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    flush();
  };

  const flush = () => {
    if (!editorRef.current) return;
    skipSyncRef.current = true;
    onChange(editorRef.current.innerHTML);
  };

  const Sep = () => (
    <div style={{ width:"1px", background:"#E5E7EB", margin:"3px 4px", alignSelf:"stretch" }}/>
  );

  const Btn = ({ cmd, val, title, children }) => (
    <button
      title={title}
      onMouseDown={e => { e.preventDefault(); exec(cmd, val); }}
      style={{
        width:"30px", height:"30px", border:"none", borderRadius:"6px",
        background:"transparent", color:"#374151",
        display:"flex", alignItems:"center", justifyContent:"center",
        cursor:"pointer", transition:"background .1s", flexShrink:0,
      }}
      onMouseEnter={e => e.currentTarget.style.background="#EEF2FF"}
      onMouseLeave={e => e.currentTarget.style.background="transparent"}
    >
      {children}
    </button>
  );

  return (
    <div
      className="rich-editor"
      style={{ border:"1.5px solid #E5E7EB", borderRadius:"10px", background:"#fff", overflow:"hidden", transition:"border-color .18s,box-shadow .18s" }}
      onFocusCapture={e => { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}1A`; }}
      onBlurCapture={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ display:"flex", alignItems:"center", gap:"1px", padding:"6px 8px", borderBottom:"1px solid #F1F3F9", background:"#FAFBFF", flexWrap:"wrap" }}>
        <Btn cmd="bold"      title="Bold (Ctrl+B)">      <Bold size={13}/></Btn>
        <Btn cmd="italic"    title="Italic (Ctrl+I)">    <Italic size={13}/></Btn>
        <Btn cmd="underline" title="Underline (Ctrl+U)"> <Underline size={13}/></Btn>
        <Sep/>
        <Btn cmd="formatBlock" val="h2"    title="Heading">     <Type size={13}/></Btn>
        <Btn cmd="formatBlock" val="p"     title="Paragraph">   <span style={{fontSize:"11px",fontWeight:"700"}}>¶</span></Btn>
        <Sep/>
        <Btn cmd="insertUnorderedList" title="Bullet List">   <List size={13}/></Btn>
        <Btn cmd="insertOrderedList"   title="Numbered List">  <span style={{fontSize:"11px",fontWeight:"700"}}>1.</span></Btn>
        <Sep/>
        <Btn cmd="justifyLeft"   title="Align Left">   <AlignLeft size={13}/></Btn>
        <Btn cmd="justifyCenter" title="Align Center"> <AlignCenter size={13}/></Btn>
        <Btn cmd="justifyRight"  title="Align Right">  <AlignRight size={13}/></Btn>
        <Sep/>
        <Btn cmd="insertHorizontalRule" title="Divider"> <Minus size={13}/></Btn>
        <Btn cmd="removeFormat"         title="Clear Formatting">
          <span style={{fontSize:"11px",fontWeight:"700",color:"#EF4444"}}>Tx</span>
        </Btn>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Write your letter content here…"
        onInput={flush}
        onKeyDown={e => {
          if (e.key === "Tab") { e.preventDefault(); exec("insertHTML", "&nbsp;&nbsp;&nbsp;&nbsp;"); }
        }}
        style={{
          minHeight:"200px", maxHeight:"340px", overflowY:"auto",
          padding:"16px 18px", outline:"none",
          fontSize:"0.875rem", lineHeight:1.8, color:"#374151",
          fontFamily:"'DM Sans',sans-serif",
        }}
      />
      <div style={{ padding:"5px 12px", borderTop:"1px solid #F1F3F9", background:"#FAFBFF", display:"flex", gap:"12px", flexWrap:"wrap" }}>
        {[
          { label:"Bold",      keys:"Ctrl+B" },
          { label:"Italic",    keys:"Ctrl+I" },
          { label:"Underline", keys:"Ctrl+U" },
        ].map(h => (
          <span key={h.label} style={{ fontSize:"0.68rem", color:"#9CA3AF" }}>
            <strong style={{color:"#6B7280"}}>{h.label}</strong> {h.keys}
          </span>
        ))}
      </div>
    </div>
  );
}

function EmployeeSelect({ onSelect, selectedEmployee, onClear, token }) {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const wrapRef               = useRef(null);
  const debounceRef           = useRef(null);
  const cfg = { headers: { "x-auth-token": token } };

  const search = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); setOpen(false); return; }
    try {
      setLoading(true); setError("");
      const r = await axios.get(EMP_API, { ...cfg, params: { q, limit: 10 } });
      const data = r.data.data || r.data.employees || r.data || [];
      setResults(Array.isArray(data) ? data : []);
      setOpen(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not load employees");
      setResults([]);
    } finally { setLoading(false); }
  }, [token]);

  const handleInput = (e) => {
    const v = e.target.value; setQuery(v);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(v), 320);
  };

  const pick = (emp) => { onSelect(emp); setQuery(""); setOpen(false); setResults([]); };

  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (selectedEmployee) {
    return (
      <div style={{ display:"flex", alignItems:"center", gap:"8px", padding:"8px 12px", background:"#EEF2FF", border:"1.5px solid #C7D2FE", borderRadius:"10px", fontSize:"0.8rem", fontWeight:"500" }}>
        <div style={{ width:"28px", height:"28px", borderRadius:"50%", background:"linear-gradient(135deg,#4F46E5,#7C3AED)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:"0.65rem", fontWeight:"700", flexShrink:0 }}>
          {(selectedEmployee.name || selectedEmployee.employee_name || "?").slice(0,2).toUpperCase()}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:"600", color:"#111827", fontSize:"0.83rem", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{selectedEmployee.name || selectedEmployee.employee_name}</div>
          <div style={{ fontSize:"0.72rem", color:"#6B7280", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>#{selectedEmployee.employeeId || selectedEmployee.employee_id} · {selectedEmployee.email || selectedEmployee.employee_email}</div>
        </div>
        <button onClick={onClear} style={{ background:"none", border:"none", cursor:"pointer", color:"#9CA3AF", padding:"2px", display:"flex", alignItems:"center" }}><X size={15}/></button>
      </div>
    );
  }

  return (
    <div ref={wrapRef} style={{ position:"relative" }}>
      <div style={{ position:"relative" }}>
        <Search size={14} style={{ position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", color:"#9CA3AF", pointerEvents:"none" }}/>
        <input className="form-input" style={{ paddingLeft:"34px" }} placeholder="Type name or ID to search employees…" value={query} onChange={handleInput} onFocus={() => { if (results.length) setOpen(true); }} autoComplete="off"/>
        {loading && <div style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)" }}><RefreshCw size={14} style={{ color:"#9CA3AF", animation:"spin 1s linear infinite" }}/></div>}
      </div>
      {error && <p style={{ color:"#EF4444", fontSize:"0.72rem", margin:"4px 0 0 2px" }}>{error}</p>}
      {open && results.length > 0 && (
        <div className="emp-dropdown">
          {results.map((emp, i) => {
            const empName = emp.name || emp.employee_name || emp.fullName || "Unknown";
            return (
              <div key={emp._id || i} className="emp-option" onClick={() => pick(emp)}>
                <div style={{ width:"32px", height:"32px", borderRadius:"50%", flexShrink:0, background:"linear-gradient(135deg,#4F46E5,#7C3AED)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:"0.65rem", fontWeight:"700" }}>{empName.slice(0,2).toUpperCase()}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:"600", fontSize:"0.84rem", color:"#111827", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{empName}</div>
                  <div style={{ fontSize:"0.72rem", color:"#9CA3AF" }}>#{emp.employeeId || emp.employee_id || "—"}</div>
                </div>
                <ChevronRight size={14} style={{ color:"#D1D5DB", flexShrink:0 }}/>
              </div>
            );
          })}
        </div>
      )}
      {open && !loading && results.length === 0 && query.trim() && (
        <div className="emp-dropdown" style={{ padding:"16px", textAlign:"center", color:"#9CA3AF", fontSize:"0.82rem" }}>No employees found for "{query}"</div>
      )}
    </div>
  );
}

export default function LetterPage() {
  const name  = localStorage.getItem("name")  || "Admin";
  const token = localStorage.getItem("token") || "";
  const cfg   = { headers: { "x-auth-token": token } };

  const [form, setForm] = useState({
    employeeId: "", employeeName: "", employeeEmail: "",
    letterType: "offer", htmlContent: "", notes: "",
    customTitle: "", customSubject: "",
  });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [errors, setErrors]             = useState({});
  const [history, setHistory]           = useState([]);
  const [histLoading, setHistLoading]   = useState(true);
  const [loading, setLoading]           = useState(false);
  const [search, setSearch]             = useState("");
  const [filterType, setFilterType]     = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [preview, setPreview]           = useState(null);
  const [toast, setToast]               = useState(null);
  const [isOpen, setIsOpen]             = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile]         = useState(window.innerWidth <= 768);

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
  const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3200); };

  const fetchHistory = async () => {
    try { setHistLoading(true); const r = await axios.get(`${API}/history`, cfg); setHistory(r.data.data || []); }
    catch (e) { console.error(e); } finally { setHistLoading(false); }
  };
  useEffect(() => { fetchHistory(); }, []);
  useEffect(() => {
    if (form.letterType === "custom") return;
    const tpl = templates[form.letterType];
    if (tpl) setForm(f => ({ ...f, htmlContent: tpl(f.employeeName) }));
  }, [form.letterType]);

  useEffect(() => {
    if (!selectedEmployee || form.letterType === "custom") return;
    const tpl = templates[form.letterType];
    if (tpl) setForm(f => ({ ...f, htmlContent: tpl(f.employeeName) }));
  }, [form.employeeName]);


  useEffect(() => {
    if (form.letterType !== "custom") return;
    setForm(f => ({ ...f, htmlContent: templates.custom(f.employeeName, f.customTitle) }));
  }, [form.customTitle]);

  const setField = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: "" })); };

  const handleTypeChange = (v) => {
    setErrors({});
    setForm(f => ({
      ...f,
      letterType: v,
      customTitle: "",
      customSubject: "",
      htmlContent: v === "custom"
        ? templates.custom(f.employeeName, "")
        : templates[v] ? templates[v](f.employeeName) : "",
    }));
  };

  const handleEmployeeSelect = (emp) => {
    const empName  = emp.name || emp.employee_name || emp.fullName || "";
    const empId    = emp._id  || emp.employee_id   || emp.empId   || "";
    const empEmail = emp.email || emp.employee_email || emp.empEmail || "";
    setSelectedEmployee(emp);
    setForm(f => ({
      ...f,
      employeeId: empId, employeeName: empName, employeeEmail: empEmail,
      htmlContent: f.letterType === "custom"
        ? templates.custom(empName, f.customTitle)
        : templates[f.letterType] ? templates[f.letterType](empName) : f.htmlContent,
    }));
    setErrors({});
  };

  const handleEmployeeClear = () => {
    setSelectedEmployee(null);
    setForm(f => ({ ...f, employeeId: "", employeeName: "", employeeEmail: "" }));
  };

  const validateCustom = () => {
    if (form.letterType !== "custom") return true;
    const errs = {};
    if (!form.customTitle.trim())   errs.customTitle   = "Letter title is required";
    if (!form.customSubject.trim()) errs.customSubject = "Email subject is required";
    if (Object.keys(errs).length) { setErrors(errs); return false; }
    return true;
  };

  const buildPayload = () => ({
    employeeId:    selectedEmployee?._id || form.employeeId,
    employeeEmail: form.employeeEmail,
    employeeName:  form.employeeName,
    letterType:    form.letterType,
    htmlContent:   form.htmlContent,
    notes:         form.notes || "",
    ...(form.letterType === "custom" && { customTitle: form.customTitle, customSubject: form.customSubject }),
  });

  const handleSend = async () => {
    if (!validateCustom()) return;
    try {
      setLoading(true);
      await axios.post(`${API}/send`, buildPayload(), { headers: { "x-auth-token": token, "Content-Type": "application/json" } });
      showToast("Letter sent successfully!"); fetchHistory();
    } catch { showToast("Send failed", false); } finally { setLoading(false); }
  };
const handleDraft = async () => {
  if (!validateCustom()) return;

  try {
    setLoading(true);
console.log("PAYLOAD:", buildPayload());
    await axios.post(
      `${API}/draft`,
      buildPayload(),
      {
        headers: {
          "x-auth-token": token,
          "Content-Type": "application/json",
        },
      }
    );

    showToast("Draft saved!");
    fetchHistory();

  } catch (err) {
    console.log(err);
    showToast("Draft failed", false);

  } finally {
    setLoading(false);
  }
};

  const filtered = history.filter(item => {
    const q = search.toLowerCase();
    const matchQ = !q || item.employee_name?.toLowerCase().includes(q) || item.employee_email?.toLowerCase().includes(q) || item.employee_id?.toLowerCase().includes(q);
    const matchT = filterType === "all" || item.letter_type === filterType;
    const matchS = filterStatus === "all" || item.status === filterStatus;
    return matchQ && matchT && matchS;
  });

  const sentCount  = history.filter(h => h.status === "sent").length;
  const draftCount = history.filter(h => h.status === "draft").length;
  const selType    = getType(form.letterType);

  return (
    <div style={{ minHeight:"100vh", background:"#F9FAFB", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{SHARED}</style>

      {toast && (
        <div style={{ position:"fixed", top:"20px", right:"24px", zIndex:9999, background:toast.ok?"#059669":"#EF4444", color:"#fff", borderRadius:"12px", padding:"12px 18px", fontSize:"0.875rem", fontWeight:"500", boxShadow:"0 8px 24px rgba(0,0,0,.15)", display:"flex", alignItems:"center", gap:"8px", animation:"toastIn .25s ease" }}>
          {toast.ok ? <CheckCircle2 size={16}/> : <X size={16}/>} {toast.msg}
        </div>
      )}

      <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      {preview && (
        <div onClick={() => setPreview(null)} style={{ position:"fixed", inset:0, background:"rgba(15,23,42,.55)", zIndex:8000, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }}>
          <div onClick={e => e.stopPropagation()} style={{ background:"#fff", borderRadius:"16px", width:"100%", maxWidth:"680px", maxHeight:"85vh", overflow:"hidden", display:"flex", flexDirection:"column", boxShadow:"0 24px 64px rgba(15,23,42,.25)" }}>
            <div style={{ padding:"16px 20px", borderBottom:"1px solid #F1F3F9", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontWeight:"600", color:"#111827", fontSize:"0.9rem" }}>Letter Preview</span>
              <button onClick={() => setPreview(null)} style={{ background:"none", border:"none", cursor:"pointer", color:"#9CA3AF" }}><X size={18}/></button>
            </div>
            <div style={{ padding:"28px 36px", overflowY:"auto", flex:1, fontSize:"0.9rem", lineHeight:1.7, color:"#374151" }} dangerouslySetInnerHTML={{ __html: preview }}/>
          </div>
        </div>
      )}

      <main style={{ marginLeft:`${sidebarWidth}px`, transition:"margin-left 0.25s cubic-bezier(0.4,0,0.2,1)", display:"flex", flexDirection:"column", minHeight:"100vh", minWidth:0 }}>
        <div className="letter-topbar" style={{ height:"64px", background:"#fff", borderBottom:"1px solid #F1F3F9", alignItems:"center", padding:"0 28px", gap:"16px", position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 4px rgba(15,23,42,.04)" }}>
          <div style={{ position:"relative", flex:1, maxWidth:"380px" }}>
            <Search size={15} style={{ position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", color:"#9CA3AF" }}/>
            <input className="search-inp" placeholder="Search anything…" style={{ width:"100%", padding:"8px 12px 8px 36px", border:"1.5px solid #E5E7EB", borderRadius:"10px", fontSize:"0.875rem", color:"#374151", background:"#F9FAFB", fontFamily:"'DM Sans',sans-serif", outline:"none" }}/>
          </div>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:"8px" }}>
            <button style={{ width:"38px", height:"38px", borderRadius:"10px", border:"1.5px solid #E5E7EB", background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#6B7280", position:"relative" }}>
              <Bell size={17}/>
              <span style={{ position:"absolute", top:"8px", right:"8px", width:"7px", height:"7px", borderRadius:"50%", background:"#EF4444", border:"1.5px solid #fff" }}/>
            </button>
            <div style={{ display:"flex", alignItems:"center", gap:"9px", padding:"5px 12px 5px 6px", border:"1.5px solid #E5E7EB", borderRadius:"10px", background:"#fff", cursor:"pointer" }}>
              <div style={{ width:"28px", height:"28px", borderRadius:"50%", background:"linear-gradient(135deg,#4F46E5,#7C3AED)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:"0.72rem", fontWeight:"600" }}>{name.slice(0,2).toUpperCase()}</div>
              <span style={{ fontSize:"0.83rem", fontWeight:"500", color:"#374151" }}>{name}</span>
            </div>
          </div>
        </div>

        <div className="letter-main" style={{ padding:"28px 28px 48px" }}>
          <div style={{ marginBottom:"24px", animation:"fadeUp .4s ease both .05s" }}>
            <p style={{ color:"#6B7280", fontSize:"0.875rem", margin:"0 0 4px" }}>Generate &amp; manage employee documents</p>
            <h1 className="letter-h1" style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.85rem", fontWeight:"700", color:"#111827", margin:0, lineHeight:1.2 }}>Letter Management</h1>
            <p style={{ color:"#9CA3AF", fontSize:"0.85rem", margin:"5px 0 0" }}>{new Date().toLocaleDateString("en-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
          </div>
          <div className="letter-stats-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"14px", marginBottom:"24px" }}>
            {[
              { label:"Total Letters", count:history.length, icon:FileText, color:"#4F46E5", bg:"#EEF2FF" },
              { label:"Sent",          count:sentCount,      icon:Send,     color:"#059669", bg:"#ECFDF5" },
              { label:"Drafts",        count:draftCount,     icon:Save,     color:"#D97706", bg:"#FFFBEB" },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i}
                  style={{ background:"#fff", borderRadius:"14px", padding:"18px 20px", border:"1px solid #F1F3F9", boxShadow:"0 2px 8px rgba(15,23,42,.05)", display:"flex", alignItems:"center", gap:"14px", animation:`fadeUp .4s ease both ${.1+i*.06}s`, transition:"transform .15s,box-shadow .15s", cursor:"default" }}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 20px rgba(15,23,42,.08)"}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 2px 8px rgba(15,23,42,.05)"}}>
                  <div style={{ width:"42px", height:"42px", borderRadius:"11px", background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", color:s.color, flexShrink:0 }}><Icon size={20}/></div>
                  <div>
                    <div style={{ fontSize:"1.6rem", fontWeight:"700", color:"#111827", lineHeight:1, fontFamily:"'Playfair Display',serif" }}>
                      {histLoading ? <span style={{ display:"inline-block", width:"40px", height:"26px", background:"#F3F4F6", borderRadius:"5px" }}/> : s.count}
                    </div>
                    <div style={{ fontSize:"0.75rem", color:"#9CA3AF", fontWeight:"500", marginTop:"3px", textTransform:"uppercase", letterSpacing:"0.4px" }}>{s.label}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="letter-content-grid" style={{ display:"grid", gridTemplateColumns:"420px 1fr", gap:"20px", alignItems:"start" }}>
            <div style={{ background:"#fff", borderRadius:"16px", border:"1px solid #F1F3F9", boxShadow:"0 2px 8px rgba(15,23,42,.05)", overflow:"hidden", animation:"fadeUp .4s ease both .22s" }}>
              <div style={{ padding:"20px 22px 16px", borderBottom:"1px solid #F1F3F9", background:"linear-gradient(135deg,#FAFBFF 0%,#fff 100%)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                  <div style={{ width:"38px", height:"38px", borderRadius:"10px", background:"#EEF2FF", display:"flex", alignItems:"center", justifyContent:"center", color:"#4F46E5" }}><FilePen size={20}/></div>
                  <div>
                    <h2 style={{ fontSize:"1rem", fontWeight:"600", color:"#111827", margin:0 }}>Compose Letter</h2>
                    <p style={{ fontSize:"0.75rem", color:"#9CA3AF", margin:"2px 0 0" }}>Fill details &amp; send or save draft</p>
                  </div>
                </div>
              </div>

              <div style={{ padding:"20px 22px", display:"flex", flexDirection:"column", gap:"16px" }}>
                <div>
                  <label style={{ fontSize:"0.72rem", fontWeight:"600", color:"#6B7280", textTransform:"uppercase", letterSpacing:"0.5px", display:"block", marginBottom:"8px" }}>Letter Type</label>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"7px" }}>
                    {letterTypes.map(t => {
                      const Icon = t.icon; const active = form.letterType === t.value;
                      return (
                        <button key={t.value} className="type-chip"
                          onClick={() => handleTypeChange(t.value)}
                          style={{ background:active?t.bg:"#F9FAFB", color:active?t.color:"#6B7280", borderColor:active?t.color:"transparent" }}>
                          <Icon size={12}/>{t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {form.letterType === "custom" && (
                  <div style={{ display:"flex", flexDirection:"column", gap:"10px", padding:"14px", background:"#F5F3FF", borderRadius:"12px", border:"1.5px dashed #C4B5FD", animation:"fadeUp .25s ease" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                      <Pencil size={13} style={{ color:"#7C3AED" }}/>
                      <p style={{ fontSize:"0.72rem", color:"#7C3AED", margin:0, fontWeight:"600", textTransform:"uppercase", letterSpacing:"0.4px" }}>Custom Letter Details</p>
                    </div>
                    <div>
                      <div style={{ position:"relative" }}>
                        <FileText size={13} style={{ position:"absolute", left:"11px", top:"50%", transform:"translateY(-50%)", color:"#9CA3AF", pointerEvents:"none" }}/>
                        <input type="text" placeholder="Letter Title (e.g. Appreciation Letter)" value={form.customTitle} onChange={e => setField("customTitle", e.target.value)} className={`form-input${errors.customTitle?" err":""}`} style={{ paddingLeft:"30px", fontSize:"0.82rem" }}/>
                      </div>
                      {errors.customTitle && <p style={{ color:"#EF4444", fontSize:"0.72rem", margin:"4px 0 0 2px" }}>{errors.customTitle}</p>}
                    </div>
                    <div>
                      <div style={{ position:"relative" }}>
                        <Mail size={13} style={{ position:"absolute", left:"11px", top:"50%", transform:"translateY(-50%)", color:"#9CA3AF", pointerEvents:"none" }}/>
                        <input type="text" placeholder="Email Subject (e.g. Appreciation — SHNOOR LLC)" value={form.customSubject} onChange={e => setField("customSubject", e.target.value)} className={`form-input${errors.customSubject?" err":""}`} style={{ paddingLeft:"30px", fontSize:"0.82rem" }}/>
                      </div>
                      {errors.customSubject && <p style={{ color:"#EF4444", fontSize:"0.72rem", margin:"4px 0 0 2px" }}>{errors.customSubject}</p>}
                    </div>
                  </div>
                )}
                <div>
                  <label style={{ fontSize:"0.72rem", fontWeight:"600", color:"#6B7280", textTransform:"uppercase", letterSpacing:"0.5px", display:"block", marginBottom:"8px" }}>
                    <span style={{ display:"flex", alignItems:"center", gap:"5px" }}><Users size={11}/> Select Employee</span>
                  </label>
                  <EmployeeSelect token={token} selectedEmployee={selectedEmployee} onSelect={handleEmployeeSelect} onClear={handleEmployeeClear}/>
                </div>
                {selectedEmployee && (
                  <div style={{ display:"flex", flexDirection:"column", gap:"10px", padding:"12px", background:"#F9FAFB", borderRadius:"10px", border:"1px dashed #E5E7EB" }}>
                    <p style={{ fontSize:"0.7rem", color:"#9CA3AF", margin:"0 0 2px", fontWeight:"500" }}>✎ Override fields if needed</p>
                    {[
                      { k:"employeeId",    label:"Employee ID",    icon:Hash, type:"text"  },
                      { k:"employeeName",  label:"Employee Name",  icon:User, type:"text"  },
                      { k:"employeeEmail", label:"Employee Email", icon:Mail, type:"email" },
                    ].map(f => {
                      const Icon = f.icon;
                      return (
                        <div key={f.k} style={{ position:"relative" }}>
                          <Icon size={13} style={{ position:"absolute", left:"11px", top:"50%", transform:"translateY(-50%)", color:"#9CA3AF", pointerEvents:"none" }}/>
                          <input type={f.type} placeholder={f.label} value={form[f.k]} onChange={e => setField(f.k, e.target.value)} className="form-input" style={{ paddingLeft:"30px", fontSize:"0.8rem" }}/>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"8px" }}>
                    <label style={{ fontSize:"0.72rem", fontWeight:"600", color:"#6B7280", textTransform:"uppercase", letterSpacing:"0.5px" }}>Letter Content</label>
                    <button
                      onClick={() => setPreview(form.htmlContent)}
                      style={{ fontSize:"0.72rem", color:"#4F46E5", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:"4px", fontWeight:"500" }}>
                      <Eye size={12}/> Preview
                    </button>
                  </div>
                  <RichEditor
                    value={form.htmlContent}
                    onChange={v => setField("htmlContent", v)}
                    accentColor={selType.color}
                  />
                </div>
                <div style={{ position:"relative" }}>
                  <StickyNote size={14} style={{ position:"absolute", left:"12px", top:"14px", color:"#9CA3AF", pointerEvents:"none" }}/>
                  <textarea rows={2} placeholder="Internal notes (optional)…" value={form.notes} onChange={e => setField("notes", e.target.value)} className="form-input" style={{ paddingLeft:"34px", resize:"none", lineHeight:1.55 }}/>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:"8px", padding:"10px 14px", borderRadius:"10px", background:selType.bg, color:selType.color, fontSize:"0.8rem", fontWeight:"500" }}>
                  {React.createElement(selType.icon, { size:15 })}
                  <span>Composing: <strong>{form.letterType === "custom" && form.customTitle ? form.customTitle : selType.label}</strong></span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
                  <button className="btn-blue" onClick={handleSend} disabled={loading}><Send size={14}/>{loading?"Sending…":"Send Letter"}</button>
                  <button className="btn-ghost" onClick={handleDraft} disabled={loading}><Save size={14}/>{loading?"Saving…":"Save Draft"}</button>
                </div>
              </div>
            </div>
            <div style={{ background:"#fff", borderRadius:"16px", border:"1px solid #F1F3F9", boxShadow:"0 2px 8px rgba(15,23,42,.05)", overflow:"hidden", animation:"fadeUp .4s ease both .28s" }}>
              <div style={{ padding:"18px 22px", borderBottom:"1px solid #F1F3F9", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px", flexWrap:"wrap" }}>
                <div>
                  <h2 style={{ fontSize:"1rem", fontWeight:"600", color:"#111827", margin:"0 0 2px" }}>Letter History</h2>
                  <p style={{ fontSize:"0.78rem", color:"#9CA3AF", margin:0, display:"flex", alignItems:"center", gap:"5px" }}><Clock size={12}/>{filtered.length} record{filtered.length!==1?"s":""} found</p>
                </div>
                <div className="letter-hist-filters" style={{ display:"flex", gap:"8px", flexWrap:"wrap", alignItems:"center" }}>
                  <div style={{ position:"relative" }}>
                    <Filter size={12} style={{ position:"absolute", left:"9px", top:"50%", transform:"translateY(-50%)", color:"#9CA3AF", pointerEvents:"none" }}/>
                    <select value={filterType} aria-label="Filter by type" onChange={e => setFilterType(e.target.value)} className="letter-hist-select" style={{ padding:"7px 12px 7px 26px", border:"1.5px solid #E5E7EB", borderRadius:"9px", fontSize:"0.78rem", color:"#374151", background:"#F9FAFB", fontFamily:"'DM Sans',sans-serif", outline:"none", cursor:"pointer", appearance:"none" }}>
                      <option value="all">All Types</option>
                      {letterTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <select aria-label="Filter by status" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="letter-hist-select" style={{ padding:"7px 12px", border:"1.5px solid #E5E7EB", borderRadius:"9px", fontSize:"0.78rem", color:"#374151", background:"#F9FAFB", fontFamily:"'DM Sans',sans-serif", outline:"none", cursor:"pointer", appearance:"none" }}>
                    <option value="all">All Status</option>
                    <option value="sent">Sent</option>
                    <option value="draft">Draft</option>
                  </select>
                  <div style={{ position:"relative" }}>
                    <Search size={13} style={{ position:"absolute", left:"9px", top:"50%", transform:"translateY(-50%)", color:"#9CA3AF" }}/>
                    <input className="search-inp letter-hist-search" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} style={{ padding:"7px 12px 7px 28px", border:"1.5px solid #E5E7EB", borderRadius:"9px", fontSize:"0.78rem", color:"#374151", background:"#F9FAFB", fontFamily:"'DM Sans',sans-serif", width:"170px", outline:"none" }}/>
                  </div>
                  <button onClick={fetchHistory} title="Refresh" style={{ width:"34px", height:"34px", border:"1.5px solid #E5E7EB", borderRadius:"9px", background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", color:"#6B7280", cursor:"pointer" }}><RefreshCw size={14}/></button>
                </div>
              </div>

              <div style={{ maxHeight:"600px", overflowY:"auto" }}>
                {histLoading ? (
                  Array.from({length:4}).map((_,i) => (
                    <div key={i} style={{ padding:"18px 22px", borderBottom:"1px solid #F9FAFB" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"10px" }}>
                        <div style={{ height:"14px", width:"180px", background:"#F3F4F6", borderRadius:"4px" }}/>
                        <div style={{ height:"22px", width:"80px", background:"#F3F4F6", borderRadius:"20px" }}/>
                      </div>
                      <div style={{ height:"12px", width:"100%", background:"#F3F4F6", borderRadius:"4px" }}/>
                    </div>
                  ))
                ) : filtered.length === 0 ? (
                  <div style={{ padding:"60px 20px", textAlign:"center" }}>
                    <div style={{ width:"52px", height:"52px", borderRadius:"14px", background:"#F3F4F6", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px", color:"#D1D5DB" }}><Inbox size={24}/></div>
                    <p style={{ color:"#9CA3AF", fontSize:"0.875rem", margin:0, fontWeight:"500" }}>No letters found</p>
                    <p style={{ color:"#D1D5DB", fontSize:"0.78rem", margin:"4px 0 0" }}>Compose and send your first letter!</p>
                  </div>
                ) : (
                  filtered.map((item, idx) => {
                    const type = getType(item.letter_type || item.letterType);
                    const Icon = type.icon;
                    const displayLabel = (item.letterType === "custom" || item.letter_type === "custom") && item.customTitle ? item.customTitle : type.label;
                    return (
                      <div key={item._id || idx} className="hist-row" style={{ padding:"16px 22px", animation:`slideIn .3s ease both ${idx*.04}s` }}>
                        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"12px" }}>
                          <div style={{ display:"flex", gap:"12px", alignItems:"flex-start", minWidth:0 }}>
                            <div style={{ width:"38px", height:"38px", borderRadius:"10px", background:type.bg, display:"flex", alignItems:"center", justifyContent:"center", color:type.color, flexShrink:0 }}><Icon size={17}/></div>
                            <div style={{ minWidth:0 }}>
                              <div style={{ display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap" }}>
                                <span style={{ fontSize:"0.875rem", fontWeight:"600", color:"#111827" }}>{item.employeeName || "—"}</span>
                                <span style={{ fontSize:"0.7rem", color:"#9CA3AF", background:"#F3F4F6", padding:"1px 7px", borderRadius:"6px", fontWeight:"500" }}>#{item.employeeId}</span>
                              </div>
                              <p style={{ fontSize:"0.78rem", color:"#9CA3AF", margin:"2px 0 0" }}>{item.employeeEmail}</p>
                              {item.customSubject && (
                                <p style={{ fontSize:"0.75rem", color:"#7C3AED", margin:"2px 0 0", display:"flex", alignItems:"center", gap:"4px" }}>
                                  <Mail size={10}/> {item.customSubject}
                                </p>
                              )}
                            </div>
                          </div>
                          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"5px", flexShrink:0 }}>
                            <span style={{ padding:"3px 10px", borderRadius:"20px", fontSize:"0.7rem", fontWeight:"600", background:type.bg, color:type.color, display:"inline-flex", alignItems:"center", gap:"4px" }}><Icon size={10}/>{displayLabel}</span>
                            <span style={{ padding:"2px 9px", borderRadius:"20px", fontSize:"0.68rem", fontWeight:"600", background:item.status==="sent"?"#ECFDF5":"#FFFBEB", color:item.status==="sent"?"#059669":"#D97706" }}>{item.status==="sent"?"✓ Sent":"⏳ Draft"}</span>
                          </div>
                        </div>
                        {item.notes && <p style={{ margin:"10px 0 0 50px", fontSize:"0.8rem", color:"#6B7280", fontStyle:"italic", borderLeft:"2px solid #E5E7EB", paddingLeft:"10px" }}>{item.notes}</p>}
                        <div style={{ marginTop:"10px", display:"flex", alignItems:"center", gap:"5px", color:"#9CA3AF", fontSize:"0.72rem" }}>
                          <Clock size={11}/>
                          {new Date(item.createdAt || item.sent_at).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {!histLoading && filtered.length > 0 && (
                <div style={{ padding:"11px 22px", borderTop:"1px solid #F1F3F9", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:"0.75rem", color:"#9CA3AF" }}>Showing {filtered.length} of {history.length} records</span>
                  <div style={{ display:"flex", alignItems:"center", gap:"5px", color:"#9CA3AF", fontSize:"0.72rem" }}><CheckCircle2 size={11}/> Up to date</div>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
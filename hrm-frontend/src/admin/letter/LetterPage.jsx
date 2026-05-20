import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import {
  FileText, Send, Save, Clock, Search, Bell,
  Eye, CheckCircle2, Inbox, Filter, X, ChevronDown,
  FileCheck, FilePen, Mail, User, Hash, StickyNote,
  Download, RefreshCw, Users, ChevronRight,
} from "lucide-react";
import Sidebar from "../../layouts/sidebar";

const API = "http://localhost:5001/api/letters";
const EMP_API = "http://localhost:5001/api/employees";

const letterTypes = [
  { value: "offer",      label: "Offer Letter",     color: "#4F46E5", bg: "#EEF2FF", icon: FileCheck },
  { value: "experience", label: "Experience Cert.", color: "#059669", bg: "#ECFDF5", icon: FileText  },
  { value: "salary",     label: "Salary Slip",      color: "#D97706", bg: "#FFFBEB", icon: FilePen   },
  { value: "relieving",  label: "Relieving Letter", color: "#DB2777", bg: "#FDF2F8", icon: Mail      },
];

const getType = (v) => letterTypes.find((t) => t.value === v) || letterTypes[0];

const templates = {
  offer: (name) => `<h2 style="color:#4F46E5">Offer Letter</h2>
<p>Dear <strong>${name || "[Employee Name]"}</strong>,</p>
<p>We are pleased to offer you the position of <strong>[Job Title]</strong> at SHNOOR INTERNATIONAL LLC, effective <strong>[Start Date]</strong>.</p>
<p>Your compensation will be <strong>[Salary]</strong> per month. This offer is contingent upon successful completion of a background check.</p>
<p>Please sign and return a copy of this letter by <strong>[Response Deadline]</strong>.</p>
<br/><p>Warm regards,<br/><strong>HR Department</strong><br/>SHNOOR INTERNATIONAL LLC</p>`,

  experience: (name) => `<h2 style="color:#059669">Experience Certificate</h2>
<p>To Whom It May Concern,</p>
<p>This is to certify that <strong>${name || "[Employee Name]"}</strong> was employed with SHNOOR INTERNATIONAL LLC from <strong>[Start Date]</strong> to <strong>[End Date]</strong> as a <strong>[Designation]</strong>.</p>
<p>During their tenure, they demonstrated dedication and professionalism. We wish them all the best in their future endeavours.</p>
<br/><p>Sincerely,<br/><strong>HR Department</strong><br/>SHNOOR INTERNATIONAL LLC</p>`,

  salary: (name) => `<h2 style="color:#D97706">Salary Slip — [Month Year]</h2>
<p>Employee: <strong>${name || "[Employee Name]"}</strong></p>
<table style="width:100%;border-collapse:collapse;margin-top:12px">
<tr style="background:#FFFBEB"><th style="padding:8px;text-align:left;border:1px solid #FDE68A">Component</th><th style="padding:8px;text-align:right;border:1px solid #FDE68A">Amount (INR)</th></tr>
<tr><td style="padding:8px;border:1px solid #F3F4F6">Basic Salary</td><td style="padding:8px;text-align:right;border:1px solid #F3F4F6">[Amount]</td></tr>
<tr><td style="padding:8px;border:1px solid #F3F4F6">HRA</td><td style="padding:8px;text-align:right;border:1px solid #F3F4F6">[Amount]</td></tr>
<tr><td style="padding:8px;border:1px solid #F3F4F6">Deductions (PF/Tax)</td><td style="padding:8px;text-align:right;border:1px solid #F3F4F6">-[Amount]</td></tr>
<tr style="background:#FFFBEB;font-weight:bold"><td style="padding:8px;border:1px solid #FDE68A">Net Pay</td><td style="padding:8px;text-align:right;border:1px solid #FDE68A">[Net Amount]</td></tr>
</table>
<br/><p><strong>HR Department</strong><br/>SHNOOR INTERNATIONAL LLC</p>`,

  relieving: (name) => `<h2 style="color:#DB2777">Relieving Letter</h2>
<p>Dear <strong>${name || "[Employee Name]"}</strong>,</p>
<p>This letter confirms that you have been relieved from your duties as <strong>[Designation]</strong> at SHNOOR INTERNATIONAL LLC effective <strong>[Last Working Day]</strong>.</p>
<p>We appreciate your contributions during your tenure and wish you success in your future endeavours. All company property has been returned and your full and final settlement is being processed.</p>
<br/><p>Best wishes,<br/><strong>HR Department</strong><br/>SHNOOR INTERNATIONAL LLC</p>`,
};

const SHARED = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
  @keyframes fadeUp { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
  @keyframes slideIn { from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:translateX(0)} }
  @keyframes toastIn { from{opacity:0;transform:translateY(-10px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes dropIn { from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)} }
  @keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }
  .form-input{width:100%;padding:10px 14px;border:1.5px solid #E5E7EB;border-radius:10px;font-size:0.875rem;color:#374151;background:#F9FAFB;font-family:'DM Sans',sans-serif;transition:border-color .18s,box-shadow .18s,background .18s;outline:none}
  .form-input:focus{border-color:#4F46E5;box-shadow:0 0 0 3px rgba(79,70,229,.10);background:#fff}
  .form-input.err{border-color:#EF4444;box-shadow:0 0 0 3px rgba(239,68,68,.08)}
  .btn-blue{display:flex;align-items:center;justify-content:center;gap:7px;padding:10px 18px;border-radius:10px;font-size:0.875rem;font-weight:600;cursor:pointer;border:none;background:linear-gradient(135deg,#4F46E5,#6366F1);color:#fff;font-family:'DM Sans',sans-serif;transition:all .18s}
  .btn-blue:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 6px 16px rgba(79,70,229,.28)}
  .btn-blue:disabled{opacity:.55;cursor:not-allowed}
  .btn-ghost{display:flex;align-items:center;justify-content:center;gap:7px;padding:10px 18px;border-radius:10px;font-size:0.875rem;font-weight:600;cursor:pointer;border:1.5px solid #E5E7EB;background:#fff;color:#374151;font-family:'DM Sans',sans-serif;transition:all .18s}
  .btn-ghost:hover:not(:disabled){background:#F9FAFB;transform:translateY(-1px);box-shadow:0 4px 12px rgba(15,23,42,.08)}
  .btn-ghost:disabled{opacity:.55;cursor:not-allowed}
  .hist-row{transition:background .12s;border-bottom:1px solid #F9FAFB}
  .hist-row:hover{background:#F5F7FF!important}
  .type-chip{padding:6px 12px;border-radius:8px;font-size:0.75rem;font-weight:600;display:inline-flex;align-items:center;gap:5px;cursor:pointer;border:1.5px solid transparent;transition:all .15s}
  .type-chip:hover{filter:brightness(.97);transform:translateY(-1px)}
  .topbar-btn:hover{background:#F3F4F6!important}
  .search-inp:focus{outline:none;border-color:#4F46E5!important;box-shadow:0 0 0 3px rgba(79,70,229,.10)}
  .emp-dropdown{position:absolute;top:calc(100% + 4px);left:0;right:0;background:#fff;border:1.5px solid #E5E7EB;border-radius:10px;box-shadow:0 8px 24px rgba(15,23,42,.12);z-index:500;overflow:hidden;animation:dropIn .15s ease}
  .emp-option{padding:10px 14px;cursor:pointer;transition:background .1s;display:flex;align-items:center;gap:10px;border-bottom:1px solid #F9FAFB}
  .emp-option:last-child{border-bottom:none}
  .emp-option:hover{background:#F5F7FF}
  .emp-selected-badge{display:flex;align-items:center;gap:8px;padding:8px 12px;background:#EEF2FF;border:1.5px solid #C7D2FE;border-radius:10px;color:#4F46E5;font-size:0.8rem;font-weight:500}
  *{box-sizing:border-box}
`;

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
      setLoading(true);
      setError("");
      const r = await axios.get(`${EMP_API}`, { ...cfg, params: { q, limit: 10 } });
      const data = r.data.data || r.data.employees || r.data || [];
      setResults(Array.isArray(data) ? data : []);
      setOpen(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not load employees");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleInput = (e) => {
    const v = e.target.value;
    setQuery(v);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(v), 320);
  };

  const pick = (emp) => {
    onSelect(emp);
    setQuery("");
    setOpen(false);
    setResults([]);
  };

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (selectedEmployee) {
    return (
      <div className="emp-selected-badge">
        <div style={{
          width: "28px", height: "28px", borderRadius: "50%",
          background: "linear-gradient(135deg,#4F46E5,#7C3AED)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: "0.65rem", fontWeight: "700", flexShrink: 0,
        }}>
          {(selectedEmployee.name || selectedEmployee.employee_name || "?").slice(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: "600", color: "#111827", fontSize: "0.83rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {selectedEmployee.name || selectedEmployee.employee_name}
          </div>
          <div style={{ fontSize: "0.72rem", color: "#6B7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            #{selectedEmployee.employeeId || selectedEmployee.employee_id} · {selectedEmployee.email || selectedEmployee.employee_email}
          </div>
        </div>
        <button onClick={onClear} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: "2px", display: "flex", alignItems: "center" }} title="Change employee">
          <X size={15} />
        </button>
      </div>
    );
  }

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", pointerEvents: "none" }} />
        <input
          className="form-input"
          style={{ paddingLeft: "34px", paddingRight: loading ? "36px" : "14px" }}
          placeholder="Type name or ID to search employees…"
          value={query}
          onChange={handleInput}
          onFocus={() => { if (results.length) setOpen(true); }}
          autoComplete="off"
        />
        {loading && (
          <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)" }}>
            <RefreshCw size={14} style={{ color: "#9CA3AF", animation: "spin 1s linear infinite" }} />
          </div>
        )}
      </div>

      {error && <p style={{ color: "#EF4444", fontSize: "0.72rem", margin: "4px 0 0 2px" }}>{error}</p>}

      {open && results.length > 0 && (
        <div className="emp-dropdown">
          {results.map((emp, i) => {
            const empName  = emp.name       || emp.employee_name  || emp.fullName || "Unknown";
            const empId    = emp.employeeId || emp.employee_id    || emp.empId    || "—";
            const empEmail = emp.email      || emp.employee_email || emp.empEmail || "";
            const empDept  = emp.department || emp.dept           || "";
            return (
              <div key={emp._id || emp.id || i} className="emp-option" onClick={() => pick(emp)}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg,#4F46E5,#7C3AED)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: "0.65rem", fontWeight: "700",
                }}>
                  {empName.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: "600", fontSize: "0.84rem", color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {empName}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#9CA3AF" }}>
                    #{empId}{empDept ? ` · ${empDept}` : ""}{empEmail ? ` · ${empEmail}` : ""}
                  </div>
                </div>
                <ChevronRight size={14} style={{ color: "#D1D5DB", flexShrink: 0 }} />
              </div>
            );
          })}
        </div>
      )}

      {open && !loading && results.length === 0 && query.trim() && (
        <div className="emp-dropdown" style={{ padding: "16px", textAlign: "center", color: "#9CA3AF", fontSize: "0.82rem" }}>
          No employees found for "{query}"
        </div>
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
  });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [errors, setErrors]         = useState({});
  const [history, setHistory]       = useState([]);
  const [histLoading, setHistLoading] = useState(true);
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState("");
  const [filterType, setFilterType]     = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [preview, setPreview]       = useState(null);
  const [toast, setToast]           = useState(null);
  const [isOpen, setIsOpen]         = useState(true);
  const sidebarWidth                = isOpen ? 255 : 68;

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3200);
  };

  const fetchHistory = async () => {
    try {
      setHistLoading(true);
      const r = await axios.get(`${API}/history`, cfg);
      setHistory(r.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setHistLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  useEffect(() => {
    const tpl = templates[form.letterType];
    if (tpl) setForm(f => ({ ...f, htmlContent: tpl(f.employeeName) }));
  }, [form.letterType]);

  useEffect(() => {
    if (!selectedEmployee) return;
    const tpl = templates[form.letterType];
    if (tpl) setForm(f => ({ ...f, htmlContent: tpl(f.employeeName) }));
  }, [form.employeeName]);

  const setField = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: "" }));
  };

  const handleEmployeeSelect = (emp) => {
    const empName  = emp.name       || emp.employee_name  || emp.fullName || "";
    const empId    = emp._id        || emp.employee_id    || emp.empId    || "";
    const empEmail = emp.email      || emp.employee_email || emp.empEmail || "";
    setSelectedEmployee(emp);
    const tpl = templates[form.letterType];
    setForm(f => ({
      ...f,
      employeeId:    empId,
      employeeName:  empName,
      employeeEmail: empEmail,
      htmlContent:   tpl ? tpl(empName) : f.htmlContent,
    }));
    setErrors({});
  };

  const handleEmployeeClear = () => {
    setSelectedEmployee(null);
    setForm(f => ({ ...f, employeeId: "", employeeName: "", employeeEmail: "" }));
  };

  const validate = (requireEmail = true) => {
    const e = {};
    if (!form.employeeId.trim())   e.employeeId   = "Employee ID is required";
    if (!form.employeeName.trim()) e.employeeName = "Name is required";
    if (requireEmail && !form.employeeEmail.trim()) e.employeeEmail = "Email is required";
    else if (requireEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.employeeEmail))
      e.employeeEmail = "Enter a valid email";
    if (!form.htmlContent.trim()) e.htmlContent = "Letter content is required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSend = async () => {
    const payload = {
      employeeId:    selectedEmployee?._id || form.employeeId,
      employeeEmail: form.employeeEmail,
      employeeName:  form.employeeName,
      letterType:    form.letterType,
      htmlContent:   form.htmlContent,
      notes:         form.notes || "",
    };
    try {
      setLoading(true);
      await axios.post(`${API}/send`, payload, {
        headers: { "x-auth-token": token, "Content-Type": "application/json" },
      });
      showToast("Letter sent successfully!");
      fetchHistory();
    } catch (err) {
      showToast("Send failed", false);
    } finally {
      setLoading(false);
    }
  };

  const handleDraft = async () => {
    const payload = {
      employeeId:    selectedEmployee?._id || form.employeeId,
      employeeEmail: form.employeeEmail,
      employeeName:  form.employeeName,
      letterType:    form.letterType,
      htmlContent:   form.htmlContent,
      notes:         form.notes || "",
    };
    try {
      setLoading(true);
      await axios.post(`${API}/draft`, payload, {
        headers: { "x-auth-token": token, "Content-Type": "application/json" },
      });
      showToast("Draft saved!");
      fetchHistory();
    } catch (err) {
      showToast("Draft failed", false);
    } finally {
      setLoading(false);
    }
  };

  const filtered = history.filter(item => {
    const q      = search.toLowerCase();
    const matchQ = !q || item.employee_name?.toLowerCase().includes(q) ||
      item.employee_email?.toLowerCase().includes(q) || item.employee_id?.toLowerCase().includes(q);
    const matchT = filterType   === "all" || item.letter_type === filterType;
    const matchS = filterStatus === "all" || item.status      === filterStatus;
    return matchQ && matchT && matchS;
  });

  const sentCount  = history.filter(h => h.status === "sent").length;
  const draftCount = history.filter(h => h.status === "draft").length;
  const selType    = getType(form.letterType);

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{SHARED}</style>

      {toast && (
        <div style={{
          position: "fixed", top: "20px", right: "24px", zIndex: 9999,
          background: toast.ok ? "#059669" : "#EF4444",
          color: "#fff", borderRadius: "12px", padding: "12px 18px",
          fontSize: "0.875rem", fontWeight: "500",
          boxShadow: "0 8px 24px rgba(0,0,0,.15)",
          display: "flex", alignItems: "center", gap: "8px",
          animation: "toastIn .25s ease",
        }}>
          {toast.ok ? <CheckCircle2 size={16} /> : <X size={16} />}
          {toast.msg}
        </div>
      )}

      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      {preview && (
        <div onClick={() => setPreview(null)} style={{
          position: "fixed", inset: 0, background: "rgba(15,23,42,.55)",
          zIndex: 8000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "680px",
            maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column",
            boxShadow: "0 24px 64px rgba(15,23,42,.25)",
          }}>
            <div style={{
              padding: "16px 20px", borderBottom: "1px solid #F1F3F9",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontWeight: "600", color: "#111827", fontSize: "0.9rem" }}>Letter Preview</span>
              <button onClick={() => setPreview(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}>
                <X size={18} />
              </button>
            </div>
            <div
              style={{ padding: "28px 36px", overflowY: "auto", flex: 1, fontSize: "0.9rem", lineHeight: 1.7, color: "#374151" }}
              dangerouslySetInnerHTML={{ __html: preview }}
            />
          </div>
        </div>
      )}

      <div style={{
        marginLeft: `${sidebarWidth}px`,
        transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column", minHeight: "100vh",
      }}>
        <div style={{
          height: "64px", background: "#fff", borderBottom: "1px solid #F1F3F9",
          display: "flex", alignItems: "center", padding: "0 28px", gap: "16px",
          position: "sticky", top: 0, zIndex: 100,
          boxShadow: "0 1px 4px rgba(15,23,42,.04)",
        }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "380px" }}>
            <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
            <input className="search-inp" placeholder="Search anything…" style={{
              width: "100%", padding: "8px 12px 8px 36px", border: "1.5px solid #E5E7EB",
              borderRadius: "10px", fontSize: "0.875rem", color: "#374151", background: "#F9FAFB",
              fontFamily: "'DM Sans',sans-serif", outline: "none",
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
                background: "linear-gradient(135deg,#4F46E5,#7C3AED)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: "0.72rem", fontWeight: "600",
              }}>{name.slice(0, 2).toUpperCase()}</div>
              <span style={{ fontSize: "0.83rem", fontWeight: "500", color: "#374151" }}>{name}</span>
            </div>
          </div>
        </div>

        <div style={{ padding: "28px 28px 48px" }}>
          <div style={{ marginBottom: "24px", animation: "fadeUp .4s ease both .05s" }}>
            <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0 0 4px" }}>Generate &amp; manage employee documents</p>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.85rem", fontWeight: "700", color: "#111827", margin: 0, lineHeight: 1.2 }}>
              Letter Management
            </h1>
            <p style={{ color: "#9CA3AF", fontSize: "0.85rem", margin: "5px 0 0" }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "14px", marginBottom: "24px" }}>
            {[
              { label: "Total Letters", count: history.length, icon: FileText, color: "#4F46E5", bg: "#EEF2FF" },
              { label: "Sent",          count: sentCount,      icon: Send,     color: "#059669", bg: "#ECFDF5" },
              { label: "Drafts",        count: draftCount,     icon: Save,     color: "#D97706", bg: "#FFFBEB" },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} style={{
                  background: "#fff", borderRadius: "14px", padding: "18px 20px",
                  border: "1px solid #F1F3F9", boxShadow: "0 2px 8px rgba(15,23,42,.05)",
                  display: "flex", alignItems: "center", gap: "14px",
                  animation: `fadeUp .4s ease both ${.1 + i * .06}s`,
                  transition: "transform .15s,box-shadow .15s", cursor: "default",
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(15,23,42,.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 8px rgba(15,23,42,.05)"; }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "11px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", color: s.color, flexShrink: 0 }}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: "1.6rem", fontWeight: "700", color: "#111827", lineHeight: 1, fontFamily: "'Playfair Display',serif" }}>
                      {histLoading
                        ? <span style={{ display: "inline-block", width: "40px", height: "26px", background: "#F3F4F6", borderRadius: "5px" }} />
                        : s.count}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#9CA3AF", fontWeight: "500", marginTop: "3px", textTransform: "uppercase", letterSpacing: "0.4px" }}>{s.label}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "20px", alignItems: "start" }}>

            <div style={{
              background: "#fff", borderRadius: "16px", border: "1px solid #F1F3F9",
              boxShadow: "0 2px 8px rgba(15,23,42,.05)", overflow: "hidden",
              animation: "fadeUp .4s ease both .22s",
            }}>
              <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid #F1F3F9", background: "linear-gradient(135deg,#FAFBFF 0%,#fff 100%)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#4F46E5" }}>
                    <FilePen size={20} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "#111827", margin: 0 }}>Compose Letter</h2>
                    <p style={{ fontSize: "0.75rem", color: "#9CA3AF", margin: "2px 0 0" }}>Fill details &amp; send or save</p>
                  </div>
                </div>
              </div>

              <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "0.72rem", fontWeight: "600", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "8px" }}>Letter Type</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
                    {letterTypes.map(t => {
                      const Icon   = t.icon;
                      const active = form.letterType === t.value;
                      return (
                        <button key={t.value} className="type-chip"
                          onClick={() => setField("letterType", t.value)}
                          style={{ background: active ? t.bg : "#F9FAFB", color: active ? t.color : "#6B7280", borderColor: active ? t.color : "transparent" }}>
                          <Icon size={12} />{t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.72rem", fontWeight: "600", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "8px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <Users size={11} /> Select Employee
                    </span>
                  </label>
                  <EmployeeSelect
                    token={token}
                    selectedEmployee={selectedEmployee}
                    onSelect={handleEmployeeSelect}
                    onClear={handleEmployeeClear}
                  />
                  {(errors.employeeId || errors.employeeName || errors.employeeEmail) && !selectedEmployee && (
                    <p style={{ color: "#EF4444", fontSize: "0.72rem", margin: "4px 0 0 2px" }}>
                      Please select an employee
                    </p>
                  )}
                </div>

                {selectedEmployee && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "12px", background: "#F9FAFB", borderRadius: "10px", border: "1px dashed #E5E7EB" }}>
                    <p style={{ fontSize: "0.7rem", color: "#9CA3AF", margin: "0 0 2px", fontWeight: "500" }}>
                      ✎ Override fields if needed
                    </p>
                    {[
                      { k: "employeeId",    label: "Employee ID",    icon: Hash, type: "text"  },
                      { k: "employeeName",  label: "Employee Name",  icon: User, type: "text"  },
                      { k: "employeeEmail", label: "Employee Email", icon: Mail, type: "email" },
                    ].map(f => {
                      const Icon = f.icon;
                      return (
                        <div key={f.k} style={{ position: "relative" }}>
                          <Icon size={13} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", pointerEvents: "none" }} />
                          <input type={f.type} placeholder={f.label} value={form[f.k]}
                            onChange={e => setField(f.k, e.target.value)}
                            className={`form-input${errors[f.k] ? " err" : ""}`}
                            style={{ paddingLeft: "30px", padding: "8px 12px 8px 30px", fontSize: "0.8rem" }} />
                          {errors[f.k] && <p style={{ color: "#EF4444", fontSize: "0.7rem", margin: "3px 0 0 2px" }}>{errors[f.k]}</p>}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                    <label style={{ fontSize: "0.72rem", fontWeight: "600", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>Letter Content (HTML)</label>
                    <button
                      onClick={() => setPreview(form.htmlContent)}
                      style={{ fontSize: "0.72rem", color: "#4F46E5", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontWeight: "500" }}>
                      <Eye size={12} /> Preview
                    </button>
                  </div>
                  <textarea rows={8} placeholder="HTML content…" value={form.htmlContent}
                    onChange={e => setField("htmlContent", e.target.value)}
                    className={`form-input${errors.htmlContent ? " err" : ""}`}
                    style={{ resize: "vertical", lineHeight: 1.55, fontFamily: "'Courier New',monospace", fontSize: "0.78rem" }} />
                  {errors.htmlContent && <p style={{ color: "#EF4444", fontSize: "0.72rem", margin: "4px 0 0 2px" }}>{errors.htmlContent}</p>}
                </div>

                <div>
                  <div style={{ position: "relative" }}>
                    <StickyNote size={14} style={{ position: "absolute", left: "12px", top: "14px", color: "#9CA3AF", pointerEvents: "none" }} />
                    <textarea rows={2} placeholder="Internal notes (optional)…" value={form.notes}
                      onChange={e => setField("notes", e.target.value)}
                      className="form-input" style={{ paddingLeft: "34px", resize: "none", lineHeight: 1.55 }} />
                  </div>
                </div>

                <div style={{
                  display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px",
                  borderRadius: "10px", background: selType.bg, color: selType.color,
                  fontSize: "0.8rem", fontWeight: "500",
                }}>
                  {React.createElement(selType.icon, { size: 15 })}
                  <span>Composing: <strong>{selType.label}</strong></span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", paddingTop: "4px" }}>
                  <button className="btn-blue" onClick={handleSend} disabled={loading}>
                    <Send size={14} />{loading ? "Sending…" : "Send Letter"}
                  </button>
                  <button className="btn-ghost" onClick={handleDraft} disabled={loading}>
                    <Save size={14} />{loading ? "Saving…" : "Save Draft"}
                  </button>
                </div>
              </div>
            </div>

            <div style={{
              background: "#fff", borderRadius: "16px", border: "1px solid #F1F3F9",
              boxShadow: "0 2px 8px rgba(15,23,42,.05)", overflow: "hidden",
              animation: "fadeUp .4s ease both .28s",
            }}>
              <div style={{
                padding: "18px 22px", borderBottom: "1px solid #F1F3F9",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: "12px", flexWrap: "wrap",
              }}>
                <div>
                  <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "#111827", margin: "0 0 2px" }}>Letter History</h2>
                  <p style={{ fontSize: "0.78rem", color: "#9CA3AF", margin: 0, display: "flex", alignItems: "center", gap: "5px" }}>
                    <Clock size={12} />{filtered.length} record{filtered.length !== 1 ? "s" : ""} found
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                  <div style={{ position: "relative" }}>
                    <Filter size={12} style={{ position: "absolute", left: "9px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", pointerEvents: "none" }} />
                    <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{
                      padding: "7px 12px 7px 26px", border: "1.5px solid #E5E7EB", borderRadius: "9px",
                      fontSize: "0.78rem", color: "#374151", background: "#F9FAFB",
                      fontFamily: "'DM Sans',sans-serif", outline: "none", cursor: "pointer", appearance: "none",
                    }}>
                      <option value="all">All Types</option>
                      {letterTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{
                    padding: "7px 12px", border: "1.5px solid #E5E7EB", borderRadius: "9px",
                    fontSize: "0.78rem", color: "#374151", background: "#F9FAFB",
                    fontFamily: "'DM Sans',sans-serif", outline: "none", cursor: "pointer", appearance: "none",
                  }}>
                    <option value="all">All Status</option>
                    <option value="sent">Sent</option>
                    <option value="draft">Draft</option>
                  </select>
                  <div style={{ position: "relative" }}>
                    <Search size={13} style={{ position: "absolute", left: "9px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                    <input className="search-inp" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} style={{
                      padding: "7px 12px 7px 28px", border: "1.5px solid #E5E7EB", borderRadius: "9px",
                      fontSize: "0.78rem", color: "#374151", background: "#F9FAFB",
                      fontFamily: "'DM Sans',sans-serif", width: "170px", outline: "none",
                    }} />
                  </div>
                  <button onClick={fetchHistory} title="Refresh" style={{
                    width: "34px", height: "34px", border: "1.5px solid #E5E7EB", borderRadius: "9px",
                    background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#6B7280", cursor: "pointer",
                  }}>
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>

              <div style={{ maxHeight: "600px", overflowY: "auto" }}>
                {histLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} style={{ padding: "18px 22px", borderBottom: "1px solid #F9FAFB" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                        <div style={{ height: "14px", width: "180px", background: "#F3F4F6", borderRadius: "4px" }} />
                        <div style={{ height: "22px", width: "80px", background: "#F3F4F6", borderRadius: "20px" }} />
                      </div>
                      <div style={{ height: "12px", width: "260px", background: "#F3F4F6", borderRadius: "4px", marginBottom: "8px" }} />
                      <div style={{ height: "12px", width: "100%", background: "#F3F4F6", borderRadius: "4px" }} />
                    </div>
                  ))
                ) : filtered.length === 0 ? (
                  <div style={{ padding: "60px 20px", textAlign: "center" }}>
                    <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "#D1D5DB" }}>
                      <Inbox size={24} />
                    </div>
                    <p style={{ color: "#9CA3AF", fontSize: "0.875rem", margin: 0, fontWeight: "500" }}>No letters found</p>
                    <p style={{ color: "#D1D5DB", fontSize: "0.78rem", margin: "4px 0 0" }}>Compose and send your first letter!</p>
                  </div>
                ) : (
                  filtered.map((item, idx) => {
                    const type = getType(item.letter_type);
                    const Icon = type.icon;
                    return (
                      <div key={item._id || idx} className="hist-row"
                        style={{ padding: "16px 22px", animation: `slideIn .3s ease both ${idx * .04}s` }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", minWidth: 0 }}>
                            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: type.bg, display: "flex", alignItems: "center", justifyContent: "center", color: type.color, flexShrink: 0 }}>
                              <Icon size={17} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#111827" }}>{item.employeeName || "—"}</span>
                                <span style={{ fontSize: "0.7rem", color: "#9CA3AF", background: "#F3F4F6", padding: "1px 7px", borderRadius: "6px", fontWeight: "500" }}>
                                  #{item.employeeId}
                                </span>
                              </div>
                              <p style={{ fontSize: "0.78rem", color: "#9CA3AF", margin: "2px 0 0" }}>{item.employeeEmail}</p>
                            </div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "5px", flexShrink: 0 }}>
                            <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "0.7rem", fontWeight: "600", background: type.bg, color: type.color, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              <Icon size={10} />{item.letterType}
                            </span>
                            <span style={{
                              padding: "2px 9px", borderRadius: "20px", fontSize: "0.68rem", fontWeight: "600",
                              background: item.status === "sent" ? "#ECFDF5" : "#FFFBEB",
                              color: item.status === "sent" ? "#059669" : "#D97706",
                            }}>
                              {item.status === "sent" ? "✓ Sent" : "⏳ Draft"}
                            </span>
                          </div>
                        </div>
                        {item.notes && (
                          <p style={{ margin: "10px 0 0 50px", fontSize: "0.8rem", color: "#6B7280", fontStyle: "italic", borderLeft: "2px solid #E5E7EB", paddingLeft: "10px" }}>
                            {item.notes}
                          </p>
                        )}
                        <div style={{ marginTop: "10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#9CA3AF", fontSize: "0.72rem" }}>
                            <Clock size={11} />
                            {new Date(item.createdAt || item.sent_at).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {!histLoading && filtered.length > 0 && (
                <div style={{ padding: "11px 22px", borderTop: "1px solid #F1F3F9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>Showing {filtered.length} of {history.length} records</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#9CA3AF", fontSize: "0.72rem" }}>
                    <CheckCircle2 size={11} /> Up to date
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
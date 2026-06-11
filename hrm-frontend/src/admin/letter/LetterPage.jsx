import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import {
  FileText, Send, Save, Clock, Search, Bell,
  Eye, CheckCircle2, Inbox, Filter, X,
  FileCheck, FilePen, Mail, User, Hash, StickyNote,
  RefreshCw, Users, ChevronRight, Pencil,
  Bold, Italic, Underline, List, AlignLeft, AlignCenter,
  AlignRight, Type, Minus, Image as ImageIcon,
} from "lucide-react";
import Sidebar from "../../layouts/sidebar";
import MobileTopBar from "../../employee/MobileTopBar";
import { useTheme } from "../../context/ThemeContext";

const API = "https://hrm-backend-vvqg.onrender.com/api/letters";
const EMP_API = "https://hrm-backend-vvqg.onrender.com/api/employees";
const DEFAULT_LOGO = `${window.location.origin}/logo.png`;
const DEFAULT_SIGNATURE = `${window.location.origin}/image.png`;

const letterTypes = [
  { value: "offer",      label: "Offer Letter",    bg: "#EEF2FF", icon: FileCheck },
  { value: "experience", label: "Experience Cert.", color: "#059669", bg: "#ECFDF5", icon: FileText  },
  { value: "salary",     label: "Salary Slip",      color: "#D97706", bg: "#FFFBEB", icon: FilePen   },
  { value: "relieving",  label: "Relieving Letter", color: "#DB2777", bg: "#FDF2F8", icon: Mail      },
  { value: "custom",     label: "Custom Letter",    color: "#7C3AED", bg: "#F5F3FF", icon: Pencil    },
];

const getType = (v) => letterTypes.find((t) => t.value === v) || letterTypes[0];

const letterShell = (accentColor, logoUrl, signatureUrl, bodyContent, footerNote = "") => `
<div style="font-family:'Times New Roman',Georgia,serif;max-width:720px;margin:0 auto;background:#fff;color:#1a1a1a;padding:0;border:1px solid #ddd;">

  <div style="padding:28px 40px;display:flex;align-items:center;justify-content:space-between;">
    <div>
      ${logoUrl ? `<img src="${logoUrl}" style="max-height:150px;max-width:150px;object-fit:contain;display:block;" alt="Company Logo"/>` : `<span style="font-size:22px;font-weight:700;color:#1a1a1a;letter-spacing:1px;">SHNOOR INTERNATIONAL LLC</span>`}
    </div>
    <div style="text-align:right;font-size:11px;line-height:1.8;font-family:Arial,sans-serif;color:#555;">
      <div style="font-weight:600;font-size:12px;color:#1a1a1a;">SHNOOR INTERNATIONAL LLC</div>
      <div>123 Business Avenue, Dubai, UAE</div>
      <div>hr@shnoorinternational.com</div>
      <div>+971 4 000 0000</div>
    </div>
  </div>

  <div style="padding:32px 40px 0;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;font-family:Arial,sans-serif;font-size:12px;color:#555;">
      <div>
        <div style="font-weight:600;color:#1a1a1a;margin-bottom:2px;">Date</div>
        <div>${new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"})}</div>
      </div>
      <div style="text-align:right;">
        <div style="font-weight:600;color:#1a1a1a;margin-bottom:2px;">Ref No.</div>
        <div>SNR/${new Date().getFullYear()}/${String(Math.floor(Math.random()*9000)+1000)}</div>
      </div>
    </div>
    <hr style="border:none;border-top:1.5px solid ${accentColor}33;margin:0 0 28px;"/>
  </div>

  <div style="padding:0 40px 32px;font-size:14.5px;line-height:1.9;color:#222;">
    ${bodyContent}
  </div>

  <div style="margin:0 40px;padding:24px 0 0;">
    <div style="display:flex;align-items:flex-end;justify-content:space-between;">
      <div>
        ${signatureUrl ? `<img src="${signatureUrl}" style="max-height:400px;max-width:400px;object-fit:contain;display:block;margin:6px 0;" alt="Signature"/>` : `<div style="width:100px;height:50px;border-bottom:1.5px solid #333;margin:6px 0;"></div>`}
      </div>
    </div>
    ${footerNote ? `<p style="margin:16px 0 0;font-size:11.5px;color:#888;font-family:Arial,sans-serif;font-style:italic;">${footerNote}</p>` : ""}
  </div>

  <div style="margin-top:24px;background:#f8f8f8;border-top:3px solid ${accentColor};padding:12px 40px;display:flex;justify-content:space-between;align-items:center;">
    <span style="font-size:10.5px;color:#999;font-family:Arial,sans-serif;">This is an official document issued by SHNOOR INTERNATIONAL LLC. Any alterations render it void.</span>
    <span style="font-size:10.5px;color:${accentColor}99;font-family:Arial,sans-serif;font-weight:600;">Confidential</span>
  </div>
</div>`;

const templates = {
  offer: (name, logo, signature) => letterShell(
    "#4F46E5", logo, signature,
    `<p style="margin:0 0 14px;"><strong>To,</strong><br/><strong>${name || "[Employee Name]"}</strong></p>

    <p style="margin:0 0 20px;"><strong>Subject: Letter of Offer of Employment</strong></p>

    <p style="margin:0 0 14px;">Dear <strong>${name || "[Employee Name]"}</strong>,</p>

    <p style="margin:0 0 14px;">We are delighted to offer you the position of <strong>[Job Title]</strong> at SHNOOR INTERNATIONAL LLC. After careful consideration, we believe your skills and experience make you an excellent fit for our team.</p>

    <p style="margin:0 0 14px;">Your employment will commence on <strong>[Start Date]</strong> and your compensation package is outlined below:</p>

    <table style="width:100%;border-collapse:collapse;margin:18px 0;font-family:Arial,sans-serif;font-size:13px;">
      <thead><tr style="background:#4F46E5;color:#fff;"><th style="padding:10px 14px;text-align:left;font-weight:600;">Component</th><th style="padding:10px 14px;text-align:right;font-weight:600;">Amount (INR/Month)</th></tr></thead>
      <tbody>
        <tr style="background:#F5F5FF;"><td style="padding:9px 14px;border-bottom:1px solid #e8e8e8;">Basic Salary</td><td style="padding:9px 14px;text-align:right;border-bottom:1px solid #e8e8e8;">[Amount]</td></tr>
        <tr><td style="padding:9px 14px;border-bottom:1px solid #e8e8e8;">HRA</td><td style="padding:9px 14px;text-align:right;border-bottom:1px solid #e8e8e8;">[Amount]</td></tr>
        <tr style="background:#F5F5FF;"><td style="padding:9px 14px;border-bottom:1px solid #e8e8e8;">Special Allowance</td><td style="padding:9px 14px;text-align:right;border-bottom:1px solid #e8e8e8;">[Amount]</td></tr>
        <tr style="font-weight:700;background:#EEF2FF;"><td style="padding:10px 14px;color:#4F46E5;">Gross CTC</td><td style="padding:10px 14px;text-align:right;color:#4F46E5;">[Total Amount]</td></tr>
      </tbody>
    </table>

    <p style="margin:0 0 14px;">This offer is contingent upon the successful completion of background verification. Please sign and return the duplicate copy of this letter as your acceptance.</p>

    <p style="margin:0;">We look forward to welcoming you to our growing family and wish you a fulfilling journey ahead.</p>`,
    "This offer letter is valid for 7 days from the date of issue."
  ),

  experience: (name, logo, signature) => letterShell(
    "#059669", logo, signature,
    `<p style="margin:0 0 20px;font-weight:700;font-size:16px;text-align:center;letter-spacing:0.5px;text-decoration:underline;text-underline-offset:5px;">EXPERIENCE CERTIFICATE</p>

    <p style="margin:0 0 14px;"><strong>To Whom It May Concern,</strong></p>

    <p style="margin:0 0 14px;">This is to certify that <strong>${name || "[Employee Name]"}</strong>, was employed with <strong>SHNOOR INTERNATIONAL LLC</strong> from <strong>[Start Date]</strong> to <strong>[End Date]</strong>.</p>

    <p style="margin:0 0 14px;">During their tenure, they served as <strong>[Designation]</strong> in the <strong>[Department]</strong> department. Throughout this period, they demonstrated dedication, professionalism, and a consistent commitment to delivering quality work.</p>

    <p style="margin:0 0 14px;">Their responsibilities included:</p>
    <ul style="margin:0 0 16px;padding-left:22px;line-height:2;">
      <li>[Key Responsibility 1]</li>
      <li>[Key Responsibility 2]</li>
      <li>[Key Responsibility 3]</li>
    </ul>

    <p style="margin:0 0 14px;">We found <strong>${name || "[Employee Name]"}</strong> to be a diligent, hardworking, and result-oriented professional. They maintained excellent conduct throughout and resigned voluntarily on [Last Working Day].</p>

    <p style="margin:0;">We wish them all the best in their future endeavors.</p>`,
    "This certificate is issued on request and without any liability on the part of the company."
  ),

  salary: (name, logo, signature) => letterShell(
    "#D97706", logo, signature,
    `<p style="margin:0 0 20px;font-weight:700;font-size:16px;text-align:center;letter-spacing:0.5px;text-decoration:underline;text-underline-offset:5px;">SALARY SLIP — [MONTH YEAR]</p>

    <table style="width:100%;border-collapse:collapse;margin:0 0 20px;font-family:Arial,sans-serif;font-size:13px;">
      <tr style="background:#FFFBEB;border-bottom:2px solid #D97706;"><th colspan="2" style="padding:10px 14px;text-align:left;color:#92400E;font-size:12px;letter-spacing:0.5px;font-weight:600;">EMPLOYEE DETAILS</th></tr>
      <tr><td style="padding:8px 14px;width:50%;border-bottom:1px solid #f0f0f0;color:#666;font-size:12.5px;">Employee Name</td><td style="padding:8px 14px;border-bottom:1px solid #f0f0f0;font-weight:600;font-size:12.5px;">${name || "[Employee Name]"}</td></tr>
      <tr style="background:#fafafa;"><td style="padding:8px 14px;border-bottom:1px solid #f0f0f0;color:#666;font-size:12.5px;">Employee ID</td><td style="padding:8px 14px;border-bottom:1px solid #f0f0f0;font-size:12.5px;">[Employee ID]</td></tr>
      <tr><td style="padding:8px 14px;border-bottom:1px solid #f0f0f0;color:#666;font-size:12.5px;">Designation</td><td style="padding:8px 14px;border-bottom:1px solid #f0f0f0;font-size:12.5px;">[Designation]</td></tr>
      <tr style="background:#fafafa;"><td style="padding:8px 14px;border-bottom:1px solid #f0f0f0;color:#666;font-size:12.5px;">Department</td><td style="padding:8px 14px;border-bottom:1px solid #f0f0f0;font-size:12.5px;">[Department]</td></tr>
      <tr><td style="padding:8px 14px;color:#666;font-size:12.5px;">Pay Period</td><td style="padding:8px 14px;font-size:12.5px;">[Month Year]</td></tr>
    </table>`,
    "This is a computer-generated salary slip and does not require a physical signature."
  ),

  relieving: (name, logo, signature) => letterShell(
    "#DB2777", logo, signature,
    `<p style="margin:0 0 20px;font-weight:700;font-size:16px;text-align:center;letter-spacing:0.5px;text-decoration:underline;text-underline-offset:5px;">RELIEVING LETTER</p>

    <p style="margin:0 0 14px;"><strong>To,</strong><br/><strong>${name || "[Employee Name]"}</strong><br/>[Address Line 1]<br/>[City, State, PIN]</p>

    <p style="margin:0 0 20px;"><strong>Subject: Relieving Letter — [Designation]</strong></p>

    <p style="margin:0 0 14px;">Dear <strong>${name || "[Employee Name]"}</strong>,</p>

    <p style="margin:0 0 14px;">This letter is to confirm that your resignation dated <strong>[Resignation Date]</strong> has been accepted and you have been relieved from your duties as <strong>[Designation]</strong> in the <strong>[Department]</strong> department of SHNOOR INTERNATIONAL LLC effective <strong>[Last Working Day]</strong>, after a notice period of <strong>[Notice Period]</strong>.</p>

    <p style="margin:0 0 14px;">You have completed all formalities including handover of duties and return of company assets. All dues have been settled as per company policy.</p>

    <p style="margin:0 0 14px;">We appreciate the contributions made by you during your tenure with us. We wish you the very best in all your future endeavors.</p>

    <p style="margin:0;">Feel free to reach out to us for any assistance in the future.</p>`,
    "This relieving letter is issued at the request of the employee."
  ),

  custom: (name, title, logo, signature) => letterShell(
    "#7C3AED", logo, signature,
    `<p style="margin:0 0 20px;font-weight:700;font-size:16px;text-align:center;letter-spacing:0.5px;text-decoration:underline;text-underline-offset:5px;">${title || "[LETTER TITLE]"}</p>

    <p style="margin:0 0 14px;"><strong>To,</strong><br/><strong>${name || "[Employee Name]"}</strong></p>

    <p style="margin:0 0 14px;">Dear <strong>${name || "[Employee Name]"}</strong>,</p>

    <p style="margin:0 0 14px;">Write your letter content here. This is a custom letter template that you can fully customize as per your requirement.</p>

    <p style="margin:0 0 14px;">Add any additional paragraphs, tables, or content that you need for this letter type.</p>

    <p style="margin:0;">Thank you for your continued association with SHNOOR INTERNATIONAL LLC.</p>`,
    ""
  ),
};

function RichEditor({ value, onChange, accentColor = "#4F46E5", isDark }) {
  const editorRef = useRef(null);
  const skipSyncRef = useRef(false);

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
    <div style={{ width:"1px", background: isDark ? "#2D3748" : "#E5E7EB", margin:"3px 4px", alignSelf:"stretch" }}/>
  );

  const Btn = ({ cmd, val, title, children }) => (
    <button
      title={title}
      onMouseDown={e => { e.preventDefault(); exec(cmd, val); }}
      style={{ width:"30px", height:"30px", border:"none", borderRadius:"6px", background:"transparent", color: isDark ? "#9CA3AF" : "#374151", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"background .1s", flexShrink:0 }}
      onMouseEnter={e => e.currentTarget.style.background = isDark ? "#1E2535" : "#EEF2FF"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      {children}
    </button>
  );

  return (
    <div
      className="rich-editor"
      style={{ border:`1.5px solid ${isDark ? "#2D3748" : "#E5E7EB"}`, borderRadius:"10px", background: isDark ? "#1E2535" : "#fff", overflow:"hidden", transition:"border-color .18s,box-shadow .18s" }}
      onFocusCapture={e => { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}1A`; }}
      onBlurCapture={e => { e.currentTarget.style.borderColor = isDark ? "#2D3748" : "#E5E7EB"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ display:"flex", alignItems:"center", gap:"1px", padding:"6px 8px", borderBottom:`1px solid ${isDark ? "#1E2535" : "#F1F3F9"}`, background: isDark ? "#0F1219" : "#FAFBFF", flexWrap:"wrap" }}>
        <Btn cmd="bold" title="Bold (Ctrl+B)"><Bold size={13}/></Btn>
        <Btn cmd="italic" title="Italic (Ctrl+I)"><Italic size={13}/></Btn>
        <Btn cmd="underline" title="Underline (Ctrl+U)"><Underline size={13}/></Btn>
        <Sep/>
        <Btn cmd="formatBlock" val="h2" title="Heading"><Type size={13}/></Btn>
        <Btn cmd="formatBlock" val="p" title="Paragraph"><span style={{fontSize:"11px",fontWeight:"700"}}>¶</span></Btn>
        <Sep/>
        <Btn cmd="insertUnorderedList" title="Bullet List"><List size={13}/></Btn>
        <Btn cmd="insertOrderedList" title="Numbered List"><span style={{fontSize:"11px",fontWeight:"700"}}>1.</span></Btn>
        <Sep/>
        <Btn cmd="justifyLeft" title="Align Left"><AlignLeft size={13}/></Btn>
        <Btn cmd="justifyCenter" title="Align Center"><AlignCenter size={13}/></Btn>
        <Btn cmd="justifyRight" title="Align Right"><AlignRight size={13}/></Btn>
        <Sep/>
        <Btn cmd="insertHorizontalRule" title="Divider"><Minus size={13}/></Btn>
        <Btn cmd="removeFormat" title="Clear Formatting"><span style={{fontSize:"11px",fontWeight:"700",color:"#EF4444"}}>Tx</span></Btn>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Write your letter content here…"
        onInput={flush}
        onKeyDown={e => { if (e.key === "Tab") { e.preventDefault(); exec("insertHTML", "&nbsp;&nbsp;&nbsp;&nbsp;"); } }}
        style={{ minHeight:"200px", maxHeight:"340px", overflowY:"auto", padding:"16px 18px", outline:"none", fontSize:"0.875rem", lineHeight:1.8, color: isDark ? "#F3F4F6" : "#374151", fontFamily:"'DM Sans',sans-serif", background: isDark ? "#1E2535" : "#fff" }}
      />
      <div style={{ padding:"5px 12px", borderTop:`1px solid ${isDark ? "#1E2535" : "#F1F3F9"}`, background: isDark ? "#0F1219" : "#FAFBFF", display:"flex", gap:"12px", flexWrap:"wrap" }}>
        {[{label:"Bold",keys:"Ctrl+B"},{label:"Italic",keys:"Ctrl+I"},{label:"Underline",keys:"Ctrl+U"}].map(h => (
          <span key={h.label} style={{ fontSize:"0.68rem", color: isDark ? "#6B7280" : "#9CA3AF" }}>
            <strong style={{color: isDark ? "#9CA3AF" : "#6B7280"}}>{h.label}</strong> {h.keys}
          </span>
        ))}
      </div>
    </div>
  );
}

function EmployeeSelect({ onSelect, selectedEmployee, onClear, token, isDark }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const wrapRef = useRef(null);
  const debounceRef = useRef(null);
  const cfg = { headers: { "x-auth-token": token } };

  const search = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const r = await axios.get(EMP_API, { ...cfg, params: { limit: 200 } });
      const data = r.data.data || r.data.employees || r.data || [];
      const allEmps = Array.isArray(data) ? data : [];
      setAllEmployees(allEmps);
      setResults(allEmps);
      if (allEmps.length > 0) setOpen(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not load employees");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const filterLocally = (q, pool) => {
    if (!q.trim()) return pool;
    const term = q.toLowerCase();
    return pool.filter(emp => {
      const name = (emp.name || emp.employee_name || emp.fullName || "").toLowerCase();
      const id = (emp.employeeId || emp.employee_id || "").toLowerCase();
      const email = (emp.email || emp.employee_email || "").toLowerCase();
      return name.includes(term) || id.includes(term) || email.includes(term);
    });
  };

  const handleInput = (e) => {
    const v = e.target.value;
    setQuery(v);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setResults(filterLocally(v, allEmployees));
      setOpen(true);
    }, 300);
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

  useEffect(() => { search(); }, [token]);

  if (selectedEmployee) {
    return (
      <div style={{ display:"flex", alignItems:"center", gap:"8px", padding:"8px 12px", background: isDark ? "#1E1B4B" : "#EEF2FF", border:`1.5px solid ${isDark ? "#2D3748" : "#C7D2FE"}`, borderRadius:"10px", fontSize:"0.8rem", fontWeight:"500" }}>
        <div style={{ width:"28px", height:"28px", borderRadius:"50%", background:"linear-gradient(135deg,#4F46E5,#7C3AED)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:"0.65rem", fontWeight:"700", flexShrink:0 }}>
          {(selectedEmployee.name || selectedEmployee.employee_name || "?").slice(0,2).toUpperCase()}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:"600", color: isDark ? "#F3F4F6" : "#111827", fontSize:"0.83rem", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{selectedEmployee.name || selectedEmployee.employee_name}</div>
          <div style={{ fontSize:"0.72rem", color: isDark ? "#9CA3AF" : "#6B7280", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>#{selectedEmployee.employeeId || selectedEmployee.employee_id} · {selectedEmployee.email || selectedEmployee.employee_email}</div>
        </div>
        <button onClick={onClear} style={{ background:"none", border:"none", cursor:"pointer", color: isDark ? "#9CA3AF" : "#9CA3AF", padding:"2px", display:"flex", alignItems:"center" }}><X size={15}/></button>
      </div>
    );
  }

  return (
    <div ref={wrapRef} style={{ position:"relative" }}>
      <div style={{ position:"relative" }}>
        <Search size={14} style={{ position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", color: isDark ? "#6B7280" : "#9CA3AF", pointerEvents:"none" }}/>
        <input
          className="form-input"
          style={{ paddingLeft:"34px", background: isDark ? "#1E2535" : "#F9FAFB", color: isDark ? "#F3F4F6" : "#374151", borderColor: isDark ? "#2D3748" : "#E5E7EB" }}
          placeholder="Type name or ID to search employees…"
          value={query}
          onChange={handleInput}
          onFocus={() => setOpen(allEmployees.length > 0)}
          autoComplete="off"
        />
        {loading && <div style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)" }}><RefreshCw size={14} style={{ color: isDark ? "#6B7280" : "#9CA3AF", animation:"spin 1s linear infinite" }}/></div>}
      </div>
      {error && <p style={{ color:"#EF4444", fontSize:"0.72rem", margin:"4px 0 0 2px" }}>{error}</p>}
      {open && results.length > 0 && (
        <div className="emp-dropdown" style={{ maxHeight:"300px", overflowY:"auto", position:"absolute", top:"calc(100% + 4px)", left:0, right:0, background: isDark ? "#161B27" : "#fff", border:`1.5px solid ${isDark ? "#2D3748" : "#E5E7EB"}`, borderRadius:"10px", boxShadow:"0 8px 24px rgba(15,23,42,.12)", zIndex:500, overflow:"hidden", animation:"dropIn .15s ease" }}>
          {results.map((emp, i) => {
            const empName = emp.name || emp.employee_name || emp.fullName || "Unknown";
            return (
              <div key={emp._id || i} className="emp-option" onClick={() => pick(emp)} style={{ padding:"10px 14px", cursor:"pointer", transition:"background .1s", display:"flex", alignItems:"center", gap:"10px", borderBottom:`1px solid ${isDark ? "#1E2535" : "#F9FAFB"}` }}>
                <div style={{ width:"32px", height:"32px", borderRadius:"50%", flexShrink:0, background:"linear-gradient(135deg,#4F46E5,#7C3AED)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:"0.65rem", fontWeight:"700" }}>
                  {empName.slice(0,2).toUpperCase()}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:"600", fontSize:"0.84rem", color: isDark ? "#F3F4F6" : "#111827", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{empName}</div>
                  <div style={{ fontSize:"0.72rem", color: isDark ? "#6B7280" : "#9CA3AF" }}>#{emp.employeeId || emp.employee_id || "—"}</div>
                </div>
                <ChevronRight size={14} style={{ color: isDark ? "#4B5563" : "#D1D5DB", flexShrink:0 }}/>
              </div>
            );
          })}
        </div>
      )}
      {open && !loading && results.length === 0 && query.trim() && (
        <div className="emp-dropdown" style={{ padding:"16px", textAlign:"center", color: isDark ? "#6B7280" : "#9CA3AF", fontSize:"0.82rem", background: isDark ? "#161B27" : "#fff", border:`1.5px solid ${isDark ? "#2D3748" : "#E5E7EB"}`, borderRadius:"10px" }}>
          No employees found for "{query}"
        </div>
      )}
    </div>
  );
}

const SHARED = `
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideIn{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:translateX(0)}}
  @keyframes toastIn{from{opacity:0;transform:translateY(-10px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes dropIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
  .form-input{width:100%;padding:10px 14px;border-radius:10px;font-size:.875rem;font-family:'DM Sans',sans-serif;transition:border-color .18s,box-shadow .18s,background .18s;outline:none}
  .form-input:focus{border-color:#4F46E5;box-shadow:0 0 0 3px rgba(79,70,229,.10)}
  .form-input.err{border-color:#EF4444}
  .btn-blue{display:flex;align-items:center;justify-content:center;gap:7px;padding:10px 18px;border-radius:10px;font-size:.875rem;font-weight:600;cursor:pointer;border:none;background:linear-gradient(135deg,#4F46E5,#6366F1);color:#fff;font-family:'DM Sans',sans-serif;transition:all .18s}
  .btn-blue:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 6px 16px rgba(79,70,229,.28)}
  .btn-blue:disabled{opacity:.55;cursor:not-allowed}
  .btn-ghost{display:flex;align-items:center;justify-content:center;gap:7px;padding:10px 18px;border-radius:10px;font-size:.875rem;font-weight:600;cursor:pointer;transition:all .18s;font-family:'DM Sans',sans-serif}
  .btn-ghost:hover:not(:disabled){transform:translateY(-1px)}
  .btn-ghost:disabled{opacity:.55;cursor:not-allowed}
  .hist-row{transition:background .12s}
  .type-chip{padding:6px 12px;border-radius:8px;font-size:.75rem;font-weight:600;display:inline-flex;align-items:center;gap:5px;cursor:pointer;border:1.5px solid transparent;transition:all .15s}
  .type-chip:hover{filter:brightness(.97);transform:translateY(-1px)}
  .search-inp:focus{outline:none;border-color:#4F46E5!important;box-shadow:0 0 0 3px rgba(79,70,229,.10)}
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
    .letter-content-grid{grid-template-columns:340px 1fr!important}
  }
`;

export default function LetterPage() {
  const name = localStorage.getItem("name") || "Admin";
  const token = localStorage.getItem("token") || "";
  const cfg = { headers: { "x-auth-token": token } };
  const { isDark } = useTheme();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const [form, setForm] = useState({
    employeeId: "", employeeName: "", employeeEmail: "",
    letterType: "offer", htmlContent: "", notes: "",
    customTitle: "", customSubject: "",
    logoUrl: DEFAULT_LOGO, signatureUrl: DEFAULT_SIGNATURE,
  });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [errors, setErrors] = useState({});
  const [history, setHistory] = useState([]);
  const [histLoading, setHistLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [preview, setPreview] = useState(null);
  const [toast, setToast] = useState(null);
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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
    modalOverlay: isDark ? "rgba(0,0,0,0.7)" : "rgba(15,23,42,0.65)",
    buttonSecondaryBg: isDark ? "#1E2535" : "#fff",
    buttonSecondaryText: isDark ? "#9CA3AF" : "#374151",
    buttonSecondaryBorder: isDark ? "#2D3748" : "#E5E7EB",
    toastSuccessBg: isDark ? "#064E3B" : "#059669",
    toastErrorBg: isDark ? "#7F1D1D" : "#EF4444",
    sectionBg: isDark ? "#1E2535" : "#F9FAFB",
    typeChipBg: isDark ? "#1E2535" : "#F9FAFB",
    previewBg: isDark ? "#161B27" : "#fff",
    previewBorder: isDark ? "#1E2535" : "#F1F3F9",
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

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3200);
  };

  const fetchHistory = async () => {
    try {
      setHistLoading(true);
      const r = await axios.get(`${API}/history`, cfg);
      setHistory(r.data.data || []);
    } catch (e) { console.error(e); }
    finally { setHistLoading(false); }
  };

  useEffect(() => { fetchHistory(); }, []);

  useEffect(() => {
    if (form.letterType === "custom") return;
    const tpl = templates[form.letterType];
    if (tpl) setForm(f => ({ ...f, htmlContent: tpl(f.employeeName, f.logoUrl, f.signatureUrl) }));
  }, [form.letterType, form.logoUrl, form.signatureUrl]);

  useEffect(() => {
    if (!selectedEmployee || form.letterType === "custom") return;
    const tpl = templates[form.letterType];
    if (tpl) setForm(f => ({ ...f, htmlContent: tpl(f.employeeName, f.logoUrl, f.signatureUrl) }));
  }, [form.employeeName, form.logoUrl, form.signatureUrl]);

  useEffect(() => {
    if (form.letterType !== "custom") return;
    setForm(f => ({ ...f, htmlContent: templates.custom(f.employeeName, f.customTitle, f.logoUrl, f.signatureUrl) }));
  }, [form.customTitle, form.logoUrl, form.signatureUrl]);

  const setField = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: "" }));
  };

  const handleTypeChange = (v) => {
    setErrors({});
    setForm(f => ({
      ...f,
      letterType: v,
      customTitle: "",
      customSubject: "",
      htmlContent: v === "custom"
        ? templates.custom(f.employeeName, "", f.logoUrl, f.signatureUrl)
        : templates[v] ? templates[v](f.employeeName, f.logoUrl, f.signatureUrl) : "",
    }));
  };

  const handleEmployeeSelect = (emp) => {
    const empName = emp.name || emp.employee_name || emp.fullName || "";
    const empId = emp._id || emp.employee_id || emp.empId || "";
    const empEmail = emp.email || emp.employee_email || emp.empEmail || "";
    setSelectedEmployee(emp);
    setForm(f => ({
      ...f,
      employeeId: empId,
      employeeName: empName,
      employeeEmail: empEmail,
      htmlContent: f.letterType === "custom"
        ? templates.custom(empName, f.customTitle, f.logoUrl, f.signatureUrl)
        : templates[f.letterType] ? templates[f.letterType](empName, f.logoUrl, f.signatureUrl) : f.htmlContent,
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
    if (!form.customTitle.trim()) errs.customTitle = "Letter title is required";
    if (!form.customSubject.trim()) errs.customSubject = "Email subject is required";
    if (Object.keys(errs).length) { setErrors(errs); return false; }
    return true;
  };

  const buildPayload = () => ({
    employeeId: selectedEmployee?._id || form.employeeId,
    employeeEmail: form.employeeEmail,
    employeeName: form.employeeName,
    letterType: form.letterType,
    htmlContent: form.htmlContent,
    notes: form.notes || "",
    logoUrl: form.logoUrl || "",
    signatureUrl: form.signatureUrl || "",
    ...(form.letterType === "custom" && { customTitle: form.customTitle, customSubject: form.customSubject }),
  });

  const handleSend = async () => {
    if (!validateCustom()) return;
    try {
      setLoading(true);
      await axios.post(`${API}/send`, buildPayload(), { headers: { "x-auth-token": token, "Content-Type": "application/json" } });
      showToast("Letter sent successfully!");
      fetchHistory();
    } catch { showToast("Send failed", false); }
    finally { setLoading(false); }
  };

  const handleDraft = async () => {
    if (!validateCustom()) return;
    try {
      setLoading(true);
      await axios.post(`${API}/draft`, buildPayload(), { headers: { "x-auth-token": token, "Content-Type": "application/json" } });
      showToast("Draft saved!");
      fetchHistory();
    } catch { showToast("Draft failed", false); }
    finally { setLoading(false); }
  };

  const filtered = history.filter(item => {
    const q = search.toLowerCase();
    const matchQ = !q || item.employee_name?.toLowerCase().includes(q) || item.employee_email?.toLowerCase().includes(q) || item.employee_id?.toLowerCase().includes(q);
    const matchT = filterType === "all" || item.letter_type === filterType;
    const matchS = filterStatus === "all" || item.status === filterStatus;
    return matchQ && matchT && matchS;
  });

  const sentCount = history.filter(h => h.status === "sent").length;
  const draftCount = history.filter(h => h.status === "draft").length;
  const selType = getType(form.letterType);

  return (
    <div style={{ minHeight:"100vh", background:t.bg, fontFamily:"'DM Sans',sans-serif" }}>
      <style>{SHARED}</style>

      {toast && (
        <div style={{ position:"fixed", top:"20px", right:"24px", zIndex:9999, background:toast.ok ? t.toastSuccessBg : t.toastErrorBg, color:"#fff", borderRadius:"12px", padding:"12px 18px", fontSize:"0.875rem", fontWeight:"500", boxShadow:"0 8px 24px rgba(0,0,0,.15)", display:"flex", alignItems:"center", gap:"8px", animation:"toastIn .25s ease" }}>
          {toast.ok ? <CheckCircle2 size={16}/> : <X size={16}/>} {toast.msg}
        </div>
      )}

      <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      {preview && (
        <div onClick={() => setPreview(null)} style={{ position:"fixed", inset:0, background:t.modalOverlay, zIndex:8000, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"24px", overflowY:"auto" }}>
          <div onClick={e => e.stopPropagation()} style={{ background:t.previewBg, borderRadius:"16px", width:"100%", maxWidth:"760px", overflow:"hidden", boxShadow:"0 32px 80px rgba(15,23,42,.35)", marginTop:"12px", marginBottom:"24px", border:`1px solid ${t.previewBorder}` }}>
            <div style={{ padding:"14px 20px", background:t.card, borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", borderRadius:"16px 16px 0 0" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <Eye size={16} style={{ color:"#4F46E5" }}/>
                <span style={{ fontWeight:"600", color:t.textPrimary, fontSize:"0.9rem" }}>Letter Preview</span>
              </div>
              <button onClick={() => setPreview(null)} style={{ background:"none", border:"none", cursor:"pointer", color:t.textMuted, display:"flex", alignItems:"center" }}><X size={18}/></button>
            </div>
            <div style={{ padding:"28px 24px" }}>
              <div dangerouslySetInnerHTML={{ __html: preview }}/>
            </div>
          </div>
        </div>
      )}

      <main style={{ marginLeft:`${sidebarWidth}px`, transition:"margin-left 0.25s cubic-bezier(0.4,0,0.2,1)", display:"flex", flexDirection:"column", minHeight:"100vh", minWidth:0 }}>
        <div className="letter-topbar" style={{ height:"64px", background:t.topbar, borderBottom:`1px solid ${t.border}`, alignItems:"center", padding:"0 28px", gap:"16px", position:"sticky", top:0, zIndex:100, boxShadow:isDark ? "0 1px 4px rgba(0,0,0,0.3)" : "0 1px 4px rgba(15,23,42,.04)" }}>
          <div style={{ position:"relative", flex:1, maxWidth:"380px" }}>
            <Search size={15} style={{ position:"absolute", left:"12px", top:"50%", transform:"translateY(-50%)", color:t.textMuted }}/>
            <input className="search-inp" placeholder="Search anything…" style={{ width:"100%", padding:"8px 12px 8px 36px", border:`1.5px solid ${t.inputBorder}`, borderRadius:"10px", fontSize:"0.875rem", color:t.textPrimary, background:t.inputBg, fontFamily:"'DM Sans',sans-serif", outline:"none" }}/>
          </div>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:"8px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"9px", padding:"5px 12px 5px 6px", border:`1.5px solid ${t.inputBorder}`, borderRadius:"10px", background:t.card, cursor:"pointer" }}>
              <div style={{ width:"28px", height:"28px", borderRadius:"50%", background:"linear-gradient(135deg,#4F46E5,#7C3AED)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:"0.72rem", fontWeight:"600" }}>{name.slice(0,2).toUpperCase()}</div>
              <span style={{ fontSize:"0.83rem", fontWeight:"500", color:t.textPrimary }}>{name}</span>
            </div>
          </div>
        </div>

        <div className="letter-main" style={{ padding:"28px 28px 48px" }}>
          <div style={{ marginBottom:"24px", animation:"fadeUp .4s ease both .05s" }}>
            <p style={{ color:t.textSecondary, fontSize:"0.875rem", margin:"0 0 4px" }}>{greeting}, <strong style={{ color:"#4F46E5" }}>{name}</strong> 👋</p>
            <h1 className="letter-h1" style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.85rem", fontWeight:"700", color:t.textPrimary, margin:0, lineHeight:1.2 }}>Letter Management</h1>
            <p style={{ color:t.textMuted, fontSize:"0.85rem", margin:"5px 0 0" }}>
              {new Date().toLocaleDateString("en-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
            </p>
          </div>

          <div className="letter-stats-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"14px", marginBottom:"24px" }}>
            {[
              { label:"Total Letters", count:history.length, icon:FileText, bg:t.statIconBg1, color:t.statIconColor1 },
              { label:"Sent", count:sentCount, icon:Send, bg:t.statIconBg2, color:t.statIconColor2 },
              { label:"Drafts", count:draftCount, icon:Save, bg:t.statIconBg3, color:t.statIconColor3 },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} style={{ background:t.card, borderRadius:"14px", padding:"18px 20px", border:`1px solid ${t.border}`, boxShadow:isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,.05)", display:"flex", alignItems:"center", gap:"14px", animation:`fadeUp .4s ease both ${.1+i*.06}s` }}>
                  <div style={{ width:"42px", height:"42px", borderRadius:"11px", background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", color:s.color, flexShrink:0 }}><Icon size={20}/></div>
                  <div>
                    <div style={{ fontSize:"1.6rem", fontWeight:"700", color:t.textPrimary, lineHeight:1, fontFamily:"'Playfair Display',serif" }}>
                      {histLoading ? <span style={{ display:"inline-block", width:"40px", height:"26px", background:t.skeletonBg, borderRadius:"5px" }}/> : s.count}
                    </div>
                    <div style={{ fontSize:"0.75rem", color:t.textMuted, fontWeight:"500", marginTop:"3px", textTransform:"uppercase", letterSpacing:"0.4px" }}>{s.label}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="letter-content-grid" style={{ display:"grid", gridTemplateColumns:"420px 1fr", gap:"20px", alignItems:"start" }}>
            <div style={{ background:t.card, borderRadius:"16px", border:`1px solid ${t.border}`, boxShadow:isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,.05)", overflow:"hidden", animation:"fadeUp .4s ease both .22s" }}>
              <div style={{ padding:"20px 22px 16px", borderBottom:`1px solid ${t.border}`, background:isDark ? "#0F1219" : "linear-gradient(135deg,#FAFBFF 0%,#fff 100%)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                  <div style={{ width:"38px", height:"38px", borderRadius:"10px", background:t.statIconBg1, display:"flex", alignItems:"center", justifyContent:"center", color:t.statIconColor1 }}><FilePen size={20}/></div>
                  <div>
                    <h2 style={{ fontSize:"1rem", fontWeight:"600", color:t.textPrimary, margin:0 }}>Compose Letter</h2>
                    <p style={{ fontSize:"0.75rem", color:t.textMuted, margin:"2px 0 0" }}>Fill details &amp; send or save draft</p>
                  </div>
                </div>
              </div>

              <div style={{ padding:"20px 22px", display:"flex", flexDirection:"column", gap:"16px" }}>
                <div>
                  <label style={{ fontSize:"0.72rem", fontWeight:"600", color:t.textSecondary, textTransform:"uppercase", letterSpacing:"0.5px", display:"block", marginBottom:"8px" }}>Letter Type</label>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"7px" }}>
                    {letterTypes.map(t => {
                      const Icon = t.icon;
                      const active = form.letterType === t.value;
                      return (
                        <button key={t.value} className="type-chip" onClick={() => handleTypeChange(t.value)}
                          style={{ background:active ? t.bg : t.typeChipBg, color:active ? t.color : t.textMuted, borderColor:active ? t.color : "transparent" }}>
                          <Icon size={12}/>{t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display:"flex", flexDirection:"column", gap:"10px", padding:"14px", background:t.sectionBg, borderRadius:"12px", border:`1.5px dashed ${t.inputBorder}` }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                      <ImageIcon size={13} style={{ color:t.textMuted }}/>
                      <p style={{ fontSize:"0.72rem", color:t.textMuted, margin:0, fontWeight:"600", textTransform:"uppercase", letterSpacing:"0.4px" }}>Logo &amp; Signature</p>
                    </div>
                    <span style={{ fontSize:"0.65rem", color:t.textMuted, fontWeight:"500" }}>Default Applied</span>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
                    <div style={{ padding:"8px", background:t.card, borderRadius:"8px", border:`1px solid ${t.inputBorder}`, textAlign:"center" }}>
                      <img src={DEFAULT_LOGO} style={{ maxWidth:"70px", maxHeight:"50px", display:"inline-block" }} alt="Default Logo"/>
                      <p style={{ fontSize:"0.65rem", color:t.textMuted, margin:"4px 0 0" }}>Logo</p>
                    </div>
                    <div style={{ padding:"8px", background:t.card, borderRadius:"8px", border:`1px solid ${t.inputBorder}`, textAlign:"center" }}>
                      <img src={DEFAULT_SIGNATURE} style={{ maxWidth:"70px", maxHeight:"50px", display:"inline-block" }} alt="Default Signature"/>
                      <p style={{ fontSize:"0.65rem", color:t.textMuted, margin:"4px 0 0" }}>Signature</p>
                    </div>
                  </div>
                  <details style={{ fontSize:"0.75rem", color:t.textSecondary, cursor:"pointer" }}>
                    <summary style={{ fontWeight:"600", userSelect:"none" }}>Override Images (Optional)</summary>
                    <div style={{ marginTop:"10px", display:"flex", flexDirection:"column", gap:"8px" }}>
                      <div>
                        <div style={{ position:"relative" }}>
                          <ImageIcon size={13} style={{ position:"absolute", left:"11px", top:"50%", transform:"translateY(-50%)", color:t.textMuted, pointerEvents:"none" }}/>
                          <input type="text" placeholder="Custom Logo URL" value={form.logoUrl === DEFAULT_LOGO ? "" : form.logoUrl} onChange={e => setField("logoUrl", e.target.value || DEFAULT_LOGO)} className="form-input" style={{ paddingLeft:"30px", fontSize:"0.82rem", background:t.inputBg, color:t.textPrimary, borderColor:t.inputBorder }}/>
                        </div>
                      </div>
                      <div>
                        <div style={{ position:"relative" }}>
                          <ImageIcon size={13} style={{ position:"absolute", left:"11px", top:"50%", transform:"translateY(-50%)", color:t.textMuted, pointerEvents:"none" }}/>
                          <input type="text" placeholder="Custom Signature URL" value={form.signatureUrl === DEFAULT_SIGNATURE ? "" : form.signatureUrl} onChange={e => setField("signatureUrl", e.target.value || DEFAULT_SIGNATURE)} className="form-input" style={{ paddingLeft:"30px", fontSize:"0.82rem", background:t.inputBg, color:t.textPrimary, borderColor:t.inputBorder }}/>
                        </div>
                      </div>
                    </div>
                  </details>
                </div>

                {form.letterType === "custom" && (
                  <div style={{ display:"flex", flexDirection:"column", gap:"10px", padding:"14px", background:"#F5F3FF", borderRadius:"12px", border:"1.5px dashed #C4B5FD", animation:"fadeUp .25s ease" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                      <Pencil size={13} style={{ color:"#7C3AED" }}/>
                      <p style={{ fontSize:"0.72rem", color:"#7C3AED", margin:0, fontWeight:"600", textTransform:"uppercase", letterSpacing:"0.4px" }}>Custom Letter Details</p>
                    </div>
                    <div>
                      <div style={{ position:"relative" }}>
                        <FileText size={13} style={{ position:"absolute", left:"11px", top:"50%", transform:"translateY(-50%)", color:t.textMuted, pointerEvents:"none" }}/>
                        <input type="text" placeholder="Letter Title (e.g. Appreciation Letter)" value={form.customTitle} onChange={e => setField("customTitle", e.target.value)} className={`form-input ${errors.customTitle ? "err" : ""}`} style={{ paddingLeft:"30px", fontSize:"0.82rem", background:t.inputBg, color:t.textPrimary, borderColor:t.inputBorder }}/>
                      </div>
                      {errors.customTitle && <p style={{ color:"#EF4444", fontSize:"0.72rem", margin:"4px 0 0 2px" }}>{errors.customTitle}</p>}
                    </div>
                    <div>
                      <div style={{ position:"relative" }}>
                        <Mail size={13} style={{ position:"absolute", left:"11px", top:"50%", transform:"translateY(-50%)", color:t.textMuted, pointerEvents:"none" }}/>
                        <input type="text" placeholder="Email Subject (e.g. Appreciation — SHNOOR LLC)" value={form.customSubject} onChange={e => setField("customSubject", e.target.value)} className={`form-input ${errors.customSubject ? "err" : ""}`} style={{ paddingLeft:"30px", fontSize:"0.82rem", background:t.inputBg, color:t.textPrimary, borderColor:t.inputBorder }}/>
                      </div>
                      {errors.customSubject && <p style={{ color:"#EF4444", fontSize:"0.72rem", margin:"4px 0 0 2px" }}>{errors.customSubject}</p>}
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ fontSize:"0.72rem", fontWeight:"600", color:t.textSecondary, textTransform:"uppercase", letterSpacing:"0.5px", display:"block", marginBottom:"8px" }}>
                    <span style={{ display:"flex", alignItems:"center", gap:"5px" }}><Users size={11}/> Select Employee</span>
                  </label>
                  <EmployeeSelect token={token} selectedEmployee={selectedEmployee} onSelect={handleEmployeeSelect} onClear={handleEmployeeClear} isDark={isDark}/>
                </div>

                {selectedEmployee && (
                  <div style={{ display:"flex", flexDirection:"column", gap:"10px", padding:"12px", background:t.sectionBg, borderRadius:"10px", border:`1px dashed ${t.inputBorder}` }}>
                    <p style={{ fontSize:"0.7rem", color:t.textMuted, margin:"0 0 2px", fontWeight:"500" }}>✎ Override fields if needed</p>
                    {[
                      { k:"employeeId", label:"Employee ID", icon:Hash, type:"text" },
                      { k:"employeeName", label:"Employee Name", icon:User, type:"text" },
                      { k:"employeeEmail", label:"Employee Email", icon:Mail, type:"email" },
                    ].map(f => {
                      const Icon = f.icon;
                      return (
                        <div key={f.k} style={{ position:"relative" }}>
                          <Icon size={13} style={{ position:"absolute", left:"11px", top:"50%", transform:"translateY(-50%)", color:t.textMuted, pointerEvents:"none" }}/>
                          <input type={f.type} placeholder={f.label} value={form[f.k]} onChange={e => setField(f.k, e.target.value)} className="form-input" style={{ paddingLeft:"30px", fontSize:"0.8rem", background:t.inputBg, color:t.textPrimary, borderColor:t.inputBorder }}/>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"8px" }}>
                    <label style={{ fontSize:"0.72rem", fontWeight:"600", color:t.textSecondary, textTransform:"uppercase", letterSpacing:"0.5px" }}>Letter Content</label>
                    <button onClick={() => setPreview(form.htmlContent)} style={{ fontSize:"0.72rem", color:"#4F46E5", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:"4px", fontWeight:"500" }}>
                      <Eye size={12}/> Preview
                    </button>
                  </div>
                  <RichEditor value={form.htmlContent} onChange={v => setField("htmlContent", v)} accentColor={selType.color} isDark={isDark}/>
                </div>

                <div style={{ position:"relative" }}>
                  <StickyNote size={14} style={{ position:"absolute", left:"12px", top:"14px", color:t.textMuted, pointerEvents:"none" }}/>
                  <textarea rows={2} placeholder="Internal notes (optional)…" value={form.notes} onChange={e => setField("notes", e.target.value)} className="form-input" style={{ paddingLeft:"34px", resize:"none", lineHeight:1.55, background:t.inputBg, color:t.textPrimary, borderColor:t.inputBorder }}/>
                </div>

                <div style={{ display:"flex", alignItems:"center", gap:"8px", padding:"10px 14px", borderRadius:"10px", background:selType.bg, color:selType.color, fontSize:"0.8rem", fontWeight:"500" }}>
                  {React.createElement(selType.icon, { size:15 })}
                  <span>Composing: <strong>{form.letterType === "custom" && form.customTitle ? form.customTitle : selType.label}</strong></span>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
                  <button className="btn-blue" onClick={handleSend} disabled={loading}><Send size={14}/>{loading ? "Sending…" : "Send Letter"}</button>
                  <button className="btn-ghost" onClick={handleDraft} disabled={loading} style={{ border:`1.5px solid ${t.buttonSecondaryBorder}`, background:t.buttonSecondaryBg, color:t.buttonSecondaryText }}><Save size={14}/>{loading ? "Saving…" : "Save Draft"}</button>
                </div>
              </div>
            </div>

            <div style={{ background:t.card, borderRadius:"16px", border:`1px solid ${t.border}`, boxShadow:isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,.05)", overflow:"hidden", animation:"fadeUp .4s ease both .28s" }}>
              <div style={{ padding:"18px 22px", borderBottom:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px", flexWrap:"wrap" }}>
                <div>
                  <h2 style={{ fontSize:"1rem", fontWeight:"600", color:t.textPrimary, margin:"0 0 2px" }}>Letter History</h2>
                  <p style={{ fontSize:"0.78rem", color:t.textMuted, margin:0, display:"flex", alignItems:"center", gap:"5px" }}><Clock size={12}/>{filtered.length} record{filtered.length!==1?"s":""} found</p>
                </div>
                <div className="letter-hist-filters" style={{ display:"flex", gap:"8px", flexWrap:"wrap", alignItems:"center" }}>
                  <div style={{ position:"relative" }}>
                    <Filter size={12} style={{ position:"absolute", left:"9px", top:"50%", transform:"translateY(-50%)", color:t.textMuted, pointerEvents:"none" }}/>
                    <select value={filterType} onChange={e => setFilterType(e.target.value)} className="letter-hist-select" style={{ padding:"7px 12px 7px 26px", border:`1.5px solid ${t.inputBorder}`, borderRadius:"9px", fontSize:"0.78rem", color:t.textPrimary, background:t.inputBg, fontFamily:"'DM Sans',sans-serif", outline:"none", cursor:"pointer", appearance:"none" }}>
                      <option value="all">All Types</option>
                      {letterTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="letter-hist-select" style={{ padding:"7px 12px", border:`1.5px solid ${t.inputBorder}`, borderRadius:"9px", fontSize:"0.78rem", color:t.textPrimary, background:t.inputBg, fontFamily:"'DM Sans',sans-serif", outline:"none", cursor:"pointer", appearance:"none" }}>
                    <option value="all">All Status</option>
                    <option value="sent">Sent</option>
                    <option value="draft">Draft</option>
                  </select>
                  <div style={{ position:"relative" }}>
                    <Search size={13} style={{ position:"absolute", left:"9px", top:"50%", transform:"translateY(-50%)", color:t.textMuted }}/>
                    <input className="search-inp letter-hist-search" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} style={{ padding:"7px 12px 7px 28px", border:`1.5px solid ${t.inputBorder}`, borderRadius:"9px", fontSize:"0.78rem", color:t.textPrimary, background:t.inputBg, fontFamily:"'DM Sans',sans-serif", width:"170px", outline:"none" }}/>
                  </div>
                  <button onClick={fetchHistory} title="Refresh" style={{ width:"34px", height:"34px", border:`1.5px solid ${t.inputBorder}`, borderRadius:"9px", background:t.card, display:"flex", alignItems:"center", justifyContent:"center", color:t.textSecondary, cursor:"pointer" }}><RefreshCw size={14}/></button>
                </div>
              </div>

              <div style={{ maxHeight:"600px", overflowY:"auto" }}>
                {histLoading ? (
                  Array.from({length:4}).map((_,i) => (
                    <div key={i} style={{ padding:"18px 22px", borderBottom:`1px solid ${t.border}` }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"10px" }}>
                        <div style={{ height:"14px", width:"180px", background:t.skeletonBg, borderRadius:"4px" }}/>
                        <div style={{ height:"22px", width:"80px", background:t.skeletonBg, borderRadius:"20px" }}/>
                      </div>
                      <div style={{ height:"12px", width:"100%", background:t.skeletonBg, borderRadius:"4px" }}/>
                    </div>
                  ))
                ) : filtered.length === 0 ? (
                  <div style={{ padding:"60px 20px", textAlign:"center" }}>
                    <div style={{ width:"52px", height:"52px", borderRadius:"14px", background:t.skeletonBg, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px", color:t.textMuted }}><Inbox size={24}/></div>
                    <p style={{ color:t.textMuted, fontSize:"0.875rem", margin:0, fontWeight:"500" }}>No letters found</p>
                    <p style={{ color:t.textMuted, fontSize:"0.78rem", margin:"4px 0 0" }}>Compose and send your first letter!</p>
                  </div>
                ) : (
                  filtered.map((item, idx) => {
                    const type = getType(item.letter_type || item.letterType);
                    const Icon = type.icon;
                    const displayLabel = (item.letterType === "custom" || item.letter_type === "custom") && item.customTitle ? item.customTitle : type.label;
                    return (
                      <div key={item._id || idx} className="hist-row" style={{ padding:"16px 22px", animation:`slideIn .3s ease both ${idx*.04}s`, borderBottom:`1px solid ${t.border}` }}>
                        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:"12px" }}>
                          <div style={{ display:"flex", gap:"12px", alignItems:"flex-start", minWidth:0 }}>
                            <div style={{ width:"38px", height:"38px", borderRadius:"10px", background:type.bg, display:"flex", alignItems:"center", justifyContent:"center", color:type.color, flexShrink:0 }}><Icon size={17}/></div>
                            <div style={{ minWidth:0 }}>
                              <div style={{ display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap" }}>
                                <span style={{ fontSize:"0.875rem", fontWeight:"600", color:t.textPrimary }}>{item.employeeName || "—"}</span>
                                <span style={{ fontSize:"0.7rem", color:t.textMuted, background:t.skeletonBg, padding:"1px 7px", borderRadius:"6px", fontWeight:"500" }}>#{item.employeeId}</span>
                              </div>
                              <p style={{ fontSize:"0.78rem", color:t.textMuted, margin:"2px 0 0" }}>{item.employeeEmail}</p>
                              {item.customSubject && (
                                <p style={{ fontSize:"0.75rem", color:"#7C3AED", margin:"2px 0 0", display:"flex", alignItems:"center", gap:"4px" }}>
                                  <Mail size={10}/> {item.customSubject}
                                </p>
                              )}
                            </div>
                          </div>
                          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"5px", flexShrink:0 }}>
                            <span style={{ padding:"3px 10px", borderRadius:"20px", fontSize:"0.7rem", fontWeight:"600", background:type.bg, color:type.color, display:"inline-flex", alignItems:"center", gap:"4px" }}><Icon size={10}/>{displayLabel}</span>
                            <span style={{ padding:"2px 9px", borderRadius:"20px", fontSize:"0.68rem", fontWeight:"600", background:item.status==="sent" ? t.badgeSentBg : t.badgeDraftBg, color:item.status==="sent" ? t.badgeSentText : t.badgeDraftText }}>{item.status==="sent" ? "✓ Sent" : "⏳ Draft"}</span>
                          </div>
                        </div>
                        {item.notes && (
                          <p style={{ margin:"10px 0 0 50px", fontSize:"0.8rem", color:t.textSecondary, fontStyle:"italic", borderLeft:`2px solid ${t.border}`, paddingLeft:"10px" }}>{item.notes}</p>
                        )}
                        <div style={{ marginTop:"10px", display:"flex", alignItems:"center", gap:"5px", color:t.textMuted, fontSize:"0.72rem" }}>
                          <Clock size={11}/>
                          {new Date(item.createdAt || item.sent_at).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}
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
        </div>
      </main>
    </div>
  );
}
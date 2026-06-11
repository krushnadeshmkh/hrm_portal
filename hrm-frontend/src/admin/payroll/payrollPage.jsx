import React, { useState, useEffect } from "react";
import Sidebar from "../../layouts/sidebar";
import MobileTopBar from "../../employee/MobileTopBar";
import { DollarSign, CheckCircle2, Download, Bell, Search, Clock, Users, TrendingUp, X } from "lucide-react";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";

function Payroll() {
  const [payrollData, setPayrollData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [search, setSearch] = useState("");
  const { isDark } = useTheme();

  const [selectedEmp, setSelectedEmp] = useState("");
  const [salary, setSalary] = useState("");
  const [bonus, setBonus] = useState("");
  const [bonusReason, setBonusReason] = useState("");
  const [allowances, setAllowances] = useState("");
  const [allowanceReason, setAllowanceReason] = useState("");
  const [customDeductions, setCustomDeductions] = useState("0");
  const [deductionReason, setDeductionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedDeductions, setCalculatedDeductions] = useState(null);

  const name = localStorage.getItem("name") || "Admin";
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
    tableHead: isDark ? "#111827" : "#FAFBFF",
    statIconBg1: isDark ? "#1E1B4B" : "#EEF2FF",
    statIconBg2: isDark ? "#064E3B" : "#ECFDF5",
    statIconBg3: isDark ? "#064E3B" : "#ECFDF5",
    statIconBg4: isDark ? "#451A03" : "#FFFBEB",
    statIconColor1: isDark ? "#818CF8" : "#4F46E5",
    statIconColor2: isDark ? "#34D399" : "#059669",
    statIconColor3: isDark ? "#34D399" : "#059669",
    statIconColor4: isDark ? "#FCD34D" : "#D97706",
    badgePaidBg: isDark ? "#064E3B" : "#ECFDF5",
    badgePaidText: isDark ? "#6EE7B7" : "#059669",
    badgePaidDot: isDark ? "#6EE7B7" : "#059669",
    badgePendingBg: isDark ? "#451A03" : "#FFFBEB",
    badgePendingText: isDark ? "#FCD34D" : "#D97706",
    badgePendingDot: isDark ? "#FCD34D" : "#D97706",
    modalOverlay: isDark ? "rgba(0,0,0,0.7)" : "rgba(15,23,42,0.5)",
    buttonPrimary: "#4F46E5",
    salaryBadgeBg: isDark ? "#1E1B4B" : "#EEF2FF",
    salaryBadgeText: isDark ? "#818CF8" : "#4F46E5",
    previewBg: isDark ? "#1E2535" : "#EEF2FF",
    previewBorder: isDark ? "#2D3748" : "#E0E7FF",
    earningsBg: isDark ? "#1E2535" : "#F9FAFB",
    deductionsBg: isDark ? "#2D0F0F" : "#FEF2F2",
    netBg: isDark ? "linear-gradient(135deg, #4F46E5, #7C3AED)" : "linear-gradient(135deg, #4F46E5, #7C3AED)",
    trendUp: isDark ? "#34D399" : "#059669",
    trendDown: isDark ? "#FCD34D" : "#D97706",
    statBorder: isDark ? "#1E2535" : "#F1F3F9",
    buttonDownloadBg: isDark ? "#1E1B4B" : "#EEF2FF",
    buttonDownloadColor: isDark ? "#818CF8" : "#4F46E5",
    buttonDownloadBorder: isDark ? "#2D3748" : "#E0E7FF",
    buttonDisabledBg: isDark ? "#1E2535" : "#F9FAFB",
    buttonDisabledColor: isDark ? "#4B5563" : "#D1D5DB",
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

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("https://hrm-backend-vvqg.onrender.com/api/payroll", {
        headers: { "x-auth-token": token },
      });
      setPayrollData(res.data.data || []);
    } catch (err) {
      console.error("Error fetching payroll:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://hrm-backend-vvqg.onrender.com/api/employees", {
        headers: { "x-auth-token": token },
      });
      setEmployees(res.data.data || []);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  useEffect(() => {
    fetchPayroll();
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (salary && parseFloat(salary) > 0) {
      setCalculatedDeductions(true);
    } else {
      setCalculatedDeductions(null);
    }
  }, [salary]);

  const handleEmployeeSelect = (empId) => {
    setSelectedEmp(empId);
    const emp = employees.find((e) => e._id === empId);
    if (emp && emp.salary) {
      setSalary(String(emp.salary));
    } else {
      setSalary("");
    }
  };

  const handleDownload = async (payrollId, employeeName) => {
    if (!payrollId) { alert("No payment record found to download."); return; }
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`https://hrm-backend-vvqg.onrender.com/api/payroll/download/${payrollId}`, {
        headers: { "x-auth-token": token },
      });
      const data = res.data.data;
      const emp = data.employee_id;
      const grossSalary = (data.salary || 0) + (data.bonus || 0) + (data.allowances || 0);
      const totalDeductions = parseFloat(data.total_deductions || 0);
      const netSalary = parseFloat(data.net_salary || 0);

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Payslip - ${emp?.name || "Employee"}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6fb; padding: 30px; color: #1a1a2e; }
  .slip { max-width: 700px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.10); }
  .header { background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 32px 36px; color: #fff; }
  .header h1 { font-size: 1.5rem; font-weight: 700; letter-spacing: 0.5px; }
  .header p { font-size: 0.85rem; opacity: 0.85; margin-top: 4px; }
  .badge { display: inline-block; background: rgba(255,255,255,0.18); border: 1px solid rgba(255,255,255,0.35); border-radius: 20px; padding: 3px 14px; font-size: 0.72rem; font-weight: 600; margin-top: 10px; letter-spacing: 0.5px; }
  .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border-bottom: 1px solid #f0f0f7; }
  .meta-item { padding: 18px 36px; border-right: 1px solid #f0f0f7; }
  .meta-item:nth-child(even) { border-right: none; }
  .meta-label { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.6px; color: #9CA3AF; font-weight: 600; }
  .meta-value { font-size: 0.9rem; font-weight: 600; color: #1F2937; margin-top: 3px; }
  .body { padding: 28px 36px; }
  .section-title { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 700; color: #6B7280; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1.5px solid #F3F4F6; }
  .row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px dashed #F3F4F6; }
  .row:last-child { border-bottom: none; }
  .row-label { font-size: 0.855rem; color: #374151; }
  .row-sub { font-size: 0.72rem; color: #9CA3AF; margin-top: 1px; }
  .row-value { font-size: 0.9rem; font-weight: 600; }
  .green { color: #059669; }
  .red { color: #DC2626; }
  .section { margin-bottom: 24px; }
  .subtotal { background: #F9FAFB; border-radius: 8px; padding: 12px 14px; display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
  .subtotal span { font-size: 0.82rem; font-weight: 600; color: #374151; }
  .subtotal strong { font-size: 0.95rem; font-weight: 700; color: #1F2937; }
  .divider { height: 1px; background: linear-gradient(to right, #E0E7FF, #E5E7EB, #E0E7FF); margin: 8px 0 20px; }
  .net { background: linear-gradient(135deg, #4F46E5, #7C3AED); border-radius: 12px; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; margin-top: 4px; }
  .net-label { color: rgba(255,255,255,0.85); font-size: 0.85rem; font-weight: 600; }
  .net-label small { display: block; font-size: 0.68rem; opacity: 0.7; margin-top: 2px; }
  .net-amount { color: #fff; font-size: 1.8rem; font-weight: 800; letter-spacing: -0.5px; }
  .footer { padding: 14px 36px; background: #FAFBFF; border-top: 1px solid #F0F0F7; font-size: 0.7rem; color: #9CA3AF; text-align: center; }
  @media print {
    body { background: #fff; padding: 0; }
    .slip { box-shadow: none; }
  }
</style>
</head>
<body>
<div class="slip">
  <div class="header">
    <h1>${data.company_name || "Company"}</h1>
    <p>Salary Payslip</p>
    <span class="badge">PAYSLIP</span>
  </div>

  <div class="meta">
    <div class="meta-item">
      <div class="meta-label">Employee Name</div>
      <div class="meta-value">${emp?.name || "N/A"}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Employee ID</div>
      <div class="meta-value">EMP-${String(emp?._id || "N/A").slice(-6).toUpperCase()}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Department</div>
      <div class="meta-value">${emp?.department_id?.department_name || "General"}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Payment Date</div>
      <div class="meta-value">${new Date(data.pay_date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</div>
    </div>
  </div>

  <div class="body">
    <div class="section">
      <div class="section-title">Earnings</div>
      <div class="row">
        <div><div class="row-label">Basic Salary</div></div>
        <div class="row-value green">₹${parseFloat(data.salary || 0).toLocaleString("en-IN")}</div>
      </div>
      ${parseFloat(data.bonus || 0) > 0 ? `
      <div class="row">
        <div>
          <div class="row-label">Bonus</div>
          ${data.bonus_reason ? `<div class="row-sub">${data.bonus_reason}</div>` : ""}
        </div>
        <div class="row-value green">+ ₹${parseFloat(data.bonus).toLocaleString("en-IN")}</div>
      </div>` : ""}
      ${parseFloat(data.allowances || 0) > 0 ? `
      <div class="row">
        <div>
          <div class="row-label">Allowances</div>
          ${data.allowance_reason ? `<div class="row-sub">${data.allowance_reason}</div>` : ""}
        </div>
        <div class="row-value green">+ ₹${parseFloat(data.allowances).toLocaleString("en-IN")}</div>
      </div>` : ""}
      <div class="subtotal">
        <span>Gross Salary</span>
        <strong>₹${grossSalary.toLocaleString("en-IN")}</strong>
      </div>
    </div>

    <div class="divider"></div>

    <div class="section">
      <div class="section-title">Deductions</div>
      ${parseFloat(data.pf || 0) > 0 ? `
      <div class="row">
        <div><div class="row-label">Provident Fund</div><div class="row-sub">12% of Basic Salary</div></div>
        <div class="row-value red">- ₹${parseFloat(data.pf).toLocaleString("en-IN")}</div>
      </div>` : ""}
      ${parseFloat(data.pt || 0) > 0 ? `
      <div class="row">
        <div><div class="row-label">Professional Tax</div></div>
        <div class="row-value red">- ₹${parseFloat(data.pt).toLocaleString("en-IN")}</div>
      </div>` : ""}
      ${parseFloat(data.tax || 0) > 0 ? `
      <div class="row">
        <div><div class="row-label">Income Tax (TDS)</div></div>
        <div class="row-value red">- ₹${parseFloat(data.tax).toLocaleString("en-IN")}</div>
      </div>` : ""}
      ${parseFloat(data.esi || 0) > 0 ? `
      <div class="row">
        <div><div class="row-label">Employee State Insurance</div><div class="row-sub">0.75% of Basic Salary</div></div>
        <div class="row-value red">- ₹${parseFloat(data.esi).toLocaleString("en-IN")}</div>
      </div>` : ""}
      ${parseFloat(data.deductions || 0) > 0 ? `
      <div class="row">
        <div>
          <div class="row-label">Other Deductions</div>
          ${data.deduction_reason ? `<div class="row-sub">${data.deduction_reason}</div>` : ""}
        </div>
        <div class="row-value red">- ₹${parseFloat(data.deductions).toLocaleString("en-IN")}</div>
      </div>` : ""}
      ${parseFloat(data.advance_deduction || 0) > 0 ? `
      <div class="row">
        <div><div class="row-label">Advance Recovery</div></div>
        <div class="row-value red">- ₹${parseFloat(data.advance_deduction).toLocaleString("en-IN")}</div>
      </div>` : ""}
      <div class="subtotal">
        <span>Total Deductions</span>
        <strong style="color:#DC2626">₹${totalDeductions.toLocaleString("en-IN")}</strong>
      </div>
    </div>

    <div class="net">
      <div class="net-label">
        Net Salary Paid
        <small>Gross ₹${grossSalary.toLocaleString("en-IN")} − Deductions ₹${totalDeductions.toLocaleString("en-IN")}</small>
      </div>
      <div class="net-amount">₹${netSalary.toLocaleString("en-IN")}</div>
    </div>
  </div>

  <div class="footer">
    This is a computer-generated payslip and does not require a signature. &nbsp;|&nbsp; Generated on ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
  </div>
</div>
</body>
</html>`;

      const element = document.createElement("a");
      const file = new Blob([html], { type: "text/html" });
      element.href = URL.createObjectURL(file);
      element.download = `Payslip_${employeeName.replace(/\s+/g, "_")}.html`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      URL.revokeObjectURL(element.href);
    } catch (err) {
      alert(err.response?.data?.error || "Could not download payslip");
    }
  };

  const handleRunPayroll = async (e) => {
    e.preventDefault();
    if (!selectedEmp) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "https://hrm-backend-vvqg.onrender.com/api/payroll/generate",
        {
          employee_id: selectedEmp,
          salary: parseFloat(salary),
          bonus: parseFloat(bonus) || 0,
          bonus_reason: bonusReason,
          allowances: parseFloat(allowances) || 0,
          allowance_reason: allowanceReason,
          deductions: parseFloat(customDeductions) || 0,
          deduction_reason: deductionReason,
        },
        { headers: { "x-auth-token": token } }
      );
      setShowModal(false);
      setSelectedEmp("");
      setSalary("");
      setBonus("");
      setBonusReason("");
      setAllowances("");
      setAllowanceReason("");
      setCustomDeductions("0");
      setDeductionReason("");
      setCalculatedDeductions(null);
      fetchPayroll();
    } catch (err) {
      alert(err.response?.data?.error || "Error generating payroll");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPayout = payrollData.reduce((acc, curr) => acc + (parseFloat(curr.last_net_salary) || 0), 0);
  const paidCount = payrollData.filter((p) => p.pay_date).length;
  const pendingCount = payrollData.filter((p) => !p.pay_date).length;

  const filtered = payrollData.filter((p) =>
    (p.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: t.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
        .stat-card { transition: transform 0.18s, box-shadow 0.18s; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(15,23,42,0.15) !important; }
        .pay-row { transition: background 0.12s; }
        .pay-row:hover { background: ${t.rowHover} !important; }
        .search-input:focus { outline: none; border-color: #4F46E5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.10); }
        .topbar-btn:hover { background: ${isDark ? "#1E2535" : "#F3F4F6"} !important; }
        .form-input { width: 100%; padding: 9px 13px; border: 1.5px solid ${t.inputBorder}; border-radius: 9px; font-size: 0.875rem; color: ${t.textPrimary}; background: ${t.inputBg}; font-family: inherit; transition: border-color 0.18s, box-shadow 0.18s; outline: none; }
        .form-input:focus { border-color: #4F46E5; box-shadow: 0 0 0 3px rgba(79,70,229,0.10); }
        * { box-sizing: border-box; }
        .modal-bg   { position:fixed; inset:0; background:${t.modalOverlay}; display:flex; align-items:flex-end; justify-content:center; z-index:2000; padding:0; }
        .modal-sheet { background:${t.card}; border-radius:18px 18px 0 0; width:100%; max-height:92vh; overflow-y:auto; padding:24px 20px 32px; animation:slideUp .25s ease both; border-top:1px solid ${t.border}; }
        @media (min-width:600px) {
          .modal-bg    { align-items:center; padding:16px; }
          .modal-sheet { border-radius:16px; max-width:560px; padding:28px; animation:fadeUp .2s ease both; border:1px solid ${t.border}; }
        }
        @media (max-width: 768px) {
          .pay-topbar       { display: none !important; }
          .pay-main         { padding: 72px 14px 32px !important; }
          .pay-page-head    { flex-direction: column !important; align-items: stretch !important; gap: 12px !important; }
          .pay-h1           { font-size: 1.45rem !important; }
          .pay-process-btn  { width: 100% !important; justify-content: center !important; }
          .pay-stats-grid   { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
          .pay-stat-card    { padding: 14px !important; }
          .pay-stat-val     { font-size: 1.3rem !important; }
          .pay-table-header { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
          .pay-search-inp   { width: 100% !important; }
          .pay-table-wrap   { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .pay-table-wrap table { min-width: 580px; }
          .pay-modal-grid   { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .pay-main       { padding: 24px 20px 32px !important; }
          .pay-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        .salary-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; background: ${t.salaryBadgeBg}; color: ${t.salaryBadgeText}; border-radius: 6px; font-size: 0.78rem; font-weight: 600; margin-top: 4px; }
      `}</style>

      <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div style={{
        marginLeft: `${sidebarWidth}px`, flex: 1,
        transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column", minHeight: "100vh", minWidth: 0,
      }}>
        <div className="pay-topbar" style={{
          height: "64px", backgroundColor: t.topbar, borderBottom: `1px solid ${t.border}`,
          display: "flex", alignItems: "center", padding: "0 28px", gap: "16px",
          position: "sticky", top: 0, zIndex: 100, boxShadow: isDark ? "0 1px 4px rgba(0,0,0,0.3)" : "0 1px 4px rgba(15,23,42,0.04)",
        }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "380px" }}>
            <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: t.textMuted }} />
            <input className="search-input" placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "8px 12px 8px 36px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "10px", fontSize: "0.875rem", color: t.textPrimary, backgroundColor: t.inputBg }} />
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "9px", padding: "5px 12px 5px 6px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "10px", background: t.card, cursor: "pointer" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #4F46E5, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.72rem", fontWeight: "600" }}>
                {name.slice(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: "0.83rem", fontWeight: "500", color: t.textPrimary }}>{name}</span>
            </div>
          </div>
        </div>

        <main className="pay-main" style={{ padding: "28px 28px 40px", flex: 1 }}>
          <div className="pay-page-head" style={{ marginBottom: "24px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", animation: "fadeUp 0.4s ease both 0.05s" }}>
            <div>
              <p style={{ color: t.textSecondary, fontSize: "0.875rem", margin: "0 0 4px" }}>
                {greeting}, <strong style={{ color: "#4F46E5" }}>{name}</strong> 👋
              </p>
              <h1 className="pay-h1" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.85rem", fontWeight: "700", color: t.textPrimary, margin: 0, lineHeight: 1.2 }}>
                Payroll Management
              </h1>
              <p style={{ color: t.textMuted, fontSize: "0.85rem", margin: "5px 0 0" }}>
                {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            <button className="pay-process-btn" onClick={() => setShowModal(true)} style={{
              display: "flex", alignItems: "center", gap: "7px",
              padding: "10px 18px", backgroundColor: t.buttonPrimary, color: "#fff",
              border: "none", borderRadius: "10px", fontSize: "0.875rem",
              fontWeight: "600", cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 2px 8px rgba(79,70,229,0.25)", whiteSpace: "nowrap", alignSelf: "flex-start",
            }}>
              <DollarSign size={15} /> Process Payment
            </button>
          </div>

          <div className="pay-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "24px" }}>
            {[
              { title: "Total Payout",     count: `₹${totalPayout.toLocaleString()}`, icon: <TrendingUp size={19} />,    bg: t.statIconBg1, color: t.statIconColor1, trend: "Current cycle",    trendUp: true },
              { title: "Total Employees",  count: payrollData.length,                  icon: <Users size={19} />,          bg: t.statIconBg2, color: t.statIconColor2, trend: "Staff on record",  trendUp: true },
              { title: "Paid",             count: paidCount,                            icon: <CheckCircle2 size={19} />,   bg: t.statIconBg3, color: t.statIconColor3, trend: "Processed",        trendUp: true },
              { title: "Pending",          count: pendingCount,                         icon: <Clock size={19} />,          bg: t.statIconBg4, color: t.statIconColor4, trend: "Awaiting payment", trendUp: false },
            ].map((stat, idx) => (
              <div key={idx} className="stat-card pay-stat-card" style={{ backgroundColor: t.card, borderRadius: "14px", padding: "18px", border: `1px solid ${t.border}`, boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)", animation: `fadeUp 0.4s ease both ${0.1 + idx * 0.07}s` }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", color: stat.color, marginBottom: "12px" }}>
                  {stat.icon}
                </div>
                <div style={{ fontSize: "0.75rem", color: t.textMuted, fontWeight: "500", marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.4px" }}>{stat.title}</div>
                <div className="pay-stat-val" style={{ fontSize: typeof stat.count === "string" && stat.count.startsWith("₹") ? "1.4rem" : "2rem", fontWeight: "700", color: t.textPrimary, lineHeight: 1, fontFamily: "'Playfair Display', serif", marginBottom: "6px" }}>
                  {loading ? <span style={{ display: "inline-block", width: "50px", height: "28px", background: t.skeletonBg, borderRadius: "5px" }} /> : stat.count}
                </div>
                <div style={{ fontSize: "0.73rem", color: stat.trendUp ? t.trendUp : t.trendDown, fontWeight: "500" }}>{stat.trend}</div>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: t.card, borderRadius: "14px", border: `1px solid ${t.border}`, boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)", overflow: "hidden", animation: "fadeUp 0.4s ease both 0.35s" }}>
            <div className="pay-table-header" style={{ padding: "16px 20px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
              <div>
                <h2 style={{ fontSize: "0.95rem", fontWeight: "600", color: t.textPrimary, margin: "0 0 2px" }}>Payroll Records</h2>
                <p style={{ fontSize: "0.75rem", color: t.textMuted, margin: 0 }}>{filtered.length} {filtered.length === 1 ? "employee" : "employees"} found</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: isMobile ? "1 1 100%" : "0 0 auto", flexWrap: "wrap" }}>
                {isMobile && (
                  <div style={{ position: "relative", flex: "1 1 100%" }}>
                    <Search size={13} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: t.textMuted }} />
                    <input className="search-input pay-search-inp" placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)}
                      style={{ padding: "8px 12px 8px 30px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "9px", fontSize: "0.82rem", color: t.textPrimary, backgroundColor: t.inputBg, width: "100%" }} />
                  </div>
                )}
                <span style={{ fontSize: "0.72rem", fontWeight: "600", color: t.buttonPrimary, backgroundColor: t.salaryBadgeBg, padding: "4px 12px", borderRadius: "20px", whiteSpace: "nowrap" }}>
                  Live Records
                </span>
              </div>
            </div>

            <div className="pay-table-wrap">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: t.tableHead }}>
                    {["#", "Employee", "Net Salary", "Status", "Payment Date", "Payslip"].map((h, i) => (
                      <th key={i} style={{
                        padding: "10px 18px",
                        textAlign: i === 5 ? "right" : "left",
                        fontSize: "0.68rem",
                        fontWeight: "600",
                        color: t.textMuted,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        borderBottom: `1px solid ${t.border}`,
                        whiteSpace: "nowrap"
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {[30, 140, 90, 70, 100, 50].map((w, j) => (
                          <td key={j} style={{ padding: "13px 18px" }}>
                            <div style={{ height: "13px", width: `${w}px`, background: t.skeletonBg, borderRadius: "4px", marginLeft: j === 5 ? "auto" : 0 }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: "44px", textAlign: "center", color: t.textMuted, fontSize: "0.875rem" }}>
                        No payroll records found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((pay, i) => (
                      <tr key={pay.employee_id} className="pay-row" style={{ borderBottom: `1px solid ${t.border}` }}>
                        <td style={{ padding: "12px 18px", fontSize: "0.8rem", color: t.textMuted, fontWeight: "500" }}>{String(i + 1).padStart(2, "0")}</td>
                        <td style={{ padding: "12px 18px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                            <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: `hsl(${(pay.name?.charCodeAt(0) || 65) * 5 % 360}, 55%, ${isDark ? "45%" : "55%"})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.72rem", fontWeight: "600", flexShrink: 0 }}>
                              {(pay.name || "?").slice(0, 2).toUpperCase()}
                            </div>
                            <span style={{ fontSize: "0.855rem", fontWeight: "500", color: t.textPrimary, whiteSpace: "nowrap" }}>{pay.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 18px" }}>
                          <span style={{ fontSize: "0.9rem", fontWeight: "700", color: t.textPrimary, whiteSpace: "nowrap" }}>
                            ₹{parseFloat(pay.last_net_salary || 0).toLocaleString()}
                          </span>
                        </td>
                        <td style={{ padding: "12px 18px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 10px", borderRadius: "20px", fontSize: "0.7rem", fontWeight: "600", backgroundColor: pay.pay_date ? t.badgePaidBg : t.badgePendingBg, color: pay.pay_date ? t.badgePaidText : t.badgePendingText, whiteSpace: "nowrap" }}>
                            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: pay.pay_date ? t.badgePaidDot : t.badgePendingDot }} />
                            {pay.pay_date ? "Paid" : "Pending"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 18px", fontSize: "0.84rem", color: t.textSecondary, whiteSpace: "nowrap" }}>
                          {pay.pay_date ? new Date(pay.pay_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </td>
                        <td style={{ padding: "12px 18px", textAlign: "right" }}>
                          <button onClick={() => handleDownload(pay.payroll_id, pay.name)} disabled={!pay.pay_date}
                            style={{ width: "32px", height: "32px", borderRadius: "8px", border: `1.5px solid`, borderColor: pay.pay_date ? t.buttonDownloadBorder : t.inputBorder, backgroundColor: pay.pay_date ? t.buttonDownloadBg : t.buttonDisabledBg, color: pay.pay_date ? t.buttonDownloadColor : t.buttonDisabledColor, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: pay.pay_date ? "pointer" : "not-allowed" }}>
                            <Download size={13} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!loading && filtered.length > 0 && (
              <div style={{ padding: "10px 20px", borderTop: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
                <span style={{ fontSize: "0.75rem", color: t.textMuted }}>Showing {filtered.length} of {payrollData.length} records</span>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Clock size={11} style={{ color: t.textMuted }} />
                  <span style={{ fontSize: "0.7rem", color: t.textMuted }}>Updated just now</span>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {showModal && (
        <div className="modal-bg" onClick={() => setShowModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "1.05rem", fontWeight: "700", color: t.textPrimary, margin: "0 0 2px", fontFamily: "'Playfair Display', serif" }}>Process Payment</h2>
                <p style={{ fontSize: "0.77rem", color: t.textMuted, margin: 0 }}>Generate payroll for a staff member</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ width: "32px", height: "32px", borderRadius: "8px", border: `1.5px solid ${t.inputBorder}`, background: t.inputBg, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: t.textMuted }}>
                <X size={15} />
              </button>
            </div>
            <form onSubmit={handleRunPayroll}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "500", color: t.textSecondary, marginBottom: "6px" }}>Select Staff Member</label>
                <select className="form-input" value={selectedEmp} onChange={(e) => handleEmployeeSelect(e.target.value)} required>
                  <option value="">— Choose Employee —</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>{emp.name}</option>
                  ))}
                </select>
                {selectedEmp && salary && (
                  <span className="salary-badge">
                    <DollarSign size={11} /> Base salary: ₹{parseFloat(salary).toLocaleString()}
                  </span>
                )}
                {selectedEmp && !salary && (
                  <span style={{ fontSize: "0.75rem", color: t.trendDown, marginTop: "4px", display: "block" }}>
                    No salary on record for this employee
                  </span>
                )}
              </div>

              <div className="pay-modal-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "22px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "500", color: t.textSecondary, marginBottom: "6px" }}>Basic Salary (₹)</label>
                  <input type="number" className="form-input" placeholder="Auto-filled from employee record" value={salary} onChange={(e) => setSalary(e.target.value)} required />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "500", color: t.textSecondary, marginBottom: "6px" }}>Bonus (₹)</label>
                  <input type="number" className="form-input" placeholder="Bonus amount" value={bonus} onChange={(e) => setBonus(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "500", color: t.textSecondary, marginBottom: "6px" }}>Bonus Reason</label>
                  <input type="text" className="form-input" placeholder="e.g., Performance, Festival" value={bonusReason} onChange={(e) => setBonusReason(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "500", color: t.textSecondary, marginBottom: "6px" }}>Allowances (₹)</label>
                  <input type="number" className="form-input" placeholder="Allowances" value={allowances} onChange={(e) => setAllowances(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "500", color: t.textSecondary, marginBottom: "6px" }}>Allowance Reason</label>
                  <input type="text" className="form-input" placeholder="e.g., HRA, Travel" value={allowanceReason} onChange={(e) => setAllowanceReason(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "500", color: t.textSecondary, marginBottom: "6px" }}>Other Deductions (₹)</label>
                  <input type="number" className="form-input" placeholder="Other deductions" value={customDeductions} onChange={(e) => setCustomDeductions(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "500", color: t.textSecondary, marginBottom: "6px" }}>Deduction Reason</label>
                  <input type="text" className="form-input" placeholder="Reason for deduction" value={deductionReason} onChange={(e) => setDeductionReason(e.target.value)} />
                </div>
              </div>

              {calculatedDeductions && parseFloat(salary) > 0 && (() => {
                const base = parseFloat(salary) || 0;
                const bonusAmt = parseFloat(bonus) || 0;
                const allowanceAmt = parseFloat(allowances) || 0;
                const customDed = parseFloat(customDeductions) || 0;
                const grossSalary = base + bonusAmt + allowanceAmt;
                const netSalary = grossSalary - customDed;

                return (
                  <div style={{ marginBottom: "22px", border: `1.5px solid ${t.previewBorder}`, borderRadius: "12px", overflow: "hidden" }}>
                    <div style={{ background: t.previewBg, padding: "10px 14px", borderBottom: `1.5px solid ${t.previewBorder}` }}>
                      <span style={{ fontSize: "0.72rem", fontWeight: "700", color: t.buttonPrimary, textTransform: "uppercase", letterSpacing: "0.5px" }}>Salary Breakdown Preview</span>
                    </div>

                    <div style={{ padding: "12px 14px", background: t.card }}>
                      <div style={{ fontSize: "0.75rem", fontWeight: "700", color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "8px" }}>Earnings</div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", padding: "5px 0", borderBottom: `1px dashed ${t.border}` }}>
                        <span style={{ color: t.textSecondary }}>Basic Salary</span>
                        <span style={{ fontWeight: "600", color: t.trendUp }}>₹{base.toLocaleString("en-IN")}</span>
                      </div>
                      {bonusAmt > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", padding: "5px 0", borderBottom: `1px dashed ${t.border}` }}>
                          <span style={{ color: t.textSecondary }}>Bonus {bonusReason ? `(${bonusReason})` : ""}</span>
                          <span style={{ fontWeight: "600", color: t.trendUp }}>+ ₹{bonusAmt.toLocaleString("en-IN")}</span>
                        </div>
                      )}
                      {allowanceAmt > 0 && (
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", padding: "5px 0", borderBottom: `1px dashed ${t.border}` }}>
                          <span style={{ color: t.textSecondary }}>Allowances {allowanceReason ? `(${allowanceReason})` : ""}</span>
                          <span style={{ fontWeight: "600", color: t.trendUp }}>+ ₹{allowanceAmt.toLocaleString("en-IN")}</span>
                        </div>
                      )}
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", padding: "6px 10px", background: t.earningsBg, borderRadius: "6px", margin: "6px 0 14px" }}>
                        <span style={{ fontWeight: "600", color: t.textSecondary }}>Gross Salary</span>
                        <span style={{ fontWeight: "700", color: t.textPrimary }}>₹{grossSalary.toLocaleString("en-IN")}</span>
                      </div>

                      {customDed > 0 && (
                        <>
                          <div style={{ fontSize: "0.75rem", fontWeight: "700", color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "8px" }}>Deductions</div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", padding: "5px 0", borderBottom: `1px dashed ${t.border}` }}>
                            <span style={{ color: t.textSecondary }}>Other Deductions {deductionReason ? `(${deductionReason})` : ""}</span>
                            <span style={{ fontWeight: "600", color: "#DC2626" }}>− ₹{customDed.toLocaleString("en-IN")}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", padding: "6px 10px", background: t.deductionsBg, borderRadius: "6px", margin: "6px 0 14px" }}>
                            <span style={{ fontWeight: "600", color: t.textSecondary }}>Total Deductions</span>
                            <span style={{ fontWeight: "700", color: "#DC2626" }}>− ₹{customDed.toLocaleString("en-IN")}</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div style={{ background: t.netBg, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.68rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Net Salary to be Paid</div>
                        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.65rem", marginTop: "2px" }}>
                          {customDed > 0 ? `₹${grossSalary.toLocaleString("en-IN")} − ₹${customDed.toLocaleString("en-IN")}` : "Full gross salary"}
                        </div>
                      </div>
                      <div style={{ color: "#fff", fontSize: "1.5rem", fontWeight: "800", letterSpacing: "-0.5px" }}>
                        ₹{netSalary.toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div style={{ display: "flex", gap: "10px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "10px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "10px", background: t.card, fontSize: "0.875rem", fontWeight: "500", color: t.textSecondary, cursor: "pointer", fontFamily: "inherit" }}>
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: "10px", border: "none", borderRadius: "10px", background: t.buttonPrimary, fontSize: "0.875rem", fontWeight: "600", color: "#fff", cursor: isSubmitting ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: isSubmitting ? 0.7 : 1, boxShadow: "0 2px 8px rgba(79,70,229,0.25)" }}>
                  {isSubmitting ? "Processing..." : "Confirm & Pay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payroll;
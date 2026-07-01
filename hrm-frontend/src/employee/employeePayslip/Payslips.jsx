import React, { useState, useEffect } from "react";
import Sidebar from "../../layouts/sidebar";
import MobileTopBar from "../../employee/MobileTopBar";
import { Receipt, Download, Eye, Calendar, DollarSign, TrendingUp, Clock, RefreshCw } from "lucide-react";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";

function Payslips() {
  const { isDark } = useTheme();
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [summary, setSummary] = useState({
    totalEarned: 0,
    averageSalary: 0,
    highestSalary: 0,
    totalAdvanceDeductions: 0,
    lastThreeMonths: []
  });
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [downloading, setDownloading] = useState(false);

  const name = localStorage.getItem("name") || "Employee";
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
    cardBorder: isDark ? "#1E2535" : "#F1F3F9",
    statCard1: "linear-gradient(135deg, #059669, #10B981)",
    statCard2: "linear-gradient(135deg, #4F46E5, #6366F1)",
    statCard3: "linear-gradient(135deg, #D97706, #F59E0B)",
    statCard4: "linear-gradient(135deg, #7C3AED, #8B5CF6)",
    statusBg: isDark ? "#064E3B" : "#ECFDF5",
    statusText: isDark ? "#6EE7B7" : "#059669",
    modalOverlay: isDark ? "rgba(0,0,0,0.7)" : "rgba(15,23,42,0.5)",
    noteBg: isDark ? "#451A03" : "#FEF3C7",
    noteText: isDark ? "#FCD34D" : "#92400E",
    deductionRed: "#DC2626",
    deductionGreen: "#059669",
    buttonPrimary: "#4F46E5",
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
  const API_URL = import.meta.env.VITE_API_URL || "https://hrm-backend-vvqg.onrender.com";

  const fetchPayslips = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/payroll/my-payslips`, {
        headers: { "x-auth-token": token },
      });
      const data = res.data.data || [];
            console.log(data)
      setPayslips(data);

      
      const totalEarned = data.reduce((sum, p) => sum + (p.net_salary || 0), 0);
      const averageSalary = data.length ? totalEarned / data.length : 0;
      const highestSalary = Math.max(...data.map(p => p.net_salary || 0), 0);
      const totalAdvanceDeductions = data.reduce((sum, p) => sum + (p.advance_deduction || 0), 0);
      
      const lastThreeMonths = data.slice(0, 3).map(p => ({
        month: p.pay_period || formatMonth(p.pay_date),
        amount: p.net_salary,
        advanceDeduction: p.advance_deduction || 0
      }));
      
      setSummary({ totalEarned, averageSalary, highestSalary, totalAdvanceDeductions, lastThreeMonths });
    } catch (error) {
      console.error("Error fetching payslips:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayslips();
  }, []);

  const formatMonth = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long" });
  };


const formatPayPeriod = (period) => {
  if (!period) return null;   
  if (period.includes("-")) {
    const [year, month] = period.split("-");
    return new Date(year, month - 1).toLocaleDateString("en-US", { year: "numeric", month: "long" });
  }
  return period;
};

  const generateHTML = (payslip, month) => {
    const employee = payslip.employee_id;
    const grossSalary = (payslip.salary || 0) + (payslip.bonus || 0) + (payslip.allowances || 0);
    const totalDeductions = parseFloat(payslip.total_deductions || 0);
    const netSalary = parseFloat(payslip.net_salary || 0);
    const companyName = employee?.company_id?.company_name || "HRM Portal";

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Payslip - ${month}</title>
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
  .advance-recovery { background: #F0FDF4; border-left: 4px solid #059669; padding: 10px 14px; border-radius: 6px; margin-top: 10px; }
  .advance-recovery span { font-size: 0.78rem; color: #065F46; }
  @media print {
    body { background: #fff; padding: 0; }
    .slip { box-shadow: none; }
  }
</style>
</head>
<body>
<div class="slip">
  <div class="header">
    <h1>${companyName}</h1>
    <p>Salary Payslip</p>
    <span class="badge">PAYSLIP</span>
  </div>

  <div class="meta">
    <div class="meta-item">
      <div class="meta-label">Employee Name</div>
      <div class="meta-value">${employee?.name || "N/A"}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Employee ID</div>
      <div class="meta-value">EMP-${String(employee?._id || "N/A").slice(-6).toUpperCase()}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Department</div>
      <div class="meta-value">${employee?.department_id?.department_name || "General"}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Pay Period</div>
      <div class="meta-value">${month}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Email</div>
      <div class="meta-value">${employee?.email || "N/A"}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Payment Date</div>
      <div class="meta-value">${new Date(payslip.pay_date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</div>
    </div>
  </div>

  <div class="body">
    <div class="section">
      <div class="section-title">Earnings</div>
      <div class="row">
        <div><div class="row-label">Basic Salary</div></div>
        <div class="row-value green">₹${parseFloat(payslip.salary || 0).toLocaleString("en-IN")}</div>
      </div>
      ${parseFloat(payslip.bonus || 0) > 0 ? `
      <div class="row">
        <div>
          <div class="row-label">Bonus</div>
          ${payslip.bonus_reason ? `<div class="row-sub">${payslip.bonus_reason}</div>` : ""}
        </div>
        <div class="row-value green">+ ₹${parseFloat(payslip.bonus).toLocaleString("en-IN")}</div>
      </div>` : ""}
      ${parseFloat(payslip.allowances || 0) > 0 ? `
      <div class="row">
        <div>
          <div class="row-label">Allowances</div>
          ${payslip.allowance_reason ? `<div class="row-sub">${payslip.allowance_reason}</div>` : ""}
        </div>
        <div class="row-value green">+ ₹${parseFloat(payslip.allowances).toLocaleString("en-IN")}</div>
      </div>` : ""}
      <div class="subtotal">
        <span>Gross Salary</span>
        <strong>₹${grossSalary.toLocaleString("en-IN")}</strong>
      </div>
    </div>

    <div class="divider"></div>

    <div class="section">
      <div class="section-title">Deductions</div>
      ${parseFloat(payslip.pf || 0) > 0 ? `
      <div class="row">
        <div><div class="row-label">Provident Fund</div><div class="row-sub">12% of Basic Salary</div></div>
        <div class="row-value red">- ₹${parseFloat(payslip.pf).toLocaleString("en-IN")}</div>
      </div>` : ""}
      ${parseFloat(payslip.pt || 0) > 0 ? `
      <div class="row">
        <div><div class="row-label">Professional Tax</div></div>
        <div class="row-value red">- ₹${parseFloat(payslip.pt).toLocaleString("en-IN")}</div>
      </div>` : ""}
      ${parseFloat(payslip.tax || 0) > 0 ? `
      <div class="row">
        <div><div class="row-label">Income Tax (TDS)</div></div>
        <div class="row-value red">- ₹${parseFloat(payslip.tax).toLocaleString("en-IN")}</div>
      </div>` : ""}
      ${parseFloat(payslip.esi || 0) > 0 ? `
      <div class="row">
        <div><div class="row-label">Employee State Insurance</div><div class="row-sub">0.75% of Basic Salary</div></div>
        <div class="row-value red">- ₹${parseFloat(payslip.esi).toLocaleString("en-IN")}</div>
      </div>` : ""}
      ${parseFloat(payslip.deductions || 0) > 0 ? `
      <div class="row">
        <div>
          <div class="row-label">Other Deductions</div>
          ${payslip.deduction_reason ? `<div class="row-sub">${payslip.deduction_reason}</div>` : ""}
        </div>
        <div class="row-value red">- ₹${parseFloat(payslip.deductions).toLocaleString("en-IN")}</div>
      </div>` : ""}
      ${parseFloat(payslip.advance_deduction || 0) > 0 ? `
      <div class="row">
        <div>
          <div class="row-label">Salary Advance Recovery</div>
          ${payslip.advance_recoveries && payslip.advance_recoveries.length > 0 ? 
            `<div class="row-sub">${payslip.advance_recoveries.length} advance(s) recovered this month</div>` : ""}
        </div>
        <div class="row-value red">- ₹${parseFloat(payslip.advance_deduction).toLocaleString("en-IN")}</div>
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

    ${payslip.notes ? `
    <div style="margin-top:16px; padding:12px 14px; background:#FEF3C7; border-radius:8px; font-size:0.8rem; color:#92400E;">
      <strong>Note:</strong> ${payslip.notes}
    </div>` : ""}
  </div>

  <div class="footer">
    This is a computer-generated payslip and does not require a signature. &nbsp;|&nbsp; Generated on ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
  </div>
</div>
</body>
</html>`;
  };

  const generatePDF = async (payslip, month) => {
    try {
      setDownloading(true);
      const html = generateHTML(payslip, month);
      const element = document.createElement("a");
      const file = new Blob([html], { type: "text/html" });
      element.href = URL.createObjectURL(file);
      element.download = `Payslip_${month.replace(/\s+/g, "_")}.html`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      URL.revokeObjectURL(element.href);
    } catch (error) {
      console.error("Error downloading payslip:", error);
      alert("Could not download payslip. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const calculateGrossSalary = (payslip) => {
    return (payslip.salary || 0) + (payslip.bonus || 0) + (payslip.allowances || 0);
  };

  const getRecoveryStatus = (payslip) => {
    if (!payslip.advance_deduction || payslip.advance_deduction === 0) return null;
    const count = payslip.advance_recoveries?.length || 0;
    return `₹${payslip.advance_deduction.toLocaleString()} recovered (${count} advance${count > 1 ? 's' : ''})`;
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: t.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .payslip-card { transition: all 0.2s; }
        .payslip-card:hover { transform: translateX(4px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .deduction-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid ${t.border}; }
        .deduction-item:last-child { border-bottom: none; }
        .deduction-label { color: ${t.textMuted}; font-size: 0.85rem; }
        .deduction-value { font-weight: 500; font-size: 0.85rem; }
        .deduction-red { color: ${t.deductionRed}; }
        .deduction-green { color: ${t.deductionGreen}; }
        .btn-outline { transition: all 0.15s; }
        .btn-outline:hover { opacity: 0.85; transform: translateY(-1px); }
        @media (max-width: 768px) {
          .payslip-topbar { display: none !important; }
          .payslip-main { padding: 72px 14px 32px !important; }
          .payslip-stats { grid-template-columns: 1fr !important; gap: 12px !important; }
          .payslip-page-title { font-size: 1.45rem !important; }
        }
      `}</style>

      <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div style={{ marginLeft: `${sidebarWidth}px`, flex: 1, transition: "margin-left 0.25s", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <div className="payslip-topbar" style={{ height: "64px", backgroundColor: t.topbar, borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", padding: "0 28px", position: "sticky", top: 0, zIndex: 100, boxShadow: isDark ? "0 1px 4px rgba(0,0,0,0.3)" : "0 1px 4px rgba(15,23,42,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "9px", marginLeft: "auto", padding: "5px 12px 5px 6px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "10px", background: t.card }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #4F46E5, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.72rem", fontWeight: "600" }}>
              {name.slice(0, 2).toUpperCase()}
            </div>
            <span style={{ fontSize: "0.83rem", fontWeight: "500", color: t.textPrimary }}>{name}</span>
          </div>
        </div>

        <main className="payslip-main" style={{ padding: "28px 28px 40px", flex: 1 }}>
          <div style={{ marginBottom: "24px", animation: "fadeUp 0.4s ease both" }}>
            <p style={{ color: t.textSecondary, fontSize: "0.875rem", margin: "0 0 4px" }}>
              {greeting}, <strong style={{ color: "#4F46E5" }}>{name}</strong> 👋
            </p>
            <h1 className="payslip-page-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.85rem", fontWeight: "700", color: t.textPrimary, margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
              <Receipt size={28} /> My Payslips
            </h1>
            <p style={{ color: t.textMuted, fontSize: "0.85rem", marginTop: "6px" }}>View and download your monthly payslips with advance recovery details</p>
          </div>

          {payslips.length > 0 && (
            <div className="payslip-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
              <div style={{ background: t.statCard1, borderRadius: "14px", padding: "18px", color: "#fff", animation: "fadeUp 0.4s ease 0.05s both" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.7rem", opacity: 0.8 }}>Total Earned</span>
                  <DollarSign size={20} opacity={0.8} />
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: "700" }}>₹{summary.totalEarned.toLocaleString()}</div>
              </div>
              <div style={{ background: t.statCard2, borderRadius: "14px", padding: "18px", color: "#fff", animation: "fadeUp 0.4s ease 0.1s both" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.7rem", opacity: 0.8 }}>Average Monthly</span>
                  <TrendingUp size={20} opacity={0.8} />
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: "700" }}>₹{Math.round(summary.averageSalary).toLocaleString()}</div>
              </div>
              <div style={{ background: t.statCard3, borderRadius: "14px", padding: "18px", color: "#fff", animation: "fadeUp 0.4s ease 0.15s both" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.7rem", opacity: 0.8 }}>Highest Salary</span>
                  <Calendar size={20} opacity={0.8} />
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: "700" }}>₹{summary.highestSalary.toLocaleString()}</div>
              </div>
              <div style={{ background: t.statCard4, borderRadius: "14px", padding: "18px", color: "#fff", animation: "fadeUp 0.4s ease 0.2s both" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.7rem", opacity: 0.8 }}>Advance Recovered</span>
                  <RefreshCw size={20} opacity={0.8} />
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: "700" }}>₹{summary.totalAdvanceDeductions.toLocaleString()}</div>
              </div>
            </div>
          )}

          <div style={{ backgroundColor: t.card, borderRadius: "14px", border: `1px solid ${t.cardBorder}`, overflow: "hidden", animation: "fadeUp 0.4s ease 0.25s both", boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)" }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "50px", color: t.textMuted }}>Loading payslips...</div>
            ) : payslips.length === 0 ? (
              <div style={{ textAlign: "center", padding: "50px", color: t.textMuted }}>No payslips available</div>
            ) : (
              <div>
                {payslips.map((payslip, index) => {
                  console.log(payslips)
                  const gross = calculateGrossSalary(payslip);
                  const period = formatPayPeriod(payslip.pay_period) || formatMonth(payslip.pay_date);
                  const recoveryInfo = getRecoveryStatus(payslip);
                  const hasAdvanceDeduction = payslip.advance_deduction && payslip.advance_deduction > 0;
                  
                  return (
                    <div key={payslip._id} className="payslip-card" style={{
                      padding: "18px 24px",
                      borderBottom: index !== payslips.length - 1 ? `1px solid ${t.border}` : "none",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      flexWrap: "wrap", gap: "16px"
                    }}>
                      <div style={{ flex: 1, minWidth: "200px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", flexWrap: "wrap" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <Calendar size={16} style={{ color: t.textMuted }} />
                            <h3 style={{ fontSize: "0.95rem", fontWeight: "600", margin: 0, color: t.textPrimary }}>
                              {period}
                            </h3>
                          </div>
                          <span style={{ background: t.statusBg, color: t.statusText, padding: "2px 10px", borderRadius: "20px", fontSize: "0.65rem", fontWeight: "600" }}>
                            {payslip.status || "GENERATED"}
                          </span>
                          {hasAdvanceDeduction && (
                            <span style={{ background: "#F0FDF4", color: "#059669", padding: "2px 10px", borderRadius: "20px", fontSize: "0.65rem", fontWeight: "600", border: "1px solid #D1FAE5" }}>
                              <RefreshCw size={10} style={{ marginRight: "4px" }} /> Recovery
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", fontSize: "0.8rem" }}>
                          <div><span style={{ color: t.textMuted }}>Basic:</span> <strong style={{ color: t.textPrimary }}>₹{payslip.salary?.toLocaleString()}</strong></div>
                          <div><span style={{ color: t.textMuted }}>Gross:</span> <strong style={{ color: t.textPrimary }}>₹{gross.toLocaleString()}</strong></div>
                          <div><span style={{ color: t.textMuted }}>Deductions:</span> <strong style={{ color: t.deductionRed }}>-₹{parseFloat(payslip.total_deductions || 0).toLocaleString()}</strong></div>
                          <div><span style={{ color: t.textMuted }}>Net:</span> <strong style={{ color: t.deductionGreen, fontSize: "0.9rem" }}>₹{payslip.net_salary?.toLocaleString()}</strong></div>
                        </div>
                        {recoveryInfo && (
                          <div style={{ marginTop: "6px", fontSize: "0.7rem", color: t.deductionGreen, background: "#F0FDF4", padding: "4px 10px", borderRadius: "4px", display: "inline-block" }}>
                            <RefreshCw size={10} style={{ marginRight: "4px" }} /> {recoveryInfo}
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button onClick={() => setSelectedPayslip(payslip)} className="btn-outline" style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, padding: "8px 14px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "500", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px", color: t.textSecondary }}>
                          <Eye size={14} /> View
                        </button>
                        <button onClick={() => generatePDF(payslip, period)} disabled={downloading} className="btn-outline" style={{ background: t.buttonPrimary, color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "500", cursor: downloading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "5px", opacity: downloading ? 0.7 : 1 }}>
                          <Download size={14} /> {downloading ? "..." : "Download"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {selectedPayslip && (
        <div style={{ position: "fixed", inset: 0, background: t.modalOverlay, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: "16px" }}>
          <div style={{ background: t.card, borderRadius: "16px", maxWidth: "600px", width: "100%", maxHeight: "85vh", overflowY: "auto", padding: "24px", animation: "fadeUp 0.2s ease", border: `1px solid ${t.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: "700", margin: 0, color: t.textPrimary }}>Payslip Details</h2>
                <p style={{ fontSize: "0.7rem", color: t.textMuted, margin: "4px 0 0" }}>{formatPayPeriod(selectedPayslip.pay_period) || formatMonth(selectedPayslip.pay_date)}</p>
              </div>
              <button onClick={() => setSelectedPayslip(null)} style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer", fontSize: "1.2rem", color: t.textSecondary }}>✕</button>
            </div>

            <div style={{ background: t.inputBg, borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
              <div style={{ marginBottom: "16px", paddingBottom: "16px", borderBottom: `1px solid ${t.border}` }}>
                <h3 style={{ fontSize: "0.9rem", fontWeight: "600", color: t.textSecondary, margin: "0 0 12px" }}>EARNINGS</h3>
                <div className="deduction-item">
                  <span className="deduction-label">Basic Salary</span>
                  <span className="deduction-value" style={{ color: t.textPrimary }}>₹{selectedPayslip.salary?.toLocaleString()}</span>
                </div>
                {selectedPayslip.bonus > 0 && (
                  <div className="deduction-item">
                    <span className="deduction-label">Bonus {selectedPayslip.bonus_reason && `(${selectedPayslip.bonus_reason})`}</span>
                    <span className="deduction-value deduction-green">+ ₹{selectedPayslip.bonus?.toLocaleString()}</span>
                  </div>
                )}
                {selectedPayslip.allowances > 0 && (
                  <div className="deduction-item">
                    <span className="deduction-label">Allowances {selectedPayslip.allowance_reason && `(${selectedPayslip.allowance_reason})`}</span>
                    <span className="deduction-value deduction-green">+ ₹{selectedPayslip.allowances?.toLocaleString()}</span>
                  </div>
                )}
                <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: "600", color: t.textSecondary }}>Gross Salary</span>
                  <span style={{ fontWeight: "600", color: t.textPrimary }}>₹{calculateGrossSalary(selectedPayslip).toLocaleString()}</span>
                </div>
              </div>

              <div style={{ marginBottom: "16px", paddingBottom: "16px", borderBottom: `1px solid ${t.border}` }}>
                <h3 style={{ fontSize: "0.9rem", fontWeight: "600", color: t.textSecondary, margin: "0 0 12px" }}>DEDUCTIONS</h3>
                {selectedPayslip.pf > 0 && (
                  <div className="deduction-item">
                    <span className="deduction-label">Provident Fund (12%)</span>
                    <span className="deduction-value deduction-red">- ₹{selectedPayslip.pf?.toLocaleString()}</span>
                  </div>
                )}
                {selectedPayslip.pt > 0 && (
                  <div className="deduction-item">
                    <span className="deduction-label">Professional Tax</span>
                    <span className="deduction-value deduction-red">- ₹{selectedPayslip.pt?.toLocaleString()}</span>
                  </div>
                )}
                {selectedPayslip.tax > 0 && (
                  <div className="deduction-item">
                    <span className="deduction-label">Income Tax (TDS)</span>
                    <span className="deduction-value deduction-red">- ₹{selectedPayslip.tax?.toLocaleString()}</span>
                  </div>
                )}
                {selectedPayslip.esi > 0 && (
                  <div className="deduction-item">
                    <span className="deduction-label">Employee State Insurance</span>
                    <span className="deduction-value deduction-red">- ₹{selectedPayslip.esi?.toLocaleString()}</span>
                  </div>
                )}
                {selectedPayslip.deductions > 0 && (
                  <div className="deduction-item">
                    <span className="deduction-label">Other Deductions {selectedPayslip.deduction_reason && `(${selectedPayslip.deduction_reason})`}</span>
                    <span className="deduction-value deduction-red">- ₹{selectedPayslip.deductions?.toLocaleString()}</span>
                  </div>
                )}
                {selectedPayslip.advance_deduction > 0 && (
                  <div className="deduction-item" style={{ background: "#F0FDF4", padding: "10px 0", borderBottom: `1px solid ${t.border}` }}>
                    <div>
                      <span className="deduction-label" style={{ fontWeight: "600", color: "#065F46" }}>Salary Advance Recovery</span>
                      {selectedPayslip.advance_recoveries && selectedPayslip.advance_recoveries.length > 0 && (
                        <div style={{ fontSize: "0.65rem", color: t.textMuted, marginTop: "2px" }}>
                          {selectedPayslip.advance_recoveries.length} advance(s) recovered this month
                        </div>
                      )}
                    </div>
                    <span className="deduction-value deduction-red">- ₹{selectedPayslip.advance_deduction?.toLocaleString()}</span>
                  </div>
                )}
                <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: "600", color: t.textSecondary }}>Total Deductions</span>
                  <span style={{ fontWeight: "600", color: t.deductionRed }}>- ₹{selectedPayslip.total_deductions?.toLocaleString()}</span>
                </div>
              </div>

              <div style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)", borderRadius: "10px", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.75rem", fontWeight: "600" }}>Net Salary Paid</div>
                  <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.65rem", marginTop: "2px" }}>
                    ₹{calculateGrossSalary(selectedPayslip).toLocaleString()} − ₹{selectedPayslip.total_deductions?.toLocaleString()}
                  </div>
                </div>
                <div style={{ color: "#fff", fontSize: "1.5rem", fontWeight: "800" }}>₹{selectedPayslip.net_salary?.toLocaleString()}</div>
              </div>
            </div>

            {selectedPayslip.notes && (
              <div style={{ marginBottom: "20px", padding: "12px", background: t.noteBg, borderRadius: "8px", fontSize: "0.8rem", color: t.noteText }}>
                <strong>Note:</strong> {selectedPayslip.notes}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button onClick={() => setSelectedPayslip(null)} style={{ padding: "8px 20px", background: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: "8px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "500", color: t.textSecondary }}>Close</button>
              <button onClick={() => { generatePDF(selectedPayslip, formatPayPeriod(selectedPayslip.pay_period) || formatMonth(selectedPayslip.pay_date)); setSelectedPayslip(null); }} disabled={downloading} style={{ padding: "8px 20px", background: "#4F46E5", color: "#fff", border: "none", borderRadius: "8px", cursor: downloading ? "not-allowed" : "pointer", fontSize: "0.8rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "5px", opacity: downloading ? 0.7 : 1 }}>
                <Download size={14} /> {downloading ? "..." : "Download"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payslips;
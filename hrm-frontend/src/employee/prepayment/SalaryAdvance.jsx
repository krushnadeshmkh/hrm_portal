import React, { useState, useEffect } from "react";
import Sidebar from "../../layouts/sidebar";
import MobileTopBar from "../../employee/MobileTopBar";
import { HandCoins, CheckCircle, XCircle, Clock, AlertCircle, DollarSign, RefreshCw } from "lucide-react";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";

function SalaryAdvance() {
  const { isDark } = useTheme();
  const [advances, setAdvances] = useState([]);
  const [formData, setFormData] = useState({
    amount: "",
    reason: "",
    repayment_months: 3,
    notes: ""
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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
    maxAdvanceBg: isDark ? "#1E1B4B" : "#EEF2FF",
    maxAdvanceBorder: isDark ? "#4F46E5" : "#4F46E5",
    maxAdvanceText: isDark ? "#818CF8" : "#4F46E5",
    errorBg: isDark ? "#2D0F0F" : "#FEE2E2",
    errorText: isDark ? "#F87171" : "#DC2626",
    successBg: isDark ? "#064E3B" : "#ECFDF5",
    successText: isDark ? "#6EE7B7" : "#059669",
    statusApprovedBg: isDark ? "#064E3B" : "#ECFDF5",
    statusApprovedText: isDark ? "#6EE7B7" : "#059669",
    statusRejectedBg: isDark ? "#2D0F0F" : "#FEE2E2",
    statusRejectedText: isDark ? "#F87171" : "#DC2626",
    statusPendingBg: isDark ? "#451A03" : "#FEF3C7",
    statusPendingText: isDark ? "#FCD34D" : "#D97706",
    statusRecoveredBg: isDark ? "#1E1B4B" : "#EEF2FF",
    statusRecoveredText: isDark ? "#818CF8" : "#4F46E5",
    buttonPrimary: "#4F46E5",
    selectBg: isDark ? "#1E2535" : "#F9FAFB",
    cardBorder: isDark ? "#1E2535" : "#F1F3F9",
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

  const fetchEmployeeData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/employees/me`, {
        headers: { "x-auth-token": token },
      });
      setEmployee(res.data.data);
    } catch (error) {
      console.error("Error fetching employee:", error);
    }
  };

  const fetchMyAdvances = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/salary-advance/my-requests/me`, {
        headers: { "x-auth-token": token },
      });
      setAdvances(res.data.data || []);
    } catch (error) {
      console.error("Error fetching advances:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
    fetchMyAdvances();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (employee && amount > employee.salary * 0.5) {
      setError(
        `Advance amount cannot exceed 50% of your monthly salary (₹${(employee.salary * 0.5).toLocaleString()})`
      );
      return;
    }

    if (!formData.reason.trim()) {
      setError("Please provide a reason for the advance");
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      const payload = {
        employee_id: employee?._id,
        amount: amount,
        reason: formData.reason.trim(),
        repayment_months: formData.repayment_months,
        notes: formData.notes.trim(),
      };

      const response = await axios.post(
        `${API_URL}/api/salary-advance/request`,
        payload,
        { headers: { "x-auth-token": token } }
      );

      setSuccess("Advance request submitted successfully!");
      setFormData({
        amount: "",
        reason: "",
        repayment_months: 3,
        notes: "",
      });

      fetchMyAdvances();
    } catch (error) {
      console.error("Error Response:", error.response?.data);
      setError(error.response?.data?.error || "Error submitting request");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "approved": return <CheckCircle size={20} />;
      case "rejected": return <XCircle size={20} />;
      case "recovered": return <RefreshCw size={20} />;
      case "partially_recovered": return <RefreshCw size={20} />;
      default: return <Clock size={20} />;
    }
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case "approved": return { bg: t.statusApprovedBg, color: t.statusApprovedText };
      case "rejected": return { bg: t.statusRejectedBg, color: t.statusRejectedText };
      case "recovered": return { bg: t.statusRecoveredBg, color: t.statusRecoveredText };
      case "partially_recovered": return { bg: t.statusRecoveredBg, color: t.statusRecoveredText };
      default: return { bg: t.statusPendingBg, color: t.statusPendingText };
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case "approved": return "Approved";
      case "rejected": return "Rejected";
      case "recovered": return "Recovered";
      case "partially_recovered": return "Partial";
      default: return "Pending";
    }
  };

  const getMaxAdvance = employee ? employee.salary * 0.5 : 0;
  const pendingCount = advances.filter(a => a.status === "pending").length;
  const approvedCount = advances.filter(a => a.status === "approved" || a.status === "partially_recovered").length;
  const totalOutstanding = advances
    .filter(a => a.status === "approved" || a.status === "partially_recovered")
    .reduce((sum, a) => sum + (a.remaining_amount || 0), 0);

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: t.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .stat-card { transition: transform 0.18s; }
        .stat-card:hover { transform: translateY(-3px); }
        .advance-card { transition: box-shadow 0.2s, transform 0.15s; }
        .advance-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); transform: translateX(2px); }
        .form-input:focus { outline: none; border-color: #4F46E5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.10); }
        @media (max-width: 768px) {
          .emp-topbar { display: none !important; }
          .emp-main { padding: 72px 14px 32px !important; }
          .emp-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
          .emp-page-title { font-size: 1.45rem !important; }
        }
      `}</style>

      <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div style={{ marginLeft: `${sidebarWidth}px`, flex: 1, transition: "margin-left 0.25s", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <div className="emp-topbar" style={{ height: "64px", backgroundColor: t.topbar, borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", padding: "0 28px", position: "sticky", top: 0, zIndex: 100, boxShadow: isDark ? "0 1px 4px rgba(0,0,0,0.3)" : "0 1px 4px rgba(15,23,42,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "9px", marginLeft: "auto", padding: "5px 12px 5px 6px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "10px", background: t.card }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #4F46E5, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.72rem", fontWeight: "600" }}>
              {name.slice(0, 2).toUpperCase()}
            </div>
            <span style={{ fontSize: "0.83rem", fontWeight: "500", color: t.textPrimary }}>{name}</span>
          </div>
        </div>

        <main className="emp-main" style={{ padding: "28px 28px 40px", flex: 1 }}>
          <div style={{ marginBottom: "24px", animation: "fadeUp 0.4s ease both" }}>
            <p style={{ color: t.textSecondary, fontSize: "0.875rem", margin: "0 0 4px" }}>
              {greeting}, <strong style={{ color: "#4F46E5" }}>{name}</strong> 👋
            </p>
            <h1 className="emp-page-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.85rem", fontWeight: "700", color: t.textPrimary, margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
              <HandCoins size={28} /> Salary Advance
            </h1>
            <p style={{ color: t.textMuted, fontSize: "0.85rem", marginTop: "6px" }}>Request a salary advance with flexible repayment options</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" }}>
            <div style={{ background: t.card, borderRadius: "10px", padding: "14px", border: `1px solid ${t.border}` }}>
              <p style={{ fontSize: "0.7rem", color: t.textMuted, margin: 0 }}>Pending Requests</p>
              <p style={{ fontSize: "1.5rem", fontWeight: "700", color: t.textPrimary, margin: "4px 0 0" }}>{pendingCount}</p>
            </div>
            <div style={{ background: t.card, borderRadius: "10px", padding: "14px", border: `1px solid ${t.border}` }}>
              <p style={{ fontSize: "0.7rem", color: t.textMuted, margin: 0 }}>Active Advances</p>
              <p style={{ fontSize: "1.5rem", fontWeight: "700", color: t.textPrimary, margin: "4px 0 0" }}>{approvedCount}</p>
            </div>
            <div style={{ background: t.card, borderRadius: "10px", padding: "14px", border: `1px solid ${t.border}` }}>
              <p style={{ fontSize: "0.7rem", color: t.textMuted, margin: 0 }}>Outstanding Amount</p>
              <p style={{ fontSize: "1.5rem", fontWeight: "700", color: t.textPrimary, margin: "4px 0 0" }}>₹{totalOutstanding.toLocaleString()}</p>
            </div>
          </div>

          <div className="emp-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "24px" }}>
            <div style={{ backgroundColor: t.card, borderRadius: "14px", border: `1px solid ${t.cardBorder}`, padding: "24px", animation: "fadeUp 0.4s ease 0.1s both", boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "20px", color: t.textPrimary }}>New Advance Request</h2>
              
              {employee && (
                <div style={{ background: t.maxAdvanceBg, borderRadius: "10px", padding: "14px", marginBottom: "20px", borderLeft: `3px solid ${t.maxAdvanceBorder}` }}>
                  <p style={{ fontSize: "0.8rem", color: t.maxAdvanceText, margin: 0 }}>
                    <strong>Maximum advance:</strong> ₹{getMaxAdvance.toLocaleString()}
                    <br />
                    <span style={{ fontSize: "0.7rem" }}>(50% of monthly salary: ₹{employee.salary?.toLocaleString()})</span>
                  </p>
                  {totalOutstanding > 0 && (
                    <p style={{ fontSize: "0.75rem", color: t.maxAdvanceText, margin: "6px 0 0" }}>
                      <strong>Outstanding:</strong> ₹{totalOutstanding.toLocaleString()}
                    </p>
                  )}
                </div>
              )}
              
              {error && (
                <div style={{ background: t.errorBg, borderRadius: "10px", padding: "12px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px", color: t.errorText, fontSize: "0.8rem" }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}
              
              {success && (
                <div style={{ background: t.successBg, borderRadius: "10px", padding: "12px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px", color: t.successText, fontSize: "0.8rem" }}>
                  <CheckCircle size={16} /> {success}
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: "500", marginBottom: "6px", display: "block", color: t.textSecondary }}>Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="form-input"
                    style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "9px", fontSize: "0.85rem", outline: "none", backgroundColor: t.inputBg, color: t.textPrimary }}
                    placeholder="Enter amount"
                    required
                    min="1000"
                    max={getMaxAdvance}
                  />
                </div>
                
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: "500", marginBottom: "6px", display: "block", color: t.textSecondary }}>Reason</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    className="form-input"
                    style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "9px", fontSize: "0.85rem", resize: "vertical", outline: "none", backgroundColor: t.inputBg, color: t.textPrimary }}
                    rows="3"
                    placeholder="Explain the reason for advance"
                    required
                  />
                </div>
                
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: "500", marginBottom: "6px", display: "block", color: t.textSecondary }}>Repayment Period</label>
                  <select
                    value={formData.repayment_months}
                    onChange={(e) => setFormData({...formData, repayment_months: Number(e.target.value)})}
                    style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "9px", fontSize: "0.85rem", background: t.selectBg, color: t.textPrimary, cursor: "pointer" }}
                  >
                    <option value={1}>1 Month</option>
                    <option value={2}>2 Months</option>
                    <option value={3}>3 Months</option>
                    <option value={4}>4 Months</option>
                    <option value={6}>6 Months</option>
                    <option value={12}>12 Months</option>
                  </select>
                  {formData.amount && parseFloat(formData.amount) > 0 && (
                    <p style={{ fontSize: "0.7rem", color: t.textMuted, marginTop: "5px" }}>
                      Monthly deduction: ₹{(parseFloat(formData.amount) / formData.repayment_months).toLocaleString()}
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: "500", marginBottom: "6px", display: "block", color: t.textSecondary }}>Additional Notes (Optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="form-input"
                    style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "9px", fontSize: "0.85rem", resize: "vertical", outline: "none", backgroundColor: t.inputBg, color: t.textPrimary }}
                    rows="2"
                    placeholder="Any additional information..."
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={submitting || pendingCount > 0}
                  style={{ width: "100%", padding: "11px", background: (submitting || pendingCount > 0) ? t.textMuted : t.buttonPrimary, color: "#fff", border: "none", borderRadius: "10px", fontSize: "0.85rem", fontWeight: "600", cursor: (submitting || pendingCount > 0) ? "not-allowed" : "pointer", opacity: (submitting || pendingCount > 0) ? 0.7 : 1, transition: "opacity 0.18s" }}
                >
                  {submitting ? "Submitting..." : pendingCount > 0 ? "Pending Request Exists" : "Submit Request"}
                </button>
                {pendingCount > 0 && (
                  <p style={{ fontSize: "0.7rem", color: t.textMuted, marginTop: "8px", textAlign: "center" }}>
                    You already have a pending request. Please wait for it to be processed.
                  </p>
                )}
              </form>
            </div>

            <div style={{ backgroundColor: t.card, borderRadius: "14px", border: `1px solid ${t.cardBorder}`, padding: "24px", animation: "fadeUp 0.4s ease 0.15s both", boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "20px", color: t.textPrimary }}>Your Advance History</h2>
              
              {loading ? (
                <div style={{ textAlign: "center", padding: "40px", color: t.textMuted }}>Loading...</div>
              ) : advances.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: t.textMuted }}>
                  No advance requests found
                </div>
              ) : (
                <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                  {advances.map(advance => {
                    const statusStyle = getStatusStyle(advance.status);
                    return (
                      <div key={advance._id} className="advance-card" style={{ border: `1px solid ${t.border}`, borderRadius: "10px", padding: "14px", marginBottom: "12px", backgroundColor: t.card }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ color: statusStyle.color }}>{getStatusIcon(advance.status)}</span>
                            <span style={{ fontWeight: "bold", fontSize: "1.1rem", color: t.textPrimary }}>₹{advance.amount?.toLocaleString()}</span>
                          </div>
                          <span style={{
                            padding: "3px 10px",
                            borderRadius: "20px",
                            fontSize: "0.7rem",
                            fontWeight: "600",
                            background: statusStyle.bg,
                            color: statusStyle.color
                          }}>
                            {getStatusLabel(advance.status)}
                          </span>
                        </div>
                        
                        <p style={{ color: t.textSecondary, fontSize: "0.8rem", marginBottom: "10px" }}>{advance.reason}</p>
                        
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.75rem" }}>
                          <div>
                            <span style={{ color: t.textMuted }}>Requested:</span>
                            <span style={{ marginLeft: "6px", color: t.textPrimary }}>{new Date(advance.requested_date).toLocaleDateString()}</span>
                          </div>
                          <div>
                            <span style={{ color: t.textMuted }}>Monthly Deduction:</span>
                            <span style={{ marginLeft: "6px", color: t.textPrimary }}>₹{advance.monthly_deduction?.toLocaleString()}</span>
                          </div>
                          {(advance.status === "approved" || advance.status === "partially_recovered") && (
                            <>
                              <div>
                                <span style={{ color: t.textMuted }}>Recovered:</span>
                                <span style={{ marginLeft: "6px", color: t.textPrimary }}>₹{advance.total_recovered?.toLocaleString()}</span>
                              </div>
                              <div>
                                <span style={{ color: t.textMuted }}>Remaining:</span>
                                <span style={{ marginLeft: "6px", fontWeight: "500", color: t.statusApprovedText }}>₹{advance.remaining_amount?.toLocaleString()}</span>
                              </div>
                            </>
                          )}
                          {advance.status === "recovered" && (
                            <div style={{ gridColumn: "span 2" }}>
                              <span style={{ color: t.textMuted }}>Fully Recovered</span>
                              <span style={{ marginLeft: "6px", fontWeight: "500", color: t.statusRecoveredText }}>✓</span>
                            </div>
                          )}
                          {advance.status === "rejected" && advance.rejection_reason && (
                            <div style={{ gridColumn: "span 2" }}>
                              <span style={{ color: t.textMuted }}>Rejection Reason:</span>
                              <span style={{ marginLeft: "6px", color: t.statusRejectedText }}>{advance.rejection_reason}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default SalaryAdvance;
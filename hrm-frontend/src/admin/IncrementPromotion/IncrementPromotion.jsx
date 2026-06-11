import React, { useState, useEffect } from "react";
import Sidebar from "../../layouts/sidebar";
import MobileTopBar from "../../employee/MobileTopBar";
import { TrendingUp, UserPlus, Save, Search, Award, Calendar, DollarSign, Trash2, AlertCircle, Bell, Clock } from "lucide-react";
import axios from "axios";
import { useTheme } from "../../context/ThemeContext";

function IncrementPromotion() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [designations, setDesignations] = useState([]);
  const [loadingDesignations, setLoadingDesignations] = useState(false);
  const [formData, setFormData] = useState({
    type: "increment",
    new_salary: "",
    new_designation: "",
    effective_date: new Date().toISOString().split("T")[0],
    remarks: ""
  });
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const { isDark } = useTheme();

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
    employeeCardHover: isDark ? "#1E2535" : "#EEF2FF",
    employeeSelected: isDark ? "#1E2535" : "#EEF2FF",
    employeeSelectedBorder: isDark ? "#4F46E5" : "#4F46E5",
    errorBg: isDark ? "#2D0F0F" : "#FEE2E2",
    errorText: isDark ? "#F87171" : "#DC2626",
    successBg: isDark ? "#064E3B" : "#D1FAE5",
    successText: isDark ? "#6EE7B7" : "#065F46",
    warningBg: isDark ? "#451A03" : "#FEF3C7",
    warningText: isDark ? "#FCD34D" : "#92400E",
    currentInfoBg: isDark ? "#1E2535" : "#F3F4F6",
    statIconBg: isDark ? "#1E1B4B" : "#EEF2FF",
    statIconColor: isDark ? "#818CF8" : "#4F46E5",
    borderLeftIncrement: isDark ? "#059669" : "#059669",
    borderLeftPromotion: isDark ? "#8B5CF6" : "#8B5CF6",
    buttonPrimary: "#4F46E5",
    buttonDanger: isDark ? "#7F1D1D" : "#DC2626",
    buttonDeleteBg: isDark ? "#2D0F0F" : "#FEE2E2",
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

  const fetchEmployees = async () => {
    try {
      setError("");
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/employees`, {
        headers: { "x-auth-token": token },
      });
      
      const employeeData = res.data.data || [];
      const validEmployees = employeeData.filter(emp => {
        if (!emp._id) {
          console.warn("Employee missing ID:", emp);
          return false;
        }
        return true;
      });
      
      setEmployees(validEmployees);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError("Failed to load employees. Please refresh the page.");
    }
  };

  const fetchDesignations = async () => {
    try {
      setLoadingDesignations(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/designations`, {
        headers: { "x-auth-token": token }
      });
      const list = res.data.data || res.data.designations || res.data || [];
      setDesignations(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Error fetching designations:", err);
      setDesignations([]);
    } finally {
      setLoadingDesignations(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/increment/all`, {
        headers: { "x-auth-token": token },
      });
      setHistory(res.data.data || []);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDesignations();
    fetchHistory();
  }, []);

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      type: "increment",
      new_salary: "",
      new_designation: "",
      effective_date: new Date().toISOString().split("T")[0],
      remarks: ""
    });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!selectedEmployee) {
      setError("Please select an employee first");
      return;
    }

    if (!selectedEmployee._id) {
      setError("Invalid employee data. Please select another employee.");
      return;
    }
    
    const oldSalaryNum = parseFloat(selectedEmployee.salary);
    if (isNaN(oldSalaryNum)) {
      setError(`Invalid salary value for ${selectedEmployee.name}. Please update employee salary first.`);
      return;
    }
    
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");
      
      let payload;
      
      if (formData.type === "increment") {
        const newSalaryNum = parseFloat(formData.new_salary);
        
        if (isNaN(newSalaryNum) || newSalaryNum <= 0) {
          setError("Please enter a valid new salary amount");
          setSubmitting(false);
          return;
        }
        
        if (newSalaryNum <= oldSalaryNum) {
          setError(`New salary (₹${newSalaryNum.toLocaleString()}) must be greater than current salary (₹${oldSalaryNum.toLocaleString()})`);
          setSubmitting(false);
          return;
        }
        
        payload = {
          employee_id: selectedEmployee._id,
          type: "increment",
          old_salary: oldSalaryNum,
          new_salary: newSalaryNum,
          old_designation: selectedEmployee.designation || "",
          new_designation: "",
          effective_date: formData.effective_date,
          remarks: formData.remarks || ""
        };
      } else {
        let newSalaryNum = oldSalaryNum;
        if (formData.new_salary && formData.new_salary.trim() !== "") {
          newSalaryNum = parseFloat(formData.new_salary);
          
          if (isNaN(newSalaryNum) || newSalaryNum <= 0) {
            setError("Please enter a valid new salary amount");
            setSubmitting(false);
            return;
          }
          
          if (newSalaryNum < oldSalaryNum) {
            setError(`New salary (₹${newSalaryNum.toLocaleString()}) cannot be less than current salary (₹${oldSalaryNum.toLocaleString()})`);
            setSubmitting(false);
            return;
          }
        }
        
        if (!formData.new_designation || formData.new_designation.trim() === "") {
          setError("Please select a new designation");
          setSubmitting(false);
          return;
        }
        const selectedDesignation = designations.find(
          des => des.designation_name === formData.new_designation
        );
        
        payload = {
          employee_id: selectedEmployee._id,
          type: "promotion",
          old_salary: oldSalaryNum,
          new_salary: newSalaryNum,
          old_designation: selectedEmployee.designation || "",
          new_designation: formData.new_designation,
          new_designation_id: selectedDesignation?._id || null,
          effective_date: formData.effective_date,
          remarks: formData.remarks || ""
        };
      }
      
      console.log("Sending payload:", payload);
      
      const res = await axios.post(
        `${API_URL}/api/increment/create`,
        payload,
        { headers: { "x-auth-token": token } }
      );
      
      if (res.data && res.data.success) {
        setSuccess(`${formData.type === "increment" ? "Increment" : "Promotion"} added successfully!`);
        await fetchEmployees();
        await fetchHistory();
        setSelectedEmployee(null);
        setFormData({
          type: "increment",
          new_salary: "",
          new_designation: "",
          effective_date: new Date().toISOString().split("T")[0],
          remarks: ""
        });
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(res.data?.error || "Error saving record");
      }
    } catch (err) {
      console.error("Submit error:", err.response?.data);
      setError(err.response?.data?.error || "Error saving record. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/increment/${id}`, {
        headers: { "x-auth-token": token },
      });
      await fetchHistory();
      setSuccess("Record deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Error deleting record");
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getUniqueDesignations = () => {
    const uniqueNames = new Set();
    designations.forEach(des => {
      if (des.designation_name) {
        uniqueNames.add(des.designation_name);
      }
    });
    return Array.from(uniqueNames).sort();
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: t.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
        .employee-card { transition: all 0.2s; cursor: pointer; }
        .employee-card:hover { background: ${t.employeeCardHover} !important; transform: translateX(4px); }
        .selected-employee { background: ${t.employeeSelected} !important; border-left: 3px solid ${t.employeeSelectedBorder} !important; }
        .success-message { animation: fadeOut 0.5s ease 2.5s forwards; }
        .inc-search-input:focus { outline: none; border-color: #4F46E5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.10); }
        .topbar-btn:hover { background: ${isDark ? "#1E2535" : "#F3F4F6"} !important; }
        @media (max-width: 768px) {
          .inc-topbar { display: none !important; }
          .inc-main { padding: 72px 14px 32px !important; }
          .inc-grid { grid-template-columns: 1fr !important; gap: 20px !important; }
          .inc-page-title { font-size: 1.45rem !important; }
        }
      `}</style>

      <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div style={{ marginLeft: `${sidebarWidth}px`, flex: 1, transition: "margin-left 0.25s", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <div className="inc-topbar" style={{ 
          height: "64px", backgroundColor: t.topbar, borderBottom: `1px solid ${t.border}`, 
          display: "flex", alignItems: "center", padding: "0 28px", position: "sticky", 
          top: 0, zIndex: 100, boxShadow: isDark ? "0 1px 4px rgba(0,0,0,0.3)" : "0 1px 4px rgba(15,23,42,0.04)"
        }}>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "9px", padding: "5px 12px 5px 6px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "10px", background: t.card, cursor: "pointer" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #4F46E5, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.72rem", fontWeight: "600" }}>
                {name.slice(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: "0.83rem", fontWeight: "500", color: t.textPrimary }}>{name}</span>
            </div>
          </div>
        </div>

        <main className="inc-main" style={{ padding: "28px 28px 40px", flex: 1 }}>
          <div style={{ marginBottom: "24px", animation: "fadeUp 0.4s ease both" }}>
            <p style={{ color: t.textSecondary, fontSize: "0.875rem", margin: "0 0 4px" }}>{greeting}, <strong style={{ color: "#4F46E5" }}>{name}</strong> 👋</p>
            <h1 className="inc-page-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.85rem", fontWeight: "700", color: t.textPrimary, margin: 0 }}>Increment & Promotion</h1>
            <p style={{ color: t.textMuted, fontSize: "0.85rem", margin: "5px 0 0" }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          {error && (
            <div style={{ background: t.errorBg, borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px", color: t.errorText, fontSize: "0.85rem" }}>
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {success && (
            <div style={{ background: t.successBg, borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px", color: t.successText, fontSize: "0.85rem" }} className="success-message">
              <Award size={18} />
              {success}
            </div>
          )}

          <div className="inc-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "24px" }}>
            <div style={{ backgroundColor: t.card, borderRadius: "14px", border: `1px solid ${t.border}`, padding: "20px", height: "fit-content" }}>
              <h2 style={{ fontSize: "0.95rem", fontWeight: "600", margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px", color: t.textPrimary }}>
                <UserPlus size={18} /> Select Employee
              </h2>
              <div style={{ position: "relative", marginBottom: "16px" }}>
                <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: t.textMuted }} />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="inc-search-input"
                  style={{ width: "100%", padding: "10px 12px 10px 36px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "10px", fontSize: "0.8rem", outline: "none", color: t.textPrimary, backgroundColor: t.inputBg }}
                />
              </div>
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {filteredEmployees.length === 0 ? (
                  <div style={{ padding: "20px", textAlign: "center", color: t.textMuted }}>No employees found</div>
                ) : (
                  filteredEmployees.map(emp => (
                    <div
                      key={emp._id}
                      onClick={() => handleEmployeeSelect(emp)}
                      className={`employee-card ${selectedEmployee?._id === emp._id ? "selected-employee" : ""}`}
                      style={{ padding: "12px", borderBottom: `1px solid ${t.border}`, cursor: "pointer", background: selectedEmployee?._id === emp._id ? t.employeeSelected : t.card }}
                    >
                      <div style={{ fontWeight: "600", color: t.textPrimary, fontSize: "0.85rem" }}>{emp.name}</div>
                      <div style={{ fontSize: "0.72rem", color: t.textMuted }}>{emp.email}</div>
                      <div style={{ fontSize: "0.75rem", color: "#4F46E5", marginTop: "4px" }}>
                        ₹{(emp.salary || 0).toLocaleString()} • {emp.designation || "No designation"}
                        {(!emp.salary || emp.salary === 0) && (
                          <span style={{ color: t.errorText, marginLeft: "8px" }}>(Salary not set)</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {selectedEmployee && (
                <div style={{ backgroundColor: t.card, borderRadius: "14px", border: `1px solid ${t.border}`, padding: "20px", animation: "fadeUp 0.3s ease" }}>
                  <h2 style={{ fontSize: "0.95rem", fontWeight: "600", margin: "0 0 16px", color: t.textPrimary }}>
                    {formData.type === "increment" ? "💰 Salary Increment" : "🏆 Promotion with Salary Review"} for {selectedEmployee.name}
                  </h2>
                  
                  {(!selectedEmployee.salary || selectedEmployee.salary === 0) && (
                    <div style={{ background: t.warningBg, borderRadius: "8px", padding: "10px", marginBottom: "16px", fontSize: "0.75rem", color: t.warningText }}>
                      ⚠️ This employee doesn't have a salary set. Please update their salary first.
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "14px" }}>
                      <label style={{ fontSize: "0.8rem", fontWeight: "500", marginBottom: "5px", display: "block", color: t.textSecondary }}>Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value, new_salary: "", new_designation: "" })}
                        style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "9px", fontSize: "0.85rem", background: t.inputBg, color: t.textPrimary }}
                      >
                        <option value="increment">Salary Increment Only</option>
                        <option value="promotion">Promotion (with optional salary increase)</option>
                      </select>
                    </div>
                    
                    <div style={{ marginBottom: "14px", background: t.currentInfoBg, padding: "10px", borderRadius: "8px" }}>
                      <div style={{ fontSize: "0.75rem", color: t.textMuted, marginBottom: "4px" }}>Current Information</div>
                      <div style={{ fontSize: "0.85rem", fontWeight: "500", color: t.textPrimary }}>
                        Salary: ₹{(selectedEmployee.salary || 0).toLocaleString()} | Designation: {selectedEmployee.designation || "Not Assigned"}
                      </div>
                    </div>
                    
                    {formData.type === "increment" ? (
                      <div style={{ marginBottom: "14px" }}>
                        <label style={{ fontSize: "0.8rem", fontWeight: "500", marginBottom: "5px", display: "block", color: t.textSecondary }}>New Salary (₹) *</label>
                        <input
                          type="number"
                          value={formData.new_salary}
                          onChange={(e) => setFormData({ ...formData, new_salary: e.target.value })}
                          className="inc-search-input"
                          style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "9px", fontSize: "0.85rem", color: t.textPrimary, backgroundColor: t.inputBg }}
                          required
                          placeholder="Enter new salary amount"
                          min={selectedEmployee.salary + 1}
                        />
                        {formData.new_salary && parseFloat(formData.new_salary) > 0 && (
                          <div style={{ fontSize: "0.7rem", color: t.successText, marginTop: "4px" }}>
                            Increase: ₹{(parseFloat(formData.new_salary) - (selectedEmployee.salary || 0)).toLocaleString()} 
                            ({((parseFloat(formData.new_salary) - (selectedEmployee.salary || 0)) / (selectedEmployee.salary || 1) * 100).toFixed(1)}%)
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <div style={{ marginBottom: "14px" }}>
                          <label style={{ fontSize: "0.8rem", fontWeight: "500", marginBottom: "5px", display: "block", color: t.textSecondary }}>New Designation *</label>
                          {loadingDesignations ? (
                            <div style={{ padding: "9px 12px", background: t.inputBg, border: `1.5px solid ${t.inputBorder}`, borderRadius: "9px", color: t.textMuted, fontSize: "0.85rem" }}>
                              Loading designations...
                            </div>
                          ) : designations.length === 0 ? (
                            <div style={{ padding: "9px 12px", background: t.warningBg, border: `1.5px solid ${t.inputBorder}`, borderRadius: "9px", color: t.warningText, fontSize: "0.85rem" }}>
                              No designations found. Please add designations first.
                            </div>
                          ) : (
                            <select
                              value={formData.new_designation}
                              onChange={(e) => setFormData({ ...formData, new_designation: e.target.value })}
                              style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "9px", fontSize: "0.85rem", background: t.inputBg, color: t.textPrimary }}
                              required
                            >
                              <option value="">Select a designation</option>
                              {getUniqueDesignations().map(desName => (
                                <option key={desName} value={desName}>{desName}</option>
                              ))}
                            </select>
                          )}
                        </div>

                        <div style={{ marginBottom: "14px" }}>
                          <label style={{ fontSize: "0.8rem", fontWeight: "500", marginBottom: "5px", display: "block", color: t.textSecondary }}>
                            New Salary (Optional)
                            <span style={{ fontSize: "0.7rem", color: t.textMuted, marginLeft: "8px" }}>(Leave empty to keep current salary)</span>
                          </label>
                          <input
                            type="number"
                            value={formData.new_salary}
                            onChange={(e) => setFormData({ ...formData, new_salary: e.target.value })}
                            className="inc-search-input"
                            style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "9px", fontSize: "0.85rem", color: t.textPrimary, backgroundColor: t.inputBg }}
                            placeholder="Enter new salary (optional)"
                            min={selectedEmployee.salary}
                          />
                          {formData.new_salary && parseFloat(formData.new_salary) > 0 && (
                            <>
                              {parseFloat(formData.new_salary) > selectedEmployee.salary ? (
                                <div style={{ fontSize: "0.7rem", color: t.successText, marginTop: "4px" }}>
                                  Increase: ₹{(parseFloat(formData.new_salary) - (selectedEmployee.salary || 0)).toLocaleString()} 
                                  ({((parseFloat(formData.new_salary) - (selectedEmployee.salary || 0)) / (selectedEmployee.salary || 1) * 100).toFixed(1)}%)
                                </div>
                              ) : parseFloat(formData.new_salary) === selectedEmployee.salary ? (
                                <div style={{ fontSize: "0.7rem", color: t.textMuted, marginTop: "4px" }}>
                                  Salary remains unchanged
                                </div>
                              ) : (
                                <div style={{ fontSize: "0.7rem", color: t.errorText, marginTop: "4px" }}>
                                  Salary cannot be decreased
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </>
                    )}

                    <div style={{ marginBottom: "14px" }}>
                      <label style={{ fontSize: "0.8rem", fontWeight: "500", marginBottom: "5px", display: "block", color: t.textSecondary }}>Effective Date</label>
                      <input
                        type="date"
                        value={formData.effective_date}
                        onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                        className="inc-search-input"
                        style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "9px", fontSize: "0.85rem", color: t.textPrimary, backgroundColor: t.inputBg }}
                        required
                      />
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                      <label style={{ fontSize: "0.8rem", fontWeight: "500", marginBottom: "5px", display: "block", color: t.textSecondary }}>Remarks (Optional)</label>
                      <textarea
                        value={formData.remarks}
                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        rows="3"
                        className="inc-search-input"
                        style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "9px", fontSize: "0.85rem", resize: "vertical", color: t.textPrimary, backgroundColor: t.inputBg }}
                        placeholder="Add any additional notes..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || (!selectedEmployee.salary || selectedEmployee.salary === 0)}
                      style={{ width: "100%", padding: "10px", background: t.buttonPrimary, color: "#fff", border: "none", borderRadius: "10px", fontSize: "0.85rem", fontWeight: "600", cursor: (submitting || (!selectedEmployee.salary || selectedEmployee.salary === 0)) ? "not-allowed" : "pointer", opacity: (submitting || (!selectedEmployee.salary || selectedEmployee.salary === 0)) ? 0.5 : 1 }}
                    >
                      {submitting ? "Saving..." : `Save ${formData.type === "increment" ? "Increment" : "Promotion"}`}
                    </button>
                  </form>
                </div>
              )}

              <div style={{ backgroundColor: t.card, borderRadius: "14px", border: `1px solid ${t.border}`, padding: "20px" }}>
                <h2 style={{ fontSize: "0.95rem", fontWeight: "600", margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px", color: t.textPrimary }}>
                  <TrendingUp size={18} /> Recent History
                </h2>
                {loading ? (
                  <div style={{ padding: "20px", textAlign: "center", color: t.textMuted }}>Loading...</div>
                ) : history.length === 0 ? (
                  <div style={{ padding: "20px", textAlign: "center", color: t.textMuted }}>No records found</div>
                ) : (
                  <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                    {history.map(record => (
                      <div key={record._id} style={{ padding: "12px", borderBottom: `1px solid ${t.border}`, borderLeft: `3px solid ${record.type === "promotion" ? t.borderLeftPromotion : t.borderLeftIncrement}`, marginBottom: "8px", position: "relative", background: t.card }}>
                        <button
                          onClick={() => handleDelete(record._id)}
                          style={{ position: "absolute", right: "8px", top: "8px", background: t.buttonDeleteBg, border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "0.7rem", color: t.buttonDanger }}
                        >
                          <Trash2 size={12} />
                        </button>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "6px", paddingRight: "50px" }}>
                          <div>
                            <span style={{ fontWeight: "600", fontSize: "0.85rem", color: t.textPrimary }}>{record.employee_id?.name}</span>
                            <span style={{ fontSize: "0.7rem", color: record.type === "promotion" ? "#8B5CF6" : "#059669", marginLeft: "8px", background: t.currentInfoBg, padding: "2px 8px", borderRadius: "12px" }}>
                              {record.type === "promotion" ? "Promotion" : "Increment"}
                            </span>
                          </div>
                          <span style={{ fontSize: "0.7rem", color: t.textMuted }}>{new Date(record.effective_date).toLocaleDateString()}</span>
                        </div>
                        {record.type === "increment" ? (
                          <div style={{ fontSize: "0.8rem", color: t.textSecondary }}>₹{(record.old_salary || 0).toLocaleString()} → <strong style={{ color: t.textPrimary }}>₹{(record.new_salary || 0).toLocaleString()}</strong></div>
                        ) : (
                          <>
                            <div style={{ fontSize: "0.8rem", color: t.textSecondary }}>
                              Designation: {record.old_designation || "N/A"} → <strong style={{ color: t.textPrimary }}>{record.new_designation || "N/A"}</strong>
                            </div>
                            {record.new_salary !== record.old_salary && (
                              <div style={{ fontSize: "0.8rem", color: t.textSecondary, marginTop: "4px" }}>
                                Salary: ₹{(record.old_salary || 0).toLocaleString()} → <strong style={{ color: t.textPrimary }}>₹{(record.new_salary || 0).toLocaleString()}</strong>
                              </div>
                            )}
                          </>
                        )}
                        {record.remarks && <div style={{ fontSize: "0.7rem", color: t.textMuted, marginTop: "4px" }}>📝 {record.remarks}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default IncrementPromotion;
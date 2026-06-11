import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  UserPlus, Mail, Phone, Calendar,
  Briefcase, Lock, ArrowRight, Bell, Search, Users, DollarSign, Award
} from "lucide-react";
import Sidebar from "../../layouts/sidebar";
import MobileTopBar from "../../employee/MobileTopBar";
import { useTheme } from "../../context/ThemeContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

function AddEmployee() {
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", phone: "",
    department_id: "",
    designation_id: "",
    manager_id: "",
    joining_date: new Date().toISOString().split("T")[0],
    salary: "",
  });
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [deptLoading, setDeptLoading] = useState(true);
  const [desigLoading, setDesigLoading] = useState(true);
  const [empLoading, setEmpLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const { isDark } = useTheme();

  const name = localStorage.getItem("name") || "Manager";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const headers = { "x-auth-token": localStorage.getItem("token"), "Content-Type": "application/json" };

  const t = {
    bg: isDark ? "#0F1219" : "#F9FAFB",
    card: isDark ? "#161B27" : "#fff",
    cardHeader: isDark ? "#111827" : "#fff",
    border: isDark ? "#1E2535" : "#F1F3F9",
    textPrimary: isDark ? "#F3F4F6" : "#111827",
    textSecondary: isDark ? "#9CA3AF" : "#6B7280",
    textMuted: isDark ? "#6B7280" : "#9CA3AF",
    inputBg: isDark ? "#0F1219" : "#fff",
    inputBorder: isDark ? "#2D3748" : "#E5E7EB",
    topbar: isDark ? "#161B27" : "#fff",
    footerBg: isDark ? "#111827" : "#FAFBFF",
    resetBtn: isDark ? "#1E2535" : "#F1F5F9",
    resetBtnText: isDark ? "#D1D5DB" : "#374151",
    skeletonBg: isDark ? "#1E2535" : "#F3F4F6",
    iconAccentBg: isDark ? "#1E1B4B" : "#EEF2FF",
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setIsOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarWidth = isMobile ? 0 : (isOpen ? 255 : 68);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setDeptLoading(true);
        const res = await axios.get(`${API}/api/departments`, { headers });
        setDepartments(res.data.data || []);
      } catch (err) {
        showToast("Could not load departments", "error");
        setDepartments([]);
      } finally { setDeptLoading(false); }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchDesignations = async () => {
      try {
        setDesigLoading(true);
        const res = await axios.get(`${API}/api/designations`, { headers });
        const designationData = res.data.data || res.data.designations || res.data || [];
        setDesignations(Array.isArray(designationData) ? designationData : []);
      } catch (err) {
        console.error("Error fetching designations:", err);
        showToast("Could not load designations", "error");
        setDesignations([]);
      } finally { setDesigLoading(false); }
    };
    fetchDesignations();
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setEmpLoading(true);
        const res = await axios.get(`${API}/api/employees`, { headers });
        setEmployees(res.data.data || res.data || []);
      } catch (err) {
        showToast("Could not load employees", "error");
        setEmployees([]);
      } finally { setEmpLoading(false); }
    };
    fetchEmployees();
  }, []);

  const handleChange = (field) => (e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const resetForm = () => setFormData({
    name: "", email: "", password: "", phone: "",
    department_id: "", designation_id: "", manager_id: "",
    joining_date: new Date().toISOString().split("T")[0],
    salary: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) { showToast("Password must be at least 6 characters.", "error"); return; }

    if (formData.salary && (isNaN(parseFloat(formData.salary)) || parseFloat(formData.salary) < 0)) {
      showToast("Please enter a valid salary amount", "error");
      return;
    }

    setLoading(true);
    try {
      const selectedDesignation = designations.find(d => d._id === formData.designation_id);
      const requestData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        department_id: formData.department_id || undefined,
        designation_id: formData.designation_id || undefined,
        designation: selectedDesignation?.designation_name || "",
        manager_id: formData.manager_id || undefined,
        joining_date: formData.joining_date,
        salary: formData.salary ? parseFloat(formData.salary) : null,
      };

      await axios.post(`${API}/api/employees/add`, requestData, { headers });
      showToast("Employee onboarded successfully!");
      resetForm();
    } catch (error) {
      showToast(error.response?.data?.error || "Failed to add employee.", "error");
    } finally { setLoading(false); }
  };

  const inputBase = {
    width: "100%", padding: "11px 14px 11px 42px",
    border: `1.5px solid ${t.inputBorder}`, borderRadius: "11px",
    fontSize: "0.875rem", color: t.textPrimary, backgroundColor: t.inputBg,
    fontFamily: "'DM Sans', sans-serif", outline: "none",
    transition: "border-color 0.18s, box-shadow 0.18s",
  };

  const labelBase = {
    display: "block", fontSize: "0.75rem", fontWeight: "600",
    color: t.textSecondary, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px",
  };

  const iconBase = { position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: t.textMuted, pointerEvents: "none" };

  const fields = [
    { label: "Full Name",        id: "field-name",         field: "name",         type: "text",     icon: <UserPlus size={16} aria-hidden="true" style={iconBase} />, placeholder: "John Doe", required: true },
    { label: "Work Email",       id: "field-email",        field: "email",        type: "email",    icon: <Mail size={16} aria-hidden="true" style={iconBase} />,    placeholder: "name@company.com", required: true },
    { label: "Access Password",  id: "field-password",     field: "password",     type: "password", icon: <Lock size={16} aria-hidden="true" style={iconBase} />,    placeholder: "Min. 6 characters", required: true },
    { label: "Contact Number",   id: "field-phone",        field: "phone",        type: "tel",      icon: <Phone size={16} aria-hidden="true" style={iconBase} />,   placeholder: "+91 98765 43210", required: true },
    { label: "Joining Date",     id: "field-joining-date", field: "joining_date", type: "date",     icon: <Calendar size={16} aria-hidden="true" style={iconBase} />, placeholder: "", required: true },
    { label: "Salary (₹)",       id: "field-salary",       field: "salary",       type: "number",   icon: <DollarSign size={16} aria-hidden="true" style={iconBase} />, placeholder: "e.g., 50000", required: false },
  ];


  const managers = employees.filter((emp) =>
    emp.role === "manager"
  );

  const selectedManager = managers.find((emp) => emp._id === formData.manager_id);
  const selectedDesignation = designations.find((d) => d._id === formData.designation_id);

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: t.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp  { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .field-input:focus  { border-color: #4F46E5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.12) !important; }
        .ae-search-input:focus { outline: none; border-color: #4F46E5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.10); }
        .topbar-btn:hover   { background: ${isDark ? "#1E2535" : "#F3F4F6"} !important; }
        * { box-sizing: border-box; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: ${isDark ? "invert(1)" : "none"}; }
        select option { background: ${t.card}; color: ${t.textPrimary}; }

        .ae-topbar { display: flex; }

        @media (max-width: 768px) {
          .ae-topbar { display: none !important; }
          .ae-main { padding: 76px 16px 32px !important; }
          .ae-form-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .ae-h1 { font-size: 1.5rem !important; }
          .ae-footer { padding: 16px !important; flex-direction: column !important; gap: 10px !important; }
          .ae-footer button { width: 100% !important; justify-content: center !important; }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .ae-main { padding: 24px 20px 32px !important; }
          .ae-form-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {toast && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            position: "fixed", top: "20px", right: "20px",
            background: toast.type === "error" ? "#EF4444" : "#059669",
            color: "#fff", padding: "12px 20px", borderRadius: "12px",
            fontWeight: "500", fontSize: "0.875rem", zIndex: 9999,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)", animation: "slideIn 0.2s ease both",
            maxWidth: "320px",
          }}
        >
          {toast.message}
        </div>
      )}

      <MobileTopBar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div style={{ marginLeft: `${sidebarWidth}px`, flex: 1, transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <div className="ae-topbar" style={{ height: "64px", backgroundColor: t.topbar, borderBottom: `1px solid ${t.border}`, alignItems: "center", padding: "0 28px", gap: "16px", position: "sticky", top: 0, zIndex: 100, boxShadow: isDark ? "0 1px 4px rgba(0,0,0,0.3)" : "0 1px 4px rgba(15,23,42,0.04)" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "380px" }}>
            <Search size={15} aria-hidden="true" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: t.textMuted }} />
            <label htmlFor="topbar-search" style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}>
              Search
            </label>
            <input
              id="topbar-search"
              className="ae-search-input"
              type="search"
              placeholder="Search anything..."
              style={{ width: "100%", padding: "8px 12px 8px 36px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "10px", fontSize: "0.875rem", color: t.textPrimary, backgroundColor: t.inputBg }}
            />
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              className="topbar-btn"
              aria-label="Notifications"
              style={{ width: "38px", height: "38px", borderRadius: "10px", border: `1.5px solid ${t.inputBorder}`, background: t.card, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: t.textSecondary, position: "relative" }}
            >
              <Bell size={17} aria-hidden="true" />
              <span aria-label="You have new notifications" style={{ position: "absolute", top: "8px", right: "8px", width: "7px", height: "7px", borderRadius: "50%", background: "#EF4444", border: `1.5px solid ${t.card}` }} />
            </button>
            <div
              aria-label={`Logged in as ${name}`}
              style={{ display: "flex", alignItems: "center", gap: "9px", padding: "5px 12px 5px 6px", border: `1.5px solid ${t.inputBorder}`, borderRadius: "10px", background: t.card, cursor: "pointer" }}
            >
              <div aria-hidden="true" style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #4F46E5, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.72rem", fontWeight: "600" }}>
                {name.slice(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: "0.83rem", fontWeight: "500", color: t.textPrimary }}>{name}</span>
            </div>
          </div>
        </div>

        <main className="ae-main" style={{ padding: "28px 28px 40px", flex: 1 }}>
          <div style={{ marginBottom: "28px", animation: "fadeUp 0.4s ease both 0.05s" }}>
            <p style={{ color: t.textSecondary, fontSize: "0.875rem", margin: "0 0 4px" }}>
              {greeting}, <strong style={{ color: "#4F46E5" }}>{name}</strong> 👋
            </p>
            <h1 className="ae-h1" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.85rem", fontWeight: "700", color: t.textPrimary, margin: 0, lineHeight: 1.2 }}>Add Employee</h1>
            <p style={{ color: t.textSecondary, fontSize: "0.85rem", margin: "5px 0 0" }}>
              <time dateTime={new Date().toISOString().split("T")[0]}>
                {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </time>
            </p>
          </div>

          <div style={{ backgroundColor: t.card, borderRadius: "16px", border: `1px solid ${t.border}`, boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(15,23,42,0.05)", overflow: "hidden", animation: "fadeUp 0.4s ease both 0.15s" }}>
            <div style={{ padding: "20px 28px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: "12px" }}>
              <div aria-hidden="true" style={{ width: "40px", height: "40px", borderRadius: "11px", background: t.iconAccentBg, display: "flex", alignItems: "center", justifyContent: "center", color: "#4F46E5" }}>
                <UserPlus size={19} />
              </div>
              <div>
                <h2 style={{ fontSize: "1rem", fontWeight: "600", color: t.textPrimary, margin: "0 0 2px" }}>New Employee Onboarding</h2>
                <p style={{ fontSize: "0.78rem", color: t.textSecondary, margin: 0 }}>Creates a login account + employee profile automatically</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <fieldset style={{ border: "none", margin: 0, padding: 0 }}>
                <legend style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}>
                  Employee details
                </legend>
                <div className="ae-form-grid" style={{ padding: "28px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
                  {fields.map(({ label, id, field, type, icon, placeholder, required }) => (
                    <div key={field}>
                      <label htmlFor={id} style={labelBase}>
                        {label} {required && <span aria-hidden="true" style={{ color: "#EF4444" }}>*</span>}
                        {required && <span style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}>(required)</span>}
                      </label>
                      <div style={{ position: "relative" }}>
                        {icon}
                        <input
                          id={id}
                          className="field-input"
                          type={type}
                          placeholder={placeholder}
                          value={formData[field]}
                          onChange={handleChange(field)}
                          required={required}
                          min={field === "salary" ? "0" : undefined}
                          step={field === "salary" ? "1000" : undefined}
                          minLength={field === "password" ? 6 : undefined}
                          style={inputBase}
                        />
                      </div>
                      {field === "salary" && formData.salary && (
                        <p style={{ margin: "6px 0 0", fontSize: "0.7rem", color: isDark ? "#34D399" : "#059669" }}>
                          ₹{parseFloat(formData.salary).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))}

                  <div>
                    <label htmlFor="field-department" style={labelBase}>
                      Department <span aria-hidden="true" style={{ color: "#EF4444" }}>*</span>
                      <span style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}>(required)</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <Briefcase size={16} aria-hidden="true" style={iconBase} />
                      <select
                        id="field-department"
                        className="field-input"
                        value={formData.department_id}
                        onChange={handleChange("department_id")}
                        required
                        aria-required="true"
                        disabled={deptLoading}
                        style={{ ...inputBase, appearance: "none", cursor: deptLoading ? "not-allowed" : "pointer", color: formData.department_id ? t.textPrimary : t.textMuted, opacity: deptLoading ? 0.6 : 1 }}
                      >
                        <option value="" disabled>{deptLoading ? "Loading departments..." : "Select Department"}</option>
                        {departments.map((dept) => <option key={dept._id} value={dept._id}>{dept.department_name}</option>)}
                      </select>
                      <svg aria-hidden="true" style={{ position: "absolute", right: "13px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: t.textMuted }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                    {formData.department_id && (
                      <p style={{ margin: "6px 0 0", fontSize: "0.75rem", color: "#4F46E5", fontWeight: "500" }}>
                        ✓ {departments.find((d) => d._id === formData.department_id)?.department_name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="field-designation" style={labelBase}>
                      Designation
                    </label>
                    <div style={{ position: "relative" }}>
                      <Award size={16} aria-hidden="true" style={iconBase} />
                      <select
                        id="field-designation"
                        className="field-input"
                        value={formData.designation_id}
                        onChange={handleChange("designation_id")}
                        disabled={desigLoading}
                        style={{ ...inputBase, appearance: "none", cursor: desigLoading ? "not-allowed" : "pointer", color: formData.designation_id ? t.textPrimary : t.textMuted, opacity: desigLoading ? 0.6 : 1 }}
                      >
                        <option value="">
                          {desigLoading ? "Loading designations..." : designations.length === 0 ? "No designations available" : "Select Designation (Optional)"}
                        </option>
                        {designations.map((desig) => (
                          <option key={desig._id} value={desig._id}>
                            {desig.designation_name}
                            {desig.company_id?.company_name && ` (${desig.company_id.company_name})`}
                          </option>
                        ))}
                      </select>
                      <svg aria-hidden="true" style={{ position: "absolute", right: "13px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: t.textMuted }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                    {selectedDesignation && (
                      <p style={{ margin: "6px 0 0", fontSize: "0.75rem", color: "#4F46E5", fontWeight: "500" }}>
                        ✓ {selectedDesignation.designation_name}
                        {selectedDesignation.company_id?.company_name && ` · ${selectedDesignation.company_id.company_name}`}
                      </p>
                    )}
                    {designations.length === 0 && !desigLoading && (
                      <p style={{ margin: "6px 0 0", fontSize: "0.7rem", color: isDark ? "#FCD34D" : "#D97706" }}>
                        ⚠️ No designations found. Please add designations first.
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="field-manager" style={labelBase}>
                      Reporting Manager
                    </label>
                    <div style={{ position: "relative" }}>
                      <Users size={16} aria-hidden="true" style={iconBase} />
                      <select
                        id="field-manager"
                        className="field-input"
                        value={formData.manager_id}
                        onChange={handleChange("manager_id")}
                        disabled={empLoading}
                        style={{ ...inputBase, appearance: "none", cursor: empLoading ? "not-allowed" : "pointer", color: formData.manager_id ? t.textPrimary : t.textMuted, opacity: empLoading ? 0.6 : 1 }}
                      >
                        <option value="">
                          {empLoading ? "Loading..." : managers.length === 0 ? "No managers assigned yet" : "Select Manager (Optional)"}
                        </option>
                        {managers.map((emp) => (
                          <option key={emp._id} value={emp._id}>
                            {emp.name} {emp.designation ? `(${emp.designation})` : ""}
                          </option>
                        ))}
                      </select>
                      <svg aria-hidden="true" style={{ position: "absolute", right: "13px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: t.textMuted }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                    {selectedManager && (
                      <p style={{ margin: "6px 0 0", fontSize: "0.75rem", color: "#4F46E5", fontWeight: "500" }}>
                        ✓ {selectedManager.name}
                        {selectedManager.designation && ` · ${selectedManager.designation}`}
                      </p>
                    )}
                  </div>
                </div>
              </fieldset>

              <div className="ae-footer" style={{ padding: "18px 28px", borderTop: `1px solid ${t.border}`, backgroundColor: t.footerBg, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px" }}>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{ background: t.resetBtn, color: t.resetBtnText, border: "none", borderRadius: "11px", padding: "11px 20px", fontWeight: "600", fontSize: "0.875rem", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={loading || deptLoading}
                  aria-disabled={loading || deptLoading}
                  style={{ display: "flex", alignItems: "center", gap: "8px", background: loading || deptLoading ? "#818CF8" : "#4F46E5", color: "#fff", border: "none", borderRadius: "11px", padding: "11px 24px", fontWeight: "600", fontSize: "0.875rem", cursor: loading || deptLoading ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", boxShadow: "0 4px 14px rgba(79,70,229,0.28)", transition: "background 0.18s, box-shadow 0.18s" }}
                >
                  {loading ? "Onboarding..." : "Complete Onboarding"}
                  {!loading && <ArrowRight size={16} aria-hidden="true" />}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AddEmployee;
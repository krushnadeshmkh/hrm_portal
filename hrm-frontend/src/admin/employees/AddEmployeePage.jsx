import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  UserPlus, Mail, Phone, Calendar,
  Briefcase, Lock, ArrowRight, Bell, Search,
} from "lucide-react";
import Sidebar from "../../layouts/sidebar";
import MobileTopBar from "../../employee/MobileTopBar";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

function AddEmployee() {
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", phone: "",
    department_id: "",
    joining_date: new Date().toISOString().split("T")[0],
  });
  const [departments, setDepartments] = useState([]);
  const [deptLoading, setDeptLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const name = localStorage.getItem("name") || "Admin";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const headers = { "x-auth-token": localStorage.getItem("token"), "Content-Type": "application/json" };

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

  const handleChange = (field) => (e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const resetForm = () => setFormData({
    name: "", email: "", password: "", phone: "",
    department_id: "", joining_date: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) { showToast("Password must be at least 6 characters.", "error"); return; }
    setLoading(true);
    try {
      await axios.post(`${API}/api/employees/add`, {
        name: formData.name, email: formData.email, password: formData.password,
        phone: formData.phone, department_id: formData.department_id || undefined,
        joining_date: formData.joining_date,
      }, { headers });
      showToast("Employee onboarded successfully!");
      resetForm();
    } catch (error) {
      showToast(error.response?.data?.error || "Failed to add employee.", "error");
    } finally { setLoading(false); }
  };

  const inputBase = {
    width: "100%", padding: "11px 14px 11px 42px",
    border: "1.5px solid #E5E7EB", borderRadius: "11px",
    fontSize: "0.875rem", color: "#111827", backgroundColor: "#fff",
    fontFamily: "'DM Sans', sans-serif", outline: "none",
    transition: "border-color 0.18s, box-shadow 0.18s",
  };

  const labelBase = {
    display: "block", fontSize: "0.75rem", fontWeight: "600",
    color: "#374151", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px",
  };

  const iconBase = { position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", pointerEvents: "none" };

  const fields = [
    { label: "Full Name",        id: "field-name",         field: "name",         type: "text",     icon: <UserPlus size={16} aria-hidden="true" style={iconBase} />, placeholder: "John Doe" },
    { label: "Work Email",       id: "field-email",        field: "email",        type: "email",    icon: <Mail size={16} aria-hidden="true" style={iconBase} />,    placeholder: "name@company.com" },
    { label: "Access Password",  id: "field-password",     field: "password",     type: "password", icon: <Lock size={16} aria-hidden="true" style={iconBase} />,    placeholder: "Min. 6 characters" },
    { label: "Contact Number",   id: "field-phone",        field: "phone",        type: "tel",      icon: <Phone size={16} aria-hidden="true" style={iconBase} />,   placeholder: "+91 98765 43210" },
    { label: "Joining Date",     id: "field-joining-date", field: "joining_date", type: "date",     icon: <Calendar size={16} aria-hidden="true" style={iconBase} />, placeholder: "" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F9FAFB", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp  { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .field-input:focus  { border-color: #4F46E5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.10) !important; }
        .search-input:focus { outline: none; border-color: #4F46E5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.10); }
        .topbar-btn:hover   { background: #F3F4F6 !important; }
        * { box-sizing: border-box; }

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
        <div className="ae-topbar" style={{ height: "64px", backgroundColor: "#fff", borderBottom: "1px solid #F1F3F9", alignItems: "center", padding: "0 28px", gap: "16px", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 4px rgba(15,23,42,0.04)" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "380px" }}>
            <Search size={15} aria-hidden="true" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
            <label htmlFor="topbar-search" style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}>
              Search
            </label>
            <input
              id="topbar-search"
              className="search-input"
              type="search"
              placeholder="Search anything..."
              style={{ width: "100%", padding: "8px 12px 8px 36px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "0.875rem", color: "#374151", backgroundColor: "#F9FAFB" }}
            />
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              className="topbar-btn"
              aria-label="Notifications"
              style={{ width: "38px", height: "38px", borderRadius: "10px", border: "1.5px solid #E5E7EB", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6B7280", position: "relative" }}
            >
              <Bell size={17} aria-hidden="true" />
              <span aria-label="You have new notifications" style={{ position: "absolute", top: "8px", right: "8px", width: "7px", height: "7px", borderRadius: "50%", background: "#EF4444", border: "1.5px solid #fff" }} />
            </button>
            <div
              aria-label={`Logged in as ${name}`}
              style={{ display: "flex", alignItems: "center", gap: "9px", padding: "5px 12px 5px 6px", border: "1.5px solid #E5E7EB", borderRadius: "10px", background: "#fff", cursor: "pointer" }}
            >
              <div aria-hidden="true" style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #4F46E5, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.72rem", fontWeight: "600" }}>
                {name.slice(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: "0.83rem", fontWeight: "500", color: "#374151" }}>{name}</span>
            </div>
          </div>
        </div>

        <main className="ae-main" style={{ padding: "28px 28px 40px", flex: 1 }}>
          <div style={{ marginBottom: "28px", animation: "fadeUp 0.4s ease both 0.05s" }}>
            <p style={{ color: "#6B7280", fontSize: "0.875rem", margin: "0 0 4px" }}>
              {greeting}, <strong style={{ color: "#4F46E5" }}>{name}</strong> 👋
            </p>
            <h1 className="ae-h1" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.85rem", fontWeight: "700", color: "#111827", margin: 0, lineHeight: 1.2 }}>Add Employee</h1>
            <p style={{ color: "#6B7280", fontSize: "0.85rem", margin: "5px 0 0" }}>
              <time dateTime={new Date().toISOString().split("T")[0]}>
                {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </time>
            </p>
          </div>

          <div style={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #F1F3F9", boxShadow: "0 2px 8px rgba(15,23,42,0.05)", overflow: "hidden", animation: "fadeUp 0.4s ease both 0.15s" }}>
            <div style={{ padding: "20px 28px", borderBottom: "1px solid #F1F3F9", display: "flex", alignItems: "center", gap: "12px" }}>
              <div aria-hidden="true" style={{ width: "40px", height: "40px", borderRadius: "11px", background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#4F46E5" }}>
                <UserPlus size={19} />
              </div>
              <div>
                <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "#111827", margin: "0 0 2px" }}>New Employee Onboarding</h2>
                <p style={{ fontSize: "0.78rem", color: "#6B7280", margin: 0 }}>Creates a login account + employee profile automatically</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <fieldset style={{ border: "none", margin: 0, padding: 0 }}>
                <legend style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}>
                  Employee details
                </legend>
                <div className="ae-form-grid" style={{ padding: "28px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
                  {fields.map(({ label, id, field, type, icon, placeholder }) => (
                    <div key={field}>
                      <label htmlFor={id} style={labelBase}>
                        {label} <span aria-hidden="true" style={{ color: "#EF4444" }}>*</span>
                        <span style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}>(required)</span>
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
                          required
                          aria-required="true"
                          minLength={field === "password" ? 6 : undefined}
                          style={inputBase}
                        />
                      </div>
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
                        style={{ ...inputBase, appearance: "none", cursor: deptLoading ? "not-allowed" : "pointer", color: formData.department_id ? "#111827" : "#6B7280", opacity: deptLoading ? 0.6 : 1 }}
                      >
                        <option value="" disabled>{deptLoading ? "Loading departments..." : "Select Department"}</option>
                        {departments.map((dept) => <option key={dept._id} value={dept._id}>{dept.department_name}</option>)}
                      </select>
                      <svg aria-hidden="true" style={{ position: "absolute", right: "13px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9CA3AF" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                    {formData.department_id && (
                      <p style={{ margin: "6px 0 0", fontSize: "0.75rem", color: "#4F46E5", fontWeight: "500" }}>
                        ✓ {departments.find((d) => d._id === formData.department_id)?.department_name}
                      </p>
                    )}
                  </div>
                </div>
              </fieldset>

              <div className="ae-footer" style={{ padding: "18px 28px", borderTop: "1px solid #F1F3F9", backgroundColor: "#FAFBFF", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px" }}>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{ background: "#F1F5F9", color: "#374151", border: "none", borderRadius: "11px", padding: "11px 20px", fontWeight: "600", fontSize: "0.875rem", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
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
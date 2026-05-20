import React, { useState, useEffect } from "react";
import Sidebar from "../../layouts/sidebar";
import axios from "axios";
import {
  Layout, Type, Phone, Tag, Star,
  Save, CheckCircle, AlertCircle, Upload,
  Search, Bell, Eye, EyeOff, Globe, ChevronRight
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

const DEFAULTS = {
  header: {
    appName: "Shnoor International LLC SAAS",
    title: "Next Generation HR Management For Your Company",
    subtitle: "Grow Your Business With SHNOOR INTERNATIONAL LLC",
    description: "Best-rated HR management application for small to large scale business.",
    btn1Text: "Get Started", btn1Url: "/register",
    btn2Text: "View Features", btn2Url: "/features",
    showBtn1: "true", showBtn2: "true",
  },
  footer: {
    companyName: "Shnoor International LLC",
    tagline: "Next-gen HR management for modern businesses.",
    email: "support@shnoor.com", phone: "+91 98765 43210",
    address: "Business Bay, Dubai / Kuppam, India",
    copyright: "© 2025 Shnoor International LLC. All rights reserved.",
    logo: "",
  },
  contact: {
    title: "Get in Touch",
    subtitle: "Have questions about our HR modules? Our team is ready to help.",
    email: "support@shnoor.com", phone: "+91 98765 43210",
    address: "Business Bay, Dubai / Kuppam, India",
  },
  pricing: {
    title: "Simple, Scalable Pricing",
    subtitle: "Choose the plan that fits your company's growth.",
    plan1Name: "Basic", plan1Price: "10",
    plan2Name: "Pro", plan2Price: "25",
    plan3Name: "Enterprise", plan3Price: "50",
  },
  features: {
    title: "Platform Capabilities",
    subtitle: "Everything you need to manage a modern workforce efficiently.",
  },
};

const navItems = [
  { key: "header",   label: "Header",   desc: "Hero section & buttons",  icon: <Layout size={16} />,  color: "#4F46E5", bg: "#EEF2FF" },
  { key: "footer",   label: "Footer",   desc: "Logo, links & copyright", icon: <Type size={16} />,    color: "#059669", bg: "#ECFDF5" },
  { key: "contact",  label: "Contact",  desc: "Contact page details",    icon: <Phone size={16} />,   color: "#0891B2", bg: "#ECFEFF" },
  { key: "pricing",  label: "Pricing",  desc: "Plans & pricing table",   icon: <Tag size={16} />,     color: "#D97706", bg: "#FFFBEB" },
  { key: "features", label: "Features", desc: "Feature section copy",    icon: <Star size={16} />,    color: "#7C3AED", bg: "#F5F3FF" },
];

function Field({ label, name, value, onChange, type = "text", rows, hint }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <div style={{ marginBottom: "18px" }}>
      <label style={{
        display: "block", fontSize: "0.72rem", fontWeight: "600",
        color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.5px",
        marginBottom: "6px",
      }}>{label}</label>
      {rows ? (
        <textarea
          name={name} value={value || ""} onChange={onChange} rows={rows}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            display: "block", width: "100%", padding: "9px 12px",
            border: `1.5px solid ${focused ? "#4F46E5" : "#E5E7EB"}`,
            borderRadius: "9px", fontSize: "0.875rem", color: "#374151",
            backgroundColor: "#F9FAFB", resize: "vertical", lineHeight: 1.6,
            boxShadow: focused ? "0 0 0 3px rgba(79,70,229,0.10)" : "none",
            transition: "border-color 0.18s, box-shadow 0.18s",
            outline: "none",
          }}
        />
      ) : (
        <input
          type={type} name={name} value={value || ""} onChange={onChange}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            display: "block", width: "100%", padding: "9px 12px",
            border: `1.5px solid ${focused ? "#4F46E5" : "#E5E7EB"}`,
            borderRadius: "9px", fontSize: "0.875rem", color: "#374151",
            backgroundColor: "#F9FAFB",
            boxShadow: focused ? "0 0 0 3px rgba(79,70,229,0.10)" : "none",
            transition: "border-color 0.18s, box-shadow 0.18s",
            outline: "none",
          }}
        />
      )}
      {hint && <p style={{ fontSize: "0.72rem", color: "#9CA3AF", margin: "5px 0 0" }}>{hint}</p>}
    </div>
  );
}

function SectionDivider({ label, color = "#4F46E5", bg = "#EEF2FF" }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "10px",
      margin: "24px 0 16px",
    }}>
      <span style={{
        fontSize: "0.72rem", fontWeight: "700", color, textTransform: "uppercase",
        letterSpacing: "0.6px", padding: "3px 10px", borderRadius: "20px",
        background: bg,
      }}>{label}</span>
      <div style={{ flex: 1, height: "1px", background: "#F1F3F9" }} />
    </div>
  );
}

function Toggle({ label, name, value, onChange, hint }) {
  const isOn = value === "true" || value === true;
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      marginBottom: "16px", padding: "12px 16px",
      background: "#FAFBFF", borderRadius: "10px",
      border: "1.5px solid #F1F3F9",
    }}>
      <div>
        <span style={{ fontSize: "0.875rem", color: "#374151", fontWeight: "500" }}>{label}</span>
        {hint && <p style={{ fontSize: "0.72rem", color: "#9CA3AF", margin: "2px 0 0" }}>{hint}</p>}
      </div>
      <div
        onClick={() => onChange({ target: { name, value: isOn ? "false" : "true" } })}
        style={{
          width: "44px", height: "24px", borderRadius: "12px", cursor: "pointer",
          background: isOn ? "#4F46E5" : "#D1D5DB",
          position: "relative", transition: "background 0.2s", flexShrink: 0,
        }}
      >
        <div style={{
          position: "absolute", top: "3px",
          left: isOn ? "23px" : "3px",
          width: "18px", height: "18px", borderRadius: "50%",
          background: "#fff", transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }} />
      </div>
    </div>
  );
}

function LogoUpload({ currentLogo, onChange }) {
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("Logo must be under 2MB"); return; }
    const reader = new FileReader();
    reader.onload = () => onChange({ target: { name: "logo", value: reader.result } });
    reader.readAsDataURL(file);
  };
  return (
    <div style={{ marginBottom: "20px" }}>
      <label style={{
        display: "block", fontSize: "0.72rem", fontWeight: "600",
        color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px",
      }}>Logo Image</label>
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <div style={{ position: "relative" }}>
          {currentLogo ? (
            <img src={currentLogo} alt="logo" style={{ width: "68px", height: "68px", objectFit: "cover", borderRadius: "50%", border: "3px solid #E0E7FF" }} />
          ) : (
            <div style={{ width: "68px", height: "68px", borderRadius: "50%", background: "#F9FAFB", border: "2px dashed #D1D5DB", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Upload size={20} color="#9CA3AF" />
            </div>
          )}
          {currentLogo && (
            <div style={{ position: "absolute", bottom: 0, right: 0, width: "22px", height: "22px", background: "#4F46E5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>
              <Upload size={10} color="#fff" />
            </div>
          )}
        </div>
        <div>
          <label style={{
            display: "inline-flex", alignItems: "center", gap: "7px",
            padding: "9px 16px", background: "#F9FAFB",
            border: "1.5px solid #E5E7EB", borderRadius: "9px",
            cursor: "pointer", fontSize: "0.875rem", color: "#374151",
            fontWeight: "500",
          }}>
            <Upload size={14} color="#4F46E5" />
            {currentLogo ? "Change Logo" : "Upload Logo"}
            <input type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
          </label>
          <p style={{ fontSize: "0.72rem", color: "#9CA3AF", marginTop: "6px", marginBottom: 0 }}>
            PNG, JPG or SVG · Max 2MB · Displayed as circle
          </p>
        </div>
      </div>
    </div>
  );
}

function HeaderForm({ data, onChange }) {
  return (
    <>
      <SectionDivider label="Basic Settings" color="#4F46E5" bg="#EEF2FF" />
      <Field label="App Name" name="appName" value={data.appName} onChange={onChange} />
      <SectionDivider label="Hero Section" color="#4F46E5" bg="#EEF2FF" />
      <Field label="Headline Title" name="title" value={data.title} onChange={onChange} />
      <Field label="Sub Title" name="subtitle" value={data.subtitle} onChange={onChange} />
      <Field label="Description" name="description" value={data.description} onChange={onChange} rows={3} />
      <SectionDivider label="Call-to-Action Buttons" color="#4F46E5" bg="#EEF2FF" />
      <Toggle label="Show Button 1" name="showBtn1" value={data.showBtn1} onChange={onChange} hint="Primary CTA button in the hero" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        <Field label="Button 1 Text" name="btn1Text" value={data.btn1Text} onChange={onChange} />
        <Field label="Button 1 URL"  name="btn1Url"  value={data.btn1Url}  onChange={onChange} />
      </div>
      <Toggle label="Show Button 2" name="showBtn2" value={data.showBtn2} onChange={onChange} hint="Secondary CTA button in the hero" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        <Field label="Button 2 Text" name="btn2Text" value={data.btn2Text} onChange={onChange} />
        <Field label="Button 2 URL"  name="btn2Url"  value={data.btn2Url}  onChange={onChange} />
      </div>
    </>
  );
}

function FooterForm({ data, onChange }) {
  return (
    <>
      <LogoUpload currentLogo={data.logo || ""} onChange={onChange} />
      <SectionDivider label="Company Info" color="#059669" bg="#ECFDF5" />
      <Field label="Company Name" name="companyName" value={data.companyName} onChange={onChange} />
      <Field label="Tagline" name="tagline" value={data.tagline} onChange={onChange} />
      <SectionDivider label="Contact Details" color="#059669" bg="#ECFDF5" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        <Field label="Email" name="email" value={data.email} onChange={onChange} />
        <Field label="Phone" name="phone" value={data.phone} onChange={onChange} />
      </div>
      <Field label="Address" name="address" value={data.address} onChange={onChange} />
      <Field label="Copyright Text" name="copyright" value={data.copyright} onChange={onChange} hint="Shown at the bottom of the footer" />
    </>
  );
}

function ContactForm({ data, onChange }) {
  return (
    <>
      <SectionDivider label="Page Copy" color="#0891B2" bg="#ECFEFF" />
      <Field label="Page Title" name="title" value={data.title} onChange={onChange} />
      <Field label="Subtitle" name="subtitle" value={data.subtitle} onChange={onChange} rows={2} />
      <SectionDivider label="Contact Information" color="#0891B2" bg="#ECFEFF" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        <Field label="Email" name="email" value={data.email} onChange={onChange} />
        <Field label="Phone" name="phone" value={data.phone} onChange={onChange} />
      </div>
      <Field label="Address" name="address" value={data.address} onChange={onChange} />
    </>
  );
}

function PricingForm({ data, onChange }) {
  const plans = [
    { key: "1", label: "Plan 1 — Basic",      nameKey: "plan1Name", priceKey: "plan1Price", color: "#4F46E5", bg: "#EEF2FF" },
    { key: "2", label: "Plan 2 — Pro",         nameKey: "plan2Name", priceKey: "plan2Price", color: "#059669", bg: "#ECFDF5" },
    { key: "3", label: "Plan 3 — Enterprise",  nameKey: "plan3Name", priceKey: "plan3Price", color: "#D97706", bg: "#FFFBEB" },
  ];
  return (
    <>
      <SectionDivider label="Page Copy" color="#D97706" bg="#FFFBEB" />
      <Field label="Page Title" name="title" value={data.title} onChange={onChange} />
      <Field label="Subtitle" name="subtitle" value={data.subtitle} onChange={onChange} />
      {plans.map((p) => (
        <React.Fragment key={p.key}>
          <SectionDivider label={p.label} color={p.color} bg={p.bg} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <Field label="Plan Name"    name={p.nameKey}  value={data[p.nameKey]}  onChange={onChange} />
            <Field label="Price ($/mo)" name={p.priceKey} value={data[p.priceKey]} onChange={onChange} type="number" />
          </div>
        </React.Fragment>
      ))}
    </>
  );
}

function FeaturesForm({ data, onChange }) {
  return (
    <>
      <SectionDivider label="Section Copy" color="#7C3AED" bg="#F5F3FF" />
      <Field label="Section Title" name="title" value={data.title} onChange={onChange} />
      <Field label="Subtitle" name="subtitle" value={data.subtitle} onChange={onChange} rows={2} />
    </>
  );
}

const FORMS = { header: HeaderForm, footer: FooterForm, contact: ContactForm, pricing: PricingForm, features: FeaturesForm };


export default function WebsiteSettingsPage() {
  const [activeSection, setActiveSection] = useState("header");
  const [allData, setAllData]             = useState({});
  const [saving, setSaving]               = useState(false);
  const [toast, setToast]                 = useState(null);
  const [isOpen, setIsOpen]               = useState(true);

  const name = localStorage.getItem("name") || "Admin";
  const token = localStorage.getItem("token");
  const headers = { "x-auth-token": token };
  const sidebarWidth = isOpen ? 255 : 68;
  const activeNav = navItems.find((n) => n.key === activeSection);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API}/api/website-settings`, { headers });
        if (res.data.success) {
          const fetched = res.data.data || {};
          const merged = {};
          for (const section of Object.keys(DEFAULTS)) {
            merged[section] = { ...DEFAULTS[section], ...(fetched[section] || {}) };
          }
          setAllData(merged);
        }
      } catch (err) {
        setAllData(DEFAULTS);
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAllData((prev) => ({
      ...prev,
      [activeSection]: { ...(prev[activeSection] || {}), [name]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/api/website-settings/${activeSection}`, allData[activeSection] || {}, { headers });
      showToast("Settings saved successfully!", "success");
    } catch (err) {
      showToast("Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const ActiveForm  = FORMS[activeSection];
  const sectionData = allData[activeSection] || DEFAULTS[activeSection] || {};

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F9FAFB", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        .nav-item { transition: background 0.14s, color 0.14s; }
        .nav-item:hover { background: #F5F7FF !important; }
        .save-btn { transition: background 0.18s, transform 0.12s, box-shadow 0.18s; }
        .save-btn:hover:not(:disabled) { background: #4338CA !important; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(79,70,229,0.3); }
        .topbar-btn:hover { background: #F3F4F6 !important; }
        * { box-sizing: border-box; }
      `}</style>
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: toast.type === "error" ? "#EF4444" : "#059669",
          color: "#fff", padding: "12px 18px", borderRadius: "10px",
          fontWeight: 500, fontSize: "0.875rem",
          display: "flex", alignItems: "center", gap: "8px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          animation: "slideIn 0.25s ease both",
        }}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}

      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <div style={{
        marginLeft: `${sidebarWidth}px`,
        flex: 1, transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column", minHeight: "100vh",
      }}>
        <div style={{
          height: "64px", backgroundColor: "#fff",
          borderBottom: "1px solid #F1F3F9",
          display: "flex", alignItems: "center",
          padding: "0 28px", gap: "16px",
          position: "sticky", top: 0, zIndex: 100,
          boxShadow: "0 1px 4px rgba(15,23,42,0.04)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.82rem", color: "#9CA3AF" }}>Dashboard</span>
            <ChevronRight size={13} color="#D1D5DB" />
            <span style={{ fontSize: "0.82rem", color: "#9CA3AF" }}>Website Settings</span>
            <ChevronRight size={13} color="#D1D5DB" />
            <span style={{ fontSize: "0.82rem", color: "#4F46E5", fontWeight: "600" }}>{activeNav?.label}</span>
          </div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
            <button className="topbar-btn" style={{
              width: "38px", height: "38px", borderRadius: "10px",
              border: "1.5px solid #E5E7EB", background: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#6B7280",
            }}>
              <Bell size={17} />
            </button>
            <div style={{
              display: "flex", alignItems: "center", gap: "9px",
              padding: "5px 12px 5px 6px",
              border: "1.5px solid #E5E7EB", borderRadius: "10px",
              background: "#fff", cursor: "pointer",
            }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: "0.72rem", fontWeight: "600",
              }}>
                {name.slice(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: "0.83rem", fontWeight: "500", color: "#374151" }}>{name}</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
          <div style={{
            width: "220px", background: "#fff",
            borderRight: "1px solid #F1F3F9",
            padding: "20px 0", flexShrink: 0,
            animation: "fadeUp 0.4s ease both 0.05s",
          }}>
            <div style={{ padding: "0 16px 14px", borderBottom: "1px solid #F1F3F9", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "30px", height: "30px", borderRadius: "8px",
                  background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Globe size={14} color="#fff" />
                </div>
                <div>
                  <p style={{ fontSize: "0.78rem", fontWeight: "700", color: "#111827", margin: 0 }}>Website</p>
                  <p style={{ fontSize: "0.68rem", color: "#9CA3AF", margin: 0 }}>Public settings</p>
                </div>
              </div>
            </div>

            {navItems.map((item) => {
              const active = item.key === activeSection;
              return (
                <button
                  key={item.key}
                  className="nav-item"
                  onClick={() => setActiveSection(item.key)}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    width: "100%", padding: "10px 16px",
                    background: active ? "#EEF2FF" : "transparent",
                    border: "none",
                    borderLeft: `3px solid ${active ? "#4F46E5" : "transparent"}`,
                    color: active ? "#4F46E5" : "#6B7280",
                    fontWeight: active ? "600" : "400",
                    fontSize: "0.855rem", cursor: "pointer", textAlign: "left",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "7px",
                    background: active ? item.bg : "#F9FAFB",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: active ? item.color : "#9CA3AF", flexShrink: 0,
                    transition: "background 0.14s",
                  }}>
                    {item.icon}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ lineHeight: 1.2 }}>{item.label}</div>
                    <div style={{ fontSize: "0.68rem", color: active ? "#818CF8" : "#9CA3AF", fontWeight: 400 }}>
                      {item.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div style={{ flex: 1, padding: "28px", overflowY: "auto", animation: "fadeUp 0.4s ease both 0.12s" }}>
            <div style={{ maxWidth: "720px" }}>
              <div style={{ marginBottom: "24px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{
                    width: "44px", height: "44px", borderRadius: "11px",
                    background: activeNav?.bg || "#EEF2FF",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: activeNav?.color || "#4F46E5",
                  }}>
                    {activeNav?.icon}
                  </div>
                  <div>
                    <h1 style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "1.5rem", fontWeight: "700",
                      color: "#111827", margin: 0, lineHeight: 1.2,
                    }}>
                      {activeNav?.label} Settings
                    </h1>
                    <p style={{ color: "#9CA3AF", fontSize: "0.82rem", margin: "4px 0 0" }}>
                      Changes here reflect live on the public website
                    </p>
                  </div>
                </div>

                <button
                  className="save-btn"
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    display: "flex", alignItems: "center", gap: "7px",
                    padding: "10px 20px",
                    background: saving ? "#A5B4FC" : "#4F46E5",
                    color: "#fff", border: "none", borderRadius: "9px",
                    fontWeight: "600", fontSize: "0.875rem",
                    cursor: saving ? "not-allowed" : "pointer",
                    flexShrink: 0, fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <Save size={15} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
              <div style={{
                backgroundColor: "#fff", borderRadius: "14px",
                border: "1px solid #F1F3F9",
                boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
                padding: "24px 28px",
              }}>
                {ActiveForm && <ActiveForm data={sectionData} onChange={handleChange} />}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
                <button
                  className="save-btn"
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    display: "flex", alignItems: "center", gap: "7px",
                    padding: "10px 20px",
                    background: saving ? "#A5B4FC" : "#4F46E5",
                    color: "#fff", border: "none", borderRadius: "9px",
                    fontWeight: "600", fontSize: "0.875rem",
                    cursor: saving ? "not-allowed" : "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <Save size={15} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
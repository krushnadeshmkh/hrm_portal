import React, { useState } from "react";
import Sidebar from "../../../layouts/Sidebar";
import { Save, ChevronDown, ChevronUp, Type, Layout, DollarSign, Star } from "lucide-react";

const Section = ({ title, icon, children }) => {
  const [open, setOpen] = useState(true);

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div
        className="card-header bg-white d-flex justify-content-between align-items-center py-3 px-4"
        style={{ cursor: "pointer", borderBottom: open ? "1px solid #f0f0f0" : "none" }}
        onClick={() => setOpen(!open)}
      >
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted">{icon}</span>
          <h6 className="mb-0 fw-semibold text-dark">{title}</h6>
        </div>
        {open ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
      </div>
      {open && <div className="card-body px-4 py-4">{children}</div>}
    </div>
  );
};

const SuperadminSettingsPage = () => {
  const [saved, setSaved] = useState(false);

  // Header
  const [header, setHeader] = useState({
    logo_text: "SHNOOR INTERNATIONAL LLC",
    nav_links: "Home, Features, Pricing, Contact",
    show_login_btn: true,
    show_register_btn: true,
  });

  // Footer
  const [footer, setFooter] = useState({
    company_name: "Shnoor International LLC",
    tagline: "Empowering HR globally.",
    copyright_year: "2025",
    show_social_links: true,
    footer_links: "Privacy Policy, Terms of Service, Support",
  });

  // Pricing
  const [pricing, setPricing] = useState({
    basic_price: "10",
    pro_price: "25",
    enterprise_price: "50",
    currency: "USD",
    billing_cycle: "monthly",
    highlight_plan: "Pro",
  });

  // Features
  const [features, setFeatures] = useState({
    feature_1: "Smart Payroll",
    feature_2: "Advanced Security",
    feature_3: "Real-time Analytics",
    feature_4: "Employee Self-Service",
    feature_5: "Mobile Ready",
    feature_6: "Compliance",
    section_title: "Platform Capabilities",
    section_subtitle: "Everything you need to manage a modern workforce efficiently.",
  });

  const handleSave = () => {
    // would POST to backend in real use
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="d-flex bg-light min-vh-100">
      <Sidebar />
      <div className="p-4" style={{ marginLeft: "250px", flex: 1 }}>

        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h2 className="fw-bold text-dark mb-1">Site Settings</h2>
            <p className="text-muted small mb-0">Control header, footer, pricing, and features displayed on the public site.</p>
          </div>
          <button
            onClick={handleSave}
            className={`btn fw-semibold d-flex align-items-center gap-2 px-4 ${saved ? "btn-success" : "btn-danger"}`}
          >
            <Save size={16} />
            {saved ? "Saved!" : "Save All Changes"}
          </button>
        </div>

        {/* Header Settings */}
        <Section title="Header Settings" icon={<Layout size={18} />}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small text-muted fw-semibold">Logo / Brand Name</label>
              <input
                type="text"
                className="form-control"
                value={header.logo_text}
                onChange={e => setHeader({ ...header, logo_text: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small text-muted fw-semibold">Nav Links (comma separated)</label>
              <input
                type="text"
                className="form-control"
                value={header.nav_links}
                onChange={e => setHeader({ ...header, nav_links: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <div className="form-check form-switch mt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="loginBtn"
                  checked={header.show_login_btn}
                  onChange={e => setHeader({ ...header, show_login_btn: e.target.checked })}
                />
                <label className="form-check-label small" htmlFor="loginBtn">Show Login Button</label>
              </div>
            </div>
            <div className="col-md-3">
              <div className="form-check form-switch mt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="registerBtn"
                  checked={header.show_register_btn}
                  onChange={e => setHeader({ ...header, show_register_btn: e.target.checked })}
                />
                <label className="form-check-label small" htmlFor="registerBtn">Show Register Button</label>
              </div>
            </div>
          </div>
        </Section>

        {/* Footer Settings */}
        <Section title="Footer Settings" icon={<Type size={18} />}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small text-muted fw-semibold">Company Name</label>
              <input
                type="text"
                className="form-control"
                value={footer.company_name}
                onChange={e => setFooter({ ...footer, company_name: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small text-muted fw-semibold">Tagline</label>
              <input
                type="text"
                className="form-control"
                value={footer.tagline}
                onChange={e => setFooter({ ...footer, tagline: e.target.value })}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label small text-muted fw-semibold">Copyright Year</label>
              <input
                type="text"
                className="form-control"
                value={footer.copyright_year}
                onChange={e => setFooter({ ...footer, copyright_year: e.target.value })}
              />
            </div>
            <div className="col-md-8">
              <label className="form-label small text-muted fw-semibold">Footer Links (comma separated)</label>
              <input
                type="text"
                className="form-control"
                value={footer.footer_links}
                onChange={e => setFooter({ ...footer, footer_links: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <div className="form-check form-switch mt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="socialLinks"
                  checked={footer.show_social_links}
                  onChange={e => setFooter({ ...footer, show_social_links: e.target.checked })}
                />
                <label className="form-check-label small" htmlFor="socialLinks">Show Social Links</label>
              </div>
            </div>
          </div>
        </Section>

        {/* Pricing Settings */}
        <Section title="Pricing Settings" icon={<DollarSign size={18} />}>
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label small text-muted fw-semibold">Basic Plan Price</label>
              <div className="input-group">
                <span className="input-group-text">$</span>
                <input
                  type="number"
                  className="form-control"
                  value={pricing.basic_price}
                  onChange={e => setPricing({ ...pricing, basic_price: e.target.value })}
                />
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted fw-semibold">Pro Plan Price</label>
              <div className="input-group">
                <span className="input-group-text">$</span>
                <input
                  type="number"
                  className="form-control"
                  value={pricing.pro_price}
                  onChange={e => setPricing({ ...pricing, pro_price: e.target.value })}
                />
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted fw-semibold">Enterprise Plan Price</label>
              <div className="input-group">
                <span className="input-group-text">$</span>
                <input
                  type="number"
                  className="form-control"
                  value={pricing.enterprise_price}
                  onChange={e => setPricing({ ...pricing, enterprise_price: e.target.value })}
                />
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted fw-semibold">Currency</label>
              <select
                className="form-select"
                value={pricing.currency}
                onChange={e => setPricing({ ...pricing, currency: e.target.value })}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="INR">INR (₹)</option>
                <option value="AED">AED (د.إ)</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label small text-muted fw-semibold">Billing Cycle</label>
              <select
                className="form-select"
                value={pricing.billing_cycle}
                onChange={e => setPricing({ ...pricing, billing_cycle: e.target.value })}
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label small text-muted fw-semibold">Highlighted Plan</label>
              <select
                className="form-select"
                value={pricing.highlight_plan}
                onChange={e => setPricing({ ...pricing, highlight_plan: e.target.value })}
              >
                <option value="Basic">Basic</option>
                <option value="Pro">Pro</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>
          </div>
        </Section>

        {/* Features Settings */}
        <Section title="Features Settings" icon={<Star size={18} />}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small text-muted fw-semibold">Section Title</label>
              <input
                type="text"
                className="form-control"
                value={features.section_title}
                onChange={e => setFeatures({ ...features, section_title: e.target.value })}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small text-muted fw-semibold">Section Subtitle</label>
              <input
                type="text"
                className="form-control"
                value={features.section_subtitle}
                onChange={e => setFeatures({ ...features, section_subtitle: e.target.value })}
              />
            </div>

            <div className="col-12 mt-2">
              <p className="text-muted small fw-semibold mb-2">Feature Labels</p>
              <div className="row g-2">
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <div key={n} className="col-md-4">
                    <div className="input-group input-group-sm">
                      <span className="input-group-text text-muted">#{n}</span>
                      <input
                        type="text"
                        className="form-control"
                        value={features[`feature_${n}`]}
                        onChange={e => setFeatures({ ...features, [`feature_${n}`]: e.target.value })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

      </div>
    </div>
  );
};

export default SuperadminSettingsPage;
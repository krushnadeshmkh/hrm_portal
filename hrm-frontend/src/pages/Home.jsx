import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../layouts/Navbar";
import Footer from "../layouts/Footer";
import {
  CreditCard, Clock, MapPin, FileText, Globe,
  ArrowRight, ShieldCheck, Star, ArrowUpRight,
  Building2, Users, CheckCircle2, Zap,
} from "lucide-react";
import { useWebsiteSettings } from "../hook/useWebsiteSettings";
import "./home.css"

const featureCards = [
  { title: "Payroll Processing",  desc: "One-click automated payroll generation.",    icon: <CreditCard size={20} />,   color: "#4F46E5", bg: "#EEF2FF" },
  { title: "Global Locations",    desc: "Manage staff across multiple branches.",      icon: <MapPin size={20} />,       color: "#0891B2", bg: "#ECFEFF" },
  { title: "Letterheads",         desc: "Generate professional dynamic documents.",    icon: <FileText size={20} />,     color: "#D97706", bg: "#FFFBEB" },
  { title: "Leave Management",    desc: "Track and approve employee time off.",        icon: <ShieldCheck size={20} />,  color: "#059669", bg: "#ECFDF5" },
  { title: "Attendance",          desc: "Real-time employee clock-in tracking.",       icon: <Clock size={20} />,        color: "#7C3AED", bg: "#F5F3FF" },
  { title: "Multi-Language",      desc: "Localized support for global teams.",         icon: <Globe size={20} />,        color: "#DB2777", bg: "#FDF2F8" },
];

const stats = [
  { label: "Active Users",  value: "10k+",  color: "#4F46E5", bg: "#EEF2FF",  icon: <Users size={20} /> },
  { label: "Companies",     value: "500+",  color: "#059669", bg: "#ECFDF5",  icon: <Building2 size={20} /> },
  { label: "Support",       value: "24/7",  color: "#0891B2", bg: "#ECFEFF",  icon: <CheckCircle2 size={20} /> },
  { label: "Uptime",        value: "99.9%", color: "#D97706", bg: "#FFFBEB",  icon: <Zap size={20} /> },
];

const Home = () => {
  const { data: s } = useWebsiteSettings("header");
  const btn1Show = s?.showBtn1 !== "false";
  const btn2Show = s?.showBtn2 !== "false";

  return (
    <>
      <div className="shn-home">
        <Navbar />
        <section className="shn-hero">
          <div className="shn-container">
            <div className="shn-hero-grid" style={{ animation: "fadeUp 0.4s ease both 0.05s" }}>
              <div>
                <div className="shn-label">
                  {s?.subtitle || "Grow Your Business With Shnoor International LLC"}
                </div>

                <h1 className="shn-hero-title">
                  {s?.title
                    ? <>{s.title.split(" ").slice(0, 3).join(" ")}<br /><span>{s.title.split(" ").slice(3).join(" ")}</span></>
                    : <>Next Generation HR<br /><span>Management System</span></>
                  }
                </h1>

                <p className="shn-hero-desc">
                  {s?.description || "Streamline your workflow with automated payroll, real-time attendance tracking, and centralized employee management."}
                </p>

                <div className="shn-hero-actions">
                  {btn1Show && (
                    <Link to={s?.btn1Url || "/register"} className="shn-btn-primary">
                      {s?.btn1Text || "Get Started"} <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  )}
                  {btn2Show && (
                    <Link to={s?.btn2Url || "/features"} className="shn-btn-outline">
                      {s?.btn2Text || "View Features"}
                    </Link>
                  )}
                </div>
              </div>

              <div className="shn-features-grid">
                {featureCards.map((feature, index) => (
                  <div
                    key={index}
                    className="shn-feature-card"
                    style={{ animation: `fadeUp 0.4s ease both ${0.1 + index * 0.07}s` }}
                  >
                    <div
                      className="shn-feature-icon"
                      style={{ backgroundColor: feature.bg, color: feature.color }}
                      aria-hidden="true"
                    >
                      {feature.icon}
                    </div>
                    <div>
                      <p className="shn-feature-title">{feature.title}</p>
                      <p className="shn-feature-desc">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section className="shn-section-sm" style={{ background: "#F9FAFB" }}>
          <div className="shn-container">
            <div className="shn-stats-grid">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="shn-stat-card"
                  style={{ animation: `fadeUp 0.4s ease both ${0.1 + idx * 0.07}s` }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div
                      style={{
                        width: "42px", height: "42px", borderRadius: "11px",
                        backgroundColor: stat.bg, color: stat.color,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                      aria-hidden="true"
                    >
                      {stat.icon}
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: "0.72rem", color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px", margin: "0 0 4px" }}>
                      {stat.label}
                    </p>
                    <p className="shn-stat-value">{stat.value}</p>
                  </div>
                  <div className="shn-stat-trend">
                    <ArrowUpRight size={13} aria-hidden="true" /> Growing
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <hr className="shn-divider" />
        <section className="shn-section" style={{ background: "#fff" }}>
          <div className="shn-container">
            <div className="shn-about-grid">
              <div style={{ animation: "fadeUp 0.4s ease both 0.1s" }}>
                <div className="shn-label">About Us</div>
                <h2 className="shn-section-title">About Shnoor International LLC</h2>
                <p className="shn-section-body">
                  SHNOOR INTERNATIONAL LLC has been formed to work progressively in the field of various IT needs focusing primarily on IT Consulting &amp; Staffing, IT Product Development, Application Designing &amp; Development, SAP Outsourcing, Import &amp; Exports of various products from India to United Arab Emirates, Bahrain, Qatar, Oman &amp; Malaysia.
                </p>
                <p className="shn-section-body">
                  We deal reasonably with producers, farmers, wholesalers, importers, and other stakeholders to establish a strong global presence in international trade.
                </p>
                <p className="shn-section-body">
                  Headquartered in <span className="shn-highlight">MUSCAT – Oman</span>, we specialize in import and export of quality products from India to the UAE, Bahrain, Qatar, Oman, and Malaysia — building strong global trade partnerships.
                </p>
              </div>

              <div className="shn-info-card" style={{ animation: "fadeUp 0.4s ease both 0.2s" }}>
                <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 20px" }}>
                  What We Do
                </p>
                {[
                  { title: "IT Consulting & Staffing", desc: "End-to-end tech talent and advisory services." },
                  { title: "Product Development", desc: "Custom applications tailored to your business." },
                  { title: "SAP Outsourcing", desc: "Expert SAP implementation and support." },
                  { title: "International Trade", desc: "Import & export between India and GCC nations." },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: "12px",
                      padding: "12px 0",
                      borderBottom: i < 3 ? "1px solid #F9FAFB" : "none",
                    }}
                  >
                    <div style={{
                      width: "8px", height: "8px", borderRadius: "50%",
                      background: "#4F46E5", marginTop: "6px", flexShrink: 0,
                    }} aria-hidden="true" />
                    <div>
                      <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827", margin: "0 0 2px" }}>{item.title}</p>
                      <p style={{ fontSize: "0.8rem", color: "#9CA3AF", margin: 0 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <hr className="shn-divider" />
        <section className="shn-section" style={{ background: "#F9FAFB" }}>
          <div className="shn-container">
            <div style={{ maxWidth: "760px", animation: "fadeUp 0.4s ease both 0.1s" }}>
              <div className="shn-label">Our Vision</div>
              <h2 className="shn-section-title">Connecting Technology And Trade Together</h2>
              <p className="shn-section-body">
                At SHNOOR International LLC, we believe innovation should have no borders. Our unique approach combines cutting-edge IT solutions with seamless global trade services, helping businesses thrive in both the digital space and the global marketplace.
              </p>
              <p className="shn-section-body">
                From IT Consulting, Product Development, Application Design, and SAP Outsourcing to the import and export of premium products between India and the UAE, Bahrain, Qatar, Oman, and Malaysia — we are your single partner for growth.
              </p>
              <p className="shn-section-body" style={{ marginBottom: 0 }}>
                By blending technological expertise with international trade experience, we empower organizations to innovate faster, operate smarter, and reach new markets with confidence.
              </p>
            </div>
          </div>
        </section>

        <hr className="shn-divider" />
        <section className="shn-section" style={{ background: "#fff" }}>
          <div className="shn-container">
            <div className="shn-testimonial" style={{ animation: "fadeUp 0.4s ease both 0.1s" }}>
              <div className="shn-stars" aria-label="5 stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} color="#F59E0B" fill="#F59E0B" aria-hidden="true" />
                ))}
              </div>

              <p className="shn-testimonial-text">
                "Working with SHNOOR International LLC has been a game-changer for our business. Their IT consulting team understood our requirements perfectly and delivered a custom solution that improved our efficiency by leaps and bounds. On top of that, their import services were smooth, reliable, and hassle-free. It's rare to find a partner who excels in both technology and trade — SHNOOR does it effortlessly."
              </p>

              <div className="shn-testimonial-avatar" aria-hidden="true">AK</div>
              <p className="shn-testimonial-name">Amita Khanna — Delivery Head</p>
              <p className="shn-testimonial-role">SF Technologies · Singapore</p>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Home;
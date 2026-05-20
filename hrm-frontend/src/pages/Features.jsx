import React from "react";
import Navbar from "../layouts/Navbar";
import Footer from "../layouts/Footer";
import { CheckCircle, Zap, Shield, BarChart3, Users, Smartphone, ArrowUpRight } from "lucide-react";
import { useWebsiteSettings } from "../hook/useWebsiteSettings";
import "./features.css"

const featureList = [
  {
    title: "Smart Payroll",
    desc: "Automated tax calculations and direct deposits with zero manual effort.",
    icon: <Zap size={20} />,
    color: "#D97706",
    bg: "#FFFBEB",
    trend: "Saves 8 hrs/month",
  },
  {
    title: "Advanced Security",
    desc: "Enterprise-grade encryption protecting all employee data end-to-end.",
    icon: <Shield size={20} />,
    color: "#059669",
    bg: "#ECFDF5",
    trend: "SOC2 compliant",
  },
  {
    title: "Real-time Analytics",
    desc: "Visual insights into turnover, attendance, and workforce performance.",
    icon: <BarChart3 size={20} />,
    color: "#0891B2",
    bg: "#ECFEFF",
    trend: "Live dashboards",
  },
  {
    title: "Employee Self-Service",
    desc: "Staff can manage their own leaves, profiles, and documents independently.",
    icon: <Users size={20} />,
    color: "#4F46E5",
    bg: "#EEF2FF",
    trend: "Reduces HR load",
  },
  {
    title: "Mobile Ready",
    desc: "Clock-in and clock-out seamlessly from any mobile device, anywhere.",
    icon: <Smartphone size={20} />,
    color: "#DB2777",
    bg: "#FDF2F8",
    trend: "iOS & Android",
  },
  {
    title: "Compliance",
    desc: "Stay updated with local labor laws and regulations automatically.",
    icon: <CheckCircle size={20} />,
    color: "#7C3AED",
    bg: "#F5F3FF",
    trend: "Auto-updated",
  },
];

const Features = () => {
  const { data: s } = useWebsiteSettings("features");

  const titleWords = s?.title ? s.title.split(" ") : ["Platform", "Capabilities"];
  const titleMain = titleWords.slice(0, -1).join(" ") || "Platform";
  const titleAccent = titleWords.slice(-1)[0] || "Capabilities";

  return (
    <>
      <div className="feat-page">
        <Navbar />

        <section className="feat-hero">
          <div className="feat-container" style={{ animation: "fadeUp 0.4s ease both 0.05s" }}>
            <div className="feat-label">Platform Features</div>
            <h1 className="feat-hero-title">
              {titleMain} <span>{titleAccent}</span>
            </h1>
            <p className="feat-hero-desc">
              {s?.subtitle || "Everything you need to manage a modern workforce efficiently."}
            </p>
          </div>
        </section>

        <section className="feat-section">
          <div className="feat-container">
            <div className="feat-grid">
              {featureList.map((f, i) => (
                <div
                  key={i}
                  className="feat-card"
                  style={{ animation: `fadeUp 0.4s ease both ${0.1 + i * 0.07}s` }}
                >
                  <div className="feat-card-top">
                    <div
                      className="feat-icon-box"
                      style={{ backgroundColor: f.bg, color: f.color }}
                      aria-hidden="true"
                    >
                      {f.icon}
                    </div>
                    <span className="feat-trend">
                      <ArrowUpRight size={11} aria-hidden="true" />
                      {f.trend}
                    </span>
                  </div>

                  <p className="feat-card-title">{f.title}</p>
                  <p className="feat-card-desc">{f.desc}</p>

                  <hr className="feat-card-divider" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="feat-cta">
          <div className="feat-container">
            <div className="feat-cta-inner" style={{ animation: "fadeUp 0.4s ease both 0.1s" }}>
              <div>
                <p className="feat-cta-title">Ready to get started?</p>
                <p className="feat-cta-desc">
                  Join 500+ companies already using Shnoor to manage their workforce smarter.
                </p>
              </div>
              <a href="/register" className="feat-btn-primary">
                Start for free <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Features;
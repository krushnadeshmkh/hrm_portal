import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../layouts/Navbar";
import Footer from "../layouts/Footer";
import { Check, Shield, Zap, Crown, ArrowRight } from "lucide-react";
import { useWebsiteSettings } from "../hook/useWebsiteSettings";
import "./pricing.css"

const planConfig = [
  {
    icon: Shield,
    color: "#059669",
    bg: "#ECFDF5",
    features: ["Employee Management", "Basic Attendance", "Email Support", "Single Location"],
  },
  {
    icon: Zap,
    color: "#4F46E5",
    bg: "#EEF2FF",
    features: ["Payroll Processing", "Attendance + GPS", "Leave Management", "Priority Support"],
  },
  {
    icon: Crown,
    color: "#D97706",
    bg: "#FFFBEB",
    features: ["Full Analytics", "Multi-Location Support", "Custom Letterheads", "24/7 Phone Support"],
  },
];

const Pricing = () => {
  const { data: s } = useWebsiteSettings("pricing");

  const plans = [
    { name: s?.plan1Name || "Basic",      price: s?.plan1Price || "10", popular: false },
    { name: s?.plan2Name || "Pro",        price: s?.plan2Price || "25", popular: true  },
    { name: s?.plan3Name || "Enterprise", price: s?.plan3Price || "50", popular: false },
  ];

  const titleWords = s?.title ? s.title.split(" ") : ["Simple", "Smart", "Pricing"];
  const titleMain   = titleWords.slice(0, -1).join(" ") || "Simple & Smart";
  const titleAccent = titleWords.slice(-1)[0] || "Pricing";

  return (
    <>
      <div className="price-page">
        <Navbar />

        <section className="price-hero">
          <div className="price-container" style={{ animation: "fadeUp 0.4s ease both 0.05s" }}>
            <div className="price-label">Plans & Pricing</div>
            <h1 className="price-hero-title">
              {titleMain} <span>{titleAccent}</span>
            </h1>
            <p className="price-hero-desc">
              {s?.subtitle || "Choose a plan that grows with your business"}
            </p>
          </div>
        </section>

        <section className="price-section">
          <div className="price-container">
            <div className="price-grid">
              {plans.map((plan, i) => {
                const cfg = planConfig[i];
                const Icon = cfg.icon;
                return (
                  <div
                    key={i}
                    className={`price-card${plan.popular ? " popular" : ""}`}
                    style={{ animation: `fadeUp 0.4s ease both ${0.1 + i * 0.08}s` }}
                  >
                    {plan.popular && (
                      <div className="price-popular-badge">Most Popular</div>
                    )}

                    <div
                      className="price-icon-box"
                      style={{ backgroundColor: cfg.bg, color: cfg.color }}
                      aria-hidden="true"
                    >
                      <Icon size={24} />
                    </div>

                    <p className="price-plan-name">{plan.name}</p>

                    <p className="price-amount">${plan.price}</p>
                    <p className="price-period">per month</p>

                    <hr className="price-divider" />

                    <ul className="price-features">
                      {cfg.features.map((feature, idx) => (
                        <li key={idx} className="price-feature-item">
                          <span className="price-check">
                            <Check size={12} color="#059669" strokeWidth={2.5} aria-hidden="true" />
                          </span>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Link
                      to="/register"
                      className={`price-btn${plan.popular ? " primary" : ""}`}
                    >
                      Choose {plan.name} <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="price-cta">
          <div className="price-container">
            <div className="price-cta-inner" style={{ animation: "fadeUp 0.4s ease both 0.1s" }}>
              <div>
                <p className="price-cta-title">Not sure which plan fits?</p>
                <p className="price-cta-desc">
                  Talk to our team and we will help you find the right fit for your business.
                </p>
              </div>
              <Link to="/contact" className="price-btn-cta">
                Contact Sales <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Pricing;
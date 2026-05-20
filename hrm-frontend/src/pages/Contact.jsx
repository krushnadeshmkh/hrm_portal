import React, { useState } from "react";
import Navbar from "../layouts/Navbar";
import Footer from "../layouts/Footer";
import { Mail, Phone, MapPin, Send, ArrowUpRight } from "lucide-react";
import { useWebsiteSettings } from "../hook/useWebsiteSettings";
import "./contact.css"

const Contact = () => {
  const { data: s } = useWebsiteSettings("contact");

  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", message: "" });
    }, 3000);
  };

  const titleWords = s?.title ? s.title.split(" ") : ["Get", "in", "Touch"];
  const titleMain   = titleWords.slice(0, -1).join(" ") || "Get in";
  const titleAccent = titleWords.slice(-1)[0] || "Touch";

  const contactItems = [
    {
      icon: Phone,
      label: "Call Support",
      value: s?.phone || "+91 98765 43210",
      color: "#4F46E5",
      bg: "#EEF2FF",
      valueColor: "#059669",
    },
    {
      icon: Mail,
      label: "Email Us",
      value: s?.email || "support@shnoor.com",
      color: "#4F46E5",
      bg: "#EEF2FF",
      valueColor: "#059669",
    },
    {
      icon: MapPin,
      label: "Head Office",
      value: s?.address || "Business Bay, Dubai / Kuppam, India",
      color: "#4F46E5",
      bg: "#EEF2FF",
      valueColor: "#6B7280",
    },
  ];

  return (
    <>
      <div className="contact-page">
        <Navbar />

        <section className="contact-hero">
          <div className="contact-container" style={{ animation: "fadeUp 0.4s ease both 0.05s" }}>
            <div className="contact-label">Contact Us</div>
            <h1 className="contact-hero-title">
              {titleMain} <span>{titleAccent}</span>
            </h1>
            <p className="contact-hero-desc">
              {s?.subtitle || "Have questions about our platform? Our team is ready to help your business grow."}
            </p>
          </div>
        </section>

        <section className="contact-section">
          <div className="contact-container">
            <div className="contact-grid">

              <div className="contact-info-stack" style={{ animation: "fadeUp 0.4s ease both 0.1s" }}>
                {contactItems.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="contact-info-card">
                      <div
                        className="contact-info-icon"
                        style={{ backgroundColor: item.bg, color: item.color }}
                        aria-hidden="true"
                      >
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="contact-info-label">{item.label}</p>
                        <p className="contact-info-value" style={{ color: item.valueColor }}>
                          {item.value}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="contact-form-card" style={{ animation: "fadeUp 0.4s ease both 0.18s" }}>
                <h2 className="contact-form-title">Send us a message</h2>

                {submitted && (
                  <div className="contact-success" role="alert">
                    <span className="contact-success-dot" aria-hidden="true" />
                    Message sent successfully. We will get back to you soon.
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  <div className="contact-field-row">
                    <div className="contact-field">
                      <label htmlFor="contact-name">Full Name</label>
                      <input
                        id="contact-name"
                        type="text"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        autoComplete="name"
                      />
                    </div>
                    <div className="contact-field">
                      <label htmlFor="contact-email">Email Address</label>
                      <input
                        id="contact-email"
                        type="email"
                        placeholder="you@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="contact-field">
                    <label htmlFor="contact-message">Message</label>
                    <textarea
                      id="contact-message"
                      rows={5}
                      placeholder="Tell us about your project or ask us anything..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="contact-submit"
                    disabled={submitted}
                  >
                    <Send size={17} aria-hidden="true" />
                    {submitted ? "Message Sent" : "Send Message"}
                  </button>
                </form>
              </div>

            </div>
          </div>
        </section>

        <hr className="contact-divider" />
        <Footer />
      </div>
    </>
  );
};

export default Contact;
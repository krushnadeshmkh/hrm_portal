import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "https://hrm-backend-vvqg.onrender.com";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "company_admin",
    company_id: "6a02fbcf5c2e16b050635ebc",
  });
  const [focusedField, setFocusedField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (field) => (e) => {
    setError("");
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const registerUser = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (
      (formData.role === "company_admin" || formData.role === "employee") &&
      !formData.company_id.trim()
    ) {
      setError("Company ID is required for this role.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/api/auth/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        company_id:
          formData.role === "super_admin" ? undefined : formData.company_id,
      });

      alert("Registered successfully! Please log in.");
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.msg ||
          err.response?.data?.error ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    ...s.input,
    borderColor: focusedField === field ? "#4F46E5" : "#E5E7EB",
    boxShadow:
      focusedField === field ? "0 0 0 3px rgba(79,70,229,0.10)" : "none",
  });

  const perks = [
    "Free 14-day trial, no credit card needed",
    "Onboarding support included",
    "Cancel anytime, no lock-in",
  ];

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@600;700&display=swap');

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-16px); } to { opacity: 1; transform: translateX(0); } }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .rf1 { animation: fadeUp 0.45s ease both 0.05s; }
        .rf2 { animation: fadeUp 0.45s ease both 0.12s; }
        .rf3 { animation: fadeUp 0.45s ease both 0.19s; }
        .rf4 { animation: fadeUp 0.45s ease both 0.26s; }
        .rf5 { animation: fadeUp 0.45s ease both 0.33s; }
        .rf6 { animation: fadeUp 0.45s ease both 0.40s; }
        .rf7 { animation: fadeUp 0.45s ease both 0.47s; }
        .rp1 { animation: slideIn 0.5s ease both 0.3s; }
        .rp2 { animation: slideIn 0.5s ease both 0.45s; }
        .rp3 { animation: slideIn 0.5s ease both 0.6s; }

        .submit-btn:hover:not(:disabled) {
          background: #312E81 !important;
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(30,27,75,0.22) !important;
        }
        .submit-btn:active { transform: translateY(0) !important; }

        ::placeholder { color: #CBD5E1; font-size: 0.9rem; }
        input, select { font-family: 'DM Sans', sans-serif; }
        select option { background: #fff; color: #111827; }

        .register-root {
          display: flex;
          width: 100vw;
          min-height: 100dvh;
          font-family: 'DM Sans', sans-serif;
        }

        .register-left {
          width: 44%;
          min-width: 380px;
          background: linear-gradient(150deg, #1E1B4B 0%, #2D2A6E 60%, #1a1740 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }

        .register-left-inner {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .register-right {
          flex: 1;
          background-color: #F9FAFB;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 2rem;
          overflow-y: auto;
        }

        .register-form-wrap {
          width: 100%;
          max-width: 390px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
        }

        @media (max-width: 768px) {
          .register-root {
            flex-direction: column;
          }

          .register-left {
            width: 100%;
            min-width: unset;
            padding: 1.1rem 1.25rem;
            align-items: center;
            justify-content: flex-start;
          }

          .register-left-inner {
            flex-direction: row;
            align-items: center;
            gap: 10px;
            max-width: 100%;
          }

          .register-hero,
          .register-perks {
            display: none !important;
          }

          .register-right {
            flex: 1;
            padding: 2rem 1.25rem 2.5rem;
            align-items: flex-start;
          }

          .register-form-wrap {
            max-width: 100%;
          }

          .register-input {
            padding: 14px 16px !important;
            font-size: 1rem !important;
          }

          .register-submit-btn {
            padding: 15px !important;
            font-size: 1rem !important;
          }

          .register-form-title {
            font-size: 1.65rem !important;
          }
        }

        @media (max-width: 400px) {
          .register-left { padding: 0.9rem 1rem; }
          .register-right { padding: 1.5rem 1rem 2.5rem; }
        }
      `}</style>

      <div className="register-root">
        <div className="register-left">
          <div className="register-left-inner">
            <div style={s.logo}>
              <div style={s.logoMark}>S</div>
              <span style={s.logoText}>Shnoor International</span>
            </div>

            <div className="register-hero">
              <p style={s.eyebrow}>Start your journey</p>
              <h1 style={s.heroH1}>HR Management built for modern teams.</h1>
              <p style={s.heroP}>
                Join thousands of companies that trust Shnoor to manage their
                most valuable asset — their people.
              </p>
            </div>

            <div className="register-perks" style={s.perkList}>
              {perks.map((p, i) => (
                <div key={i} className={`rp${i + 1}`} style={s.perkItem}>
                  <CheckCircle2
                    size={16}
                    style={{ color: "#6EE7B7", flexShrink: 0 }}
                  />
                  <span style={s.perkText}>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="register-right">
          <div className="register-form-wrap">
            <div className="rf1" style={s.formHeader}>
              <h2 className="register-form-title" style={s.formTitle}>Create your account</h2>
              <p style={s.formSubtitle}>Get started — it only takes a minute</p>
            </div>

            {error && (
              <div style={s.errorBanner}>
                {error}
              </div>
            )}

            <form onSubmit={registerUser} style={{ width: "100%" }}>
              <div className="rf2" style={s.field}>
                <label style={s.label}>Full Name</label>
                <input
                  className="register-input"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange("name")}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  required
                  style={inputStyle("name")}
                />
              </div>

              <div className="rf3" style={s.field}>
                <label style={s.label}>Email Address</label>
                <input
                  className="register-input"
                  type="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={handleChange("email")}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  required
                  style={inputStyle("email")}
                />
              </div>

              <div className="rf4" style={s.field}>
                <label style={s.label}>Password</label>
                <input
                  className="register-input"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={handleChange("password")}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  required
                  minLength={6}
                  style={inputStyle("password")}
                />
              </div>

              <div className="rf5" style={s.field}>
                <label style={s.label}>Role</label>
                <select
                  value={formData.role}
                  onChange={handleChange("role")}
                  onFocus={() => setFocusedField("role")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...s.select,
                    borderColor: focusedField === "role" ? "#4F46E5" : "#E5E7EB",
                    boxShadow:
                      focusedField === "role"
                        ? "0 0 0 3px rgba(79,70,229,0.10)"
                        : "none",
                  }}
                >
                  <option value="manager">Company Manager</option>
                  <option value="employee">Employee</option>
                  <option value="company_admin">Company Admin</option>
                </select>
              </div>

              <div className="rf7">
                <button
                  type="submit"
                  className="submit-btn register-submit-btn"
                  disabled={loading}
                  style={{
                    ...s.submitBtn,
                    opacity: loading ? 0.75 : 1,
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  <span style={s.btnInner}>
                    {loading ? (
                      "Creating account..."
                    ) : (
                      <>
                        <span>Create account</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </span>
                </button>

                <p style={s.terms}>
                  By registering, you agree to our{" "}
                  <span style={s.termsLink}>Terms of Service</span> and{" "}
                  <span style={s.termsLink}>Privacy Policy</span>.
                </p>
              </div>
            </form>

            <p style={s.footerLine}>
              Already have an account?{" "}
              <Link to="/login" style={s.footerLink}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    fontFamily: "'DM Sans', sans-serif",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logoMark: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.22)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "1.3rem",
    fontWeight: "700",
    fontFamily: "'Playfair Display', serif",
    flexShrink: 0,
  },
  logoText: {
    color: "#fff",
    fontSize: "1.1rem",
    fontWeight: "600",
    letterSpacing: "-0.2px",
  },
  eyebrow: {
    color: "#A5B4FC",
    fontSize: "0.75rem",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "10px",
  },
  heroH1: {
    fontFamily: "'Playfair Display', serif",
    color: "#fff",
    fontSize: "2rem",
    fontWeight: "700",
    lineHeight: "1.28",
    marginBottom: "0.9rem",
  },
  heroP: {
    color: "rgba(255,255,255,0.58)",
    fontSize: "0.93rem",
    lineHeight: "1.75",
    fontWeight: "300",
  },
  perkList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  perkItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  perkText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: "0.875rem",
  },
  formHeader: {
    textAlign: "center",
    width: "100%",
  },
  formTitle: {
    fontFamily: "'Playfair Display', serif",
    color: "#111827",
    fontSize: "2rem",
    fontWeight: "700",
    marginBottom: "6px",
  },
  formSubtitle: {
    color: "#6B7280",
    fontSize: "0.875rem",
  },
  errorBanner: {
    width: "100%",
    padding: "10px 14px",
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    borderRadius: "10px",
    color: "#DC2626",
    fontSize: "0.85rem",
    fontWeight: "500",
  },
  field: {
    marginBottom: "0.9rem",
    width: "100%",
  },
  label: {
    display: "block",
    color: "#374151",
    fontSize: "0.83rem",
    fontWeight: "500",
    marginBottom: "7px",
    letterSpacing: "0.1px",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    backgroundColor: "#fff",
    color: "#111827",
    border: "1.5px solid #E5E7EB",
    borderRadius: "10px",
    fontSize: "1rem",
    transition: "border-color 0.18s, box-shadow 0.18s",
    outline: "none",
  },
  select: {
    width: "100%",
    padding: "12px 14px",
    backgroundColor: "#fff",
    color: "#111827",
    border: "1.5px solid #E5E7EB",
    borderRadius: "10px",
    fontSize: "1rem",
    transition: "border-color 0.18s, box-shadow 0.18s",
    outline: "none",
    cursor: "pointer",
    appearance: "auto",
  },
  submitBtn: {
    width: "100%",
    padding: "14px",
    background: "#1E1B4B",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "1rem",
    fontWeight: "600",
    transition: "background 0.2s, transform 0.15s, box-shadow 0.2s",
    letterSpacing: "0.15px",
    fontFamily: "'DM Sans', sans-serif",
  },
  btnInner: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    justifyContent: "center",
  },
  terms: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: "0.75rem",
    marginTop: "10px",
    lineHeight: "1.5",
  },
  termsLink: {
    color: "#4F46E5",
    cursor: "pointer",
    fontWeight: "500",
  },
  footerLine: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: "0.85rem",
  },
  footerLink: {
    color: "#4F46E5",
    textDecoration: "none",
    fontWeight: "600",
  },
};

export default Register;
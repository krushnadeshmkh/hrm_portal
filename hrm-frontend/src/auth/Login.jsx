import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, ArrowRight, Shield, Zap, Users } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "https://hrm-backend-vvqg.onrender.com";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const navigate = useNavigate();

  const loginUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      localStorage.clear();
      const normalizedEmail = email.toLowerCase().trim();
      const res = await axios.post(`${API}/api/auth/login`, {
        email: normalizedEmail,
        password,
      });

      if (res.data.success && res.data.user) {
        const { token } = res.data;
        const { role, name, id, company_id, employee_id, position } = res.data.user;

        localStorage.setItem("token",      token);
        localStorage.setItem("name",       name);
        localStorage.setItem("user_id",    id);
        localStorage.setItem("company_id", company_id || "");
        localStorage.setItem("role",       role);
        localStorage.setItem("true_role",  role);
        localStorage.setItem("position", position || "");

        if (employee_id) {
          localStorage.setItem("employee_id", employee_id);
        }

        switch (role) {
          case "employee":        navigate("/employee-dashboard");   break;
          case "company_admin":   navigate("/dashboard");            break;
          case "super_admin":
          case "software_owner":  navigate("/superadmin-dashboard"); break;
          default:                navigate("/dashboard");
        }
      }
    } catch (err) {
      if (!err.response) {
        alert("Server is offline. Please check if your backend is running.");
      } else {
        alert(err.response?.data?.msg || err.response?.data?.message || "Invalid Credentials");
      }
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <Shield size={18} />, text: "Enterprise-grade security" },
    { icon: <Zap size={18} />,    text: "Real-time workforce analytics" },
    { icon: <Users size={18} />,  text: "Multi-role access control" },
  ];

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@600;700&display=swap');

        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(-16px); } to { opacity:1; transform:translateX(0); } }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .f1  { animation: fadeUp  0.45s ease both 0.05s; }
        .f2  { animation: fadeUp  0.45s ease both 0.15s; }
        .f3  { animation: fadeUp  0.45s ease both 0.25s; }
        .f4  { animation: fadeUp  0.45s ease both 0.35s; }
        .fi1 { animation: slideIn 0.5s  ease both 0.30s; }
        .fi2 { animation: slideIn 0.5s  ease both 0.45s; }
        .fi3 { animation: slideIn 0.5s  ease both 0.60s; }

        .submit-btn:hover:not(:disabled) {
          background: #312E81 !important;
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(30,27,75,0.22) !important;
        }
        .submit-btn:active { transform: translateY(0) !important; }
        .eye-btn:hover { color: #4F46E5 !important; }

        ::placeholder { color: #CBD5E1; font-size: 0.9rem; }
        input, select { font-family: 'DM Sans', sans-serif; }

        .login-root {
          display: flex;
          width: 100vw;
          min-height: 100dvh;
          font-family: 'DM Sans', sans-serif;
        }

        .login-left {
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

        .login-left-inner {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          gap: 2.25rem;
        }

        .login-right {
          flex: 1;
          background-color: #F9FAFB;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 2rem;
          overflow-y: auto;
        }

        .login-form-wrap {
          width: 100%;
          max-width: 390px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.4rem;
        }

        @media (max-width: 768px) {
          .login-root {
            flex-direction: column;
          }

          .login-left {
            width: 100%;
            min-width: unset;
            padding: 1.1rem 1.25rem;
            align-items: center;
            justify-content: flex-start;
          }

          .login-left-inner {
            flex-direction: row;
            align-items: center;
            gap: 10px;
            max-width: 100%;
          }

          /* Hide everything except the logo on mobile */
          .login-hero-text,
          .login-features,
          .login-stats {
            display: none !important;
          }

          .login-right {
            flex: 1;
            padding: 2rem 1.25rem 2.5rem;
            align-items: flex-start;
          }

          .login-form-wrap {
            max-width: 100%;
          }

          .login-input {
            padding: 14px 16px !important;
            font-size: 1rem !important;
          }

          .login-submit-btn {
            padding: 15px !important;
            font-size: 1rem !important;
          }

          .login-form-title {
            font-size: 1.65rem !important;
          }
        }

        @media (max-width: 400px) {
          .login-left  { padding: 0.9rem 1rem; }
          .login-right { padding: 1.5rem 1rem 2.5rem; }
        }
      `}</style>

      <div className="login-root">
        <div className="login-left">
          <div className="login-left-inner">
            <div style={s.logo}>
              <div style={s.logoMark}>S</div>
              <span style={s.logoText}>Shnoor International</span>
            </div>
            <div className="login-hero-text">
              <h1 style={s.heroH1}>The smarter way to manage your workforce.</h1>
              <p style={s.heroP}>
                Streamline HR, payroll, attendance, and team operations — all in one unified platform.
              </p>
            </div>

            <div className="login-features" style={s.featureList}>
              {features.map((f, i) => (
                <div key={i} className={`fi${i + 1}`} style={s.featureItem}>
                  <div style={s.featureIcon}>{f.icon}</div>
                  <span style={s.featureText}>{f.text}</span>
                </div>
              ))}
            </div>

            <div className="login-stats" style={s.leftFooter}>
              {[["2,400+", "Companies"], ["98%", "Uptime SLA"], ["150K+", "Employees managed"]].map(
                ([val, lab], i) => (
                  <div key={i} style={s.stat}>
                    <span style={s.statVal}>{val}</span>
                    <span style={s.statLab}>{lab}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-form-wrap">
            <div className="f1" style={s.formHeader}>
              <h2 className="login-form-title" style={s.formTitle}>Welcome back</h2>
              <p style={s.formSubtitle}>Sign in to your account to continue</p>
            </div>

            <form onSubmit={loginUser} style={{ width: "100%" }}>
              <div className="f2" style={s.field}>
                <label style={s.label}>Email address</label>
                <input
                  className="login-input"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  required
                  disabled={loading}
                  style={{
                    ...s.input,
                    borderColor: focusedField === "email" ? "#4F46E5" : "#E5E7EB",
                    boxShadow:   focusedField === "email" ? "0 0 0 3px rgba(79,70,229,0.10)" : "none",
                  }}
                />
              </div>

              <div className="f3" style={{ ...s.field, position: "relative" }}>
                <label style={s.label}>Password</label>
                <input
                  className="login-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  required
                  disabled={loading}
                  style={{
                    ...s.input,
                    paddingRight: "46px",
                    borderColor: focusedField === "password" ? "#4F46E5" : "#E5E7EB",
                    boxShadow:   focusedField === "password" ? "0 0 0 3px rgba(79,70,229,0.10)" : "none",
                  }}
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  style={s.eyeBtn}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
                <div style={{ textAlign: "right", marginTop: "6px" }}>
                  <span style={s.forgotLink}>Forgot password?</span>
                </div>
              </div>

              <div className="f4">
                <button
                  type="submit"
                  className="submit-btn login-submit-btn"
                  disabled={loading}
                  style={{
                    ...s.submitBtn,
                    opacity: loading ? 0.75 : 1,
                    cursor:  loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? (
                    <span style={s.btnInner}>
                      <Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} />
                      Authenticating...
                    </span>
                  ) : (
                    <span style={s.btnInner}>
                      Sign in <ArrowRight size={16} />
                    </span>
                  )}
                </button>
              </div>
            </form>

            <p style={s.footerLine}>
              Don't have an account?{" "}
              <Link to="/register" style={s.footerLink}>Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logoMark: {
    width: "38px",
    height: "38px",
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
    fontSize: "1rem",
    fontWeight: "600",
    letterSpacing: "-0.2px",
  },
  heroH1: {
    fontFamily: "'Playfair Display', serif",
    color: "#fff",
    fontSize: "2.1rem",
    fontWeight: "700",
    lineHeight: "1.28",
    marginBottom: "0.9rem",
  },
  heroP: {
    color: "rgba(255,255,255,0.60)",
    fontSize: "0.95rem",
    lineHeight: "1.75",
    fontWeight: "300",
  },
  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  featureIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    background: "rgba(255,255,255,0.09)",
    border: "1px solid rgba(255,255,255,0.14)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#A5B4FC",
    flexShrink: 0,
  },
  featureText: {
    color: "rgba(255,255,255,0.78)",
    fontSize: "0.875rem",
  },
  leftFooter: {
    display: "flex",
    gap: "2rem",
    borderTop: "1px solid rgba(255,255,255,0.10)",
    paddingTop: "1.75rem",
  },
  stat: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },
  statVal: {
    color: "#fff",
    fontSize: "1.35rem",
    fontWeight: "600",
    letterSpacing: "-0.5px",
  },
  statLab: {
    color: "rgba(255,255,255,0.45)",
    fontSize: "0.72rem",
    fontWeight: "400",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
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
  field: {
    marginBottom: "1rem",
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
  eyeBtn: {
    position: "absolute",
    right: "12px",
    top: "34px",
    background: "none",
    border: "none",
    color: "#9CA3AF",
    cursor: "pointer",
    padding: "6px",
    display: "flex",
    alignItems: "center",
    transition: "color 0.15s",
  },
  forgotLink: {
    color: "#4F46E5",
    fontSize: "0.78rem",
    fontWeight: "500",
    cursor: "pointer",
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

export default Login;
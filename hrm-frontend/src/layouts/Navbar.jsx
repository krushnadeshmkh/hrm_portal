import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Globe, X, Menu } from "lucide-react";
import { useWebsiteSettings } from "../hook/useWebsiteSettings";

const Navbar = () => {
  const { data: s } = useWebsiteSettings("header");
  const appName = s?.appName || "Shnoor International LLC";
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Features", path: "/features" },
    { name: "Pricing", path: "/pricing" },
    { name: "Contact", path: "/contact" },
  ];

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');

        /* ── Reset ── */
        *, *::before, *::after { box-sizing: border-box; }

        .shn-navbar {
          height: 64px;
          background: #ffffff;
          border-bottom: 1px solid #F1F3F9;
          box-shadow: 0 1px 4px rgba(15,23,42,0.04);
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          font-family: 'DM Sans', sans-serif;
        }

        .shn-navbar .shn-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .shn-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
        }

        .shn-logo-box {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #4F46E5, #7C3AED);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          flex-shrink: 0;
        }

        .shn-brand-name {
          font-size: 0.92rem;
          font-weight: 600;
          color: #111827;
          letter-spacing: -0.1px;
          white-space: nowrap;
        }
        .shn-nav-links {
          display: flex;
          align-items: center;
          gap: 2px;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .shn-nav-link {
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #6B7280;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap;
        }

        .shn-nav-link:hover {
          background: #F9FAFB;
          color: #111827;
        }

        .shn-nav-link.active {
          background: #EEF2FF;
          color: #4F46E5;
        }
        .shn-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .shn-lang-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 12px;
          border: 1.5px solid #E5E7EB;
          border-radius: 9px;
          background: #F9FAFB;
          color: #6B7280;
          font-size: 0.82rem;
          font-weight: 500;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
          font-family: 'DM Sans', sans-serif;
        }

        .shn-lang-btn:hover {
          border-color: #D1D5DB;
          background: #F3F4F6;
        }

        .shn-btn-outline {
          padding: 7px 16px;
          border: 1.5px solid #E5E7EB;
          border-radius: 9px;
          background: #fff;
          color: #374151;
          font-size: 0.855rem;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          transition: border-color 0.15s, background 0.15s;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
        }

        .shn-btn-outline:hover {
          border-color: #D1D5DB;
          background: #F9FAFB;
          color: #111827;
        }

        .shn-btn-primary {
          padding: 7px 16px;
          border: none;
          border-radius: 9px;
          background: #4F46E5;
          color: #fff;
          font-size: 0.855rem;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.15s, transform 0.12s;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
        }

        .shn-btn-primary:hover {
          background: #4338CA;
          color: #fff;
        }

        .shn-btn-primary:active {
          transform: scale(0.98);
        }

        .shn-toggler {
          display: none;
          flex-direction: column;
          justify-content: center;
          gap: 5px;
          background: none;
          border: 1.5px solid #E5E7EB;
          border-radius: 9px;
          padding: 8px 9px;
          cursor: pointer;
          width: 40px;
          height: 40px;
          flex-shrink: 0;
        }

        .shn-toggler-bar {
          display: block;
          width: 18px;
          height: 2px;
          background: #6B7280;
          border-radius: 2px;
          transition: transform 0.22s ease, opacity 0.22s ease;
          transform-origin: center;
        }

        .shn-toggler.is-open .shn-toggler-bar:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }
        .shn-toggler.is-open .shn-toggler-bar:nth-child(2) {
          opacity: 0;
          transform: scaleX(0);
        }
        .shn-toggler.is-open .shn-toggler-bar:nth-child(3) {
          transform: rotate(-45deg) translate(5px, -5px);
        }

        .shn-mobile-menu {
          position: fixed;
          top: 64px;
          left: 0;
          right: 0;
          background: #fff;
          border-bottom: 1px solid #F1F3F9;
          box-shadow: 0 8px 24px rgba(15,23,42,0.10);
          z-index: 999;
          overflow: hidden;
          max-height: 0;
          transition: max-height 0.3s ease, opacity 0.3s ease;
          opacity: 0;
          pointer-events: none;
        }

        .shn-mobile-menu.open {
          max-height: 500px;
          opacity: 1;
          pointer-events: auto;
        }

        .shn-mobile-menu-inner {
          padding: 12px 20px 20px;
        }

        .shn-mobile-links {
          list-style: none;
          margin: 0 0 12px;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .shn-mobile-links .shn-nav-link {
          display: block;
          padding: 10px 14px;
          font-size: 0.95rem;
          border-radius: 10px;
        }

        .shn-mobile-divider {
          border: none;
          border-top: 1px solid #F1F3F9;
          margin: 0 0 12px;
        }

        .shn-mobile-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .shn-mobile-actions .shn-lang-btn {
          justify-content: center;
        }

        .shn-mobile-actions .shn-btn-outline,
        .shn-mobile-actions .shn-btn-primary {
          text-align: center;
          padding: 10px 16px;
          font-size: 0.9rem;
          display: block;
        }
        .shn-overlay {
          position: fixed;
          inset: 0;
          top: 64px;
          background: rgba(15, 23, 42, 0.25);
          z-index: 998;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }

        .shn-overlay.open {
          opacity: 1;
          pointer-events: auto;
        }

        @media (max-width: 900px) {
          .shn-brand-name {
            max-width: 140px;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

        @media (max-width: 768px) {
          .shn-toggler { display: flex; }
          .shn-desktop-only { display: none !important; }
        }

        @media (max-width: 400px) {
          .shn-brand-name { 
            overflow: hidden }
          .shn-navbar .shn-inner { padding: 0 16px; }
        }
      `}</style>

      <nav className="shn-navbar" role="navigation" aria-label="Main navigation">
        <div className="shn-inner">
          <Link to="/" className="shn-brand" onClick={closeMenu}>
            <div className="shn-logo-box">
              {appName.slice(0, 2).toUpperCase()}
            </div>
            <span className="shn-brand-name">{appName}</span>
          </Link>
          <ul className="shn-nav-links shn-desktop-only" role="list">
            {menuItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    "shn-nav-link" + (isActive ? " active" : "")
                  }
                >
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="shn-actions shn-desktop-only">
            <button className="shn-lang-btn" aria-label="Switch language">
              <Globe size={14} aria-hidden="true" /> EN
            </button>
            <Link to="/register" className="shn-btn-outline">Register</Link>
            <Link to="/login" className="shn-btn-primary">Login</Link>
          </div>
          <button
            className={`shn-toggler${menuOpen ? " is-open" : ""}`}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="shn-mobile-menu"
          >
            <span className="shn-toggler-bar" />
            <span className="shn-toggler-bar" />
            <span className="shn-toggler-bar" />
          </button>
        </div>
      </nav>
      <div
        className={`shn-overlay${menuOpen ? " open" : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      />
      <div
        id="shn-mobile-menu"
        className={`shn-mobile-menu${menuOpen ? " open" : ""}`}
        role="dialog"
        aria-label="Mobile navigation"
      >
        <div className="shn-mobile-menu-inner">
          <ul className="shn-mobile-links" role="list">
            {menuItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    "shn-nav-link" + (isActive ? " active" : "")
                  }
                  onClick={closeMenu}
                >
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
          <hr className="shn-mobile-divider" />
          <div className="shn-mobile-actions">
            <button className="shn-lang-btn" aria-label="Switch language">
              <Globe size={14} aria-hidden="true" /> EN
            </button>
            <Link to="/register" className="shn-btn-outline" onClick={closeMenu}>
              Register
            </Link>
            <Link to="/login" className="shn-btn-primary" onClick={closeMenu}>
              Login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { useWebsiteSettings } from "../hook/useWebsiteSettings";

const Footer = () => {
  const { data: s = {} } = useWebsiteSettings("footer");

  const companyName = s.companyName || "Shnoor International LLC";
  const tagline = s.tagline || "Next-gen HR management for modern businesses.";
  const email = s.email || "support@shnoor.com";
  const phone = s.phone || "+91 98765 43210";
  const address = s.address || "Business Bay, Dubai / Kuppam, India";
  const copyright =
    s.copyright ||
    `© ${new Date().getFullYear()} ${companyName}. All rights reserved.`;

  return (
    <>
      <style>{`

        .shn-footer {
          background: #fff;
          border-top: 1px solid #F1F3F9;
          font-family: 'DM Sans', sans-serif;
        }

        .shn-footer-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 56px 28px 40px;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 2fr;
          gap: 40px;
        }

        .shn-footer-logo-box {
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
          margin-bottom: 12px;
          flex-shrink: 0;
        }

        .shn-footer-brand-name {
          font-size: 0.96rem;
          font-weight: 600;
          color: #111827;
          margin: 0 0 8px;
        }

        .shn-footer-tagline {
          font-size: 0.84rem;
          color: #9CA3AF;
          line-height: 1.6;
          margin: 0;
        }

        .shn-footer-col-title {
          font-size: 0.72rem;
          font-weight: 600;
          color: #9CA3AF;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 16px;
        }

        .shn-footer-links {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .shn-footer-link {
          font-size: 0.855rem;
          color: #6B7280;
          text-decoration: none;
          transition: color 0.15s;
          font-weight: 400;
        }

        .shn-footer-link:hover {
          color: #4F46E5;
        }

        .shn-footer-contact-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 14px;
        }

        .shn-footer-contact-icon {
          color: #4F46E5;
          margin-top: 1px;
          flex-shrink: 0;
        }

        .shn-footer-contact-text {
          font-size: 0.84rem;
          color: #6B7280;
          line-height: 1.5;
          word-break: break-word;
        }

        .shn-footer-bottom {
          border-top: 1px solid #F1F3F9;
          background: #F9FAFB;
        }

        .shn-footer-bottom-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 16px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .shn-footer-copy {
          font-size: 0.78rem;
          color: #9CA3AF;
          margin: 0;
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .shn-footer-inner {
            grid-template-columns: 1fr 1fr;
            gap: 32px;
          }
        }

        @media (max-width: 640px) {
          .shn-footer-inner {
            grid-template-columns: 1fr 1fr;
            padding: 36px 20px 28px;
            gap: 28px;
          }

          /* Brand col spans full width on small phones */
          .shn-footer-brand-col {
            grid-column: 1 / -1;
          }

          .shn-footer-bottom-inner {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }
        }

        @media (max-width: 400px) {
          .shn-footer-inner {
            grid-template-columns: 1fr;
          }
          .shn-footer-brand-col {
            grid-column: auto;
          }
        }
      `}</style>

      <footer className="shn-footer">
        <div className="shn-footer-inner">
          <div className="shn-footer-brand-col">
            <div className="shn-footer-logo-box">
              {companyName.slice(0, 2).toUpperCase()}
            </div>
            <p className="shn-footer-brand-name">{companyName}</p>
            <p className="shn-footer-tagline">{tagline}</p>
          </div>
          <div>
            <p className="shn-footer-col-title">Quick Links</p>
            <ul className="shn-footer-links">
              {[
                { label: "Home", path: "/" },
                { label: "Features", path: "/features" },
                { label: "Pricing", path: "/pricing" },
                { label: "Contact", path: "/contact" },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="shn-footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="shn-footer-col-title">Account</p>
            <ul className="shn-footer-links">
              {[
                { label: "Login", path: "/login" },
                { label: "Register", path: "/register" },
              ].map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="shn-footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="shn-footer-col-title">Contact Us</p>
            <div className="shn-footer-contact-item">
              <Mail size={15} className="shn-footer-contact-icon" aria-hidden="true" />
              <span className="shn-footer-contact-text">{email}</span>
            </div>
            <div className="shn-footer-contact-item">
              <Phone size={15} className="shn-footer-contact-icon" aria-hidden="true" />
              <span className="shn-footer-contact-text">{phone}</span>
            </div>
            <div className="shn-footer-contact-item">
              <MapPin size={15} className="shn-footer-contact-icon" aria-hidden="true" />
              <span className="shn-footer-contact-text">{address}</span>
            </div>
          </div>
        </div>

        <div className="shn-footer-bottom">
          <div className="shn-footer-bottom-inner">
            <p className="shn-footer-copy">{copyright}</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
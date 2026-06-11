import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, UserPlus, Clock, Palmtree, CalendarRange,
  Wallet, LogOut, Building2, CreditCard, HeadphonesIcon,
  UserCog, Globe, Menu, UserCircle, ChevronRight,
  ClipboardList, Mail, ArrowLeftRight, X,
  UserPen, HandCoins, TrendingUp, Receipt, FileText,
  AlertTriangle, DoorOpen, MessageSquareWarning, Sun, Moon,
  MessageCircle
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const ALL_MENU_ITEMS = [
  { name: "Manager Dashboard", path: "/dashboard", icon: <LayoutDashboard size={17} />, roles: ["manager"] },
  { name: "Super Control Panel", path: "/superadmin-dashboard", icon: <LayoutDashboard size={17} />, roles: ["super_admin", "software_owner"] },
  { name: "My Dashboard", path: "/employee-dashboard", icon: <LayoutDashboard size={17} />, roles: ["employee"] },
  { name: "Add Employee", path: "/add-employee", icon: <UserPlus size={17} />, roles: ["manager"] },
  { name: "Employee Attendance", path: "/admin-attendance", icon: <Clock size={17} />, roles: ["manager"] },
  { name: "My Attendance", path: "/attendance", icon: <Clock size={17} />, roles: ["employee"] },
  { name: "Holidays", path: "/holidays", icon: <Palmtree size={17} />, roles: ["manager", "employee"] },
  { name: "Leaves", path: "/leaves", icon: <CalendarRange size={17} />, roles: ["manager", "employee"] },
  { name: "Assign Task", path: "/assign-task", icon: <ClipboardList size={17} />, roles: ["manager"] },
  { name: "My Tasks", path: "/my-tasks", icon: <ClipboardList size={17} />, roles: ["employee"], positions: ["employee"] },
  { name: "Salary Advance", path: "/employee/salary-advance", icon: <HandCoins size={17} />, roles: ["employee"] },
  { name: "Career History", path: "/employee/career-history", icon: <TrendingUp size={17} />, roles: ["employee"] },
  { name: "My Payslips", path: "/employee/payslips", icon: <Receipt size={17} />, roles: ["employee"] },
  { name: "Appreciations", path: "/appreciations", icon: <LayoutDashboard size={17} />, roles: ["employee"] },
  { name: "Employee Policies", path: "/employeePolicies", icon: <ClipboardList size={17} />, roles: ["employee"] },
  { name: "Employee Letters", path: "/employeeLetters", icon: <Mail size={17} />, roles: ["employee"] },
  { name: "My Warnings", path: "/employee/warnings", icon: <AlertTriangle size={17} />, roles: ["employee"] },
  { name: "Resignation", path: "/employee/resignation", icon: <DoorOpen size={17} />, roles: ["employee"] },
  { name: "Complaints", path: "/employee/complaints", icon: <MessageSquareWarning size={17} />, roles: ["employee"] },
  { name: "Advance Requests", path: "/admin/advance-requests", icon: <FileText size={17} />, roles: ["manager"] },
  { name: "Increment & Promotion", path: "/admin/increment-promotion", icon: <TrendingUp size={17} />, roles: ["manager"] },
  { name: "Warnings", path: "/admin/warnings", icon: <AlertTriangle size={17} />, roles: ["manager"] },
  { name: "Resignations", path: "/admin/resignations", icon: <DoorOpen size={17} />, roles: ["manager"] },
  { name: "Complaints", path: "/admin/complaints", icon: <MessageSquareWarning size={17} />, roles: ["manager"] },
  { name: "Payroll", path: "/payroll", icon: <Wallet size={17} />, roles: ["manager"] },
  { name: "Departments", path: "/departments", icon: <Building2 size={17} />, roles: ["manager"] },
  { name: "Designations", path: "/designations", icon: <UserPlus size={17} />, roles: ["manager"] },
  { name: "Profile", path: "/profile", icon: <UserCircle size={17} />, roles: ["employee"] },
  { name: "Transactions", path: "/transactions", icon: <CreditCard size={17} />, roles: ["super_admin", "software_owner"] },
  { name: "Companies", path: "/superadmin/companiespage", icon: <Building2 size={17} />, roles: ["super_admin", "software_owner"] },
  { name: "Add Super Admin", path: "/add-superadmin", icon: <UserCog size={17} />, roles: ["super_admin", "software_owner"] },
  { name: "Pricing Plans", path: "/superadmin/pricing", icon: <CreditCard size={17} />, roles: ["super_admin", "software_owner"] },
  { name: "Website Settings", path: "/superadmin/website-settings", icon: <Globe size={17} />, roles: ["software_owner"] },
  { name: "Appreciation", path: "/appreciation", icon: <UserPlus size={17} />, roles: ["manager"] },
  { name: "Letters", path: "/letter", icon: <ClipboardList size={17} />, roles: ["manager"] },
  { name: "Policies", path: "/policy", icon: <Mail size={17} />, roles: ["manager"] },
   { name: "Chat", path: "/chat", icon: <MessageCircle size={17} />, roles: ["manager", "employee"] },
];

const ROLE_LABELS = {
  manager: "Manager",
  super_admin: "Super Admin",
  software_owner: "Software Owner",
  employee: "Employee",
};

const SB_STYLES = (isDark) => `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');

  :root {
    --sb-bg: ${isDark ? "#161B27" : "#fff"};
    --sb-border: ${isDark ? "#1E2535" : "#F1F3F9"};
    --sb-text-primary: ${isDark ? "#F3F4F6" : "#111827"};
    --sb-text-secondary: ${isDark ? "#9CA3AF" : "#6B7280"};
    --sb-text-muted: ${isDark ? "#6B7280" : "#9CA3AF"};
    --sb-icon: ${isDark ? "#9CA3AF" : "#6B7280"};
    --sb-hover-bg: ${isDark ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.08)"};
    --sb-active-bg: ${isDark ? "linear-gradient(135deg,#312E81,#3730A3)" : "linear-gradient(135deg,#EEF2FF,#E0E7FF)"};
    --sb-active-text: ${isDark ? "#C7D2FE" : "#4338CA"};
    --sb-active-icon: ${isDark ? "#818CF8" : "#4F46E5"};
    --sb-toggle-bg: ${isDark ? "#1E2535" : "#F3F4F6"};
    --sb-tab-active-admin: ${isDark ? "#312E81" : "#1E1B4B"};
    --sb-tab-active-emp: ${isDark ? "#3730A3" : "#4F46E5"};
    --sb-tab-inactive-text: ${isDark ? "#6B7280" : "#6B7280"};
    --sb-logout-hover-bg: ${isDark ? "#2D1515" : "#fef2f2"};
    --sb-logout-hover-text: ${isDark ? "#F87171" : "#dc2626"};
    --sb-shadow: ${isDark ? "2px 0 16px rgba(0,0,0,0.4)" : "2px 0 16px rgba(15,23,42,0.06)"};
    --sb-shadow-mobile: ${isDark ? "4px 0 24px rgba(0,0,0,0.5)" : "4px 0 24px rgba(15,23,42,0.15)"};
    --sb-logo-text: ${isDark ? "#E0E7FF" : "#111827"};
    --sb-brand-badge: ${isDark ? "linear-gradient(135deg,#312E81,#4F46E5)" : "linear-gradient(135deg,#1E1B4B,#4F46E5)"};
  }

  .sb-nav-link { transition: background 0.15s, color 0.15s; }
  .sb-nav-link:hover { background: var(--sb-hover-bg) !important; color: var(--sb-active-icon) !important; }
  .sb-nav-link:hover .sb-icon { color: var(--sb-active-icon) !important; }
  .sb-toggle:hover { background: var(--sb-hover-bg) !important; }
  .sb-logout:hover { background: var(--sb-logout-hover-bg) !important; color: var(--sb-logout-hover-text) !important; }
  .sb-scroll::-webkit-scrollbar { width: 4px; }
  .sb-scroll::-webkit-scrollbar-track { background: transparent; }
  .sb-scroll::-webkit-scrollbar-thumb { background: ${isDark ? "#2D3748" : "#E5E7EB"}; border-radius: 4px; }
  @keyframes badgePulse { 0%,100%{opacity:1} 50%{opacity:0.55} }
  .preview-badge { animation: badgePulse 2.5s ease-in-out infinite; }
  .view-tab { transition: all 0.2s ease; }
  .view-tab:hover { opacity: 0.85; }
  .sb-overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.45);
    z-index: 999;
    backdrop-filter: blur(2px);
  }

  @media (max-width: 768px) {
    .sb-overlay.active { display: block; }
  }
`;

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
};

const UserAvatar = ({ size = 36, initials, avatarUrl, showBadge = false, isDark }) => {
  const [imgError, setImgError] = useState(false);
  useEffect(() => { setImgError(false); }, [avatarUrl]);

  const showImage = avatarUrl && !imgError;

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
        border: showImage ? `2px solid ${isDark ? "#312E81" : "#E0E7FF"}` : "none",
      }}
    >
      {showImage ? (
        <img
          src={avatarUrl}
          alt={initials}
          onError={() => setImgError(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            borderRadius: "50%",
          }}
        />
      ) : (
        <div style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: size <= 36 ? "0.8rem" : "1rem",
          fontWeight: "600",
          borderRadius: "50%",
        }}>
          {initials}
        </div>
      )}
      {showBadge && (
        <span
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: "#10B981",
            border: "2px solid #fff",
          }}
        />
      )}
    </div>
  );
};

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { isDark, toggleTheme } = useTheme();

  const trueRole = localStorage.getItem("true_role");
  const name = localStorage.getItem("name") || "Administrator";
  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem("avatar") || "");

  useEffect(() => {
    const syncAvatar = () => {
      setAvatarUrl(localStorage.getItem("avatar") || "");
    };
    window.addEventListener("storage", syncAvatar);
    return () => window.removeEventListener("storage", syncAvatar);
  }, []);

  const [viewMode, setViewMode] = useState(() => localStorage.getItem("role"));

  const initials = useMemo(
    () => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
    [name]
  );

  const trueRoleLabel = ROLE_LABELS[trueRole] || trueRole;
  const isAdminViewingAsEmployee = trueRole === "manager" && viewMode === "employee";

  const position = localStorage.getItem("position");

  const menuItems = useMemo(
    () =>
      ALL_MENU_ITEMS.filter((item) => {
        if (!item.roles.includes(viewMode)) return false;
        if (item.positions && !item.positions.includes(position)) return false;
        return true;
      }),
    [viewMode, position]
  );

  const sidebarVisible = isMobile ? isOpen : true;
  const sidebarExpanded = isMobile ? true : isOpen;

  const handleViewSwitch = useCallback(() => {
    const next = viewMode === "manager" ? "employee" : "manager";
    localStorage.setItem("role", next);
    setViewMode(next);
    navigate(next === "employee" ? "/employee-dashboard" : "/dashboard");
    if (isMobile) setIsOpen(false);
  }, [viewMode, navigate, isMobile, setIsOpen]);

  const handleLogout = useCallback(() => {
    localStorage.clear();
    window.location.href = "/";
  }, []);

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, [setIsOpen]);

  const handleNavClick = useCallback(() => {
    if (isMobile) setIsOpen(false);
  }, [isMobile, setIsOpen]);

  return (
    <>
      <style>{SB_STYLES(isDark)}</style>
      <div
        className={`sb-overlay${isMobile && isOpen ? " active" : ""}`}
        onClick={() => setIsOpen(false)}
      />

      <nav
        style={{
          width: sidebarExpanded ? "255px" : "68px",
          height: "100vh",
          position: "fixed",
          left: isMobile ? (isOpen ? "0" : "-280px") : "0",
          top: 0,
          zIndex: 1000,
          backgroundColor: "var(--sb-bg)",
          borderRight: "1px solid var(--sb-border)",
          boxShadow: isMobile && isOpen ? "var(--sb-shadow-mobile)" : "var(--sb-shadow)",
          display: "flex",
          flexDirection: "column",
          transition: isMobile
            ? "left 0.28s cubic-bezier(0.4,0,0.2,1)"
            : "width 0.25s cubic-bezier(0.4,0,0.2,1)",
          overflow: "hidden",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div style={{
          padding: sidebarExpanded ? "18px 16px 14px" : "18px 0 14px",
          borderBottom: "1px solid var(--sb-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: sidebarExpanded ? "space-between" : "center",
          gap: "10px",
          flexShrink: 0,
        }}>
          {sidebarExpanded && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden" }}>
              <div
                style={{
                  width: "34px", height: "34px", borderRadius: "9px",
                  background: "var(--sb-brand-badge)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontFamily: "'Playfair Display', serif",
                  fontSize: "1.1rem", fontWeight: "700", flexShrink: 0,
                }}
              >S</div>
              <span style={{ fontSize: "1rem", fontWeight: "600", color: "var(--sb-logo-text)", letterSpacing: "-0.2px", whiteSpace: "nowrap" }}>
                Shnoor
              </span>
            </div>
          )}
          <button
            className="sb-toggle"
            onClick={isMobile ? () => setIsOpen(false) : handleToggle}
            style={{
              width: "34px", height: "34px", borderRadius: "8px",
              border: "none", background: "transparent", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--sb-text-secondary)", flexShrink: 0,
            }}
          >
            {isMobile
              ? <X size={19} />
              : <Menu size={19} style={{ transform: isOpen ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.25s" }} />
            }
          </button>
        </div>

        <div style={{
          padding: sidebarExpanded ? "12px 14px" : "12px 0",
          borderBottom: "1px solid var(--sb-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: sidebarExpanded ? "flex-start" : "center",
          gap: "10px",
          flexShrink: 0,
        }}>
          <UserAvatar
            size={36}
            initials={initials}
            avatarUrl={avatarUrl}
            showBadge={isAdminViewingAsEmployee}
            isDark={isDark}
          />

          {sidebarExpanded && (
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: "600", color: "var(--sb-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {name}
              </div>
              <div style={{ fontSize: "0.7rem", color: "#6366F1", fontWeight: "500" }}>
                {trueRoleLabel}
              </div>
            </div>
          )}
        </div>

        {trueRole === "manager" && (
          <div style={{
            padding: sidebarExpanded ? "10px 12px" : "10px 6px",
            borderBottom: "1px solid var(--sb-border)",
            flexShrink: 0,
          }}>
            {sidebarExpanded ? (
              <div>
                {isAdminViewingAsEmployee && (
                  <div
                    className="preview-badge"
                    style={{
                      fontSize: "0.64rem", fontWeight: "600", color: "#059669",
                      textTransform: "uppercase", letterSpacing: "0.6px",
                      marginBottom: "7px",
                      display: "flex", alignItems: "center", gap: "5px",
                    }}
                  >
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981", display: "inline-block" }} />
                    Viewing as Employee
                  </div>
                )}
                <div
                  style={{ display: "flex", background: "var(--sb-toggle-bg)", borderRadius: "10px", padding: "3px", gap: "2px" }}
                >
                  {[
                    { mode: "manager", label: "Manager" },
                    { mode: "employee", label: "Employee" },
                  ].map(({ mode, label }) => {
                    const active = viewMode === mode;
                    return (
                      <button
                        key={mode}
                        className="view-tab"
                        onClick={() => { if (!active) handleViewSwitch(); }}
                        style={{
                          flex: 1, padding: "7px 6px", borderRadius: "8px", border: "none",
                          background: active ? (mode === "employee" ? "var(--sb-tab-active-emp)" : "var(--sb-tab-active-admin)") : "transparent",
                          color: active ? "#fff" : "var(--sb-tab-inactive-text)",
                          fontSize: "0.75rem", fontWeight: "600",
                          cursor: active ? "default" : "pointer",
                          fontFamily: "'DM Sans', sans-serif",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <button
                className="sb-toggle"
                onClick={handleViewSwitch}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "8px 0", borderRadius: "9px", border: "none",
                  background: isAdminViewingAsEmployee ? "rgba(79,70,229,0.10)" : "transparent",
                  color: isAdminViewingAsEmployee ? "#4F46E5" : "var(--sb-icon)",
                  cursor: "pointer",
                }}
              >
                <ArrowLeftRight size={17} />
              </button>
            )}
          </div>
        )}

        <div className="sb-scroll" style={{ flex: 1, overflowY: "auto", padding: sidebarExpanded ? "10px" : "10px 6px" }}>
          {sidebarExpanded && (
            <p style={{ fontSize: "0.65rem", fontWeight: "600", color: "var(--sb-text-muted)", textTransform: "uppercase", letterSpacing: "0.8px", padding: "4px 8px 8px", margin: 0 }}>
              Navigation
            </p>
          )}
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="sb-nav-link"
                    title={!sidebarExpanded ? item.name : undefined}
                    onClick={handleNavClick}
                    style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      padding: sidebarExpanded ? "9px 10px" : "9px 0",
                      justifyContent: sidebarExpanded ? "flex-start" : "center",
                      borderRadius: "9px", textDecoration: "none",
                      background: isActive ? "var(--sb-active-bg)" : "transparent",
                      color: isActive ? "var(--sb-active-text)" : "var(--sb-text-primary)",
                      fontWeight: isActive ? "600" : "400",
                      fontSize: "0.855rem", position: "relative",
                    }}
                  >
                    {isActive && (
                      <span style={{
                        position: "absolute", left: 0, top: "20%", bottom: "20%",
                        width: "3px", borderRadius: "0 3px 3px 0", background: "#4F46E5",
                      }} />
                    )}
                    <span className="sb-icon" style={{ color: isActive ? "var(--sb-active-icon)" : "var(--sb-icon)", flexShrink: 0, display: "flex" }}>
                      {item.icon}
                    </span>
                    {sidebarExpanded && <span style={{ whiteSpace: "nowrap" }}>{item.name}</span>}
                    {sidebarExpanded && isActive && <ChevronRight size={13} style={{ marginLeft: "auto", color: "var(--sb-active-icon)" }} />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div style={{ padding: sidebarExpanded ? "10px 10px 6px" : "10px 6px 6px", borderTop: "1px solid var(--sb-border)", flexShrink: 0 }}>
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            style={{
              width: "100%", display: "flex", alignItems: "center",
              justifyContent: sidebarExpanded ? "flex-start" : "center",
              gap: "10px", padding: sidebarExpanded ? "9px 10px" : "9px 0",
              borderRadius: "9px", border: "none",
              background: isDark ? "rgba(99,102,241,0.10)" : "rgba(99,102,241,0.06)",
              color: isDark ? "#818CF8" : "#4F46E5",
              fontSize: "0.855rem", fontWeight: "500", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              marginBottom: "4px",
            }}
          >
            {isDark
              ? <Sun size={17} style={{ flexShrink: 0 }} />
              : <Moon size={17} style={{ flexShrink: 0 }} />
            }
            {sidebarExpanded && <span>{isDark ? "Light Mode" : "Dark Mode"}</span>}
          </button>

          <button
            className="sb-logout"
            onClick={handleLogout}
            style={{
              width: "100%", display: "flex", alignItems: "center",
              justifyContent: sidebarExpanded ? "flex-start" : "center",
              gap: "10px", padding: sidebarExpanded ? "9px 10px" : "9px 0",
              borderRadius: "9px", border: "none",
              background: "transparent", color: "var(--sb-text-secondary)",
              fontSize: "0.855rem", fontWeight: "500", cursor: "pointer",
              transition: "background 0.15s, color 0.15s",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <LogOut size={17} style={{ flexShrink: 0 }} />
            {sidebarExpanded && <span>Logout</span>}
          </button>
        </div>
      </nav>
    </>
  );
};

export default React.memo(Sidebar);
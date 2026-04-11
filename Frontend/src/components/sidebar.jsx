import React, { useEffect, useState } from "react";
import "./sidebar.css";
import logo from "../assets/InvesTechy.jpg";
import { useNavigate } from "react-router-dom";
import { useAppSettings } from "../context/AppSettingsContext";
import { clearSession, clearResetPasswordFlow } from "../services/api";

const Sidebar = ({ activeMenu }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useAppSettings();

  const menus = [
    {
      name: t("navDashboard"),
      key: "Dashboard",
      path: "/dashboard",
      icon: "https://img.icons8.com/?size=100&id=sUJRwjfnGwbJ&format=png&color=FFFFFF",
      activeIcon:
        "https://img.icons8.com/?size=100&id=sUJRwjfnGwbJ&format=png&color=053B29",
    },
    {
      name: t("navNewProject"),
      key: "New Project",
      path: "/new-project",
      icon: "https://img.icons8.com/?size=100&id=gxFxowCaQoBQ&format=png&color=FFFFFF",
      activeIcon:
        "https://img.icons8.com/?size=100&id=gxFxowCaQoBQ&format=png&color=053B29",
    },
    {
      name: t("navProjectList"),
      key: "Project List",
      path: "/project-list",
      icon: "https://img.icons8.com/?size=100&id=aslXiAMR2V7S&format=png&color=FFFFFF",
      activeIcon:
        "https://img.icons8.com/?size=100&id=aslXiAMR2V7S&format=png&color=053B29",
    },
    {
      name: t("navReportList"),
      key: "Report List",
      path: "/report-list",
      icon: "https://img.icons8.com/?size=100&id=Ss9HzIp5VFDD&format=png&color=FFFFFF",
      activeIcon:
        "https://img.icons8.com/?size=100&id=Ss9HzIp5VFDD&format=png&color=053B29",
    },
    {
      name: t("navConsult"),
      key: "Consult",
      path: "/consult",
      icon: "https://img.icons8.com/?size=100&id=8kHOhdrNngb3&format=png&color=FFFFFF",
      activeIcon:
        "https://img.icons8.com/?size=100&id=8kHOhdrNngb3&format=png&color=053B29",
    },
    {
      name: t("navSettings"),
      key: "Settings",
      path: "/settings",
      icon: "https://img.icons8.com/?size=100&id=CcpTg57jVuhI&format=png&color=FFFFFF",
      activeIcon:
        "https://img.icons8.com/?size=100&id=CcpTg57jVuhI&format=png&color=053B29",
    },
  ];

  useEffect(() => {
    document.body.classList.toggle("sidebar-open", isOpen);

    return () => {
      document.body.classList.remove("sidebar-open");
    };
  }, [isOpen]);

  const handleNavigate = (path) => {
    setIsOpen(false);
    document.body.classList.add("page-exit");
    setTimeout(() => {
      navigate(path);
    }, 250);
  };

  const handleLogout = () => {
    setIsOpen(false);
    clearSession();
    clearResetPasswordFlow();
    document.body.classList.add("page-exit");
    document.body.classList.add("auth-page-exit");
    setTimeout(() => {
      navigate("/login");
    }, 250);
  };

  return (
    <>
      <button
        type="button"
        className="sidebar-toggle"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span />
        <span />
        <span />
      </button>

      <div
        className={`sidebar-backdrop ${isOpen ? "visible" : ""}`}
        onClick={() => setIsOpen(false)}
      />

      <aside className={`sidebar ${isOpen ? "is-open" : ""}`}>
        <div className="sidebar-logo">
          <img src={logo} alt="InvesTechy" />
        <div className="sidebar-brand-copy">
          <strong>InvesTechy</strong>
          <span>Smarter IT Investment Decision</span>
        </div>
      </div>

        <nav className="sidebar-nav">
          {menus.map((menu) => {
            const isActive = activeMenu === menu.key;

            return (
              <div
                key={menu.key}
                className={`nav-item ${isActive ? "active" : ""}`}
                onClick={() => handleNavigate(menu.path)}
              >
                <img
                  src={isActive ? menu.activeIcon : menu.icon}
                  alt={menu.name}
                  className="sidebar-icon-img"
                />
                <span className="menu-text">{menu.name}</span>
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-line"></div>
          <div className="nav-item logout-item" onClick={handleLogout}>
            <img
              src="https://img.icons8.com/?size=100&id=2445&format=png&color=FFFFFF"
              alt="Logout"
              className="sidebar-icon-img"
            />
            <span className="menu-text">Log Out</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

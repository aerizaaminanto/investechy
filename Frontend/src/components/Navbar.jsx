import { useState } from "react";
import logo from "../assets/InvesTechy.jpg";
import { Link } from "react-router-dom";
import { useAppSettings } from "../context/AppSettingsContext";
import "./navbar.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useAppSettings();

  const scrollToSection = (event, sectionId) => {
    event.preventDefault();
    setIsMenuOpen(false);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <img src={logo} alt="InvesTechy Logo" className="logo-img" />
        <span className="logo-text">InvesTechy</span>
      </div>

      <button
        type="button"
        className={`nav-toggle ${isMenuOpen ? "active" : ""}`}
        aria-label={isMenuOpen ? "Close site menu" : "Open site menu"}
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((prev) => !prev)}
      >
        <span />
        <span />
        <span />
      </button>

      <div className={`nav-menu ${isMenuOpen ? "open" : ""}`}>
        <ul className="nav-links">
          <li>
            <a href="#about-us" onClick={(event) => scrollToSection(event, "about-us")}>
              {t("aboutUs")}
            </a>
          </li>

          <li>
            <a href="#contact" onClick={(event) => scrollToSection(event, "contact")}>
              {t("contact")}
            </a>
          </li>
        </ul>

        <div className="nav-actions">
          <Link to="/login" className="login-btn" onClick={() => setIsMenuOpen(false)}>
            {t("login")}
          </Link>
          <Link
            to="/register"
            className="register-btn"
            onClick={() => setIsMenuOpen(false)}
          >
            {t("register")}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import React from 'react';
import "./footer.css";
import logo from '../assets/InvesTechy.jpg'; // Mengambil logo dari folder assets

export default function Footer() {
  return (
    <footer id="contact"className="footer">
      <div className="footer-container">
        <div className="footer-wrapper">

          {/* BAGIAN KIRI: Logo & Tagline */}
          <div className="footer-left">
            <div className="footer-brand">
              <img src={logo} alt="InvesTechy Logo" className="footer-logo" />
              <h2 className="brand-name">InvesTechy</h2>
            </div>
            <p className="footer-description">
              Turning complex IT investment analysis into simple, actionable insight.
            </p>
          </div>

          {/* BAGIAN KANAN: Navigasi & Kontak */}
          <div className="footer-right">
            
            {/* Navigasi Links */}
            <div className="footer-column">
              <h3 className="column-title">Links</h3>
              <ul className="footer-links">
                <li><a href="#about">About Us</a></li>
                <li><a href="#services">Our Services</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
              </ul>
            </div>

            {/* Informasi Kontak */}
            <div className="footer-column">
              <h3 className="column-title">Contact Us</h3>
              <div className="contact-item">
                <span>📧</span> <p>email@example.com</p>
              </div>
              <div className="contact-item">
                <span>📞</span> <p>+62 812 3456 7890</p>
              </div>
              <div className="contact-item">
                <span>📍</span> <p>Indonesia</p>
              </div>
            </div>

          </div>
        </div>

        {/* BAGIAN BAWAH: Copyright */}
        <div className="footer-bottom">
          <p>© 2026 InvesTechy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
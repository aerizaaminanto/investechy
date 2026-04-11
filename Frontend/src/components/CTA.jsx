import "./cta.css";
import { Link } from "react-router-dom";

export default function CTA() {
  return (
    <section className="cta">
      <div className="cta-content">
        <h2 className="cta-title">Ready to Make Smarter IT Investment Decisions?</h2>

        <p className="cta-subtitle">
          Discover the potential of your investment - fast, simple, and data-driven.
        </p>

        <Link to="/login" className="btn-cta">
          Get Started &gt;
        </Link>
      </div>
    </section>
  );
}

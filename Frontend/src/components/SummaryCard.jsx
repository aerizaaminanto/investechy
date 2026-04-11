import React from "react";
import "./summaryCard.css";

export default function SummaryCard({ title, value, icon }) {
  const iconContent = typeof icon === "string"
    ? <img src={icon} alt={title} className="card-icon-img" />
    : icon;

  return (
    <div className="summary-card">
      <div className="card-icon-bg" aria-hidden="true">
        {iconContent}
      </div>
      <div className="card-details">
        <span className="card-title">{title}</span>
        <h3 className="card-value">{value}</h3>
      </div>
    </div>
  );
}

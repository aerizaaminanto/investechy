import "./insight.css";

export default function InsightBox({ note }) {
  const hasNote = Boolean(note?.trim());

  return (
    <div className="insight">
      <div className="insight-content">
        <span className="insight-subtitle">NOTE</span>
        <h3>Operational Recommendation</h3>
        <p>
          {hasNote
            ? note
            : "Belum ada data kalkulasi yang tersedia untuk memberikan wawasan."}
        </p>
      </div>

      {hasNote ? (
        <div className="badge-container">
          <button type="button" className="badge-insight">
            Save
          </button>
        </div>
      ) : null}
    </div>
  );
}

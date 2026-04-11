import "./table.css";

const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export default function AnalyticsTable({ data = [] }) {
  return (
    <div className="table-container">
      <div className="table-head">
        <span className="table-subtitle">Top Project</span>
        <h3 className="table-title">Top Project</h3>
      </div>

      {data.length === 0 ? (
        <div className="table-empty-state">
          <p>No top project data yet.</p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Simulation Name</th>
              <th>Investment</th>
              <th>ROI</th>
              <th>IE Score</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item, i) => (
              <tr key={i}>
                <td>{item.projectName}</td>
                <td>{item.simulationName}</td>
                <td>{formatCurrency(item.investment)}</td>
                <td><span className="status-pill">{item.roiPercentage}%</span></td>
                <td><span className="status-pill">{item.ieScore}</span></td>
                <td><span className="status-pill">{item.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

import { useAppSettings } from "../context/AppSettingsContext";
import "./table.css";

const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export default function AnalyticsTable({ data = [] }) {
  const { t } = useAppSettings();

  return (
    <div className="table-container">
      <div className="table-head">
        <span className="table-subtitle">{t("topProject")}</span>
        <h3 className="table-title">{t("topProject")}</h3>
      </div>

      {data.length === 0 ? (
        <div className="table-empty-state">
          <p>{t("noTopProject")}</p>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>{t("projectName")}</th>
              <th>{t("scenarioNameLabel")}</th>
              <th>{t("investment")}</th>
              <th>{t("roi")}</th>
              <th>{t("ieScore")}</th>
              <th>{t("status")}</th>
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

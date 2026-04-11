import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaChartLine, FaCoins, FaHourglassHalf, FaWallet } from "react-icons/fa";
import { LuBadgeDollarSign } from "react-icons/lu";
import Sidebar from "../components/sidebar";
import { fetchProjectById } from "../store/projectThunk";
import "./reportSummary.css";

const getLatestSimulation = (simulationHistory = []) => {
  if (!Array.isArray(simulationHistory) || simulationHistory.length === 0) {
    return null;
  }

  return [...simulationHistory].sort((a, b) => {
    const dateA = new Date(a?.calculatedAt || 0).getTime();
    const dateB = new Date(b?.calculatedAt || 0).getTime();
    return dateB - dateA;
  })[0];
};

const formatCurrency = (value) => {
  const amount = Number(value);
  if (Number.isNaN(amount)) return "-";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatPercent = (value) => {
  const amount = Number(value);
  if (Number.isNaN(amount)) return "-";
  return `${amount.toFixed(2)}%`;
};

const formatNumber = (value) => {
  const amount = Number(value);
  if (Number.isNaN(amount)) return "-";
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const SummaryStat = ({ icon, label, value, accent = "green" }) => (
  <div className={`report-summary-stat accent-${accent}`}>
    <div className="report-summary-stat-icon">{icon}</div>
    <div>
      <p>{label}</p>
      <h3>{value}</h3>
    </div>
  </div>
);

const getProjectDisplayName = (project) => project?.projectName?.trim() || "Project Summary";

export default function ReportSummary() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { selectedProject: project, loading, error } = useSelector((state) => state.project);

  useEffect(() => {
    dispatch(fetchProjectById(id));
  }, [dispatch, id]);

  const latestSimulation = useMemo(
    () => getLatestSimulation(project?.simulationHistory),
    [project],
  );

  const settings = latestSimulation?.simulationSettings || {};
  const financialResults = latestSimulation?.financialResults || {};
  const breakEvenRows = financialResults?.breakEvenAnalysisDetail || [];
  const businessName = project ? getProjectDisplayName(project) : "Project Summary";

  return (
    <div className="report-summary-layout">
      <Sidebar activeMenu="Report List" />

      <main className="report-summary-content">
        <div className="report-summary-header">
          <button className="back-button" type="button" onClick={() => navigate("/report-list")}>
            <FaArrowLeft />
            Back to Reports
          </button>

          <div>
            <h1>{businessName}</h1>
            <p>Summary hasil simulasi terbaru dari backend project calculation.</p>
          </div>
        </div>

        {loading && <p>Loading summary...</p>}
        {error && <p className="report-summary-error">{error}</p>}

        {!loading && !error && !latestSimulation && (
          <div className="report-summary-panel">
            <p>Belum ada simulation history untuk project ini.</p>
          </div>
        )}

        {!loading && !error && latestSimulation && (
          <>
            <div className="report-summary-top-grid">
              <div className="report-summary-panel report-summary-overview">
                <div className="report-summary-overview-head">
                  <div>
                    <span className="report-summary-eyebrow">Project Status</span>
                    <h2>{project?.status || "-"}</h2>
                  </div>
                  <span className="report-summary-badge">
                    {financialResults?.feasibilityStatus || "Unknown"}
                  </span>
                </div>

                <div className="report-summary-meta">
                  <div>
                    <span>Scenario</span>
                    <strong>{latestSimulation?.scenarioName || "-"}</strong>
                  </div>
                  <div>
                    <span>Calculated At</span>
                    <strong>{formatDateTime(latestSimulation?.calculatedAt)}</strong>
                  </div>
                </div>
              </div>

              <div className="report-summary-panel">
                <span className="report-summary-eyebrow">Simulation Settings</span>
                <div className="report-summary-settings">
                  <div>
                    <span>Inflation Rate</span>
                    <strong>{formatPercent((settings?.inflationRate || 0) * 100)}</strong>
                  </div>
                  <div>
                    <span>Tax Rate</span>
                    <strong>{formatPercent((settings?.taxRate || 0) * 100)}</strong>
                  </div>
                  <div>
                    <span>Discount Rate</span>
                    <strong>{formatPercent((settings?.discountRate || 0) * 100)}</strong>
                  </div>
                  <div>
                    <span>Years</span>
                    <strong>{formatNumber(settings?.years)}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="report-summary-stats-grid">
              <SummaryStat
                icon={<FaWallet />}
                label="NPV"
                value={formatCurrency(financialResults?.npv)}
              />
              <SummaryStat
                icon={<FaChartLine />}
                label="ROI"
                value={formatPercent(financialResults?.roi)}
                accent="blue"
              />
              <SummaryStat
                icon={<FaHourglassHalf />}
                label="Payback Period"
                value={`${formatNumber(financialResults?.paybackPeriod)} tahun`}
                accent="amber"
              />
              <SummaryStat
                icon={<FaCoins />}
                label="Break Even Year"
                value={formatNumber(financialResults?.breakEvenYear)}
                accent="slate"
              />
              <SummaryStat
                icon={<LuBadgeDollarSign />}
                label="IE Score"
                value={formatNumber(financialResults?.ieScore)}
                accent="emerald"
              />
            </div>

            <div className="report-summary-bottom-grid">
              <div className="report-summary-panel">
                <span className="report-summary-eyebrow">Financial Insight</span>
                <div className="report-summary-insight-list">
                  <div>
                    <span>Feasibility</span>
                    <strong>{financialResults?.feasibilityStatus || "-"}</strong>
                  </div>
                  <div>
                    <span>NPV</span>
                    <strong>{formatCurrency(financialResults?.npv)}</strong>
                  </div>
                  <div>
                    <span>ROI</span>
                    <strong>{formatPercent(financialResults?.roi)}</strong>
                  </div>
                  <div>
                    <span>Payback Period</span>
                    <strong>{formatNumber(financialResults?.paybackPeriod)} tahun</strong>
                  </div>
                </div>
              </div>

              <div className="report-summary-panel">
                <span className="report-summary-eyebrow">Break Even Analysis</span>
                <div className="report-summary-table-wrap">
                  <table className="report-summary-table">
                    <thead>
                      <tr>
                        <th>Year</th>
                        <th>Cost</th>
                        <th>Benefit</th>
                        <th>Cumulative Cost</th>
                        <th>Cumulative Benefit</th>
                        <th>Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {breakEvenRows.length === 0 ? (
                        <tr>
                          <td colSpan="6">No break-even analysis detail available.</td>
                        </tr>
                      ) : (
                        breakEvenRows.map((row, index) => (
                          <tr key={`${row?.year || index}-${index}`}>
                            <td>{formatNumber(row?.year)}</td>
                            <td>{formatCurrency(row?.cost)}</td>
                            <td>{formatCurrency(row?.benefit)}</td>
                            <td>{formatCurrency(row?.cumulativeCost)}</td>
                            <td>{formatCurrency(row?.cumulativeBenefit)}</td>
                            <td>{formatCurrency(row?.net)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

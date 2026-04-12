import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaChartLine, FaCoins, FaDownload, FaEye, FaHourglassHalf, FaWallet } from "react-icons/fa";
import { LuBadgeDollarSign } from "react-icons/lu";
import Sidebar from "../components/sidebar";
import api from "../services/api";
import "./reportDetail.css";

const formatCurrency = (value) => {
  const amount = Number(value);
  if (Number.isNaN(amount)) return "-";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
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

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const SummaryStat = ({ icon, label, value, accent = "green" }) => (
  <div className={`report-detail-stat accent-${accent}`}>
    <div className="report-detail-stat-icon">{icon}</div>
    <div className="report-detail-stat-info">
      <p>{label}</p>
      <h3>{value}</h3>
    </div>
  </div>
);

const BreakdownTable = ({ title, items = [] }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="report-detail-panel breakdown-card">
      <h3 className="breakdown-title">{title}</h3>
      <div className="report-detail-table-wrap">
        <table className="report-detail-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Description</th>
              <th className="text-right">Nominal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td className="font-medium">{item.item || item.name || "-"}</td>
                <td>{item.description || "-"}</td>
                <td className="text-right">{formatCurrency(item.nominal || item.amount || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function ReportDetail() {
  const navigate = useNavigate();
  const { projectId, reportId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    const fetchReportDetail = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get(`/projects/${projectId}/reports/${reportId}`);
        if (response?.data) {
          setReport(response.data);
        } else {
          setReport(response);
        }
      } catch (err) {
        setError(err?.message || "Gagal memuat detail laporan.");
      } finally {
        setLoading(false);
      }
    };

    fetchReportDetail();
  }, [projectId, reportId]);

  const settings = report?.simulationSettings || {};
  const financialResults = report?.financialResults || {};
  const simulatedData = report?.simulatedData || {};

  return (
    <div className="report-detail-layout">
      <Sidebar activeMenu="Report List" />

      <main className="report-detail-content">
        <div className="report-detail-header-row">
          <div className="report-detail-header">
            <button className="back-button" type="button" onClick={() => navigate("/report-list")}>
              <FaArrowLeft />
              Back to Reports
            </button>

            <div className="header-text">
              <h1>{report?.scenarioName || "Report Detail"}</h1>
              <p>Dibuat pada {formatDate(report?.calculatedAt)}</p>
            </div>
          </div>
          
          {report?.pdfUrl && (
            <div className="report-detail-actions">
              <button 
                className={`btn-view-pdf ${isPreviewOpen ? 'active' : ''}`}
                onClick={() => setIsPreviewOpen(!isPreviewOpen)}
              >
                <FaEye />
                {isPreviewOpen ? "Tutup Preview" : "Lihat PDF"}
              </button>
              <a 
                href={report.pdfUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-download-pdf"
              >
                <FaDownload />
                Download PDF
              </a>
            </div>
          )}
        </div>

        {isPreviewOpen && report?.pdfUrl && (
          <div className="pdf-preview-container">
            <iframe 
              src={report.pdfUrl} 
              title="PDF Preview"
              className="pdf-preview-iframe"
            />
          </div>
        )}

        {loading && <div className="loading-state">Loding detail laporan...</div>}
        {error && <p className="report-detail-error">{error}</p>}

        {!loading && !error && report && (
          <div className="report-detail-grid">
            <div className="report-detail-stats-grid">
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

            <div className="report-detail-panel settings-panel">
              <div className="panel-header">
                <span className="report-detail-eyebrow">Simulation Settings</span>
              </div>
              <div className="settings-content-grid">
                <div className="setting-item">
                  <span>Inflation Rate</span>
                  <strong>{formatPercent((settings?.inflationRate || 0) * 100)}</strong>
                </div>
                <div className="setting-item">
                  <span>Tax Rate</span>
                  <strong>{formatPercent((settings?.taxRate || 0) * 100)}</strong>
                </div>
                <div className="setting-item">
                  <span>Discount Rate</span>
                  <strong>{formatPercent((settings?.discountRate || 0) * 100)}</strong>
                </div>
                <div className="setting-item">
                  <span>Analysis Period</span>
                  <strong>{formatNumber(settings?.years)} tahun</strong>
                </div>
              </div>
            </div>

            <div className="breakdown-sections">
              <BreakdownTable title="CAPEX (Capital Expenditure)" items={simulatedData.capex} />
              <BreakdownTable title="OPEX (Operational Expenditure)" items={simulatedData.opex} />
              <BreakdownTable title="Tangible Benefits" items={simulatedData.tangibleBenefits} />
              <BreakdownTable title="Intangible Benefits" items={simulatedData.intangibleBenefits} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

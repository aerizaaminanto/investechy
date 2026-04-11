import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import { fetchProjects } from "../store/projectThunk";
import api from "../services/api";
import "../components/report.css";

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

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatPercent = (value) => {
  const amount = Number(value);
  if (Number.isNaN(amount)) return "-";
  return `${amount.toFixed(2)}%`;
};

const getProjectDisplayName = (project) => project?.projectName?.trim() || "Untitled Project";

const mapSimulationHistoryToReports = (project) => {
  const simulations = Array.isArray(project?.simulationHistory) ? project.simulationHistory : [];

  return simulations.map((simulation, index) => ({
    id: `${project?._id || project?.id}-${simulation?._id || index}`,
    projectId: project?._id || project?.id,
    name: getProjectDisplayName(project),
    scenarioName: simulation?.scenarioName || "Current Scenario",
    date: simulation?.calculatedAt || project?.updatedAt || project?.createdAt,
    roi: Number(simulation?.financialResults?.roi || 0),
    ieScore: simulation?.financialResults?.ieScore,
    status:
      simulation?.financialResults?.feasibilityStatus ||
      (simulation?.financialResults?.isFeasible === true
        ? "Feasible"
        : simulation?.financialResults?.isFeasible === false
          ? "Not Feasible"
          : project?.status || "Unknown"),
    pdfUrl: "",
  }));
};

const Report = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [sortType, setSortType] = useState("newest");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reports, setReports] = useState([]);
  const { projectList, loading, error } = useSelector((state) => state.project);

  useEffect(() => {
    dispatch(fetchProjects());
    const timer = setTimeout(() => setIsLoaded(true), 100);

    return () => clearTimeout(timer);
  }, [dispatch]);

  useEffect(() => {
    if (!projectList.length) {
      setReports([]);
      return;
    }

    let isMounted = true;

    const loadReports = async () => {
      setReportLoading(true);
      setReportError("");

      try {
        const reportResponses = await Promise.all(
          projectList.map(async (project) => {
            const projectId = project?._id || project?.id;
            if (!projectId) return [];

            try {
              const response = await api.get(`/projects/${projectId}/reports`);
              const reportItems = Array.isArray(response?.data) ? response.data : [];

              if (reportItems.length === 0) {
                return mapSimulationHistoryToReports(project);
              }

              return reportItems.map((reportItem, index) => ({
                id: `${projectId}-${index}`,
                projectId,
                name: getProjectDisplayName(project),
                scenarioName: reportItem?.scenarioName || "Current Scenario",
                date: reportItem?.date || project?.updatedAt || project?.createdAt,
                roi: Number.parseFloat(String(reportItem?.roi || "").replace(/[^\d.-]/g, "")),
                ieScore: reportItem?.ieScore,
                status: reportItem?.feasibilityStatus || project?.status || "Unknown",
                pdfUrl: reportItem?.pdfUrl || "",
              }));
            } catch {
              return mapSimulationHistoryToReports(project);
            }
          }),
        );

        if (!isMounted) return;

        setReports(reportResponses.flat());
      } catch (fetchError) {
        if (!isMounted) return;
        setReportError(fetchError?.message || "Failed to load reports.");
      } finally {
        if (isMounted) {
          setReportLoading(false);
        }
      }
    };

    loadReports();

    return () => {
      isMounted = false;
    };
  }, [projectList]);

  const statusOptions = useMemo(() => {
    return [...new Set(reports.map((item) => item.status).filter(Boolean))];
  }, [reports]);

  const filteredReports = useMemo(() => {
    let result = [...reports];

    if (filterStatus) {
      result = result.filter((item) => item.status === filterStatus);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      return sortType === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [reports, filterStatus, sortType]);

  return (
    <div className="report-container">
      <Sidebar activeMenu="Report List" />

      <main className={`report-content ${isLoaded ? "page-fade-in" : ""}`}>
        <h1 className="report-title">Report List</h1>

        <div className="report-filters">
          <div className="custom-dropdown">
            <button
              className={`dropdown-btn ${isOrderOpen ? "active" : ""}`}
              onClick={() => {
                setIsOrderOpen(!isOrderOpen);
                setIsStatusOpen(false);
              }}
            >
              Order by
              <span className="arrow-icon-visible"></span>
            </button>

            {isOrderOpen && (
              <div className="dropdown-content border-style dropdown-animate">
                <div
                  className={`menu-item ${sortType === "newest" ? "selected" : ""}`}
                  onClick={() => {
                    setSortType("newest");
                    setIsOrderOpen(false);
                  }}
                >
                  Newest
                </div>
                <div
                  className={`menu-item ${sortType === "oldest" ? "selected" : ""}`}
                  onClick={() => {
                    setSortType("oldest");
                    setIsOrderOpen(false);
                  }}
                >
                  Oldest
                </div>
              </div>
            )}
          </div>

          <div className="custom-dropdown">
            <button
              className={`dropdown-btn ${isStatusOpen ? "active" : ""}`}
              onClick={() => {
                setIsStatusOpen(!isStatusOpen);
                setIsOrderOpen(false);
              }}
            >
              {filterStatus || "Status"}
              <span className="arrow-icon-visible"></span>
            </button>

            {isStatusOpen && (
              <div className="dropdown-content border-style dropdown-animate">
                <div
                  className="menu-item"
                  onClick={() => {
                    setFilterStatus("");
                    setIsStatusOpen(false);
                  }}
                >
                  All Status
                </div>
                {statusOptions.map((status) => (
                  <div
                    key={status}
                    className={`menu-item ${filterStatus === status ? "selected" : ""}`}
                    onClick={() => {
                      setFilterStatus(status);
                      setIsStatusOpen(false);
                    }}
                  >
                    {status}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="report-card">
          <h2 className="card-subtitle">History</h2>

          {(loading || reportLoading) && <p>Loading reports...</p>}
          {error && <p style={{ color: "#b42318" }}>{error}</p>}
          {reportError && <p style={{ color: "#b42318" }}>{reportError}</p>}

          {!loading && !reportLoading && !error && !reportError && (
            <div className="table-wrapper">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th className="text-left">Business Name</th>
                    <th>Date</th>
                    <th>Scenario</th>
                    <th>ROI</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan="6">No calculated reports available yet.</td>
                    </tr>
                  ) : (
                    filteredReports.map((report) => (
                      <tr key={report.id} className="row-animate">
                        <td className="report-name-cell">{report.name}</td>
                        <td className="report-date-cell">{formatDate(report.date)}</td>
                        <td>{report.scenarioName}</td>
                        <td>
                          <span className="roi-tag">{formatPercent(report.roi)}</span>
                        </td>
                        <td>
                          <span
                            className={`status-badge ${String(report.status)
                              .toLowerCase()
                              .replace(/\s+/g, "-")}`}
                          >
                            {report.status}
                          </span>
                        </td>
                        <td className="action-cell">
                          <button
                            className="btn-open"
                            onClick={() => navigate(`/report-list/${report.projectId}`)}
                          >
                            Open
                          </button>
                          <span className="v-divider">|</span>
                          <button className="btn-delete-text" type="button">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Report;

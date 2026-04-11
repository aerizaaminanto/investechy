import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaChartLine, FaCoins, FaMoneyBillWave, FaSearch } from "react-icons/fa";
import { LuBadgeDollarSign } from "react-icons/lu";
import Sidebar from "../components/sidebar";
import SummaryCard from "../components/SummaryCard";
import ChartSection from "../components/CharSection";
import AnalyticsTable from "../components/AnalyticsTable";
import InsightBox from "../components/InsightBox";
import { useAppSettings } from "../context/AppSettingsContext";
import api, {
  DEFAULT_USER_AVATAR,
  fetchCurrentUser,
  getStoredUser,
  getUserDisplayName,
  getUserPhoto,
  getUserRoleLabel,
} from "../services/api";
import "./dashboard.css";

export default function Dashboard() {
  const { t } = useAppSettings();
  const [isLoaded, setIsLoaded] = useState(false);
  const [storedUser, setStoredUser] = useState(() => getStoredUser());
  const displayName = getUserDisplayName(storedUser);
  const displayPhoto = getUserPhoto(storedUser) || DEFAULT_USER_AVATAR;
  const displayRole = getUserRoleLabel(storedUser);
  const [dashboardData, setDashboardData] = useState({
    overviewCards: {
      totalInvestmentCapex: 0,
      totalProject: 0,
      waitingInputDataProject: 0,
      calculatedProjectValue: 0,
    },
    statistics: {
      ieScoreProjection: [],
      ieScoreAndRoiComparison: {
        selectedProject: "",
        data: [],
      },
    },
    insightNote: "",
    topProjects: [],
  });

  useEffect(() => {
    let isMounted = true;

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

    const deriveDashboardFromProjects = (projects = []) => {
      const totalProject = projects.length;
      const waitingInputDataProject = projects.filter(
        (project) => project?.status === "WAITING_USER_INPUT",
      ).length;
      const calculatedProjectValue = projects.filter(
        (project) => project?.status === "CALCULATED",
      ).length;

      const totalInvestmentCapex = projects.reduce((total, project) => {
        const capexItems = project?.draft?.capex || project?.capex || [];
        const capexTotal = Array.isArray(capexItems)
          ? capexItems.reduce((sum, item) => sum + Number(item?.nominal || 0), 0)
          : 0;
        return total + capexTotal;
      }, 0);

      const ieScoreProjection = projects
        .map((project) => {
          const latestSimulation = getLatestSimulation(project?.simulationHistory);
          const score =
            latestSimulation?.financialResults?.ieScore ??
            project?.mcfarlan?.coordinates?.x ??
            0;

          return {
            projectName: project?.projectName || `PROJECT ${project?.projectId || project?._id || ""}`.trim(),
            score: Number(score) || 0,
          };
        })
        .filter((item) => item.score > 0)
        .slice(0, 5);

      return {
        overviewCards: {
          totalInvestmentCapex,
          totalProject,
          waitingInputDataProject,
          calculatedProjectValue,
        },
        statistics: {
          ieScoreProjection,
        },
      };
    };

    const loadDashboardData = async () => {
      try {
        const [dashboardResponse, projectsResponse] = await Promise.allSettled([
          api.get("/dashboard"),
          api.get("/projects"),
        ]);

        const dashboardPayload =
          dashboardResponse.status === "fulfilled"
            ? dashboardResponse.value?.data || dashboardResponse.value
            : null;

        const projectsPayload =
          projectsResponse.status === "fulfilled"
            ? projectsResponse.value?.data || projectsResponse.value || []
            : [];

        const derivedData = deriveDashboardFromProjects(projectsPayload);

        if (isMounted) {
          setDashboardData({
            overviewCards: {
              totalInvestmentCapex:
                dashboardPayload?.overviewCards?.totalInvestmentCapex ??
                derivedData.overviewCards.totalInvestmentCapex,
              totalProject:
                dashboardPayload?.overviewCards?.totalProject ??
                derivedData.overviewCards.totalProject,
              waitingInputDataProject:
                dashboardPayload?.overviewCards?.waitingInputDataProject ??
                derivedData.overviewCards.waitingInputDataProject,
              calculatedProjectValue:
                dashboardPayload?.overviewCards?.calculatedProjectValue ??
                derivedData.overviewCards.calculatedProjectValue,
            },
            statistics: {
              ieScoreProjection:
                dashboardPayload?.statistics?.ieScoreProjection?.length
                  ? dashboardPayload.statistics.ieScoreProjection
                  : derivedData.statistics.ieScoreProjection,
              ieScoreAndRoiComparison:
                dashboardPayload?.statistics?.ieScoreAndRoiComparison || {
                  selectedProject: "",
                  data: [],
                },
            },
            insightNote: dashboardPayload?.insightNote || "",
            topProjects: dashboardPayload?.topProjects || [],
          });
        }
      } catch {
        // Keep zero-state data if requests fail.
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const syncCurrentUser = async () => {
      try {
        const nextUser = await fetchCurrentUser();
        if (isMounted) {
          setStoredUser(nextUser);
        }
      } catch {
        // Keep stored session data if user refresh fails.
      }
    };

    syncCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    document.body.classList.remove("page-exit");
    const timer = window.setTimeout(() => setIsLoaded(true), 100);

    return () => window.clearTimeout(timer);
  }, []);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);

  const statisticsData = useMemo(
    () =>
      (dashboardData.statistics?.ieScoreProjection || []).map((item) => ({
        label: item.projectName,
        value: item.score,
      })),
    [dashboardData],
  );

  const comparisonOptions = useMemo(
    () => dashboardData.statistics?.ieScoreAndRoiComparison?.selectedProject || "No Project Selected",
    [dashboardData],
  );

  const comparisonData = useMemo(
    () =>
      (dashboardData.statistics?.ieScoreAndRoiComparison?.data || []).map((item) => ({
        label: item.simulationName,
        ie: item.roiScore,
        roi: item.ieScore,
      })),
    [dashboardData],
  );

  return (
    <div className="dashboard-wrapper dashboard-shell">
      <Sidebar activeMenu="Dashboard" />

      <main className={`main-content dashboard-main ${isLoaded ? "page-fade-in" : ""}`}>
        <div className="content-wrapper dashboard-inner">
          <header className="top-bar dashboard-topbar">
            <div className="welcome-message">
              <h1>{`${t("dashboardGreeting")}, ${displayName}`}</h1>
              <p>Welcome back, We miss you coming</p>
            </div>

            <div className="top-bar-right">
              <label className="search-wrapper dashboard-search" htmlFor="dashboard-search-input">
                <span className="search-icon-wrap" aria-hidden="true">
                  <FaSearch className="search-icon" />
                </span>
                <input
                  id="dashboard-search-input"
                  type="text"
                  placeholder={t("dashboardSearch")}
                  aria-label={t("dashboardSearch")}
                />
              </label>

              <div className="profile-info">
                <Link
                  to="/profile"
                  className="user-profile"
                  style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
                >
                  <img src={displayPhoto} alt="Avatar" className="avatar" />
                  <div className="user-detail">
                    <span className="user-name">{displayName}</span>
                    <span className="user-role">{displayRole}</span>
                  </div>
                </Link>
              </div>
            </div>
          </header>

          <div className="summary-grid dashboard-card-grid">
            <SummaryCard
              title="Total Investment"
              value={formatCurrency(dashboardData.overviewCards?.totalInvestmentCapex)}
              icon={<FaMoneyBillWave />}
            />
            <SummaryCard
              title="Total Project"
              value={String(dashboardData.overviewCards?.totalProject ?? 0)}
              icon={<FaChartLine />}
            />
            <SummaryCard
              title="Waiting Input Data Project"
              value={String(dashboardData.overviewCards?.waitingInputDataProject ?? 0)}
              icon={<FaCoins />}
            />
            <SummaryCard
              title="Calculated Project Value"
              value={String(dashboardData.overviewCards?.calculatedProjectValue ?? 0)}
              icon={<LuBadgeDollarSign />}
            />
          </div>

          <section className="dashboard-feature-grid">
            <div className="dashboard-feature-main">
              <ChartSection
                data={statisticsData}
                type="user"
                subtitle="Statistics"
                title="IE Score Projection"
                compact
              />
              <InsightBox note={dashboardData.insightNote} />
              <div className="table-section dashboard-table-section">
                <AnalyticsTable data={dashboardData.topProjects || []} />
              </div>
            </div>
            <div className="dashboard-feature-side">
              <div className="comparison-card">
                <span className="comparison-subtitle">Statistics</span>
                <h3>IE Score And ROI Comparison</h3>
                <select className="comparison-select" value={comparisonOptions} readOnly>
                  <option>{comparisonOptions}</option>
                </select>

                {comparisonData.length === 0 ? (
                  <div className="comparison-empty-card">No comparison data yet.</div>
                ) : (
                  <div className="comparison-chart">
                    {comparisonData.map((item) => (
                      <div key={item.label} className="comparison-group">
                        <div className="comparison-bars">
                          <div className="comparison-bar gold" style={{ height: `${item.ie}%` }} />
                          <div className="comparison-bar green" style={{ height: `${item.roi}%` }} />
                        </div>
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

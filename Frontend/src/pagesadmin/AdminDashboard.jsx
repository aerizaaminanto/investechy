import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SidebarAdmin from "./admsidebar";
import SummaryCard from "../components/SummaryCard";
import ChartSection from "../components/CharSection";
import { fetchAdminDashboard } from "../store/projectThunk";
import { useAdminPageTransition } from "./useAdminPageTransition";
import "./adminTransitions.css";
import "./AdminDashboard.css";

const formatShortDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
  }).format(date);
};

const formatWeekRangeLabel = (startValue, endValue) => {
  const startDate = new Date(startValue);
  const endDate = new Date(endValue);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return "Week";
  }

  return `${new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
  }).format(startDate).replace(",", "")}-${new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
  }).format(endDate)}`;
};

const normalizeChartData = (items = [], getLabel) =>
  (items || []).map((item) => ({
    label: getLabel(item),
    rawValue: item.total || 0,
  }));

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const [filter, setFilter] = useState("LAST_7_DAYS");
  const { adminDashboard, loading, error } = useSelector((state) => state.project);
  const dashboardData = adminDashboard?.data ?? adminDashboard ?? null;
  const { transitionClassName } = useAdminPageTransition();

  useEffect(() => {
    dispatch(fetchAdminDashboard());
  }, [dispatch]);

  const dailyChartData = useMemo(
    () => normalizeChartData(dashboardData?.dailyLast7Days, (item) => formatShortDate(item.date)),
    [dashboardData],
  );

  const weeklyChartData = useMemo(
    () => normalizeChartData(
      dashboardData?.weeklyLast4Weeks,
      (item) => formatWeekRangeLabel(item.weekStart, item.weekEnd),
    ),
    [dashboardData],
  );

  const projectSummary = useMemo(() => ({
    today: dashboardData?.projectsToday ?? 0,
    last7Days: (dashboardData?.dailyLast7Days || []).reduce(
      (total, item) => total + (item.total || 0),
      0,
    ),
    last4Weeks: (dashboardData?.weeklyLast4Weeks || []).reduce(
      (total, item) => total + (item.total || 0),
      0,
    ),
    lastYear: dashboardData?.yearlyTotal ?? 0,
  }), [dashboardData]);

  const chartData = filter === "LAST_7_DAYS" ? dailyChartData : weeklyChartData;
  const chartTitle = filter === "LAST_7_DAYS" ? "PROJECTS IN THE LAST 7 DAYS" : "PROJECTS IN THE LAST 4 WEEKS";

  return (
    <div className="admin-layout">
      <SidebarAdmin activeMenu="Dashboard" />
      <main className={`admin-content ${transitionClassName}`}>
        <header className="top-bar">
          <div className="welcome dashboard-intro">
            <h1>Project Activity Overview</h1>
            <p>Track how many projects were created across key time ranges.</p>
          </div>
        </header>

        {loading && <p className="dashboard-feedback">Loading project summary...</p>}
        {error && <p className="dashboard-feedback error">{error}</p>}
        {!loading && !error && !dashboardData && (
          <p className="dashboard-feedback error">
            Admin dashboard data is empty.
          </p>
        )}

        <div className="summary-grid">
          <SummaryCard
            title="PROJECTS TODAY"
            value={projectSummary.today}
            icon="https://img.icons8.com/?size=100&id=nGCq83WiIaj1&format=png&color=00381e"
          />
          <SummaryCard
            title="LAST 7 DAYS"
            value={projectSummary.last7Days}
            icon="https://img.icons8.com/?size=100&id=FEvoAE6bQo0Q&format=png&color=00381e"
          />
          <SummaryCard
            title="LAST 4 WEEKS"
            value={projectSummary.last4Weeks}
            icon="https://img.icons8.com/?size=100&id=70110&format=png&color=00381e"
          />
          <SummaryCard
            title="LAST 1 YEAR"
            value={projectSummary.lastYear}
            icon="https://img.icons8.com/?size=100&id=9emOgiekluvM&format=png&color=00381e"
          />
        </div>

        <div className="chart-wrapper">
          <div className="chart-header-row">
            <h2>{chartTitle}</h2>
            <div className="toggle-buttons">
              <button
                className={filter === "LAST_7_DAYS" ? "active" : ""}
                onClick={() => setFilter("LAST_7_DAYS")}
              >
                LAST 7 DAYS
              </button>
              <button
                className={filter === "LAST_4_WEEKS" ? "active" : ""}
                onClick={() => setFilter("LAST_4_WEEKS")}
              >
                LAST 4 WEEKS
              </button>
            </div>
          </div>
          <ChartSection data={chartData} type="admin" />
        </div>
      </main>
    </div>
  );
}

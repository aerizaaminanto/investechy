import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/sidebar";
import { usePopup } from "../components/PopupProvider";
import { useAppSettings } from "../context/AppSettingsContext";
import { deleteProject, fetchProjects } from "../store/projectThunk";
import "./projectList.css";

const normalizeStatus = (status = "", t) => {
  const normalized = status.replaceAll("_", " ");
  if (status === "CALCULATED") return t("calculated");
  if (status === "WAITING_USER_INPUT") return t("waitingInput");
  if (status === "DRAFTING") return t("drafting");
  return normalized;
};
const getProjectId = (project) => project?._id || project?.id || "";

const getProjectDisplayName = (project) => {
  const name = project?.projectName?.trim();
  return name || "Untitled Project";
};

const formatProjectDate = (value, language = "id") => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat(language === "id" ? "id-ID" : "en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

export default function ProjectList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const popup = usePopup();
  const { t, settings } = useAppSettings();
  const [animate, setAnimate] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const { projectList, loading, error } = useSelector((state) => state.project);

  useEffect(() => {
    document.body.classList.remove("page-exit");
    setAnimate(true);
    dispatch(fetchProjects());
  }, [dispatch]);

  const stats = useMemo(() => {
    const counts = {
      total: projectList.length,
      calculated: 0,
      waiting: 0,
      drafting: 0,
      error: 0,
    };

    projectList.forEach((project) => {
      if (project.status === "CALCULATED") counts.calculated += 1;
      if (project.status === "WAITING_USER_INPUT") counts.waiting += 1;
      if (project.status === "DRAFTING") counts.drafting += 1;
      if (project.status === "ERROR") counts.error += 1;
    });

    return counts;
  }, [projectList]);

  const sortedProjects = useMemo(() => {
    return [...projectList].sort((a, b) => {
      const dateA = new Date(a?.createdAt || a?.updatedAt || 0).getTime();
      const dateB = new Date(b?.createdAt || b?.updatedAt || 0).getTime();
      return dateB - dateA;
    });
  }, [projectList]);

  const handleDeleteProject = async (project) => {
    const projectId = getProjectId(project);
    const projectName = getProjectDisplayName(project);

    if (!projectId) return;

    const isConfirmed = await popup.confirm({
      title: { id: "Hapus Project", en: t("delete") + " Project" },
      message: {
        id: `Project "${projectName}" akan dihapus dari daftar. Aksi ini tidak bisa dibatalkan.`,
        en: `Project "${projectName}" will be removed from the list. This action cannot be undone.`,
      },
      confirmText: { id: "Ya, hapus", en: t("delete") },
      cancelText: { id: "Kembali", en: t("back") },
      tone: "danger",
    });
    if (!isConfirmed) return;

    setDeletingId(projectId);
    const resultAction = await dispatch(deleteProject(projectId));
    setDeletingId("");

    if (deleteProject.rejected.match(resultAction)) {
      await popup.alert({
        title: { id: "Penghapusan Gagal", en: "Delete Failed" },
        message: resultAction.payload || { id: "Gagal menghapus project.", en: "Failed to delete the project." },
        tone: "danger",
      });
      return;
    }

    dispatch(fetchProjects());
    popup.notify({
      title: { id: "Project Dihapus", en: "Project Deleted" },
      message: {
        id: `"${projectName}" berhasil dihapus dari portfolio kamu.`,
        en: `"${projectName}" was successfully removed from your portfolio.`,
      },
    });
  };

  return (
    <div className="dashboard-layout">
      <Sidebar activeMenu="Project List" />

      <main className={`main-content ${animate ? "page-enter" : ""}`}>
        <div className="header">
          <div>
            <h1>{t("projectsPortfolio")}</h1>
            <p>{t("projectsPortfolioSub")}</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <p>{t("totalProjects")}</p>
            <h2>{stats.total}</h2>
          </div>
          <div className="stat-card">
            <p>{t("calculated")}</p>
            <h2>{stats.calculated}</h2>
          </div>
          <div className="stat-card">
            <p>{t("waitingInput")}</p>
            <h2>{stats.waiting}</h2>
          </div>
          <div className="stat-card">
            <p>{t("drafting")}</p>
            <h2>{stats.drafting}</h2>
          </div>
        </div>

        <div className="project-header">
          <h2>{t("recentProjects")}</h2>
          <button className="btn-primary" onClick={() => navigate("/new-project")}>
            + {t("newProject")}
          </button>
        </div>

        {loading && <p>Loading projects...</p>}
        {error && <p style={{ color: "#b42318" }}>{error}</p>}

        {!loading && !error && (
          <div className="project-grid">
            {sortedProjects.length === 0 ? (
              <div className="project-card">
                <div className="card-top">
                  <div>
                    <p className="label">{t("projectName")}</p>
                    <h3>{t("noProjects")}</h3>
                  </div>
                </div>
                <div className="tag">{t("startCreating")}</div>
              </div>
            ) : (
              sortedProjects.map((item) => {
                const projectId = getProjectId(item);

                return (
                <div className="project-card" key={projectId}>
                  <div className="card-top">
                    <div>
                      <p className="label">{t("projectName")}</p>
                      <h3>{getProjectDisplayName(item)}</h3>
                    </div>

                    <span
                      className={`status ${String(item.status || "")
                        .toLowerCase()
                        .replaceAll("_", "-")}`}
                    >
                      {normalizeStatus(item.status, t)}
                    </span>
                  </div>

                  <div className="tag">{item.industry}</div>

                  <div className="card-footer">
                    <div>
                      <p className="label">{t("createdAt")}</p>
                      <h4>{formatProjectDate(item.createdAt || item.updatedAt, settings.language)}</h4>
                    </div>

                    <div className="card-actions">
                      <button
                        className="btn-detail"
                        onClick={() => navigate(`/edit-data/${projectId}`)}
                      >
                        {t("viewDetail")}
                      </button>
                      {item.status === "ERROR" && (
                        <button
                          className="btn-delete-project"
                          type="button"
                          onClick={() => handleDeleteProject(item)}
                          disabled={deletingId === projectId}
                        >
                          {deletingId === projectId ? t("deleting") : t("delete")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )})
            )}
          </div>
        )}
      </main>
    </div>
  );
}

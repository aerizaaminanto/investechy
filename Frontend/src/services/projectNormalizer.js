const PROJECT_OVERRIDE_KEY = "investechy_project_overrides";
const PENDING_PROJECT_OVERRIDE_KEY = "investechy_pending_project_override";

const unwrapObjectId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value.$oid) return value.$oid;
  return "";
};

const unwrapDate = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && value.$date) return value.$date;
  return "";
};

const normalizeSimulationHistory = (simulationHistory = []) => {
  if (!Array.isArray(simulationHistory)) return [];

  return simulationHistory.map((simulation) => ({
    ...simulation,
    _id: unwrapObjectId(simulation?._id) || simulation?._id,
    calculatedAt: unwrapDate(simulation?.calculatedAt) || simulation?.calculatedAt,
  }));
};

export const getProjectId = (project) =>
  unwrapObjectId(project?._id) ||
  unwrapObjectId(project?.id) ||
  project?.projectId ||
  "";

const readOverrides = () => {
  try {
    const raw = localStorage.getItem(PROJECT_OVERRIDE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeOverrides = (overrides) => {
  localStorage.setItem(PROJECT_OVERRIDE_KEY, JSON.stringify(overrides));
};

const readPendingOverride = () => {
  try {
    const raw = localStorage.getItem(PENDING_PROJECT_OVERRIDE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const savePendingProjectOverride = (override) => {
  if (!override || typeof override !== "object") return;
  localStorage.setItem(PENDING_PROJECT_OVERRIDE_KEY, JSON.stringify(override));
};

export const clearPendingProjectOverride = () => {
  localStorage.removeItem(PENDING_PROJECT_OVERRIDE_KEY);
};

export const saveProjectOverride = (projectId, override) => {
  if (!projectId || !override || typeof override !== "object") return;

  const overrides = readOverrides();
  overrides[projectId] = {
    ...overrides[projectId],
    ...override,
  };
  writeOverrides(overrides);
};

const getOverride = (projectId) => {
  if (!projectId) return {};
  return readOverrides()[projectId] || {};
};

const deriveCreatedAtFromObjectId = (projectId) => {
  if (!/^[a-f\d]{24}$/i.test(projectId || "")) return "";

  try {
    const unixSeconds = parseInt(projectId.slice(0, 8), 16);
    if (Number.isNaN(unixSeconds)) return "";
    return new Date(unixSeconds * 1000).toISOString();
  } catch {
    return "";
  }
};

const pickProjectName = (project, override) => {
  if (override?.projectName?.trim()) {
    return override.projectName.trim();
  }

  const directName =
    project?.projectName ||
    project?.name ||
    project?.title ||
    project?.project?.projectName ||
    project?.businessProfile?.projectName;

  if (directName?.trim()) {
    return directName.trim();
  }

  if (project?.industry?.trim()) {
    return `IT Project - ${project.industry.trim()}`;
  }

  return "";
};

export const normalizeProject = (project) => {
  const projectId = getProjectId(project);
  const override = getOverride(projectId);
  const createdAt = unwrapDate(project?.createdAt) || unwrapDate(project?.updatedAt);
  const updatedAt = unwrapDate(project?.updatedAt);
  const simulationHistory = normalizeSimulationHistory(project?.simulationHistory);
  const latestSimulation = [...simulationHistory].sort((a, b) => {
    const dateA = new Date(a?.calculatedAt || 0).getTime();
    const dateB = new Date(b?.calculatedAt || 0).getTime();
    return dateB - dateA;
  })[0];

  const normalized = {
    ...project,
    _id: projectId,
    id: unwrapObjectId(project?.id) || projectId,
    projectName: pickProjectName(project, override),
    createdAt:
      createdAt ||
      updatedAt ||
      override?.createdAt ||
      deriveCreatedAtFromObjectId(projectId),
    updatedAt: updatedAt || createdAt || "",
    expiresAt: unwrapDate(project?.expiresAt) || project?.expiresAt || "",
    simulationHistory,
    latestSimulation,
  };

  if (normalized.projectName && projectId) {
    saveProjectOverride(projectId, {
      projectName: normalized.projectName,
      createdAt: normalized.createdAt,
    });
  }

  return normalized;
};

export const normalizeProjectList = (projects) => {
  if (!Array.isArray(projects)) return [];

  const pendingOverride = readPendingOverride();
  const normalizedProjects = projects.map((project) => normalizeProject(project));

  if (!pendingOverride?.projectName?.trim()) {
    return normalizedProjects;
  }

  const pendingIndustry = String(pendingOverride.industry || "").trim().toLowerCase();
  const pendingLocation = String(pendingOverride.location || "").trim().toLowerCase();
  const pendingPlan = String(pendingOverride.plan || "").trim().toLowerCase();

  const matchesPendingProject = (project) => {
    const currentName = String(project?.projectName || "").trim();
    const isGeneratedName =
      !currentName ||
      /^IT Project\s*-\s*/i.test(currentName) ||
      currentName === "Untitled Project";

    if (!isGeneratedName) {
      return false;
    }

    const sameIndustry =
      pendingIndustry &&
      String(project?.industry || "").trim().toLowerCase() === pendingIndustry;
    const sameLocation =
      !pendingLocation ||
      String(project?.location || "").trim().toLowerCase() === pendingLocation;
    const samePlan =
      !pendingPlan ||
      String(project?.plan || "").trim().toLowerCase() === pendingPlan;

    return sameIndustry && sameLocation && samePlan;
  };

  const matchedProject = [...normalizedProjects]
    .sort((a, b) => {
      const dateA = new Date(a?.createdAt || a?.updatedAt || 0).getTime();
      const dateB = new Date(b?.createdAt || b?.updatedAt || 0).getTime();
      return dateB - dateA;
    })
    .find((project) => matchesPendingProject(project));

  if (!matchedProject) {
    return normalizedProjects;
  }

  const matchedProjectId = getProjectId(matchedProject);
  if (matchedProjectId) {
    saveProjectOverride(matchedProjectId, {
      projectName: pendingOverride.projectName.trim(),
      createdAt: matchedProject.createdAt,
    });
  }
  clearPendingProjectOverride();

  return normalizedProjects.map((project) =>
    getProjectId(project) === matchedProjectId
      ? {
          ...project,
          projectName: pendingOverride.projectName.trim(),
        }
      : project,
  );
};

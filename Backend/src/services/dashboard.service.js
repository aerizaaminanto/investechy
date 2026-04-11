import { Project, User } from "../models/index.js";

const EMPTY_DASHBOARD = {
  overviewCards: {
    totalInvestmentCapex: 0,
    totalProject: 0,
    waitingInputDataProject: 0,
    calculatedProjectValue: 0,
  },
  statistics: {
    ieScoreProjection: [],
    ieScoreAndRoiComparison: {
      selectedProject: "-",
      data: [],
    },
  },
  insightNote: "Belum ada data proyek. Silakan buat proyek baru untuk melihat statistik.",
  topProjects: [],
};

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

const sumNominalItems = (items = []) =>
  Array.isArray(items)
    ? items.reduce((sum, item) => sum + Number(item?.nominal || 0), 0)
    : 0;

const getCalculatedProjects = (projects = []) =>
  projects.filter(
    (project) =>
      project?.status === "CALCULATED" &&
      Array.isArray(project?.simulationHistory) &&
      project.simulationHistory.length > 0
  );

const buildProjectRanking = (projects = []) =>
  getCalculatedProjects(projects)
    .map((project) => {
      const latestSimulation = getLatestSimulation(project.simulationHistory);
      if (!latestSimulation) {
        return null;
      }

      return {
        projectId: project._id?.toString(),
        projectName: project.projectName || "Unnamed Project",
        simulationName: latestSimulation.scenarioName || "Latest Simulation",
        investment: sumNominalItems(latestSimulation.simulatedData?.capex),
        roiPercentage: Number(latestSimulation.financialResults?.roi || 0),
        ieScore: Number(latestSimulation.financialResults?.ieScore || 0),
        status: latestSimulation.financialResults?.feasibilityStatus || "Unknown",
        updatedAt: new Date(project.updatedAt || project.createdAt || 0).getTime(),
        simulationHistory: project.simulationHistory || [],
      };
    })
    .filter(Boolean);

export const updateInsightNote = (projects = []) => {
  const rankedProjects = buildProjectRanking(projects).sort(
    (a, b) =>
      b.roiPercentage - a.roiPercentage ||
      b.ieScore - a.ieScore ||
      b.updatedAt - a.updatedAt
  );

  if (rankedProjects.length === 0) {
    return "Belum ada data kalkulasi yang tersedia untuk memberikan wawasan.";
  }

  const bestProject = rankedProjects[0];
  const roi = Number(bestProject.roiPercentage || 0).toFixed(2);
  const ieScore = Number(bestProject.ieScore || 0).toFixed(2);

  if (bestProject.roiPercentage >= 150 && bestProject.ieScore >= 70) {
    return `Project "${bestProject.projectName}" menunjukkan performa sangat kuat dengan ROI ${roi}% dan IE Score ${ieScore}. Ini layak diprioritaskan sebagai investasi utama.`;
  }

  if (bestProject.roiPercentage >= 100 && bestProject.ieScore >= 50) {
    return `Project "${bestProject.projectName}" memiliki prospek baik dengan ROI ${roi}% dan IE Score ${ieScore}. Pertimbangkan untuk memprioritaskan proyek ini.`;
  }

  if (bestProject.roiPercentage > 0) {
    return `Project "${bestProject.projectName}" saat ini mencatat ROI ${roi}% dengan IE Score ${ieScore}. Masih ada potensi optimasi melalui simulasi lanjutan.`;
  }

  return `Project "${bestProject.projectName}" masih memerlukan evaluasi lanjutan karena ROI saat ini ${roi}%. Tinjau kembali asumsi biaya dan manfaatnya.`;
};

export const updateInsightNoteByUserId = async (
  userId,
  customInsightNote = null
) => {
  try {
    const normalizedCustomNote =
      typeof customInsightNote === "string" ? customInsightNote.trim() : "";

    await User.findByIdAndUpdate(userId, {
      customInsightNote: normalizedCustomNote || null,
    });

    const projects = await Project.find({ userId }).sort({
      updatedAt: -1,
      createdAt: -1,
    });

    const simulationCount = projects.reduce(
      (total, project) =>
        total +
        (Array.isArray(project?.simulationHistory)
          ? project.simulationHistory.length
          : 0),
      0
    );

    return {
      success: true,
      insightNote: normalizedCustomNote || updateInsightNote(projects),
      projectCount: projects.length,
      simulationCount,
      isCustom: Boolean(normalizedCustomNote),
    };
  } catch (error) {
    console.error("Dashboard insight update error:", error.message);
    throw error;
  }
};

export const getDashboardData = async (userId) => {
  try {
    const [projects, user] = await Promise.all([
      Project.find({ userId }).sort({ updatedAt: -1, createdAt: -1 }),
      User.findById(userId).select("customInsightNote"),
    ]);

    if (!projects || projects.length === 0) {
      return {
        ...EMPTY_DASHBOARD,
        insightNote: user?.customInsightNote?.trim() || EMPTY_DASHBOARD.insightNote,
      };
    }

    const calculatedProjects = getCalculatedProjects(projects);
    const rankedProjects = buildProjectRanking(projects);

    const overviewCards = {
      totalInvestmentCapex: rankedProjects.reduce(
        (sum, project) => sum + Number(project.investment || 0),
        0
      ),
      totalProject: projects.length,
      waitingInputDataProject: projects.filter(
        (project) => project?.status === "WAITING_USER_INPUT"
      ).length,
      calculatedProjectValue: calculatedProjects.length,
    };

    const ieScoreProjection = rankedProjects
      .map((project) => ({
        projectName: project.projectName,
        score: Number(project.ieScore || 0),
      }))
      .filter((item) => item.score > 0)
      .slice(0, 5);

    const selectedProject = [...rankedProjects].sort(
      (a, b) => b.updatedAt - a.updatedAt
    )[0];

    const ieScoreAndRoiComparison = selectedProject
      ? {
          selectedProject: selectedProject.projectName,
          data: selectedProject.simulationHistory.map((simulation, index) => ({
            simulationName:
              simulation.scenarioName || `Simulasi ${index + 1}`,
            roiScore: Number(simulation.financialResults?.roi || 0),
            ieScore: Number(simulation.financialResults?.ieScore || 0),
          })),
        }
      : {
          selectedProject: "-",
          data: [],
        };

    const topProjects = [...rankedProjects]
      .sort(
        (a, b) =>
          b.roiPercentage - a.roiPercentage ||
          b.ieScore - a.ieScore ||
          b.updatedAt - a.updatedAt
      )
      .slice(0, 3)
      .map((project) => ({
        projectName: project.projectName,
        simulationName: project.simulationName,
        investment: project.investment,
        roiPercentage: project.roiPercentage,
        ieScore: project.ieScore,
        status: project.status,
      }));

    return {
      overviewCards,
      statistics: {
        ieScoreProjection,
        ieScoreAndRoiComparison,
      },
      insightNote:
        user?.customInsightNote?.trim() || updateInsightNote(projects),
      topProjects,
    };
  } catch (error) {
    console.error("Dashboard data error:", error.message);
    throw error;
  }
};

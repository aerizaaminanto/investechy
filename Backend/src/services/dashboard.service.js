import { findAllProjects } from "../repositories/project.repository.js";
import { findAllSimulations } from "../repositories/simulation.repository.js";
import { User } from "../models/index.js";

// =========================
// 🧠 GENERATE INSIGHT NOTE
// =========================
export const updateInsightNote = (projects, simulations) => {
  if (simulations.length === 0) {
    return "Start your first simulation to get investment insights.";
  }

  // Find best ROI simulation
  const bestSim = simulations.reduce((best, curr) =>
    (curr.roi || 0) > (best.roi || 0) ? curr : best
  );

  // Find related project
  const bestProject = projects.find(
    (p) => p._id?.toString() === bestSim.projectId?.toString()
  );

  const projectName = bestProject?.projectName || "your best project";
  const roi = bestSim.roi || 0;
  const ieScore = bestSim.ieScore || 0;

  if (roi > 150 && ieScore > 70) {
    return `📈 Excellent! "${projectName}" shows exceptional performance with ${roi}% ROI and ${ieScore} IE Score. This is your top investment opportunity.`;
  } else if (roi > 100 && ieScore > 50) {
    return `✅ Good prospect! "${projectName}" demonstrates solid returns with ${roi}% ROI and ${ieScore} IE Score. Consider prioritizing this project.`;
  } else if (roi > 50) {
    return `⚡ Promising! "${projectName}" has potential with ${roi}% ROI. Analyze more scenarios to optimize returns.`;
  } else {
    return `💡 Review needed. "${projectName}" currently shows ${roi}% ROI. Consider adjusting parameters or exploring alternative strategies.`;
  }
};

// =========================
// 🔄 UPDATE INSIGHT NOTE
// =========================
export const updateInsightNoteByUserId = async (userId, customInsightNote = null) => {
  try {
    console.log("🔄 updateInsightNoteByUserId called with:");
    console.log("👤 userId:", userId);
    console.log("📝 customInsightNote:", customInsightNote);
    console.log("📝 Type:", typeof customInsightNote);

    // If custom insight note provided and not empty string, save it to user
    if (customInsightNote !== null && customInsightNote !== undefined && customInsightNote.trim() !== "") {
      console.log("💾 Saving custom insight note to database");
      await User.findByIdAndUpdate(userId, { customInsightNote: customInsightNote.trim() });
    } else {
      console.log("🗑️ Removing custom insight note (will use auto-generated)");
      // If null/undefined/empty, remove custom insight note (will use auto-generated)
      await User.findByIdAndUpdate(userId, { customInsightNote: null });
    }

    // Get user's projects and simulations
    const projects = (await findAllProjects(userId)) || [];
    const simulations = (await findAllSimulations(userId)) || [];

    // Use custom insight note if provided, otherwise generate auto insight
    const finalInsightNote = (customInsightNote !== null && customInsightNote !== undefined && customInsightNote.trim() !== "")
      ? customInsightNote.trim()
      : updateInsightNote(projects, simulations);

    const isCustom = (customInsightNote !== null && customInsightNote !== undefined && customInsightNote.trim() !== "");

    console.log("✅ Final result:");
    console.log("📝 finalInsightNote:", finalInsightNote);
    console.log("🔍 isCustom:", isCustom);

    return {
      success: true,
      insightNote: finalInsightNote,
      projectCount: projects.length,
      simulationCount: simulations.length,
      isCustom,
    };
  } catch (error) {
    console.error("❌ UPDATE INSIGHT NOTE ERROR:", error.message);
    throw error;
  }
};

export const getDashboardData = async (userId) => {
  try {
    // =========================
    // 📥 GET DATA FROM DB
    // =========================
    const projects = (await findAllProjects(userId)) || [];
    const simulations = (await findAllSimulations(userId)) || [];

    // =========================
    // 👤 GET USER CUSTOM INSIGHT
    // =========================
    const user = await User.findById(userId);
    const customInsightNote = user?.customInsightNote;

    // =========================
    // 📊 OVERVIEW CARDS
    // =========================
    const totalInvestmentCapex = projects.reduce(
      (sum, proj) => sum + (proj.investment || 0),
      0
    );

    const totalProject = projects.length;

    const waitingInputDataProject = projects.filter(
      (proj) => !proj.isCalculated
    ).length;

    const calculatedProjectValue = projects.filter(
      (proj) => proj.isCalculated
    ).length;

    // =========================
    // 📈 IE SCORE PROJECTION
    // =========================
    const ieScoreProjection = projects.slice(0, 5).map((proj) => {
      const projSim = simulations.find(
        (sim) => sim.projectId?.toString() === proj._id?.toString()
      );
      return {
        projectName: proj.projectName || "Unnamed Project",
        score: projSim?.ieScore || proj.ieScore || 0,
      };
    });

    // =========================
    // 📊 ROI vs IE SCORE
    // =========================
    const selectedProject = projects[0];

    const comparisonData = simulations
      .filter((sim) => sim.projectId?.toString() === selectedProject?._id?.toString())
      .map((sim) => ({
        simulationName: sim.name || "Unnamed Simulation",
        roiScore: sim.roi || 0,
        ieScore: sim.ieScore || 0,
      }));

    // =========================
    // 🧠 INSIGHT NOTE (CUSTOM OR AUTO-GENERATED)
    // =========================
    const insightNote = customInsightNote || updateInsightNote(projects, simulations);

    // =========================
    // 🏆 TOP PROJECTS
    // =========================
    const topProjects = simulations
      .sort((a, b) => (b.roi || 0) - (a.roi || 0))
      .slice(0, 3)
      .map((sim) => {
        const project = projects.find(
          (p) => p._id?.toString() === sim.projectId?.toString()
        );

        const roi = sim.roi || 0;

        return {
          projectName: project?.projectName || "Unknown Project",
          simulationName: sim.name || "Unnamed Simulation",
          investment: project?.investment || 0,
          roiPercentage: roi,
          ieScore: sim.ieScore || 0,
          status:
            roi > 150
              ? "Highly Feasible"
              : roi > 100
              ? "Feasible"
              : "Less Feasible",
        };
      });

    // =========================
    // 🚀 FINAL RESPONSE
    // =========================
    return {
      overviewCards: {
        totalInvestmentCapex,
        totalProject,
        waitingInputDataProject,
        calculatedProjectValue,
      },
      statistics: {
        ieScoreProjection,
        ieScoreAndRoiComparison: {
          selectedProject: selectedProject?.projectName || null,
          data: comparisonData,
        },
      },
      insightNote,
      topProjects,
    };
  } catch (error) {
    console.error("❌ DASHBOARD ERROR:", error.message);
    throw error;
  }
};
import { Project } from '../models/index.js';

export const getDashboardData = async (userId) => {
  try {
    const projects = await Project.find({ userId });

    if (!projects || projects.length === 0) {
      return {
        overviewCards: {
          totalInvestmentCapex: 0,
          totalProject: 0,
          waitingInputDataProject: 0,
          calculatedProjectValue: 0
        },
        statistics: {
          ieScoreProjection: [],
          ieScoreAndRoiComparison: {
            selectedProject: "-",
            data: []
          }
        },
        insightNote: "Belum ada data proyek. Silakan buat proyek baru untuk melihat statistik.",
        topProjects: []
      };
    }

    // 1. Overview Cards
    const calculatedProjects = projects.filter(p => p.status === 'CALCULATED');
    const waitingProjects = projects.filter(p => p.status === 'WAITING_USER_INPUT');

    // Total Investment Capex: Only from calculated projects
    const totalInvestmentCapex = calculatedProjects.reduce((sum, project) => {
      const latestSimulation = project.simulationHistory[project.simulationHistory.length - 1];
      if (latestSimulation && latestSimulation.simulatedData && latestSimulation.simulatedData.capex) {
        const capexSum = latestSimulation.simulatedData.capex.reduce((cSum, item) => cSum + (item.nominal || 0), 0);
        return sum + capexSum;
      }
      return sum;
    }, 0);

    const overviewCards = {
      totalInvestmentCapex,
      totalProject: projects.length,
      waitingInputDataProject: waitingProjects.length,
      calculatedProjectValue: calculatedProjects.length
    };

    // 2. Statistics - IE Score Projection (Take all calculated projects)
    const ieScoreProjection = calculatedProjects.map(project => {
      const latestSimulation = project.simulationHistory[project.simulationHistory.length - 1];
      return {
        projectName: project.projectName || "Unnamed Project",
        score: latestSimulation?.financialResults?.ieScore || 0
      };
    });

    // 3. Statistics - IE Score & ROI Comparison (Latest calculated project's history)
    let ieScoreAndRoiComparison = {
      selectedProject: "-",
      data: []
    };

    if (calculatedProjects.length > 0) {
      // Sort by updatedAt descending to get the most recentCalculated project
      const latestCalculated = [...calculatedProjects].sort((a, b) => b.updatedAt - a.updatedAt)[0];
      
      ieScoreAndRoiComparison = {
        selectedProject: latestCalculated.projectName || "Unnamed Project",
        data: latestCalculated.simulationHistory.map((sim, index) => ({
          simulationName: sim.scenarioName || `Simulasi ${index + 1}`,
          roiScore: sim.financialResults?.roi || 0,
          ieScore: sim.financialResults?.ieScore || 0
        }))
      };
    }

    // 4. Top Projects (Top 3 by ROI)
    const topProjects = calculatedProjects
      .map(project => {
        const latestSimulation = project.simulationHistory[project.simulationHistory.length - 1];
        const capexSum = latestSimulation.simulatedData.capex.reduce((cSum, item) => cSum + (item.nominal || 0), 0);
        
        return {
          projectName: project.projectName || "Unnamed Project",
          simulationName: latestSimulation.scenarioName || "Latest Simulation",
          investment: capexSum,
          roiPercentage: latestSimulation.financialResults?.roi || 0,
          ieScore: latestSimulation.financialResults?.ieScore || 0,
          status: latestSimulation.financialResults?.feasibilityStatus || "Unknown"
        };
      })
      .sort((a, b) => b.roiPercentage - a.roiPercentage)
      .slice(0, 3);

    // 5. Insight Note
    let insightNote = "Belum ada data kalkulasi yang tersedia untuk memberikan wawasan.";
    if (topProjects.length > 0) {
      const best = topProjects[0];
      insightNote = `Investasi pada proyek "${best.projectName}" memiliki potensi ROI tertinggi sebesar ${best.roiPercentage}%.`;
    }

    return {
      overviewCards,
      statistics: {
        ieScoreProjection,
        ieScoreAndRoiComparison
      },
      insightNote,
      topProjects
    };

  } catch (error) {
    console.error("❌ DASHBOARD ERROR:", error.message);
    throw error;
  }
};
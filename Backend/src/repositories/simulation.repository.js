import Simulation from "../models/simulation.model.js";

export const findAllSimulations = async (userId = null) => {
  if (userId) {
    // Find simulations for projects owned by the user
    const Project = (await import("../models/project.model.js")).default;
    const userProjects = await Project.find({ userId }).select('_id');
    const projectIds = userProjects.map(p => p._id);
    return await Simulation.find({ project_id: { $in: projectIds } });
  }
  return await Simulation.find();
};
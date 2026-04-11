import Project from "../models/project.model.js";

export const findAllProjects = async (userId = null) => {
  if (userId) {
    return await Project.find({ userId });
  }
  return await Project.find();
};
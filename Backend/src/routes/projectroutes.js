import { Router } from "express";
import {
  getProjects,
  createProject
} from "../controllers/project.controller.js";

const router = Router();

// =======================
// 📁 PROJECT ROUTES
// =======================

// GET all projects & CREATE project
router.route("/")
  .get(getProjects)
  .post(createProject);

export default router;
import { Router } from "express";

// =======================
// 📦 CONTROLLERS
// =======================
import {
  createProject,
  getProjectDraft,
  deleteProject,
  getProjects,
  updateDraftProject,
  getProjectReports,
  uploadProjectReportPdf,
  getProjectReportDetail,
  chatWithBot,
  getProjectChatHistory,
  sendProjectChatMessage,
  getConsultants,
  getConsultantById,
  createConsultant,
  updateConsultant,
  deleteConsultant,
  getAdminDashboard,
  getDashboard,
  updateInsight,
  resetInsight,
} from "../controllers/index.js";

import authRoutes from "./authRoutes.js";
import multer from "multer";

// =======================
// 🔐 MIDDLEWARE
// =======================
import { authentication, authorizeRoles } from "../middlewares/auth.js";
import { authorization as protectProject } from "../middlewares/authMiddleware.js";

const router = Router();
const consultantUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});
const reportPdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (file?.mimetype === "application/pdf") {
      callback(null, true);
      return;
    }

    callback(new Error("Only PDF files are allowed."));
  },
});

// AUTH
router.use("/auth", authRoutes);

// CHATBOT GLOBAL
router.post("/chatbot", chatWithBot);

// CONSULTANTS
router.get("/consultants", getConsultants);
router.get("/consultants/:id", getConsultantById);
router.post("/consultants", authentication, authorizeRoles("admin"), consultantUpload.single("photo"), createConsultant);
router.put("/consultants/:id", authentication, authorizeRoles("admin"), consultantUpload.single("photo"), updateConsultant);
router.delete("/consultants/:id", authentication, authorizeRoles("admin"), deleteConsultant);

// ADMIN DASHBOARD
router.get("/admin/dashboard", authentication, authorizeRoles("admin"), getAdminDashboard);

// 🔥 DASHBOARD FIGMA (REQUIRES AUTH)
router.get("/dashboard", authentication, getDashboard);
router.post("/dashboard/insight", authentication, updateInsight);
router.delete("/dashboard/insight", authentication, resetInsight);

// PROJECT
router.get("/projects", authentication, getProjects);
router.post("/projects", authentication, authorizeRoles("user"), createProject);
router.get("/projects/:id", authentication, getProjectDraft);
router.get("/projects/:id/reports", authentication, protectProject, getProjectReports);
router.get("/projects/:id/reports/:reportId", authentication, protectProject, getProjectReportDetail);
router.post("/projects/:id/reports/:reportIndex/pdf", authentication, protectProject, reportPdfUpload.single("pdf"), uploadProjectReportPdf);
router.put("/projects/:id", authentication, protectProject, updateDraftProject);
router.delete("/projects/:id", authentication, protectProject, deleteProject);

// PROJECT CHAT
router.get("/projects/:id/chatbot", authentication, protectProject, getProjectChatHistory);
router.post("/projects/:id/chatbot", authentication, protectProject, sendProjectChatMessage);

export default router;

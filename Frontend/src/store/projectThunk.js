import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";
import {
  clearPendingProjectOverride,
  getProjectId,
  normalizeProject,
  normalizeProjectList,
  savePendingProjectOverride,
  saveProjectOverride,
} from "../services/projectNormalizer";

const extractResponseData = (response) => {
  if (response?.data?.data) {
    return response.data.data;
  }

  if (response?.data) {
    return response.data;
  }

  return response;
};

const getErrorMessage = (error) => error?.data?.message || error?.message || "Request failed.";

export const fetchProjects = createAsyncThunk(
  "project/fetchProjects",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/projects");
      const projects = extractResponseData(response) ?? [];
      return normalizeProjectList(projects);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const createProject = createAsyncThunk(
  "project/createProject",
  async (payload, { rejectWithValue }) => {
    try {
      if (payload?.projectName?.trim()) {
        savePendingProjectOverride({
          projectName: payload.projectName.trim(),
          industry: payload.industry,
          location: payload.location,
          plan: payload.plan,
        });
      }

      const response = await api.post("/projects", payload);
      const project = normalizeProject(extractResponseData(response));
      const projectId = getProjectId(project);

      if (projectId && payload?.projectName?.trim()) {
        saveProjectOverride(projectId, {
          projectName: payload.projectName.trim(),
          createdAt: project?.createdAt,
        });
        clearPendingProjectOverride();
      }

      return normalizeProject({
        ...project,
        projectName: payload?.projectName?.trim() || project?.projectName,
      });
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchProjectDraft = createAsyncThunk(
  "project/fetchProjectDraft",
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/projects/${projectId}`);
      return normalizeProject(extractResponseData(response));
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchProjectById = createAsyncThunk(
  "project/fetchProjectById",
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/projects/${projectId}`);
      return normalizeProject(extractResponseData(response));
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const fetchAdminDashboard = createAsyncThunk(
  "project/fetchAdminDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/dashboard");
      return extractResponseData(response);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const updateProjectDraft = createAsyncThunk(
  "project/updateProjectDraft",
  async ({ projectId, payload }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/projects/${projectId}`, payload);
      return normalizeProject(extractResponseData(response));
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

export const deleteProject = createAsyncThunk(
  "project/deleteProject",
  async (projectId, { rejectWithValue }) => {
    try {
      await api.delete(`/projects/${projectId}`);
      return projectId;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

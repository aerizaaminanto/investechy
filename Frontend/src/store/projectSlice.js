import { createSlice } from "@reduxjs/toolkit";
import {
  createProject,
  fetchAdminDashboard,
  deleteProject,
  fetchProjectById,
  fetchProjectDraft,
  fetchProjects,
  updateProjectDraft,
} from "./projectThunk";

const getProjectEntityId = (project) => project?._id || project?.id || project?.projectId;
const mergeProjectState = (baseProject, nextProject) => ({
  ...baseProject,
  ...nextProject,
  businessDomain: nextProject?.businessDomain || baseProject?.businessDomain || {},
  technologyDomain: nextProject?.technologyDomain || baseProject?.technologyDomain || {},
  mcfarlan: nextProject?.mcfarlan || baseProject?.mcfarlan || {},
  projectName: nextProject?.projectName || baseProject?.projectName || "",
  industry: nextProject?.industry || baseProject?.industry || "",
  scale: nextProject?.scale || baseProject?.scale || "",
  calculatedScale: nextProject?.calculatedScale || baseProject?.calculatedScale || "",
  plan: nextProject?.plan || baseProject?.plan || "",
  location: nextProject?.location || baseProject?.location || "",
  createdAt: nextProject?.createdAt || baseProject?.createdAt || "",
  updatedAt: nextProject?.updatedAt || baseProject?.updatedAt || "",
  expiresAt: nextProject?.expiresAt || baseProject?.expiresAt || "",
  latestSimulation: nextProject?.latestSimulation || baseProject?.latestSimulation || null,
  simulationHistory:
    nextProject?.simulationHistory?.length > 0
      ? nextProject.simulationHistory
      : baseProject?.simulationHistory || [],
});

const initialState = {
  projectList: [],
  adminDashboard: null,
  currentProject: null,
  currentDraft: null,
  selectedProject: null,
  status: "idle",
  loading: false,
  error: null,
};

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    clearProjectError: (state) => {
      state.error = null;
    },
    resetCurrentProject: (state) => {
      state.currentProject = null;
      state.currentDraft = null;
      state.selectedProject = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projectList = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load projects.";
      })
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.adminDashboard = action.payload?.data ?? action.payload;
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load admin dashboard.";
      })
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.status = "drafting";
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = action.payload;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.status = "idle";
        state.error = action.payload || "Failed to create project.";
      })
      .addCase(fetchProjectDraft.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectDraft.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDraft = action.payload;
        state.status = action.payload?.status?.toLowerCase?.() || state.status;
      })
      .addCase(fetchProjectDraft.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load project draft.";
      })
      .addCase(fetchProjectById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProject = action.payload;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load project.";
      })
      .addCase(updateProjectDraft.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProjectDraft.fulfilled, (state, action) => {
        state.loading = false;
        const mergedDraft = mergeProjectState(state.currentDraft, action.payload);
        state.currentDraft = mergedDraft;
        state.selectedProject = mergeProjectState(state.selectedProject, action.payload);
        state.status = mergedDraft?.status?.toLowerCase?.() || state.status;

        const updatedProjectId = getProjectEntityId(mergedDraft);
        if (!updatedProjectId) {
          return;
        }

        const existingIndex = state.projectList.findIndex(
          (project) => getProjectEntityId(project) === updatedProjectId,
        );

        if (existingIndex >= 0) {
          state.projectList[existingIndex] = mergeProjectState(
            state.projectList[existingIndex],
            mergedDraft,
          );
        } else {
          state.projectList.unshift(mergedDraft);
        }
      })
      .addCase(updateProjectDraft.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to save project draft.";
      })
      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projectList = state.projectList.filter((project) => {
          const projectId = project?._id || project?.id;
          return projectId !== action.payload;
        });
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete project.";
      });
  },
});

export const { clearProjectError, resetCurrentProject } = projectSlice.actions;
export default projectSlice.reducer;

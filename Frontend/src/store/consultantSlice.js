import { createSlice } from "@reduxjs/toolkit";
import {
  createConsultant,
  deleteConsultant,
  fetchConsultantById,
  fetchConsultants,
  updateConsultant,
} from "./consultantThunk";

const getConsultantId = (consultant) => consultant?.id ?? consultant?._id;

const initialState = {
  items: [],
  currentItem: null,
  loading: false,
  saving: false,
  deleting: false,
  error: null,
};

const consultantSlice = createSlice({
  name: "consultant",
  initialState,
  reducers: {
    clearCurrentConsultant: (state) => {
      state.currentItem = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConsultants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConsultants.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchConsultants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load consultants.";
      })
      .addCase(fetchConsultantById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConsultantById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentItem = action.payload;
      })
      .addCase(fetchConsultantById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load consultant.";
      })
      .addCase(createConsultant.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createConsultant.fulfilled, (state, action) => {
        state.saving = false;
        if (action.payload) {
          state.items.push(action.payload);
          state.currentItem = action.payload;
        }
      })
      .addCase(createConsultant.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || "Failed to create consultant.";
      })
      .addCase(updateConsultant.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateConsultant.fulfilled, (state, action) => {
        state.saving = false;
        state.currentItem = action.payload;
        const updatedId = getConsultantId(action.payload) ?? action.meta.arg.id;
        state.items = state.items.map((item) =>
          getConsultantId(item) === updatedId ? action.payload : item,
        );
      })
      .addCase(updateConsultant.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || "Failed to update consultant.";
      })
      .addCase(deleteConsultant.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteConsultant.fulfilled, (state, action) => {
        state.deleting = false;
        state.items = state.items.filter(
          (item) => getConsultantId(item) !== action.payload,
        );
        if (getConsultantId(state.currentItem) === action.payload) {
          state.currentItem = null;
        }
      })
      .addCase(deleteConsultant.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload || "Failed to delete consultant.";
      });
  },
});

export const { clearCurrentConsultant } = consultantSlice.actions;
export default consultantSlice.reducer;

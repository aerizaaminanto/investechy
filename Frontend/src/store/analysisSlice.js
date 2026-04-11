import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  roi: 0,
  payback: 0,
  benefit: 0,
  investment: 0,
};

const analysisSlice = createSlice({
  name: "analysis",
  initialState,
  reducers: {
    setAnalysis: (state, action) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { setAnalysis } = analysisSlice.actions;
export default analysisSlice.reducer;
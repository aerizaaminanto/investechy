import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loading: false,
  result: null,
};

const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setResult: (state, action) => {
      state.result = action.payload;
    },
  },
});

export const { setLoading, setResult } = aiSlice.actions;
export default aiSlice.reducer;
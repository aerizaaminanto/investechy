import { setAnalysis } from "./analysisSlice";
import api from "../services/api";

export const generateAnalysis = (data) => async (dispatch) => {
  const res = await api.post("/analysis", data);
  dispatch(setAnalysis(res.data ?? res));
};

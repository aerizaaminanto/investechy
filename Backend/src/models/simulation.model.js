import mongoose from "mongoose";

const simulationSchema = new mongoose.Schema(
  {
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    name: String,
    roi: Number,
    ie_score: Number,
    status: String,
  },
  { timestamps: true }
);

// ✅ FIX juga di sini
const Simulation =
  mongoose.models.Simulation ||
  mongoose.model("Simulation", simulationSchema);

export default Simulation;
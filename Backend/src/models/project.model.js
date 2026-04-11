import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    investment: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["waiting", "calculated"],
      default: "waiting",
    },
  },
  { timestamps: true }
);

// ✅ FIX OverwriteModelError
const Project =
  mongoose.models.Project || mongoose.model("Project", projectSchema);

export default Project;
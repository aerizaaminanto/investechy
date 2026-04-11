import { getDashboardData, updateInsightNoteByUserId } from "../services/dashboard.service.js";
import { User } from "../models/index.js";

export const getDashboard = async (req, res, next) => {
  try {
    console.log("✅ DASHBOARD API HIT");

    const userId = req.userId; // Get user ID from authenticated request
    const data = await getDashboardData(userId);

    // 🔥 handle undefined / null / empty object
    if (!data || (typeof data === "object" && Object.keys(data).length === 0)) {
      return res.status(404).json({
        success: false,
        message: "Dashboard data not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      data,
    });

  } catch (err) {
    console.error("❌ Dashboard Error:", err);

    // 🔥 jangan return dua kali (hindari unreachable code)
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err?.message || "Unknown error",
    });

    // optional: kalau pakai global error handler
    // next(err);
  }
};

// =========================
// 💡 UPDATE INSIGHT NOTE
// =========================
export const updateInsight = async (req, res, next) => {
  try {
    console.log("✅ UPDATE INSIGHT NOTE API HIT");
    console.log("📝 Request Body:", JSON.stringify(req.body, null, 2));

    const userId = req.userId; // Get user ID from authenticated request

    // Simple and direct approach
    const customInsightNote = req.body?.customInsightNote;
    console.log("🔍 customInsightNote from body:", customInsightNote);
    console.log("🔍 Type:", typeof customInsightNote);

    // Process the note
    let processedNote = null;
    if (customInsightNote !== undefined && customInsightNote !== null) {
      processedNote = String(customInsightNote).trim();
    }
    console.log("🔄 processedNote:", processedNote);

    const result = await updateInsightNoteByUserId(userId, processedNote);

    const message = (processedNote && processedNote.length > 0)
      ? "Custom insight note updated successfully"
      : "Insight note updated successfully";

    return res.status(200).json({
      success: true,
      message,
      data: result,
    });
  } catch (err) {
    console.error("❌ Update Insight Error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to update insight note",
      error: err?.message || "Unknown error",
    });
  }
};

// =========================
// 🔄 RESET INSIGHT NOTE TO AUTO
// =========================
export const resetInsight = async (req, res, next) => {
  try {
    console.log("✅ RESET INSIGHT NOTE API HIT");

    const userId = req.userId; // Get user ID from authenticated request

    // Reset custom insight note to null (will use auto-generated)
    await User.findByIdAndUpdate(userId, { customInsightNote: null });

    // Get updated insight note (auto-generated)
    const result = await updateInsightNoteByUserId(userId, null);

    return res.status(200).json({
      success: true,
      message: "Insight note reset to auto-generated successfully",
      data: result,
    });
  } catch (err) {
    console.error("❌ Reset Insight Error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to reset insight note",
      error: err?.message || "Unknown error",
    });
  }
};
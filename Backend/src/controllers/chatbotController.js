import { sendChatbotRequest } from "../services/chatbotService.js";
import { Chat, Project } from "../models/index.js";

const chatWithBot = async (req, res, next) => {
  try {
    const { payload, message, history } = req.body;

    if (!payload && (!message || typeof message !== "string")) {
      return res.status(400).json({
        status: "error",
        message: "Send 'payload' or at least the 'message' field.",
      });
    }

    const result = await sendChatbotRequest({
      payload,
      message,
      history,
    });

    return res.status(200).json({
      status: "success",
      message: "Chatbot response retrieved successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export { chatWithBot };

const getProjectChatHistory = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    let chat = await Chat.findOne({ projectId });

    if (!chat) {
      chat = { history: [] };
    }

    return res.status(200).json({
      status: "success",
      message: "Successfully retrieved project chat history.",
      data: chat.history,
    });
  } catch (error) {
    next(error);
  }
};

const sendProjectChatMessage = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        status: "error",
        message: "Send at least the 'message' field.",
      });
    }

    // Ambil data project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ status: "error", message: "Project not found." });
    }

    // Ambil atau buat chat history
    let chat = await Chat.findOne({ projectId });
    if (!chat) {
      chat = new Chat({ projectId, history: [] });
    }

    // Menyusun context bawaan agar AI mengerti project
    let historyForModel = chat.history.map((h) => ({
      role: h.role,
      content: h.content,
    }));

    if (historyForModel.length === 0) {
      // Injeksi konteks project sebelum pesan pertama
      const systemContext = `You are an IT consultant assistant (IT Investment Chatbot). Answer user questions regarding the following IT investment project:
Project Name: ${project.projectName}
Industry: ${project.industry}
Scale: ${project.scale}
Detail Plan: ${project.plan}
Feasibility Status: ${project.status}

Help refine or deepen the analysis above if the user asks. Please answer in friendly and professional English.`;
      
      historyForModel.push({ role: "user", content: systemContext });
      historyForModel.push({ role: "assistant", content: "Understood. How can I help you with this project?" });
    }

    // Kirim request ke bot
    const result = await sendChatbotRequest({
      message,
      history: historyForModel,
    });

    const aiMessage = result.text || "Sorry, I am experiencing technical difficulties.";

    // Simpan ke database
    chat.history.push({ role: "user", content: message });
    chat.history.push({ role: "assistant", content: aiMessage });
    await chat.save();

    return res.status(200).json({
      status: "success",
      message: "Chatbot response retrieved manually.",
      data: {
        text: aiMessage,
      },
    });
  } catch (error) {
    next(error);
  }
};

export { getProjectChatHistory, sendProjectChatMessage };

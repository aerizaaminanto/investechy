const CHATBOT_API_URL =
  process.env.CHATBOT_API_URL ||
  "https://mlapi.run/8ad406df-bb6c-4a51-aaaf-3aa3235598d8/v1/responses";

const buildChatbotPayload = ({ message, history = [] }) => {
  const conversation = [];

  history.forEach((item) => {
    if (!item?.role || !item?.content) {
      return;
    }

    // OpenAI Responses API requires different content types per role:
    // - user/system → "input_text"
    // - assistant   → "output_text"
    const contentType = item.role === "assistant" ? "output_text" : "input_text";

    conversation.push({
      role: item.role,
      content: [{ type: contentType, text: item.content }],
    });
  });

  conversation.push({
    role: "user",
    content: [{ type: "input_text", text: message }],
  });

  return {
    input: conversation,
  };
};

const extractResponseText = (data) => {
  if (typeof data === "string") {
    return data;
  }

  if (data?.output_text) {
    return data.output_text;
  }

  if (Array.isArray(data?.output)) {
    const texts = data.output.flatMap((item) =>
      Array.isArray(item?.content)
        ? item.content
            .filter((content) => typeof content?.text === "string")
            .map((content) => content.text)
        : []
    );

    if (texts.length > 0) {
      return texts.join("\n");
    }
  }

  return "";
};

const sendChatbotRequest = async ({ payload, message, history }) => {
  const apiKey = process.env.CHATBOT_API_KEY;

  if (!apiKey) {
    const error = new Error("CHATBOT_API_KEY is not configured.");
    error.status = 500;
    throw error;
  }

  const requestPayload = payload || buildChatbotPayload({ message, history });

  const response = await fetch(CHATBOT_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestPayload),
  });

  const rawText = await response.text();
  let parsedData = null;

  try {
    parsedData = rawText ? JSON.parse(rawText) : null;
  } catch {
    parsedData = rawText;
  }

  if (!response.ok) {
    const error = new Error("Chatbot API request failed.");
    error.status = response.status;
    error.details = parsedData;
    throw error;
  }

  return {
    raw: parsedData,
    text: extractResponseText(parsedData),
  };
};

export { sendChatbotRequest };

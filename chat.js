// File: pages/api/chat.js
import { Router } from "express";
import axios from "axios";

const router = Router();

// Array of API keys for rotation
const apiKeys = [
  "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",
  // Add more keys as needed
];

let apiKeyIndex = 0;

// Function to get the next API key
const getNextApiKey = () => {
  const key = apiKeys[apiKeyIndex];
  apiKeyIndex = (apiKeyIndex + 1) % apiKeys.length;
  return key;
};

router.get("/chat", async (req, res) => {
  const { message, history } = req.query;

  // Set headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  console.log("Received message:", message);
  console.log("Received history:", history);

  const prompt = `
  User: ${message}
  History: ${history}
  `;

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.2-90b-vision-preview",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${getNextApiKey()}`,
          "Content-Type": "application/json",
        },
      }
    );

    const assistantResponse = response.data.choices[0].message.content.trim();

    console.log("Assistant response:", assistantResponse);

    // Send the response as SSE
    res.write(`data: ${JSON.stringify({ role: "assistant", content: assistantResponse })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Error:", error);
    if (error.response) {
      console.error("Error response data:", error.response.data);
    }
    res.write(`data: ${JSON.stringify({ role: "assistant", content: "Sorry, I encountered an error. Please try again." })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
  }
});

export default router;

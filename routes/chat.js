// backend/routes/chat.js
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Gemini API request
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: message }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    // extract model’s reply
    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ No valid answer received from Gemini.";

    res.json({ reply: answer });
  } catch (err) {
    console.error("Gemini Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

export default router;

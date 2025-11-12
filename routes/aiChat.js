import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.post("/", async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    // ✅ Using your working model: gemini-2.5-flash
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `You are CampusConnect AI Tutor. 
Answer questions for 2nd PUC, JEE, and NEET level clearly, step-by-step, 
showing reasoning, formulas, and explanations.
Question: ${message}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    const data = await response.json();

    // Debug log (optional)
    // console.log("GEMINI RAW RESPONSE:", JSON.stringify(data, null, 2));

    let reply = "⚠️ No valid answer received from Gemini.";
    if (data?.candidates?.length > 0) {
      const parts = data.candidates[0]?.content?.parts;
      if (parts && parts.length > 0) {
        reply = parts.map((p) => p.text || "").join("\n").trim();
      }
    } else if (data.error) {
      reply = `⚠️ Gemini Error: ${data.error.message}`;
    }

    res.json({ reply });
  } catch (error) {
    console.error("Gemini API error:", error);
    res
      .status(500)
      .json({ reply: "⚠️ Failed to fetch response from Gemini API." });
  }
});

export default router;

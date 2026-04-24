import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import { generateSinglePost, scorePost } from "./services/ai.js";
import { postToLinkedIn } from "./services/linkedin.js";

import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));

let latestApprovedPost = "";
let postsDB = [];

// ===============================
// ROOT
// ===============================
app.get("/", (req, res) => {
  res.send("✅ LinkedIn AI Agent API running");
});

// ===============================
// GENERATE POSTS
// ===============================
app.get("/generate-multiple", async (req, res) => {
  try {
    const posts = [];

    for (let i = 0; i < 2; i++) { // 🔥 reduce calls
      try {
        const content = await generateSinglePost();
        const score = await scorePost(content);

        posts.push({ content, score });

      } catch (err) {
        console.error("⚠️ Gemini error:", err.message);

        // ✅ Handle quota error gracefully
        if (err.message.includes("quota") || err.message.includes("429")) {
          return res.json({
            error: "API quota exceeded. Please try later or upgrade API plan.",
            posts: []
          });
        }

        posts.push({
          content: "⚠️ Failed to generate post",
          score: { hook: 0, readability: 0, curiosity: 0, personal: 0, total: 0 }
        });
      }
    }

    res.json({ posts });

  } catch (err) {
    console.error("🔥 Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===============================
// APPROVE POST
// ===============================
app.post("/approve", (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Content required" });
  }

  latestApprovedPost = content;

  res.json({ status: "approved" });
});

// ===============================
// POST TO LINKEDIN
// ===============================
app.post("/post", async (req, res) => {
  try {
    if (!latestApprovedPost) {
      return res.status(400).json({ error: "No approved post" });
    }

    await postToLinkedIn(latestApprovedPost);

    res.json({ status: "posted" });

  } catch (err) {
    console.error("🔥 LINKEDIN ERROR:", err); // 👈 ADD THIS

    res.status(500).json({
      error: err.message || "Posting failed"
    });
  }
});

// ===============================
// UPDATE METRICS (MANUAL)
// ===============================
app.post("/update-metrics", (req, res) => {
  const { id, likes, comments, impressions } = req.body;

  const post = postsDB.find(p => p.id === id);

  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  post.metrics = { likes, comments, impressions };

  res.json({ status: "updated", post });
});

// ===============================
// ANALYTICS
// ===============================
app.get("/analytics", (req, res) => {
  const data = postsDB.map(p => {
    const engagement =
      (p.metrics.likes + p.metrics.comments) /
      (p.metrics.impressions || 1);

    return { ...p, engagement };
  });

  res.json(data);
});

// ===============================
// IMPROVE POST (Gemini)
// ===============================
import OpenAI from "openai";

app.post("/improve", async (req, res) => {
  try {
    const client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{
        role: "user",
        content: `
Improve this LinkedIn post:

${req.body.content}

Make it:
- More engaging
- Better hook
- More personal
`
      }]
    });

    res.json({ improved: response.choices[0].message.content });

  } catch (err) {
    console.error("Improve error:", err.message);
    res.json({ improved: req.body.content }); // fallback
  }
});

// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
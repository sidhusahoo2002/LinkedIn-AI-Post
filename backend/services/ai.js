// backend/services/ai.js
import OpenAI from "openai";

function getClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY missing");
  }

  // Groq uses OpenAI-compatible API
  return new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });
}

// ===============================
// GENERATE POST
// ===============================
export async function generateSinglePost() {
  try {
    const client = getClient();

    const topic = ["AI agents", "React", "system design", "startup"]
      .sort(() => 0.5 - Math.random())[0];

    const prompt = `
Write a LinkedIn post (max 120 words):

Topic: ${topic}

- Strong hook
- Human tone
- 2-3 insights
- End with a question
`;

    const res = await client.chat.completions.create({
      model: "llama-3.1-8b-instant", // 🔥 fast + free
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    return res.choices[0].message.content;

  } catch (err) {
    console.error("🔥 Groq generate error:", err.message);

    // fallback so UI never breaks
    return `
🚀 I tried building an AI LinkedIn agent…

Here’s what I learned:

1. APIs fail more than your code  
2. Simplicity wins  
3. Consistency beats perfection  

What’s your experience building something real?
`;
  }
}

// ===============================
// SCORE POST
// ===============================
export async function scorePost(post) {
  try {
    const client = getClient();

    const res = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{
        role: "user",
        content: `
Return ONLY JSON:

{
  "hook": number,
  "readability": number,
  "curiosity": number,
  "personal": number,
  "total": number
}

Post:
${post}
`
      }],
      temperature: 0.2,
    });

    return JSON.parse(res.choices[0].message.content);

  } catch (err) {
    console.error("⚠️ scoring error:", err.message);

    return {
      hook: 7,
      readability: 7,
      curiosity: 7,
      personal: 7,
      total: 7,
    };
  }
}
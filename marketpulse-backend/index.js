import express from "express";
import fetch from "node-fetch";
import OpenAI from "openai";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/query", async (req, res) => {
  const { command } = req.body;
  let searchQuery;

  if (!command) return res.json({ response: "No command provided" });

  if (command.toLowerCase().startsWith("news")) {
    const ticker = command.split(" ")[1];
    searchQuery = `${ticker} site:bloomberg.com OR site:reuters.com`;
  } else if (command.toLowerCase().startsWith("stocks")) {
    const ticker = command.split(" ")[1];
    searchQuery = `${ticker} stock site:yahoo.com`;
  } else if (command.toLowerCase() === "pols") {
    searchQuery = "senate stock trades site:senate.gov";
  } else {
    return res.json({ response: "Unknown command" });
  }

  try {
    // Call Bing Search API
    const bingRes = await fetch(`https://api.bing.microsoft.com/v7.0/news/search?q=${encodeURIComponent(searchQuery)}`, {
      headers: { "Ocp-Apim-Subscription-Key": process.env.BING_API_KEY },
    });
    const results = await bingRes.json();
    const snippets = results.value?.map(r => `${r.name}: ${r.description}`).slice(0, 3).join("\n");

    // Summarize using OpenAI
    const aiRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Summarize finance/news/politics queries concisely in Bloomberg terminal style." },
        { role: "user", content: snippets || "No news found." }
      ],
      max_tokens: 80,
    });

    res.json({ response: aiRes.choices[0].message.content.trim() });
  } catch (err) {
    console.error(err);
    res.json({ response: "Error fetching AI data" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AI backend running on port ${PORT}`));
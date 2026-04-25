import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Initialize Google GenAI SDK
let ai;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} else {
  console.warn("⚠️ Warning: GEMINI_API_KEY is not set in .env file. API requests will fail.");
}

app.post('/api/generate', async (req, res) => {
  if (!ai) {
    return res.status(500).json({ error: "API key is missing in the backend configuration." });
  }

  const { model, city, concern } = req.body;

  if (!model || !city || !concern) {
    return res.status(400).json({ error: "Missing required fields in the request body." });
  }

  try {
    const prompt = `You are an expert EV Adoption Education Content Agent focusing on the Indian EV market.
    A user is interested in the EV Model: "${model}".
    They are located in City: "${city}".
    Their primary concern or question is: "${concern}".
    
    INSTRUCTIONS FOR GENERATION:
    - You must highly contextualize to the Indian market. Use Indian Rupees (₹), kilometers (km), compare with ICE/CNG costs, and mention local context where appropriate.
    
    Generate the following educational assets. Be CONCISE (max 100 words per message/item). Return ONLY a valid JSON object:
    {
      "whatsappDrip": ["Day 1-7 messages"],
      "faq": [{ "question": "Q", "answer": "A" }],
      "videoScript": "Script under 400 words",
      "socialPosts": ["Post 1-7"]
    }
    
    CRITICAL: Output raw JSON only. Escape all double quotes inside strings with backslashes (\").`;

    // Using gemini-1.5-flash-latest (Free Tier)
    const modelInterface = ai.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const response = await modelInterface.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 4096 // Reducing to encourage conciseness
      }
    });

    let text = response.response.text();
    console.log("Raw API Output Length:", text.length);

    try {
      // Step 1: Basic cleaning of the text
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        text = text.substring(firstBrace, lastBrace + 1);
      }

      // Step 2: Attempt to fix common JSON issues like unescaped newlines inside strings
      // AI sometimes leaves raw newlines inside strings which breaks JSON.parse
      let cleanedText = text
        .replace(/[\n\r]/g, " ") // Replace all newlines with spaces for now
        .replace(/\s+/g, " ");   // Collapse multiple spaces

      const data = JSON.parse(cleanedText);
      res.json(data);
    } catch (parseError) {
      console.error("====== JSON PARSE ERROR ======");
      console.error("Error Message:", parseError.message);
      // Fallback: If it still fails, let's try a more aggressive approach or report error
      res.status(500).json({ 
        error: "AI returned a formatting error. Please try clicking 'Initialize Flow' again.",
        details: parseError.message
      });
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: "Failed to generate assets due to an AI generation error." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend server listening on http://localhost:${PORT}`);
});

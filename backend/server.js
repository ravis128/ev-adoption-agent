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
    
    Generate the following educational assets to convert curious enquiries into confident test drive bookings. Return ONLY a valid JSON object matching this exact structure:
    {
      "whatsappDrip": ["Day 1 message", "Day 2 message", ..., "Day 7 message"],
      "faq": [
          { "question": "Question 1", "answer": "Answer 1" },
          ...
          { "question": "Question 10", "answer": "Answer 10" }
      ],
      "videoScript": "Comprehensive script with [Visuals:] and [Narration:] tags. Keep it under 600 words.",
      "socialPosts": ["Post 1", "Post 2", ..., "Post 7"]
    }
    
    CRITICAL: Output raw JSON only. Ensure all quotes inside strings are escaped properly if necessary, although the API should handle this with responseMimeType.`;

    // Using gemini-1.5-flash-latest (Free Tier)
    const modelInterface = ai.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const response = await modelInterface.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 8192
      }
    });

    let text = response.response.text();
    console.log("Raw API Output Length:", text.length);

    // Robust cleaning: extraction of the JSON object
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      text = text.substring(firstBrace, lastBrace + 1);
    }

    try {
      const data = JSON.parse(text);
      res.json(data);
    } catch (parseError) {
      console.error("====== JSON PARSE ERROR ======");
      console.error("Position of Error:", parseError.message);
      console.error("Cleaned Text Output (first 500 chars):", text.substring(0, 500));
      console.error("Cleaned Text Output (last 500 chars):", text.substring(text.length - 500));
      console.error("===============================");
      res.status(500).json({ error: "AI returned invalid JSON format. Please try again." });
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: "Failed to generate assets due to an AI generation error." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend server listening on http://localhost:${PORT}`);
});

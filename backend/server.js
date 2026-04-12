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
    - Example tone/style: "Does the ${model} charge at normal outlets? Yes — and here is the math: Home charging overnight = full charge for ₹220. That is 452 km for less than a tank of CNG. Charging stations within 5 km of your area: [map link]."
    
    Generate the following educational assets to convert curious enquiries into confident test drive bookings. Return ONLY a valid JSON object matching this exact structure:
    {
      "whatsappDrip": [Array of exactly 7 short conversational strings representing a 7-day daily WhatsApp message series addressing the user concern and city. Do not include 'Day X:' prefix.],
      "faq": [
          { "question": "A specific question", "answer": "Detailed answer using ₹, math, or CNG comparisons if applicable." },
          { "question": "Another top concern", "answer": "Another detailed answer." }
          // GENERATE EXACTLY 10 FAQ OBJECTS for the top 10 EV concerns
      ],
      "videoScript": "A single comprehensive string containing a 2-3 minute explainer video script. Include [Visuals:] and [Narration:] tags.",
      "socialPosts": [Array of exactly 7 engaging social media posts addressing EV myths, battery warranty, resale value, and charging infra in ${city}.]
    }
    
    DO NOT output markdown formatting like \`\`\`json. Output raw JSON.`;

    const modelInterface = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

    const response = await modelInterface.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 8192
      }
    });

    let text = response.response.text();
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    try {
      const data = JSON.parse(text);
      res.json(data);
    } catch (parseError) {
      console.error("====== JSON PARSE ERROR ======");
      console.error("Raw Text Output:", text);
      console.error("===============================");
      throw parseError;
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: "Failed to generate assets due to an AI generation error." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend server listening on http://localhost:${PORT}`);
});

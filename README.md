# ⚡ AgentZero: EV Adoption Education Content Agent

AgentZero is a sophisticated AI-powered orchestrator designed to bridge the knowledge gap in the Indian EV market. It generates highly contextualized educational content to convert curious enquiries into confident test drive bookings.

![Frontend Preview](https://img.shields.io/badge/UI-Modern%20&%20Dynamic-teal)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%2F%20Express-blue)
![AI](https://img.shields.io/badge/AI-Google%20Gemini%202.0-orange)

## 🚀 Key Features

- **Multi-Channel Orchestration**: Generates assets across four critical branches simultaneously.
- **WhatsApp Drip Sequence**: A 7-day educational sequence to keep leads engaged.
- **Engagement Plan**: Tailored social media posts (Twitter, Instagram) to build community trust.
- **Knowledge Base**: Automated FAQ generation addressing specific customer concerns (range anxiety, resale value, etc.).
- **Indian Market Context**: All content is tailored to the Indian ecosystem (₹, km, charging infra).
- **Premium UI**: High-legibility dashboard with real-time orchestration visualizer.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express, Google Generative AI (@google/generative-ai).
- **Deployment**: Configured for Render/Vercel (includes `render.yaml`).

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- Google Gemini API Key

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file:
   ```env
   GEMINI_API_KEY=your_api_key_here
   PORT=5000
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Install dependencies in the root directory:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

## 🌐 Deployment

This repository includes a `render.yaml` for automated deployment on **Render.com**.

1. Connect this repo to Render.
2. Add your `GEMINI_API_KEY` to the environment variables.
3. Deploy!

---

Built with ❤️ for the EV Revolution.

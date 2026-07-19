# StadiumMind AI — AI Volunteer Copilot for FIFA World Cup 2026

**StadiumMind AI** is an AI-powered Volunteer Copilot built for FIFA World Cup 2026 stadium operations at MetLife Stadium. It leverages **Gemini 2.5 Flash** and real-time **Firebase Cloud Firestore** operational telemetry to help stadium volunteers make data-driven crowd-routing recommendations.

---

## 🔑 Gemini API Local Setup

To enable real-time generative reasoning with Gemini 2.5 Flash:

1. Obtain a Gemini API key from [Google AI Studio](https://aistudio.google.com/).
2. Create a `.env` file in the project root directory.
3. Add your `GEMINI_API_KEY` (kept strictly on the backend):
   ```env
   GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
   ```
4. Verify backend health:
   ```bash
   # Query health check endpoint
   curl http://localhost:3001/api/copilot/health
   ```
   Expected response:
   ```json
   {
     "geminiConfigured": true,
     "firestoreConnected": true,
     "model": "gemini-2.5-flash"
   }
   ```
5. Open the UI at `http://localhost:5173/copilot` and enable **Developer Mode** to monitor the active engine (`⚡ Gemini 2.5 Flash API` vs `🛡️ Dynamic Fallback Engine`), latency (ms), token consumption, and prompt byte size.

---

## 🏗️ AI Architecture

```
                                +-----------------------------------+
                                |    Firebase Cloud Firestore       |
                                | (gates, parking, volunteers, etc) |
                                +-----------------+-----------------+
                                                  |
                                                  v
+------------------------+      +-----------------+-----------------+
|   React Frontend UI    | ---> |    Express Cloud Run Backend    |
| (AI Copilot View Page) | <--- |   (Node.js / TypeScript API)    |
+------------------------+      +-----------------+-----------------+
                                                  |
                                                  v
                                +-----------------+-----------------+
                                |      Google Gemini API            |
                                |     (Gemini 2.5 Flash)            |
                                +-----------------------------------+
```

1. **Frontend**: React + TypeScript + Vite + Tailwind CSS (Google Antigravity Glassmorphic UI).
2. **Backend**: Express API server (Cloud Run target) encapsulating prompt construction, Gemini API calls, and Zod response validation. The Gemini API key is securely stored in backend environment variables and never exposed to the client.
3. **Data Source**: Real-time Firestore operational state (`gates`, `parking`, `volunteers`, `incidents`, `restrooms`).
4. **Audit Logging**: Every AI recommendation is automatically saved to the Firestore `recommendations` collection for operational observability and compliance tracing.

---

## 🎯 Prompt Engineering Approach

The backend prompt engine (`backend/services/promptBuilder.ts`) enforces strict boundary isolation between system guidelines, venue context, live telemetry data, and the fan's situation:

- **SYSTEM INSTRUCTION**: Defines the AI persona, primary objectives (minimize wait times, prevent bottlenecks, prioritize accessibility), critical rules (never fabricate data, strictly reason over telemetry), and required output schema.
- **CONTEXT**: Specifies match event parameters (FIFA World Cup 2026 Match 14 at MetLife Stadium).
- **LIVE FIRESTORE TELEMETRY DATA**: Real-time snapshot JSON containing live gate wait times, queue lengths, occupancy percentages, volunteer language capabilities, parking lot availability, and active incidents.
- **USER REQUEST & FAN SITUATION**: Unstructured volunteer notes, fan demographic (Family, Wheelchair User, Senior Citizen, VIP), target destination, current gate, and fan spoken language.
- **STRUCTURED RESPONSE SCHEME**: Requires Gemini 2.5 Flash to respond in validated JSON matching Zod schema:
  - `recommendedGate`: Recommended entry gate.
  - `reasoning`: Array of explicit telemetry-backed bullet points explaining *WHY*.
  - `walkingDifference`: Route distance comparison.
  - `waitTimeSaved`: Estimated minutes saved.
  - `priority`: `HIGH` | `MEDIUM` | `LOW`.
  - `confidence`: Floating-point confidence score (0.0 to 1.0).
  - `translatedMessage`: Direct fan recommendation message translated into fan's native language.

---

## 💡 Why GenAI is Required (vs. Rule-Based Logic)

Rule-based decision trees and static conditional statements (`if/else`) are fundamentally insufficient for modern stadium operational copilots for the following reasons:

1. **Multi-Factor High-Dimensional Reasoning**:
   Static rules struggle when balancing competing constraints simultaneously (e.g., Gate B has a shorter line, but Gate C has volunteers speaking French, while Gate D has dedicated stroller lanes for families with children). GenAI dynamically weighs complex tradeoffs in real time based on live telemetry metrics.

2. **Natural Language Understanding of Unstructured Volunteer Notes**:
   Volunteers input free-text notes like *"Family has two toddlers, looking exhausted, carrying heavy bags"*. A rule-based system cannot extract semantic nuances (demographics, fatigue, stroller needs) from arbitrary text, whereas Gemini comprehends contextual cues instantly and adapts its recommendations accordingly.

3. **Multilingual Real-Time Fan Translation**:
   Volunteers interact with international fans speaking Spanish, French, German, Japanese, Portuguese, and more. Gemini generates natural, polite, and culturally appropriate translations directly in the fan's native tongue tailored to the specific situation.

4. **Transparent Explainability ("WHY")**:
   Static logic returns hardcoded string outputs. Gemini generates clear, human-understandable explanations detailing the exact telemetry reasoning behind each recommendation, empowering volunteers to communicate confidently with fans.

---

## 🧪 Testing & Verification

Run the Vitest test suite covering prompt construction, Zod validation, Gemini service execution, and backend Express endpoints:

```bash
# Run all unit tests
npx vitest run
```

### Running Backend Server & Frontend App
```bash
# Start backend server (Port 3001)
npm start

# Start Vite dev server (Port 5173/5176)
npm run dev
```
Navigate to `/copilot` in your browser to test the AI Volunteer Copilot interface!

---

## 🚀 Production Deployment (Google Cloud & Firebase)

The application is fully containerized and configured for production deployment on **Google Cloud Run** (Backend API) and **Firebase Hosting** (Frontend SPA with Cloud Run API proxy rewrites).

### Comprehensive Deployment Guides
- **Cloud Run Backend Deployment**: See [`CLOUD_RUN_DEPLOYMENT.md`](./CLOUD_RUN_DEPLOYMENT.md) for full container multi-stage builds, Artifact Registry tagging, secret injection (`GEMINI_API_KEY`), and container health probing.
- **Firebase Hosting Frontend Deployment**: See [`FIREBASE_HOSTING_DEPLOYMENT.md`](./FIREBASE_HOSTING_DEPLOYMENT.md) for SPA build commands and automatic `/api/**` rewrites pointing to Cloud Run.

### Quick Deployment Summary
```bash
# 1. Build and Test Production Container
npm run docker:build
npm run docker:run

# 2. Deploy Backend Container to Google Cloud Run
gcloud builds submit --tag us-central1-docker.pkg.dev/YOUR_PROJECT_ID/stadiummind-repo/copilot-backend:latest .
gcloud run deploy stadiummind-copilot-backend \
  --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/stadiummind-repo/copilot-backend:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 3001 \
  --set-env-vars NODE_ENV=production \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest

# 3. Deploy Frontend SPA to Firebase Hosting (Automatic API proxying via firebase.json)
npm run build
firebase deploy --only hosting
```


# Firebase Hosting Deployment Guide — StadiumMind AI Frontend

This document details the exact, step-by-step procedures to deploy the **StadiumMind AI Volunteer Copilot Frontend** as a high-performance Single Page Application (SPA) on **Firebase Hosting**, with automatic API routing to the **Cloud Run** backend service.

---

## 🚀 Architecture Overview

```
+-----------------------------------------------------------------+
|                         Fan / Volunteer                         |
+---------------------------------+-------------------------------+
                                  |
                                  v
+-----------------------------------------------------------------+
|                       Firebase Hosting                          |
|         (Static Assets: HTML, JS, CSS, Google UI Fonts)         |
+---------------------------------+-------------------------------+
                                  |
       +--------------------------+--------------------------+
       | Rewrite: /api/**                                    | Rewrite: /**
       v                                                     v
+---------------------------------+ +---------------------------------+
|   Google Cloud Run Service      | |          index.html             |
| (stadiummind-copilot-backend)   | | (React SPA Router Fallback)     |
+---------------------------------+ +---------------------------------+
```

---

## 📋 Step 1: Firebase CLI & Project Setup

1. Install the global Firebase CLI tool (if not installed):
   ```bash
   npm install -g firebase-tools
   ```

2. Authenticate with your Firebase / Google Cloud account:
   ```bash
   firebase login
   ```

3. Initialize Firebase Hosting in your local workspace (or verify `firebase.json`):
   ```bash
   firebase init hosting
   ```
   - **Select Project**: Choose `stadiummind-ai-f7ced` (or your production project ID).
   - **Public directory**: `dist`
   - **Configure as single-page app**: `Yes`
   - **Set up automatic builds with GitHub**: `No`

---

## ⚙️ Step 2: Configure Rewrite Rules (`firebase.json`)

To seamlessly route frontend API requests (`/api/copilot/*`) to our Cloud Run container without CORS complexity or hardcoded production backend URLs, configure `firebase.json` rewrites pointing to your Cloud Run service:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/api/**",
        "run": {
          "serviceId": "stadiummind-copilot-backend",
          "region": "us-central1"
        }
      },
      {
        "source": "/health",
        "run": {
          "serviceId": "stadiummind-copilot-backend",
          "region": "us-central1"
        }
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

---

## 🏗️ Step 3: Build Production Bundle (`npm run build`)

Before deploying, generate the production Vite bundle:

```bash
# Ensure strict TypeScript checks and Vite optimization
npm run build
```

This compiles TypeScript and outputs optimized, minified static assets to the `/dist` directory.

---

## 🚢 Step 4: Deploy to Firebase Hosting

Execute the Firebase deployment command:

```bash
firebase deploy --only hosting
```

**Output Example:**
```
=== Deploying to 'stadiummind-ai-f7ced'...
i  deploying hosting
i  hosting[stadiummind-ai-f7ced]: beginning deploy...
i  hosting[stadiummind-ai-f7ced]: found 14 files in dist
✔  hosting[stadiummind-ai-f7ced]: file upload complete
i  hosting[stadiummind-ai-f7ced]: finalizing version...
✔  hosting[stadiummind-ai-f7ced]: version finalized
i  hosting[stadiummind-ai-f7ced]: releasing new version...
✔  hosting[stadiummind-ai-f7ced]: release complete

✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/stadiummind-ai-f7ced/overview
Hosting URL: https://stadiummind-ai-f7ced.web.app
```

---

## 🧪 Step 5: Verification & End-to-End Testing

1. Open the **Hosting URL** (`https://stadiummind-ai-f7ced.web.app/copilot`) in your browser.
2. Verify that live Firestore stadium data loads immediately on the **Gates** and **Copilot** dashboards.
3. Submit a recommendation request in the AI Copilot UI and verify that `/api/copilot/recommend` executes cleanly via Cloud Run rewrites.
4. Check **Developer Mode** in the UI to confirm low latency and transparent engine observability (`⚡ Gemini 2.5 Flash API`).

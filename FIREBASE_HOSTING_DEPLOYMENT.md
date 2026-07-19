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
+---------------------------------+-------------------------------+
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

## 📋 Step 1: Enable Cloud Run API in GCP Project

Because `firebase.json` routes `/api/**` to Cloud Run, Firebase Hosting requires the **Cloud Run Admin API (`run.googleapis.com`)** to be enabled in your Google Cloud / Firebase project.

Run this command in **GCP Cloud Shell** or your terminal:

```bash
# Enable Cloud Run Admin API on your Firebase project
gcloud services enable run.googleapis.com --project=praful-workspace
```

---

## 📋 Step 2: Firebase CLI & Switch Active Project

1. Install the global Firebase CLI tool (if not installed):
   ```bash
   npm install -g firebase-tools
   ```

2. Authenticate with your Firebase / Google Cloud account:
   ```bash
   firebase login
   ```

3. **Explicitly switch active project in Firebase CLI**:
   ```bash
   firebase use praful-workspace
   ```

---

## ⚙️ Step 3: Configure Rewrite Rules (`firebase.json`)

To seamlessly route frontend API requests (`/api/copilot/*`) to our Cloud Run container without CORS complexity or hardcoded production backend URLs, `firebase.json` in the root directory contains:

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

## 🏗️ Step 4: Build Production Bundle (`npm run build`)

Before deploying, generate the production Vite bundle:

```bash
# Ensure strict TypeScript checks and Vite optimization
npm run build
```

This compiles TypeScript and outputs optimized static assets to the `/dist` directory.

---

## 🚢 Step 5: Deploy to Firebase Hosting

Execute the Firebase deployment command with explicit project flag:

```bash
firebase deploy --only hosting --project praful-workspace
```

---

## 🧪 Step 6: Verification & End-to-End Testing

1. Open your **Hosting URL** (`https://praful-workspace.web.app/copilot`) in your browser.
2. Verify that live Firestore stadium data loads immediately on the **Gates** and **Copilot** dashboards.
3. Submit a recommendation request in the AI Copilot UI and verify that `/api/copilot/recommend` executes cleanly via Cloud Run rewrites.
4. Check **Developer Mode** in the UI to confirm low latency and transparent engine observability (`⚡ Gemini 2.5 Flash API`).

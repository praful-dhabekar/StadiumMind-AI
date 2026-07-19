# Google Cloud Run Deployment Guide — StadiumMind AI Backend

This document details the exact, step-by-step procedures to deploy the **StadiumMind AI Volunteer Copilot Backend** as a secure, auto-scaling containerized service on **Google Cloud Run**.

---

## 🏗️ Architecture & Prerequisites

- **Target Service**: Google Cloud Run (Fully managed serverless container runtime)
- **Container Registry**: Google Artifact Registry (or Container Registry)
- **Required Secrets**: `GEMINI_API_KEY`, `FIREBASE_PROJECT_ID`
- **Required CLI Tools**: Google Cloud SDK (`gcloud`), Docker CLI (`docker`)

---

## 📋 Step 1: Google Cloud Project Setup & Authentication

1. Log into Google Cloud CLI and set your target project ID:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_GOOGLE_CLOUD_PROJECT_ID
   ```

2. Enable essential Google Cloud APIs required for Cloud Run, Artifact Registry, and Gemini reasoning:
   ```bash
   gcloud services enable run.googleapis.com \
                          artifactregistry.googleapis.com \
                          cloudbuild.googleapis.com \
                          aiplatform.googleapis.com
   ```

3. Create an Artifact Registry Docker repository (if not already created):
   ```bash
   gcloud artifacts repositories create stadiummind-repo \
     --repository-format=docker \
     --location=us-central1 \
     --description="Docker repository for StadiumMind AI backend images"
   ```

---

## 🐳 Step 2: Container Build & Push

We use our multi-stage `Dockerfile` (`node:20-alpine`) to produce a lightweight, non-root production container image.

### Option A: Build & Push with Google Cloud Build (Recommended Serverless Build)
```bash
gcloud builds submit --tag us-central1-docker.pkg.dev/YOUR_GOOGLE_CLOUD_PROJECT_ID/stadiummind-repo/copilot-backend:latest .
```

### Option B: Local Docker Build & Push
```bash
# Configure Docker authentication with Artifact Registry
gcloud auth configure-docker us-central1-docker.pkg.dev

# Build image locally
npm run docker:build
docker tag stadiummind-ai-backend us-central1-docker.pkg.dev/YOUR_GOOGLE_CLOUD_PROJECT_ID/stadiummind-repo/copilot-backend:latest

# Push image
docker push us-central1-docker.pkg.dev/YOUR_GOOGLE_CLOUD_PROJECT_ID/stadiummind-repo/copilot-backend:latest
```

---

## 🚀 Step 3: Cloud Run Service Deployment

Deploy the pushed container image to Cloud Run. We configure environment secrets directly and enable health probe compatibility:

```bash
gcloud run deploy stadiummind-copilot-backend \
  --image us-central1-docker.pkg.dev/YOUR_GOOGLE_CLOUD_PROJECT_ID/stadiummind-repo/copilot-backend:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 3001 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --set-env-vars NODE_ENV=production \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest
```

*(Note: If using Secret Manager for `GEMINI_API_KEY`, ensure the Cloud Run service account (`[PROJECT_NUMBER]-compute@developer.gserviceaccount.com`) is granted `roles/secretmanager.secretAccessor`.)*

---

## 🔍 Step 4: Verification & Health Checks

1. Verify deployment status and obtain the assigned HTTPS service URL:
   ```bash
   gcloud run services describe stadiummind-copilot-backend --region us-central1 --format="value(status.url)"
   ```

2. Probe the root container health endpoint:
   ```bash
   curl https://stadiummind-copilot-backend-[hash]-uc.a.run.app/health
   ```
   **Expected Response:**
   ```json
   {
     "status": "ok",
     "service": "StadiumMind AI Copilot Engine",
     "nodeEnv": "production",
     "uptime": 14,
     "timestamp": "2026-07-19T20:00:00.000Z"
   }
   ```

3. Probe the diagnostic Copilot API health endpoint:
   ```bash
   curl https://stadiummind-copilot-backend-[hash]-uc.a.run.app/api/copilot/health
   ```
   **Expected Response:**
   ```json
   {
     "geminiConfigured": true,
     "firestoreConnected": true,
     "model": "gemini-2.5-flash",
     "uptime": 14
   }
   ```

---

## 📊 Step 5: Production Observability & Tracing

In `NODE_ENV=production`, the backend outputs structured JSON logs automatically ingested by **Google Cloud Logging (Stackdriver)**:
- Filter logs in Google Cloud Console by `jsonPayload.requestId` to trace individual fan recommendation requests across the entire execution lifecycle.
- Examine `jsonPayload.severity` (`INFO`, `WARNING`, `ERROR`) and latency (`jsonPayload.durationMs`).

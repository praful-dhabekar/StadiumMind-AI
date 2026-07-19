# Google Cloud Run Deployment Guide — StadiumMind AI Backend (Cloud Shell Edition)

This guide provides step-by-step instructions for deploying the **StadiumMind AI Volunteer Copilot Backend** to **Google Cloud Run** by cloning the GitHub repository directly inside **GCP Cloud Shell**.

---

## 🎯 Prerequisite: Open GCP Cloud Shell
Navigate to [Google Cloud Shell](https://shell.cloud.google.com) in your browser. Cloud Shell comes pre-configured with `gcloud`, `git`, `docker`, and Node.js.

---

## 📥 Step 1: Clone GitHub Repository & Set Project ID

Run the following commands in Cloud Shell to clone the project repository and set your target GCP project environment variable:

```bash
# 1. Clone the GitHub repository directly into Cloud Shell
git clone https://github.com/praful-dhabekar/StadiumMind-AI.git

# 2. Enter project directory
cd StadiumMind-AI

# 3. Automatically capture your active GCP Project ID into environment variable
export PROJECT_ID=$(gcloud config get-value project)
echo "Deploying StadiumMind AI to GCP Project ID: $PROJECT_ID"
```

---

## 📋 Step 2: Enable GCP APIs & Create Artifact Registry Repository

Enable the required Cloud APIs and create an Artifact Registry Docker repository:

```bash
# Enable required Google Cloud APIs
gcloud services enable run.googleapis.com \
                       artifactregistry.googleapis.com \
                       cloudbuild.googleapis.com \
                       secretmanager.googleapis.com \
                       aiplatform.googleapis.com

# Create Artifact Registry repository for backend Docker images
gcloud artifacts repositories create stadiummind-repo \
  --repository-format=docker \
  --location=us-central1 \
  --description="Docker repository for StadiumMind AI backend images"
```

---

## 🔐 Step 3: Store Gemini API Key in Secret Manager

Store your `GEMINI_API_KEY` securely in Google Secret Manager and grant Cloud Run permission to access it:

```bash
# Store your Gemini API Key in Secret Manager (replace YOUR_ACTUAL_GEMINI_API_KEY)
echo -n "YOUR_ACTUAL_GEMINI_API_KEY" | gcloud secrets create GEMINI_API_KEY \
  --data-file=- \
  --replication-policy="automatic"

# Grant the default Cloud Run service account access to read the secret
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 🐳 Step 4: Build Container Image with Google Cloud Build

Use **Google Cloud Build** to compile and tag the multi-stage `Dockerfile` serverlessly:

```bash
# Submit build to Cloud Build using project Dockerfile
gcloud builds submit --tag us-central1-docker.pkg.dev/${PROJECT_ID}/stadiummind-repo/copilot-backend:latest .
```

---

## 🚀 Step 5: Deploy Backend to Google Cloud Run

Deploy the built container image to Cloud Run with non-root security, memory allocation, and secret mapping:

```bash
# Deploy backend container to Cloud Run
gcloud run deploy stadiummind-copilot-backend \
  --image us-central1-docker.pkg.dev/${PROJECT_ID}/stadiummind-repo/copilot-backend:latest \
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

---

## 🔍 Step 6: Verify Health Probe & API Endpoints

Retrieve the assigned service URL and verify that the backend is responding:

```bash
# Get the assigned service URL
export SERVICE_URL=$(gcloud run services describe stadiummind-copilot-backend --region us-central1 --format="value(status.url)")
echo "Cloud Run Service URL: $SERVICE_URL"

# Probe container root health
curl ${SERVICE_URL}/health

# Probe API diagnostic endpoint
curl ${SERVICE_URL}/api/copilot/health
```

### Expected API Health Response:
```json
{
  "geminiConfigured": true,
  "firestoreConnected": true,
  "model": "gemini-2.5-flash",
  "uptime": 14
}
```

---

## 📊 Step 7: Stream Backend Logs in Cloud Shell

To monitor backend requests and Gemini API reasoning logs in real time:

```bash
# Stream live backend logs from Cloud Run
gcloud run services logs tail stadiummind-copilot-backend --region us-central1
```

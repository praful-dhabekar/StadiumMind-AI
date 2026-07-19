# Google Cloud Run Deployment Guide — StadiumMind AI Backend (Cloud Shell Edition)

This guide provides step-by-step instructions for deploying the **StadiumMind AI Volunteer Copilot Backend** directly from **Google Cloud Shell**.

---

## 🏗️ Cloud Shell Environment Setup

Google Cloud Shell has `gcloud`, `git`, `docker`, and Node.js pre-installed and pre-authenticated to your GCP project.

### 1. Clone Repository & Set Project Variable
Open **Google Cloud Shell** (`https://shell.cloud.google.com`) and run:

```bash
# Clone the repository
git clone https://github.com/praful-dhabekar/StadiumMind-AI.git
cd StadiumMind-AI

# Automatically capture your active GCP Project ID into a variable
export PROJECT_ID=$(gcloud config get-value project)
echo "Deploying to GCP Project ID: $PROJECT_ID"
```

---

## 📋 Step 1: Enable Google Cloud APIs & Create Repository

Enable the required services and create an Artifact Registry repository:

```bash
# Enable required APIs
gcloud services enable run.googleapis.com \
                       artifactregistry.googleapis.com \
                       cloudbuild.googleapis.com \
                       secretmanager.googleapis.com \
                       aiplatform.googleapis.com

# Create Artifact Registry repository for Docker images
gcloud artifacts repositories create stadiummind-repo \
  --repository-format=docker \
  --location=us-central1 \
  --description="Docker repository for StadiumMind AI backend images"
```

---

## 🔐 Step 2: Store Gemini API Key in Secret Manager (Recommended)

Store your `GEMINI_API_KEY` securely in Google Secret Manager:

```bash
# Store your Gemini API Key in Secret Manager (replace YOUR_ACTUAL_GEMINI_API_KEY)
echo -n "YOUR_ACTUAL_GEMINI_API_KEY" | gcloud secrets create GEMINI_API_KEY \
  --data-file=- \
  --replication-policy="automatic"

# Grant Cloud Run service account access to read the secret
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 🐳 Step 3: Build Container with Cloud Build

Use **Google Cloud Build** inside Cloud Shell to compile and push the container image serverlessly without needing local Docker daemons:

```bash
# Submit build to Cloud Build using multi-stage Dockerfile
gcloud builds submit --tag us-central1-docker.pkg.dev/${PROJECT_ID}/stadiummind-repo/copilot-backend:latest .
```

---

## 🚀 Step 4: Deploy to Cloud Run

Deploy the built container image to Cloud Run, attaching environment variables and Secret Manager keys:

```bash
# Deploy to Cloud Run
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

## 🔍 Step 5: Verify Deployment & Health Endpoints

Once deployed, retrieve the service URL and probe the health endpoints:

```bash
# Get the assigned service URL
export SERVICE_URL=$(gcloud run services describe stadiummind-copilot-backend --region us-central1 --format="value(status.url)")
echo "Service URL: $SERVICE_URL"

# Probe root container health
curl ${SERVICE_URL}/health

# Probe API diagnostic health
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

## 📊 Step 6: View Live Production Logs in Cloud Shell

View structured logs directly inside Cloud Shell:

```bash
# Stream live backend logs from Cloud Run
gcloud run services logs tail stadiummind-copilot-backend --region us-central1
```

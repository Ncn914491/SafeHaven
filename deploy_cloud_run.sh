#!/bin/bash

PROJECT_ID="safehaven-463909"
REGION="us-central1"
SERVICE_NAME="safehaven-frontend" # Choose a service name for your Cloud Run service

# Replace with your actual Artifact Registry path and image tag
ARTIFACT_REPO_NAME="safehaven-repo" # The name of your Artifact Registry repository
IMAGE_NAME="safehaven-app"
IMAGE_TAG="latest" # Use a specific tag or digest in production

IMAGE_URL="${REGION}-docker.pkg.dev/${PROJECT_ID}/${ARTIFACT_REPO_NAME}/${IMAGE_NAME}:${IMAGE_TAG}"

# Determine the service account for Cloud Run
# Using the default Compute Engine service account as an example.
# It's recommended to use a dedicated service account with least privilege for production.
PROJECT_NUMBER=$(gcloud projects describe ${PROJECT_ID} --format='value(projectNumber)' 2>/dev/null)
if [ -z "$PROJECT_NUMBER" ]; then
  echo "Error: Could not retrieve project number for project ${PROJECT_ID}."
  echo "Please ensure the project exists and you have permissions to describe it."
  exit 1
fi
SERVICE_ACCOUNT_EMAIL="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
# If you created a dedicated service account for this Cloud Run service, set its email here:
# SERVICE_ACCOUNT_EMAIL="your-dedicated-sa-name@${PROJECT_ID}.iam.gserviceaccount.com"

echo "Deploying Cloud Run service: ${SERVICE_NAME}"
echo "Project: ${PROJECT_ID}, Region: ${REGION}"
echo "Image: ${IMAGE_URL}"
echo "Service Account: ${SERVICE_ACCOUNT_EMAIL}"
echo ""

gcloud run deploy "${SERVICE_NAME}" \
  --image="${IMAGE_URL}" \
  --platform="managed" \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --service-account="${SERVICE_ACCOUNT_EMAIL}" \
  --allow-unauthenticated \
  --port=8080 \
  --min-instances=0 \
  --max-instances=2 \
  --cpu=1 \
  --memory=512Mi \
  # --concurrency=80 # Default, adjust as needed
  # --timeout=300s # Default, adjust as needed

  # === Runtime Environment Variables from Secret Manager ===
  # The following are examples if your Cloud Run service needs to access secrets AT RUNTIME
  # for server-side logic (e.g., calling Twilio API from a Node.js backend in the container).
  # These are NOT for EXPO_PUBLIC_* variables, which must be baked in at build time.

  # Example: If your server-side code expects process.env.APP_TWILIO_AUTH_TOKEN
  # and the secret is stored in Secret Manager as "TWILIO_AUTH_TOKEN" (latest version)
  # --update-secrets=APP_TWILIO_AUTH_TOKEN=TWILIO_AUTH_TOKEN:latest

  # Example: If your server-side code expects process.env.APP_DEFAULT_ALERT_RADIUS
  # and the secret is stored as "DEFAULT_ALERT_RADIUS_KM"
  # --update-secrets=APP_DEFAULT_ALERT_RADIUS=DEFAULT_ALERT_RADIUS_KM:latest

  # Add other flags as needed, e.g., VPC connector, CPU allocation, etc.
  --quiet # Use --quiet for non-interactive deployment

echo ""
echo "--------------------------------------"
echo "Cloud Run deployment command generated."
echo "Before running:"
echo "1. Ensure the Docker image '${IMAGE_URL}' has been built and pushed to Artifact Registry."
echo "   The image must be built with EXPO_PUBLIC_* variables embedded (e.g., via Cloud Build using --build-arg)."
echo "2. Ensure the service account '${SERVICE_ACCOUNT_EMAIL}' has the necessary IAM roles"
echo "   (e.g., roles/secretmanager.secretAccessor if using --update-secrets for runtime variables)."
echo "3. If using --update-secrets, ensure the specified secrets exist in Secret Manager in project '${PROJECT_ID}'."
echo "4. Review and adjust parameters like SERVICE_NAME, IMAGE_TAG, min/max instances, CPU, memory as needed."
echo "5. '--allow-unauthenticated' makes the service publicly accessible. Adjust if different auth is needed."
echo "--------------------------------------"

#!/bin/bash

PROJECT_ID="safehaven-463909"

# Get the project number to construct the default Compute Engine service account name
# This is often the default service account used by Cloud Run if not specified otherwise.
PROJECT_NUMBER=$(gcloud projects describe ${PROJECT_ID} --format='value(projectNumber)' 2>/dev/null)

if [ -z "$PROJECT_NUMBER" ]; then
  echo "Error: Could not retrieve project number for project ${PROJECT_ID}."
  echo "Please ensure the project exists and you have permissions to describe it."
  exit 1
fi

SERVICE_ACCOUNT_EMAIL="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

echo "Target Project ID: ${PROJECT_ID}"
echo "Target Service Account (default Compute Engine SA): ${SERVICE_ACCOUNT_EMAIL}"
echo ""
echo "Assigning essential IAM roles for Cloud Run service..."
echo "----------------------------------------------------"

# Role for accessing secrets from Secret Manager
echo "Assigning roles/secretmanager.secretAccessor..."
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
    --role="roles/secretmanager.secretAccessor" \
    --condition=None \
    --quiet

# Role for publishing messages to Pub/Sub (if the service needs to publish)
# This is for features like SOS Alert Broadcasting if handled server-side by Cloud Run.
echo "Assigning roles/pubsub.publisher..."
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
    --role="roles/pubsub.publisher" \
    --condition=None \
    --quiet

# Note: The application is primarily a frontend served by Cloud Run.
# Firebase interactions (Firestore, Realtime DB, Storage, Auth) are mostly client-side
# and governed by Firebase Security Rules and Firebase configuration embedded in the client.
# The Cloud Run service account itself typically does not need direct IAM roles for these
# Firebase data plane operations unless it's using the Firebase Admin SDK for server-side logic.

# Example: If the Cloud Run service were to act as a backend using Firebase Admin SDK
# you might add roles like:
# echo "Assigning roles/datastore.user (for Firestore admin access)..."
# gcloud projects add-iam-policy-binding ${PROJECT_ID} \
#     --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
#     --role="roles/datastore.user" \
#     --condition=None --quiet
#
# echo "Assigning roles/firebase.sdkAdmin (broad Firebase Admin SDK permissions)..."
# gcloud projects add-iam-policy-binding ${PROJECT_ID} \
#     --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
#     --role="roles/firebase.sdkAdmin" \
#     --condition=None --quiet


echo ""
echo "----------------------------------------------------"
echo "IAM role assignment script generated."
echo "Review the roles and uncomment/add as necessary based on specific backend needs."
echo "Remember that client-side Firebase access is controlled by Firebase Security Rules."
echo "If you use a dedicated service account for Cloud Run (recommended), replace"
echo "\${SERVICE_ACCOUNT_EMAIL} with your dedicated service account's email."

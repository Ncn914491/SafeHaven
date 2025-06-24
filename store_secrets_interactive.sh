#!/bin/bash
PROJECT_ID="safehaven-463909"

echo "Creating/Updating secrets in Google Secret Manager for project ${PROJECT_ID}."
echo "You will be prompted to enter the value for each secret."
echo "After pasting/typing the value, press Enter, then Ctrl+D, then Enter again."
echo "Ensure the values are correct and do not include extra spaces or newlines unless intended."
echo "----------------------------------------------------"

secrets=(
  "FIREBASE_API_KEY"
  "FIREBASE_AUTH_DOMAIN"
  "FIREBASE_PROJECT_ID"
  "FIREBASE_STORAGE_BUCKET"
  "FIREBASE_MESSAGING_SENDER_ID"
  "FIREBASE_APP_ID"
  # "FIREBASE_MEASUREMENT_ID" # Uncomment if used
  "FIREBASE_DATABASE_URL"
  "GOOGLE_MAPS_API_KEY"
  "TWILIO_ACCOUNT_SID"
  "TWILIO_AUTH_TOKEN"
  "TWILIO_PHONE_NUMBER"
  "DEFAULT_ALERT_RADIUS_KM"
)

for secret_name in "${secrets[@]}"; do
  echo ""
  echo "Processing secret: ${secret_name}"
  echo "Please enter the value for ${secret_name} (then Enter, Ctrl+D, Enter):"

  # Check if secret exists
  if gcloud secrets describe ${secret_name} --project=${PROJECT_ID} --quiet &>/dev/null; then
    echo "Secret ${secret_name} already exists. Adding a new version."
    if gcloud secrets versions add ${secret_name} --project=${PROJECT_ID} --data-file=- --quiet; then
      echo "Successfully added new version to ${secret_name}."
    else
      echo "Failed to add new version to ${secret_name}."
    fi
  else
    echo "Secret ${secret_name} does not exist. Creating it."
    if gcloud secrets create ${secret_name} --project=${PROJECT_ID} --replication-policy="automatic" --data-file=- --quiet; then
      echo "Successfully created secret ${secret_name}."
    else
      echo "Failed to create secret ${secret_name}."
    fi
  fi
done

echo ""
echo "----------------------------------------------------"
echo "All secrets have been processed."
echo "IMPORTANT:"
echo "1. For client-side keys (FIREBASE_*, GOOGLE_MAPS_API_KEY), ensure you have configured strict API key restrictions"
echo "   (e.g., HTTP referrers, API restrictions) in the Google Cloud Console / Firebase Console."
echo "2. For EXPO_PUBLIC_* variables needed by the Expo web build, these must be available as environment variables"
echo "   (e.g., EXPO_PUBLIC_FIREBASE_API_KEY) during the 'npm run build:web' step in your Docker build process."
echo "   This typically involves fetching them from Secret Manager in your CI/CD pipeline (e.g., Cloud Build)"
echo "   and exposing them to the Docker build environment."
echo "3. For true backend secrets used at runtime by Cloud Run (e.g., TWILIO_AUTH_TOKEN if used server-side),"
echo "   map them in your 'gcloud run deploy' command using '--update-secrets' or '--set-env-vars' flags linking to Secret Manager."
echo "   For example: --update-secrets=MY_APP_TWILIO_TOKEN=TWILIO_AUTH_TOKEN:latest"

# Essential for Cloud Run deployment
gcloud services enable run.googleapis.com --project=safehaven-463909

# For storing Docker images
gcloud services enable artifactregistry.googleapis.com --project=safehaven-463909

# For managing secrets
gcloud services enable secretmanager.googleapis.com --project=safehaven-463909

# For automated builds (optional but good practice)
gcloud services enable cloudbuild.googleapis.com --project=safehaven-463909

# For IAM (usually enabled by default, but good to ensure)
gcloud services enable iam.googleapis.com --project=safehaven-463909

# Firebase related APIs
gcloud services enable firebase.googleapis.com --project=safehaven-463909
gcloud services enable firestore.googleapis.com --project=safehaven-463909
gcloud services enable firebasedatabase.googleapis.com --project=safehaven-463909
# Firebase Storage uses Google Cloud Storage buckets; enabling this also enables GCS API
gcloud services enable storage.googleapis.com --project=safehaven-463909 # For Firebase Storage
gcloud services enable identitytoolkit.googleapis.com --project=safehaven-463909 # For Firebase Auth
gcloud services enable firebasecloudmessaging.googleapis.com --project=safehaven-463909 # For FCM

# Google Maps Platform APIs (Enable specific ones as needed)
# Note: Maps APIs often require billing to be set up and might have specific enablement UIs.
# Enabling them via gcloud services enable is a good first step.
gcloud services enable mapsplatform.googleapis.com --project=safehaven-463909 # General platform
gcloud services enable mapsjs.googleapis.com --project=safehaven-463909 # Maps JavaScript API
gcloud services enable geocoding-backend.googleapis.com --project=safehaven-463909 # Geocoding API
gcloud services enable places-backend.googleapis.com --project=safehaven-463909 # Places API

# Cloud Pub/Sub API
gcloud services enable pubsub.googleapis.com --project=safehaven-463909

echo "All identified Google Cloud services have been enabled for project safehaven-463909."

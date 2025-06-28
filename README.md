# SafeHaven - Cloud-Based Emergency Alert Application 🚨

## 🚀 **Recent Critical Fixes & Improvements**

### ✅ **Issues Resolved (Latest Update)**

1. **📦 Package.json Reconstruction**
   - Fixed corrupted package.json with proper dependencies
   - Added Express backend support (express, cors, body-parser, dotenv, axios)
   - Included all necessary dev tools (nodemon, postcss, autoprefixer)
   - Maintained Expo frontend compatibility

2. **🎨 Tailwind CSS Integration Fixed**
   - ✅ Fixed Tailwind CSS not rendering properly
   - ✅ Added proper PostCSS configuration (`postcss.config.js`)
   - ✅ Implemented responsive design with mobile-first approach
   - ✅ Added custom CSS classes for layout components
   - ✅ Fixed CSS build pipeline with proper scripts

3. **📱 Scrolling & Layout Issues Resolved**
   - ✅ Fixed UI overflow and scrolling problems
   - ✅ Implemented proper responsive layout with Tailwind
   - ✅ Added mobile-friendly navigation with hamburger menu
   - ✅ Fixed content container heights and overflow handling
   - ✅ Added proper CSS classes: `.scrollable-container`, `.main-layout`, etc.

4. **🔧 Build Process & CI/CD Optimization**
   - ✅ Added CSS build pipeline with Tailwind CLI
   - ✅ Fixed GitHub Actions CI/CD compatibility
   - ✅ Optimized Docker build process with CSS building
   - ✅ Added proper environment variable handling

### 🛠 **New Scripts Available**
```bash
npm run build:css-prod    # Build CSS for production (minified)
npm run build:css         # Build CSS with watch mode
npm run dev:server        # Start Express server with nodemon
npm run server            # Start Express server
```

### 🌐 **Live Application**
**Production URL:** https://safehaven-frontend-441114248968.us-central1.run.app

---

## 1. Project Overview

SafeHaven is a cloud-based emergency alert application designed to help communities and individuals stay safe and informed during critical events. It provides a platform for broadcasting alerts, requesting assistance (SOS), reporting suspicious activities, and finding nearby help centers. The application is built using modern web technologies and is deployed on Google Cloud Platform (GCP) using Docker and Cloud Run, ensuring scalability and reliability.

## 2. Features

- **Disaster Alerting**: Administrators can broadcast emergency alerts to users within specific geographical areas or to all users.
- **SOS Functionality**: Users in distress can send SOS signals with their location to emergency contacts or responders.
- **Suspicious Activity Reporting**: Users can report suspicious activities with details and location, helping to maintain community safety.
- **Help Center Locator**: Users can find nearby help centers, shelters, or safe zones during emergencies, integrated with Google Maps.
- **User Authentication**: Secure phone number based authentication for users.
- **Real-time Location Sharing**: For SOS and emergency coordination (requires user consent).
- **Push Notifications**: For timely delivery of alerts and updates.

## 3. Setup Guide

### 3.1. Prerequisites

- [Node.js](https://nodejs.org/) (LTS version, e.g., v20.x)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Google Cloud SDK (gcloud CLI)](https://cloud.google.com/sdk/docs/install)
- A Google Cloud Platform project with billing enabled.
- Firebase project for authentication and potentially other services.

### 3.2. Configuration

The application uses environment variables for configuration, especially for sensitive API keys and service settings. These are managed via a `.env` file for local development and set directly in Cloud Run for deployed environments.

**Create a `.env` file** in the root of the project with the following content. **Do not commit this file to version control.**

```env
# Firebase Configuration (obtain from your Firebase project settings)
EXPO_PUBLIC_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY"
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
EXPO_PUBLIC_FIREBASE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET"
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID"
EXPO_PUBLIC_FIREBASE_APP_ID="YOUR_FIREBASE_APP_ID"
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID="YOUR_FIREBASE_MEASUREMENT_ID" # Optional

# Google Maps API Key (ensure it's secured and has necessary APIs enabled)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_GOOGLE_MAPS_API_KEY"

# Twilio Configuration (if used for SMS/Voice for SOS, notifications)
# These would typically be used server-side (e.g., in Firebase Functions)
# For client-side initiated actions that trigger backend Twilio, ensure your functions are secure.
TWILIO_ACCOUNT_SID="YOUR_TWILIO_ACCOUNT_SID"
TWILIO_AUTH_TOKEN="YOUR_TWILIO_AUTH_TOKEN"
TWILIO_PHONE_NUMBER="YOUR_TWILIO_PHONE_NUMBER" # Twilio phone number for sending messages

# Application specific configurations
EXPO_PUBLIC_DEFAULT_ALERT_RADIUS_KM="10" # Example: Default radius for alerts
```

**Note on API Keys:**
- **Google Maps API Key**:
    1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
    2. Select your project.
    3. Navigate to "APIs & Services" > "Credentials".
    4. Create an API key.
    5. **Restrict the API key** to only be used by your application (e.g., by HTTP referrers for web, or by IP addresses if applicable) and enable only the necessary APIs (e.g., Maps JavaScript API, Geocoding API, Places API).
- **Twilio Credentials**:
    1. Sign up or log in to your [Twilio account](https://www.twilio.com/console).
    2. Find your Account SID and Auth Token on the dashboard.
    3. Purchase or configure a Twilio phone number.
    Twilio credentials (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`) are highly sensitive and should primarily be used server-side (e.g., in Firebase Functions or a dedicated backend). Avoid exposing them directly in client-side code. The `twilioConfig.js` mentioned in the problem description likely handles interaction with a backend service that uses these credentials.
- **Firebase Configuration**:
    1. Go to your [Firebase Console](https://console.firebase.google.com/).
    2. Select your project or create a new one.
    3. Go to Project Settings (gear icon).
    4. Under the "General" tab, find your web app's configuration details (API Key, Auth Domain, etc.).

### 3.3. Install Dependencies

```bash
npm install
```

## 4. How to Run Locally

### 4.1. Running the Web Application

The SafeHaven application uses Expo for its web build.

1.  **Ensure your `.env` file is configured** as described in section 3.2.
2.  **Start the development server:**

    ```bash
    npm run web
    ```
    This command typically starts the Expo development server for the web. Open the URL provided in your browser (usually `http://localhost:8081` or similar, Expo will specify the port).

    *Note: The `npm run web` script is based on typical Expo projects (`expo start --web`). If your `package.json` has a different script for local web development, use that instead.*

### 4.2. Running with Local Emulators (if applicable)

-   **Firebase Emulators**: If you are using Firebase services like Firestore, Functions, Auth, etc., you can run them locally using the Firebase Emulator Suite.
    ```bash
    # firebase emulators:start
    ```
    Ensure your application is configured to connect to the emulators during local development.

## 5. Deployment to Google Cloud with Docker and Cloud Run

This guide assumes you have:
- A configured GCP project.
- `gcloud` CLI authenticated and set to your project (`gcloud config set project YOUR_PROJECT_ID`).
- Google Cloud Build API, Cloud Run API, Artifact Registry API, and Secret Manager API enabled in your GCP project.

### 5.1. Store Secrets in Secret Manager (Recommended)

Instead of passing build arguments directly for sensitive keys, it's best practice to store them in Google Cloud Secret Manager and grant Cloud Build access.

1.  **Store each secret:**
    For example, for `EXPO_PUBLIC_FIREBASE_API_KEY`:
    ```bash
    echo "YOUR_FIREBASE_API_KEY_VALUE" | gcloud secrets create expo_firebase_api_key --replication-policy="automatic" --data-file=-
    ```
    Repeat for all `EXPO_PUBLIC_` variables and other secrets needed at build time or runtime.

2.  **Grant Cloud Build service account access to these secrets:**
    Find your Cloud Build service account (usually `[PROJECT_NUMBER]@cloudbuild.gserviceaccount.com`).
    ```bash
    gcloud secrets add-iam-policy-binding YOUR_SECRET_NAME \
        --member="serviceAccount:[PROJECT_NUMBER]@cloudbuild.gserviceaccount.com" \
        --role="roles/secretmanager.secretAccessor"
    ```
    Repeat for all secrets.

### 5.2. Build with Google Cloud Build

The `Dockerfile` in the project is a multi-stage Dockerfile. Cloud Build will use this to build your container image.

You can trigger a build using `gcloud builds submit`. To pass the `EXPO_PUBLIC_` variables from Secret Manager to the Docker build process, you'll reference them in your `cloudbuild.yaml` or directly in the `gcloud builds submit` command.

**Option A: Using `gcloud builds submit` directly (simpler for direct Dockerfile builds)**

If your `Dockerfile` uses `ARG`s for `EXPO_PUBLIC_` variables, you can pass them like this:

```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/safehaven-app \
  --project=YOUR_PROJECT_ID \
  --substitutions=\
_EXPO_PUBLIC_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY_VALUE",\
_EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN_VALUE",\
_EXPO_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID_VALUE",\
_EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET_VALUE",\
_EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID_VALUE",\
_EXPO_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID_VALUE",\
_EXPO_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_GOOGLE_MAPS_API_KEY_VALUE",\
_EXPO_PUBLIC_DEFAULT_ALERT_RADIUS_KM="10"
# Add other EXPO_PUBLIC_ variables as needed
# Note: For values from Secret Manager, you'd use a cloudbuild.yaml

# To pass these ARGs to Docker build, ensure your Dockerfile has:
# ARG EXPO_PUBLIC_FIREBASE_API_KEY
# ENV EXPO_PUBLIC_FIREBASE_API_KEY=${EXPO_PUBLIC_FIREBASE_API_KEY}
# (This is already present in the provided Dockerfile)
```
This command builds the Docker image and pushes it to Google Container Registry (GCR). You can also use Artifact Registry by specifying the appropriate path (e.g., `us-central1-docker.pkg.dev/YOUR_PROJECT_ID/YOUR_REPO/safehaven-app`).

**Option B: Using a `cloudbuild.yaml` (more flexible)**

Create a `cloudbuild.yaml` file in your project root:
```yaml
steps:
- name: 'gcr.io/cloud-builders/docker'
  args:
  - 'build'
  - '--tag=gcr.io/${PROJECT_ID}/safehaven-app:latest'
  # Pass build arguments from Secret Manager or substitutions
  - '--build-arg'
  - 'EXPO_PUBLIC_FIREBASE_API_KEY=${_EXPO_PUBLIC_FIREBASE_API_KEY}' # If using substitutions
  # OR for secrets:
  # - '--build-arg'
  # - 'EXPO_PUBLIC_FIREBASE_API_KEY=$_EXPO_PUBLIC_FIREBASE_API_KEY_SECRET' # If mapping secret to build arg
  - '--build-arg'
  - 'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=${_EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN}'
  - '--build-arg'
  - 'EXPO_PUBLIC_FIREBASE_PROJECT_ID=${_EXPO_PUBLIC_FIREBASE_PROJECT_ID}'
  - '--build-arg'
  - 'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=${_EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET}'
  - '--build-arg'
  - 'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${_EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}'
  - '--build-arg'
  - 'EXPO_PUBLIC_FIREBASE_APP_ID=${_EXPO_PUBLIC_FIREBASE_APP_ID}'
  - '--build-arg'
  - 'EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=${_EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}'
  - '--build-arg'
  - 'EXPO_PUBLIC_DEFAULT_ALERT_RADIUS_KM=${_EXPO_PUBLIC_DEFAULT_ALERT_RADIUS_KM}'
  - '.'
  # Example for using secrets directly (requires Cloud Build SA to have access)
  # availableSecrets:
  #   secretManager:
  #   - versionName: projects/$PROJECT_ID/secrets/expo_firebase_api_key/versions/latest
  #     env: 'EXPO_PUBLIC_FIREBASE_API_KEY_SECRET' # This env var is available to build steps

images:
- 'gcr.io/${PROJECT_ID}/safehaven-app:latest'

# Example substitutions (can be passed via gcloud builds submit --substitutions=...)
# substitutions:
#   _EXPO_PUBLIC_FIREBASE_API_KEY: 'your-default-or-test-key' # Not recommended for actual secrets
#   _EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: 'your-default-maps-key'
```
Then run:
```bash
gcloud builds submit --config cloudbuild.yaml --project=YOUR_PROJECT_ID \
  --substitutions=\
_EXPO_PUBLIC_FIREBASE_API_KEY="VALUE_OR_SECRET_MANAGER_REF",\
_EXPO_PUBLIC_GOOGLE_MAPS_API_KEY="VALUE_OR_SECRET_MANAGER_REF" # etc.
```
Refer to [Cloud Build documentation for using secrets](https://cloud.google.com/build/docs/securing-builds/use-secrets) and [substituting variable values](https://cloud.google.com/build/docs/configuring-builds/substitute-variable-values).

### 5.3. Deploy to Cloud Run

Once the image is built and pushed to GCR or Artifact Registry:

```bash
gcloud run deploy safehaven-service \
  --image gcr.io/YOUR_PROJECT_ID/safehaven-app:latest \ # Or your Artifact Registry path
  --platform managed \
  --region YOUR_REGION \ # e.g., us-central1
  --allow-unauthenticated \ # Or configure authentication as needed
  --port 8080 \ # The port your application listens on (defined in Dockerfile CMD)
  --project=YOUR_PROJECT_ID
  # To set runtime environment variables (if not already baked in or different from build-time):
  # --set-env-vars="KEY1=VALUE1,KEY2=VALUE2"
  # For secrets at runtime:
  # --update-secrets=ENV_VAR_NAME=SECRET_NAME:latest # ...
```

**Runtime Environment Variables:**
If your application needs environment variables at runtime (e.g., database URLs, different API keys for prod), you can set them during deployment using `--set-env-vars` or by linking to Secret Manager secrets using `--update-secrets`. The `EXPO_PUBLIC_` variables are typically build-time arguments needed by `expo build:web`, so they get baked into the static assets. If there are runtime configurations needed by the `serve` command or any server-side logic within the container (if any), use Cloud Run's env var settings.

### 5.4. Continuous Deployment (Optional)

Set up a Cloud Build trigger to automatically build and deploy your application when changes are pushed to your Git repository (e.g., to the `main` or `master` branch).

## 6. Project Structure (Relevant)

```
- src/
  - screens/
    - HomeScreen.tsx
    - SosScreen.tsx
    - HelpCenterScreen.tsx
    - details/                  # << Ensure AlertDetailScreen.tsx is present here
      - AlertDetailScreen.tsx
  - components/
  - navigation/
  - services/
  - config/
- web/                          # Expo web specific files (index.html, etc.)
- functions/                    # Firebase Functions (if any, for backend logic)
- dataconnect/                  # Firebase Data Connect configuration
- .env                          # Local environment variables (NOT committed)
- Dockerfile                    # Docker configuration for building the app
- package.json                  # Node.js project manifest
- .gcloudignore                 # Specifies files to ignore for gcloud uploads
- .dockerignore                 # Specifies files to ignore for Docker build context
- cloudbuild.yaml               # Optional: For CI/CD with Google Cloud Build
- README.md                     # This file
```

## 7. Troubleshooting

-   **Missing File `AlertDetailScreen.tsx` during build**:
    This was the initial problem. Ensure the file `src/screens/details/AlertDetailScreen.tsx` and its directory `src/screens/details/` actually exist in your project source code. If it was accidentally deleted or not committed, it needs to be restored.
-   **Build failures in Cloud Build**: Check the logs in the Cloud Build history in the GCP console for detailed error messages.
-   **Cloud Run deployment issues**: Check Cloud Run logs for your service. Ensure the container starts correctly and listens on the specified port (default 8080).
-   **Environment Variables**: Double-check that all necessary `EXPO_PUBLIC_` variables are correctly passed as build arguments during the Docker build (`ARG` in Dockerfile, then `ENV`). For Cloud Run, ensure runtime environment variables are set if needed.

---

This README provides a comprehensive guide. Remember to replace placeholders like `YOUR_PROJECT_ID`, `YOUR_FIREBASE_API_KEY`, etc., with your actual values.

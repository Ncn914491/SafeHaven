# SafeHaven Disaster Alert App - Deployment Documentation

## Deployment Summary

The SafeHaven disaster alert application has been successfully deployed to Google Cloud Platform using the following architecture:

- **Frontend**: React Native/Expo web application
- **Backend**: Firebase Functions with Twilio SMS integration
- **Database**: Firebase Firestore and Realtime Database
- **Hosting**: Google Cloud Run
- **Container Registry**: Google Cloud Artifact Registry

## Deployment URLs

### Production Application
- **Main URL**: https://safehaven-frontend-441114248968.us-central1.run.app
- **Alternative URL**: https://safehaven-frontend-uegoaipuiq-uc.a.run.app

## Infrastructure Configuration

### Google Cloud Project
- **Project ID**: safehaven-463909
- **Project Number**: 441114248968
- **Region**: us-central1

### Cloud Run Service
- **Service Name**: safehaven-frontend
- **Image**: us-central1-docker.pkg.dev/safehaven-463909/safehaven-repo/safehaven-app:latest
- **Port**: 8080
- **CPU**: 1 vCPU
- **Memory**: 512Mi
- **Min Instances**: 0
- **Max Instances**: 2
- **Concurrency**: 80 requests per instance
- **Timeout**: 300 seconds

### Artifact Registry
- **Repository**: safehaven-repo
- **Location**: us-central1
- **Format**: Docker

## Environment Variables

The following environment variables are configured in the Docker build:

```
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyD9yWrY2xO5oS59_mEaGthe5VnAtDtWpAM
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=safehaven-463909.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=safehaven-463909
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=safehaven-463909.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=441114248968
EXPO_PUBLIC_FIREBASE_APP_ID=1:441114248968:web:d4f1d612fa335733380ebd
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-WJN6VFZ3CR
EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://safehaven-463909-default-rtdb.firebaseio.com
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBB-8425qrfGJvEy6eqHJZxGo2_8kNVev4
EXPO_PUBLIC_DEFAULT_ALERT_RADIUS_KM=10
```

## Firebase Configuration

### Functions
- **Twilio Account SID**: [CONFIGURED_IN_ENVIRONMENT]
- **Twilio Phone Number**: [CONFIGURED_IN_ENVIRONMENT]
- **Functions deployed**: sendSMSAlert, sendBulkSMSAlert, handleSOSRequest, sendAlertNotifications, cleanupExpiredAlerts

### Database
- **Firestore**: Configured for user data, emergency contacts, and logs
- **Realtime Database**: Configured for real-time alerts and notifications

## Deployment Process

### Automated Build and Deploy
The deployment uses Google Cloud Build with the configuration in `cloudbuild.yaml`:

1. **Build Stage**: Creates Docker image with environment variables
2. **Push Stage**: Uploads image to Artifact Registry
3. **Deploy Stage**: Deploys to Cloud Run with proper configuration

### Manual Deployment Commands
```bash
# Build and deploy using Cloud Build
gcloud builds submit --config cloudbuild.yaml .

# Or deploy manually after building
gcloud run deploy safehaven-frontend \
  --image us-central1-docker.pkg.dev/safehaven-463909/safehaven-repo/safehaven-app:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --min-instances 0 \
  --max-instances 2 \
  --cpu 1 \
  --memory 512Mi
```

## Security Configuration

- **IAM**: Service is publicly accessible (allUsers have run.invoker role)
- **HTTPS**: Automatic HTTPS termination by Cloud Run
- **Authentication**: Firebase Authentication for user management
- **API Keys**: Secured through Firebase project configuration

## Monitoring and Logs

### Cloud Run Logs
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=safehaven-frontend" --limit=20
```

### Service Status
```bash
gcloud run services describe safehaven-frontend --region=us-central1
```

## Application Features

The deployed application includes:

1. **Emergency Alert System**: Real-time disaster alerts with location-based filtering
2. **Interactive Maps**: Google Maps integration for visualizing alerts and shelters
3. **SOS Messaging**: Emergency communication system with SMS notifications
4. **User Authentication**: Firebase-based user management
5. **Shelter Information**: Database of emergency shelters and safe locations
6. **SMS Alerts**: Twilio integration for critical notifications

## Maintenance and Updates

### Updating the Application
1. Make changes to the codebase
2. Run `gcloud builds submit --config cloudbuild.yaml .`
3. The new version will be automatically deployed

### Scaling
- Auto-scaling is configured (0-2 instances)
- Can be adjusted via Cloud Run console or gcloud commands

### Backup and Recovery
- Firebase data is automatically backed up
- Container images are versioned in Artifact Registry
- Infrastructure is defined as code in the repository

## Support and Troubleshooting

### Common Issues
1. **Build Failures**: Check Cloud Build logs in Google Cloud Console
2. **Runtime Errors**: Monitor Cloud Run logs for application errors
3. **Firebase Issues**: Verify Firebase configuration and API keys

### Contact Information
- **Project**: SafeHaven Disaster Alert System
- **Deployment Date**: June 27, 2025
- **Last Updated**: June 27, 2025

## Next Steps

1. Set up monitoring and alerting for the production service
2. Configure custom domain if needed
3. Implement CI/CD pipeline for automated deployments
4. Set up backup and disaster recovery procedures
5. Configure Firebase Functions deployment automation

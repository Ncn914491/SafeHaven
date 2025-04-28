# SafeHaven - Disaster Management App

SafeHaven is a mobile-first, real-time, location-aware disaster management app built with React Native, Firebase, and Google Cloud services.

## Features

- **Authentication**: Phone-number OTP login via Firebase Auth with Anonymous Emergency Mode fallback
- **Real-Time Location-Based Alerts**: Receive alerts within your configurable radius
- **Safe Check-In & Family Groups**: Mark yourself as safe and create family groups to track status
- **SOS & Offline Messaging**: One-tap SOS button with offline SMS fallback via Twilio
- **Shelter & Resource Map**: Find nearby shelters with offline map caching
- **Suspicious Activity Reporting**: Upload photos/videos with location metadata
- **Admin Dashboard**: Web app for authorities to manage alerts and respond to SOS messages

## Project Structure

```
safehaven/
├── .expo/                  # Expo configuration
├── .github/                # GitHub Actions workflows
├── assets/                 # App assets (images, fonts)
├── functions/              # Firebase Cloud Functions
├── src/                    # Source code
│   ├── components/         # Reusable UI components
│   ├── config/             # Configuration files
│   ├── constants/          # App constants
│   ├── hooks/              # Custom React hooks
│   ├── navigation/         # Navigation configuration
│   ├── screens/            # App screens
│   │   ├── auth/           # Authentication screens
│   │   ├── details/        # Detail screens
│   │   ├── forms/          # Form screens
│   │   └── main/           # Main tab screens
│   ├── services/           # Firebase and API services
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── web/                    # Web admin dashboard
├── .env                    # Environment variables
├── App.tsx                 # Main app component
├── app.json                # Expo configuration
├── babel.config.js         # Babel configuration
├── firebase.json           # Firebase configuration
├── index.ts                # App entry point
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Firebase account
- Google Cloud account
- Twilio account (for SMS functionality)

### Environment Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/safehaven.git
   cd safehaven
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   # Firebase Configuration
   FIREBASE_API_KEY=your-api-key
   FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   FIREBASE_APP_ID=your-app-id
   FIREBASE_MEASUREMENT_ID=your-measurement-id
   FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com

   # Google Maps API Key
   GOOGLE_MAPS_API_KEY=your-google-maps-api-key

   # Twilio Configuration
   TWILIO_ACCOUNT_SID=your-twilio-account-sid
   TWILIO_AUTH_TOKEN=your-twilio-auth-token
   TWILIO_PHONE_NUMBER=your-twilio-phone-number

   # App Configuration
   DEFAULT_ALERT_RADIUS_KM=5
   ```

### Firebase Setup

1. Create a new Firebase project at [firebase.google.com](https://firebase.google.com/)
2. Enable the following services:
   - Authentication (Phone and Email/Password providers)
   - Firestore Database
   - Realtime Database
   - Storage
   - Cloud Functions
   - Hosting
   - Cloud Messaging

3. Set up Firebase CLI:
   ```
   npm install -g firebase-tools
   firebase login
   firebase init
   ```

4. Configure Firebase Functions environment variables:
   ```
   firebase functions:config:set twilio.account_sid="your-twilio-account-sid" twilio.auth_token="your-twilio-auth-token" twilio.phone_number="your-twilio-phone-number"
   ```

### Running the App

#### Mobile App (React Native)

```
# Start the development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android simulator
npm run android

# Run on web
npm run web
```

#### Web Admin Dashboard

```
# Build the web app
npm run build:web

# Deploy to Firebase Hosting
npm run deploy:hosting
```

#### Cloud Functions

```
# Install dependencies for Cloud Functions
npm run prepare-functions

# Deploy Cloud Functions
npm run deploy:functions
```

### Deployment

The project includes GitHub Actions workflows for CI/CD. To use them:

1. Add the following secrets to your GitHub repository:
   - FIREBASE_API_KEY
   - FIREBASE_AUTH_DOMAIN
   - FIREBASE_PROJECT_ID
   - FIREBASE_STORAGE_BUCKET
   - FIREBASE_MESSAGING_SENDER_ID
   - FIREBASE_APP_ID
   - FIREBASE_MEASUREMENT_ID
   - FIREBASE_DATABASE_URL
   - GOOGLE_MAPS_API_KEY
   - TWILIO_ACCOUNT_SID
   - TWILIO_AUTH_TOKEN
   - TWILIO_PHONE_NUMBER
   - FIREBASE_SERVICE_ACCOUNT (JSON content of your Firebase service account key)
   - FIREBASE_TOKEN (Generate with `firebase login:ci`)
   - EXPO_TOKEN (Generate from your Expo account)

2. Push to the main branch to trigger the deployment workflow.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

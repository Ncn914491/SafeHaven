import { initializeApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getDatabase, Database } from "firebase/database";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getMessaging, isSupported, Messaging } from "firebase/messaging";
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Robust environment variable getter with multiple fallback strategies
const getEnvVar = (key: string): string | undefined => {
  // Strategy 1: Try process.env (works in Node.js and bundled web apps)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }

  // Strategy 2: Try Expo Constants (works in Expo managed workflow)
  if (Constants.expoConfig?.extra?.[key]) {
    return Constants.expoConfig.extra[key];
  }

  // Strategy 3: Try window environment (for runtime injection)
  if (typeof window !== 'undefined' && (window as any).__ENV__ && (window as any).__ENV__[key]) {
    return (window as any).__ENV__[key];
  }

  // Strategy 4: Try global environment (for Node.js-like environments)
  if (typeof global !== 'undefined' && (global as any).process?.env?.[key]) {
    return (global as any).process.env[key];
  }

  return undefined;
};

// Fallback configuration for development/testing
const fallbackConfig = {
  apiKey: "AIzaSyD9yWrY2xO5oS59_mEaGthe5VnAtDtWpAM",
  authDomain: "safehaven-463909.firebaseapp.com",
  projectId: "safehaven-463909",
  storageBucket: "safehaven-463909.appspot.com",
  messagingSenderId: "441114248968",
  appId: "1:441114248968:web:d4f1d612fa335733380ebd",
  measurementId: "G-WJN6VFZ3CR",
  databaseURL: "https://safehaven-463909-default-rtdb.firebaseio.com"
};

// Build Firebase configuration with environment variables and fallbacks
const buildFirebaseConfig = () => {
  const config = {
    apiKey: getEnvVar('EXPO_PUBLIC_FIREBASE_API_KEY') || fallbackConfig.apiKey,
    authDomain: getEnvVar('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN') || fallbackConfig.authDomain,
    projectId: getEnvVar('EXPO_PUBLIC_FIREBASE_PROJECT_ID') || fallbackConfig.projectId,
    storageBucket: getEnvVar('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET') || fallbackConfig.storageBucket,
    messagingSenderId: getEnvVar('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID') || fallbackConfig.messagingSenderId,
    appId: getEnvVar('EXPO_PUBLIC_FIREBASE_APP_ID') || fallbackConfig.appId,
    measurementId: getEnvVar('EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID') || fallbackConfig.measurementId,
    databaseURL: getEnvVar('EXPO_PUBLIC_FIREBASE_DATABASE_URL') || fallbackConfig.databaseURL
  };

  // Log configuration status (without exposing sensitive data)
  console.log('Firebase configuration loaded:', {
    apiKeyPresent: !!config.apiKey,
    authDomainPresent: !!config.authDomain,
    projectId: config.projectId,
    platform: Platform.OS,
    source: getEnvVar('EXPO_PUBLIC_FIREBASE_API_KEY') ? 'environment' : 'fallback'
  });

  return config;
};

const firebaseConfig = buildFirebaseConfig();

// Validate that essential Firebase config values are present
const validateConfig = (config: any) => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId'];
  const missingFields = requiredFields.filter(field => !config[field]);

  if (missingFields.length > 0) {
    console.error("Firebase configuration is missing required fields:", missingFields);
    console.error("Current config:", {
      ...config,
      apiKey: config.apiKey ? '[PRESENT]' : '[MISSING]'
    });
    return false;
  }

  return true;
};

const isConfigValid = validateConfig(firebaseConfig);

// Safe Firebase initialization with error handling
let app: FirebaseApp | null = null;
let analytics: Analytics | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let database: Database | null = null;
let storage: FirebaseStorage | null = null;
let messaging: Messaging | null = null;

const initializeFirebase = () => {
  try {
    if (!isConfigValid) {
      console.warn('Firebase configuration is invalid. Some features may not work.');
      return false;
    }

    // Initialize Firebase app
    app = initializeApp(firebaseConfig);
    console.log('Firebase app initialized successfully');

    // Initialize Firebase services
    try {
      auth = getAuth(app);
      console.log('Firebase Auth initialized');
    } catch (error) {
      console.error('Failed to initialize Firebase Auth:', error);
    }

    try {
      firestore = getFirestore(app);
      console.log('Firestore initialized');
    } catch (error) {
      console.error('Failed to initialize Firestore:', error);
    }

    try {
      database = getDatabase(app);
      console.log('Realtime Database initialized');
    } catch (error) {
      console.error('Failed to initialize Realtime Database:', error);
    }

    try {
      storage = getStorage(app);
      console.log('Firebase Storage initialized');
    } catch (error) {
      console.error('Failed to initialize Firebase Storage:', error);
    }

    // Initialize Analytics (web only)
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        analytics = getAnalytics(app);
        console.log('Firebase Analytics initialized');
      } catch (error) {
        console.error('Failed to initialize Firebase Analytics:', error);
      }
    }

    // Initialize Firebase Cloud Messaging (web only)
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      isSupported().then(supported => {
        if (supported) {
          try {
            messaging = getMessaging(app!);
            console.log('Firebase Messaging initialized');
          } catch (error) {
            console.error('Failed to initialize Firebase Messaging:', error);
          }
        } else {
          console.log('Firebase Messaging not supported in this browser');
        }
      }).catch(error => {
        console.error('Error checking Firebase Messaging support:', error);
      });
    }

    return true;
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    return false;
  }
};

// Initialize Firebase
const firebaseInitialized = initializeFirebase();

// Helper functions to safely access Firebase services
export const getFirebaseApp = (): FirebaseApp | null => app;
export const getFirebaseAuth = (): Auth | null => auth;
export const getFirebaseFirestore = (): Firestore | null => firestore;
export const getFirebaseDatabase = (): Database | null => database;
export const getFirebaseStorage = (): FirebaseStorage | null => storage;
export const getFirebaseAnalytics = (): Analytics | null => analytics;
export const getFirebaseMessaging = (): Messaging | null => messaging;

// Check if Firebase is properly initialized
export const isFirebaseInitialized = (): boolean => firebaseInitialized && app !== null;

// Legacy exports for backward compatibility
export { app, analytics, auth, firestore, database, storage, messaging };

// Export configuration for debugging
export { firebaseConfig, isConfigValid };

// User roles enum
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

// User profile interface for role-based access
export interface UserProfile {
  uid: string;
  email?: string;
  displayName?: string;
  phoneNumber?: string;
  role: UserRole;
  createdAt: Date;
  lastLogin: Date;
  isActive: boolean;
}

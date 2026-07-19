import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

const getEnvVar = (key: string, fallback: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
  } catch (_e) {
    // import.meta.env not present in node environment
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key]!;
  }
  return fallback;
};

/**
 * Firebase modular configuration object using environment variables with safe fallback.
 */
const firebaseConfig = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY', 'AIzaSyDemoPlaceholderKey123456789'),
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN', 'stadiummind-ai.firebaseapp.com'),
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID', 'stadiummind-ai'),
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET', 'stadiummind-ai.appspot.com'),
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID', '102938475610'),
  appId: getEnvVar('VITE_FIREBASE_APP_ID', '1:102938475610:web:abc123def456ghi789'),
};

/**
 * Initialize or retrieve the singleton FirebaseApp instance.
 */
export const app: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

/**
 * Firestore modular instance initialized from Firebase app.
 */
export const db: Firestore = getFirestore(app);

/**
 * Firebase SDK Initializer Placeholder for StadiumMind AI.
 *
 * Note: Firebase is prepared for upcoming phases (Auth, Firestore live crowd feeds).
 * Environment variables will be populated when Firebase project is linked.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';

// Dummy config placeholder until environment variables are supplied in future phase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'PLACEHOLDER_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'stadiummind-ai.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'stadiummind-ai',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'stadiummind-ai.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:000000000000:web:0000000000000000000000',
};

/**
 * Initializes and retrieves the Firebase app instance.
 *
 * @returns {FirebaseApp | null} Initialized FirebaseApp or null if unconfigured placeholder
 */
export function getFirebaseApp(): FirebaseApp | null {
  if (!getApps().length && firebaseConfig.apiKey !== 'PLACEHOLDER_KEY') {
    return initializeApp(firebaseConfig);
  }
  return getApps()[0] || null;
}

// Firebase configuration
// Replace these with your actual Firebase config values
import { initializeApp } from 'firebase/app'
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "your-app-id",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined
}

// Validate Firebase config before initializing
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "your-api-key") {
  console.warn('Firebase API key is missing or invalid. Please set VITE_FIREBASE_API_KEY in your .env file.')
}

// Initialize Firebase
let app
try {
  app = initializeApp(firebaseConfig)
} catch (error) {
  console.error('Firebase initialization error:', error)
  // Create a mock app object to prevent crashes
  app = { name: '[DEFAULT]', options: firebaseConfig }
}

// Initialize Firebase Authentication and get a reference to the service
let auth
try {
  if (app && app.name) {
    auth = getAuth(app)
    
    // Set persistence to session-only so users must log in each time they open the app
    // This ensures authentication doesn't persist across browser sessions
    // Users will need to log in again when they close and reopen the browser
    setPersistence(auth, browserSessionPersistence).catch((error) => {
      console.error('Error setting auth persistence:', error)
    })
  } else {
    throw new Error('Firebase app not initialized')
  }
} catch (error) {
  console.error('Firebase Auth initialization error:', error)
  console.error('Please check your Firebase API key in .env file. The API key may be invalid or expired.')
  // Create a mock auth object to prevent crashes
  auth = null
}

export { auth }
export default app


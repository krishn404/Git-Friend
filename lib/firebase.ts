import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
}

// Initialize Firebase client
let app: any = null
let auth: any = null
let googleProvider: any = null

try {
  if (!getApps().length && firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig)
  } else if (getApps().length) {
    app = getApp()
  }
  
  if (app) {
    auth = getAuth(app)
    googleProvider = new GoogleAuthProvider()
  }
} catch (error) {
  console.warn("Firebase initialization failed:", error)
}

export { auth, googleProvider }

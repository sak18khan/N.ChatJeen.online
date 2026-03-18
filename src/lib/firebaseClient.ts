import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

const dbUrl = `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  databaseURL: dbUrl
};

// Initialize Firebase only once
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Get Realtime Database instance
export const rtdb = getDatabase(app);

// Monitor connection state
export let fbConnectionErr = "";
if (typeof window !== 'undefined') {
  const connectedRef = ref(rtdb, ".info/connected");
  onValue(connectedRef, (snap) => {
    if (snap.val() === true) {
      console.log("[Firebase] connected securely to", dbUrl);
      fbConnectionErr = "";
    } else {
      console.warn("[Firebase] disconnected from", dbUrl);
    }
  }, (err) => {
     console.error("Firebase Connection Error:", err.message);
     fbConnectionErr = "Firebase DB Error: " + err.message;
  });
}

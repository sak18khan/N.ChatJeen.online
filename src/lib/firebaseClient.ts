import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

const dbUrl = `https://chatjeen-93bcc-default-rtdb.asia-southeast1.firebasedatabase.app`;

const firebaseConfig = {
  apiKey: "AIzaSyBaPcIj13UBtYjM0obEugMtGIplEJ3Fx-Q",
  authDomain: "chatjeen-93bcc.firebaseapp.com",
  projectId: "chatjeen-93bcc",
  storageBucket: "chatjeen-93bcc.firebasestorage.app",
  messagingSenderId: "1051862658643",
  appId: "1:1051862658643:web:58ffb89aee9648ea3d20a6",
  measurementId: "G-8ZB3RJPCF8",
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

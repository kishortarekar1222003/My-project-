// ─────────────────────────────────────────────────────────────
// STEP 1: Firebase Console (console.firebase.google.com) pe jaake:
//   1. "Add Project" → naam do (e.g. "roomwala") → create
//   2. Left menu me "Build > Firestore Database" → Create database → "test mode" me start karo
//   3. Left menu me "Build > Storage" → Get started → "test mode" me start karo
//   4. Project Settings (gear icon) > General > "Your apps" > Web app (</>) icon > register
//   5. Wahan se ye config object milega — usse yahan neeche paste karo
// ─────────────────────────────────────────────────────────────

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

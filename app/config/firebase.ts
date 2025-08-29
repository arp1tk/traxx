import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.API_URL,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: "traxx-d2691",
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: "776254568196",
  appId: process.env.APP_ID,
  databaseURL: process.env.DATABASE_URL
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
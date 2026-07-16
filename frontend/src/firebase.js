import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAcSWPTuuUmOa0kLV-raO8mNmklPVUqT8s",
  authDomain: "cincrafit-ai.firebaseapp.com",
  projectId: "cincrafit-ai",
  storageBucket: "cincrafit-ai.firebasestorage.app",
  messagingSenderId: "660885947712",
  appId: "1:660885947712:web:3da9674c5e78f380dc66a5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

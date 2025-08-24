// Import SDK
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Hapus import storage

const firebaseConfig = {
  apiKey: "AIzaSyCAvu9yEikVXZFGK9HBvCTbTLR61TjGl6A",
  authDomain: "mini-lms-c6c05.firebaseapp.com",
  projectId: "mini-lms-c6c05",
  storageBucket: "mini-lms-c6c05.firebasestorage.app",
  messagingSenderId: "533046308162",
  appId: "1:533046308162:web:bc072180ff540697d92cdb"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
// Hapus export storage

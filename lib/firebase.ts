import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDBVkV-zQBRKKCTZCXez73THZqYXwMCFdo",
    authDomain: "tiph-71310.firebaseapp.com",
    projectId: "tiph-71310",
    storageBucket: "tiph-71310.firebasestorage.app",
    messagingSenderId: "229006067234",
    appId: "1:229006067234:web:5b83eb66c0b3f43b63ec7b",
    measurementId: "G-BXNCS24QVK"
  };
  

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

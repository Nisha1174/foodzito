// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "foodzito-food-aap.firebaseapp.com",
  projectId: "foodzito-food-aap",
  storageBucket: "foodzito-food-aap.firebasestorage.app",
  messagingSenderId: "421451492676",
  appId: "1:421451492676:web:db0a6bba0d55d986f33b11"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth =getAuth(app)
export{app,auth}
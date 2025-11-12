// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA2jviaNr6y3eaFXhKb-mHEh3LhxML387s",
    authDomain: "artistry-1c33d.firebaseapp.com",
    projectId: "artistry-1c33d",
    storageBucket: "artistry-1c33d.firebasestorage.app",
    messagingSenderId: "691946213767",
    appId: "1:691946213767:web:2de8581b04db589ef60322",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

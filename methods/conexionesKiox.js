import { initializeApp } from "https://www.gstatic.com/firebasejs/7.17.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/7.17.1/firebase-analytics.js";
import { getFirestore, collection, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/7.17.1/firebase-firestore.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/7.17.1/firebase-auth.js';

const firebaseConfig = {
    apiKey: "AIzaSyDFlvXXq0Kdu1CAyjslc2gChlLu0SILn7s",
    authDomain: "fior-a4273.firebaseapp.com",
    databaseURL: "https://fior-a4273-default-rtdb.firebaseio.com",
    projectId: "fior-a4273",
    storageBucket: "fior-a4273.firebasestorage.app",
    messagingSenderId: "735779644274",
    appId: "1:735779644274:web:79fa30cc8ce9bbb7db33eb",
    measurementId: "G-L6BS8GTYS4"
};

export const firebase = initializeApp(firebaseConfig);
export const db = getFirestore(firebase);
export const auth = getAuth(firebase);
export const EXsignInWithEmailAndPassword = signInWithEmailAndPassword;
export const EXcollection = collection;
export const EXgetDocs = getDocs;
export const EXquery = query;
export const EXwhere = where;
const dbCompleto = firebase;
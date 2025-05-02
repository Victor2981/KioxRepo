const idNombreRestauranteGlobal = "LePetit";
// var firebaseConfig = {
//     apiKey: "AIzaSyBHz-u9x4TqS7M7cOFv9Aay6viGjIO5IRg",
//     authDomain: "posavka.firebaseapp.com",
//     databaseURL: "https://posavka.firebaseio.com",
//     projectId: "posavka",
//     storageBucket: "posavka.appspot.com",
//     messagingSenderId: "339518907567",
//     appId: "1:339518907567:web:ab73a4969a90ac4e1d205a",
//     measurementId: "G-NVMBX0W8C1"
// };
// const actionURLGlobal = 'https://posavka.firebaseapp.com/__/auth/action';

const firebaseConfig = {
    apiKey: "AIzaSyDFlvXXq0Kdu1CAyjslc2gChlLu0SILn7s",
    authDomain: "fior-a4273.firebaseapp.com",
    projectId: "fior-a4273",
    storageBucket: "fior-a4273.appspot.com",
    messagingSenderId: "735779644274",
    appId: "1:735779644274:web:79fa30cc8ce9bbb7db33eb",
    measurementId: "G-L6BS8GTYS4"
};
const actionURLGlobal = 'https://fior-a4273.firebaseapp.com/__/auth/action';

const apiKeyGlobal = firebaseConfig.apiKey;
const authDomainGlobal = firebaseConfig.authDomain;
const databaseURLGlobal = firebaseConfig.databaseURL;
const projectIdGlobal = firebaseConfig.projectId;
firebase.initializeApp(firebaseConfig);
firebase.analytics();
const db = firebase.firestore();
const dbCompleto = firebase;
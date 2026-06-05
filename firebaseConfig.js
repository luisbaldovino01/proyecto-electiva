import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDWSCQshInHebkLeWqfjq6ClgbsvKijHgc",
  authDomain: "bd-electiva-83186.firebaseapp.com",
  projectId: "bd-electiva-83186",
  storageBucket: "bd-electiva-83186.firebasestorage.app",
  messagingSenderId: "225282402975",
  appId: "1:225282402975:web:baa86b04dd2aa7934710aa"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const app = firebase.app();

const db = firebase.firestore();

const auth = firebase.auth();

export { app, db, auth };
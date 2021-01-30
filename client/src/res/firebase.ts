import firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/functions';

var firebaseConfig = {
  apiKey: "AIzaSyB5-X0jYNuIinzUIprbY8L1YN_R53zbu0M",
  authDomain: "wall-street-mafia.firebaseapp.com",
  projectId: "wall-street-mafia",
  storageBucket: "wall-street-mafia.appspot.com",
  messagingSenderId: "965478967147",
  appId: "1:965478967147:web:38a323d3608ec485e38e2e",
  measurementId: "G-3N44MFRRSB"
};

firebase.initializeApp(firebaseConfig);
export const db = firebase.firestore();
export const functions = firebase.functions();

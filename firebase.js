// firebase.js: Configuración y conexión a Firebase.
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  getDoc,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBr7W7aBgK3_fZVSxm72J1E1U34WN67TDo",
  authDomain: "registro-de-alumnos-d1f44.firebaseapp.com",
  projectId: "registro-de-alumnos-d1f44",
  storageBucket: "registro-de-alumnos-d1f44.firebasestorage.app",
  messagingSenderId: "998037573498",
  appId: "1:998037573498:web:382f7cbe17f007318dd0c3",
  measurementId: "G-GEEEWNEW6Q"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Exportar funciones comunes
export { db, collection, doc, setDoc, updateDoc, arrayUnion, getDoc, getDocs, query, where };

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js"; // Asegúrate de importar query y where

const firebaseConfig = {
    apiKey: "AIzaSyA-tqEFvToEgUcStkly0MwOF5MhClqu6_g",
    authDomain: "registro-de-alumnos-fisica-fca.firebaseapp.com",
    projectId: "registro-de-alumnos-fisica-fca",
    storageBucket: "registro-de-alumnos-fisica-fca.firebasestorage.app",
    messagingSenderId: "273077032444",
    appId: "1:273077032444:web:0118113de69a6a0c194e79",
    measurementId: "G-FQEM1SWL9V"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Función para verificar si el DNI ya existe en la base de datos
const verificarDNI = async (dni) => {
    const q = query(collection(db, "alumnos"), where("dni", "==", dni));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty; // Retorna true si el DNI ya existe, false si no
};

// Función para guardar un alumno en la base de datos
const guardarAlumno = async (alumno) => {
    try {
        // Verificar si el DNI ya existe
        const existeDNI = await verificarDNI(alumno.dni);
        if (existeDNI) {
            console.log("Error: Ya existe un alumno con el mismo DNI.");
            return false; // No agregar el alumno si el DNI ya existe
        }

        // Si el DNI no existe, agregar el alumno
        const docRef = await addDoc(collection(db, "alumnos"), alumno);
        console.log("Alumno guardado con éxito:", docRef.id);
        return true; // Retorna true cuando el alumno se guarda con éxito
    } catch (e) {
        console.error("Error al añadir el alumno: ", e);
        return false; // En caso de error, retorna false
    }
};

export { guardarAlumno };
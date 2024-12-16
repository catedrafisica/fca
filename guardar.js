// guardar.js: Funciones para registrar y actualizar datos (alumnos, notas y asistencias).
import { db, collection, doc, setDoc, updateDoc, arrayUnion } from "./firebase.js";

// Registrar un nuevo alumno
export async function registrarAlumno(alumno) {
  const alumnoRef = doc(collection(db, "alumnos"));
  await setDoc(alumnoRef, { ...alumno, notas: [], asistencias: [] });
  return alumnoRef.id;
};

// Agregar una nota a un alumno
export async function agregarNota(id, nota) {
  const alumnoRef = doc(db, "alumnos", id);
  await updateDoc(alumnoRef, {
    notas: arrayUnion(nota)
  });
};

// Registrar una asistencia
export async function registrarAsistencia(id, asistencia) {
  const alumnoRef = doc(db, "alumnos", id);
  await updateDoc(alumnoRef, {
    asistencias: arrayUnion(asistencia)
  });
};


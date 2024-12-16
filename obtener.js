// obtener.js: Funciones para consultar datos de Firebase.
import { db, doc, getDoc } from "./firebase.js";

// Obtener un alumno por ID
export async function obtenerAlumno(id) {
  const alumnoDoc = doc(db, "alumnos", id);
  const snapshot = await getDoc(alumnoDoc);
  return snapshot.exists() ? snapshot.data() : null;
};

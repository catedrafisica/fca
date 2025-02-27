const [TU_API_KEY, TU_AUTH_DOMAIN, TU_PROJECT_ID, TU_STORAGE_BUCKET, TU_MESSAGING_SENDER_ID, TU_APP_ID] = ["AIzaSyB2fn6CJSJCnfpwpvR6Bv0j8ep5zr7RQ7s", "bd-catedra-fisica-i-y-ii.firebaseapp.com", "bd-catedra-fisica-i-y-ii", "bd-catedra-fisica-i-y-ii.appspot.com", "334162853863", "1:334162853863:web:74be4219443b957e5c8742"];

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, setDoc, getDocs, doc, updateDoc, getDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: TU_API_KEY,
  authDomain: TU_AUTH_DOMAIN,
  projectId: TU_PROJECT_ID,
  storageBucket: TU_STORAGE_BUCKET,
  messagingSenderId: TU_MESSAGING_SENDER_ID,
  appId: TU_APP_ID
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Esta funcion ocupo para cargar nuevos alumnos en forma manual
async function agregarDatosAFirebase(datos) {
  for (const materia in datos.data) {
    for (const grupo in datos.data[materia]) {
      for (const estudiante of datos.data[materia][grupo]) {
        const estudianteRef = doc(db, "estudiantes", estudiante.dni.toString());

        try {
          await setDoc(estudianteRef, {
            nombre: estudiante.name,
            dni: estudiante.dni,
            email: estudiante.mail,
            celular: estudiante.celular,
            condicion: estudiante.condicion,
            asistencia: estudiante.asistencia,
            notas: estudiante.notas,
            observaciones: estudiante.observaciones,
            materia,
            grupo
          });
          console.log(`Estudiante ${estudiante.name} agregado correctamente.`);
        } catch (error) {
          console.error("Error al agregar estudiante: ", error);
        }
      }
    }
  }
};
// Llamar a la función con tus datos
// agregarDatosAFirebase(tuObjetoJSON) Para agregar nuevo completar el array y colocar true en ejecutarCargaAlumnos;
const ejecutarCargaAlumnos = false;
const datos = [
  ['Física II', 'Grupo 1', 'BUSTOS, PABLO FACUNDO', '46856019', 'pablobusto87@gmail.com', '+54 3644 335993', 'Pendiente'],
  ['Física II', 'Grupo 2', 'CAÑETE, LUIS ALCIBIADES', '39862157', 'luiscaa97@gmail.com', '+54 3773 493495', 'Pendiente']

];

if (ejecutarCargaAlumnos) {
  for (let i = 0; i < datos.length; i++) {
    const [materia, grupo, name, dni, mail, celular, condicion] = datos[i];
    const datosEstudiantes = {
      "data": {
        [`${materia}`]: {
          [`${grupo}`]: [
            {
              "name": name,
              "dni": dni,
              "mail": mail,
              "celular": celular,
              "condicion": condicion,
              "asistencia": [
                {
                  "actividad": null,
                  "fecha": null,
                  "valor": null
                }
              ],
              "notas": [
                {
                  "actividad": null,
                  "fecha": null,
                  "valor": null
                }
              ],
              "observaciones": ""
            }
          ]
        }
      }
    };
    agregarDatosAFirebase(datosEstudiantes);
  };
};



async function obtenerEstudiantes() {
  const estudiantesRef = collection(db, "estudiantes"); // Referencia a la colección
  try {
    const querySnapshot = await getDocs(estudiantesRef); // Obtiene los documentos
    const estudiantes = [];

    querySnapshot.forEach((doc) => {
      estudiantes.push({ id: doc.id, ...doc.data() }); // Agrega cada estudiante al array
    });
    return estudiantes; // Devuelve los datos
  } catch (error) {
    console.error("Error al obtener estudiantes:", error);
  }
};
// Llamar a la función
export const alumnosFirebase = obtenerEstudiantes();




export async function guardarAsistencia(asistenciaSeleccionada) {
  try {
    for (const alumno of asistenciaSeleccionada) {
      const alumnoRef = doc(db, "estudiantes", alumno.dni);
      const alumnoSnap = await getDoc(alumnoRef);

      if (alumnoSnap.exists()) {
        let asistenciaActual = alumnoSnap.data().asistencia || [];

        // Buscar si hay una asistencia con valores nulos
        const asistenciaIndex = asistenciaActual.findIndex(a => a.actividad === null && a.fecha === null && a.valor === null);

        if (asistenciaIndex !== -1) {
          // Reemplazar la asistencia vacía con la nueva
          asistenciaActual[asistenciaIndex] = alumno.registro;
        } else {
          // Buscar si ya existe una asistencia con la misma actividad y fecha
          const actividadIndex = asistenciaActual.findIndex(a => a.actividad === alumno.registro.actividad && a.fecha === alumno.registro.fecha);

          if (actividadIndex !== -1) {
            // Actualizar la asistencia existente con el nuevo valor
            asistenciaActual[actividadIndex] = alumno.registro;
          } else {
            // Agregar la nueva asistencia si no hay coincidencias
            asistenciaActual.push(alumno.registro);
          }
        }

        // Actualizar el documento con la nueva asistencia
        await updateDoc(alumnoRef, { asistencia: asistenciaActual });
      } else {
        // Si el documento NO existe, lo creamos con los datos básicos y la asistencia
        await setDoc(alumnoRef, {
          nombre: alumno.name,
          dni: alumno.dni,
          asistencia: [alumno.registro] // Se guarda como un array con el primer registro
        });
      }
    }
    return true;
  } catch (error) {
    console.error("Error al guardar la asistencia: ", error);
    return false;
  }
}

// Exportamos la base de datos para que otros archivos puedan usarla
export { db };



export async function editarObservacion(dni, nuevaObservacion) {
  try {
    const estudianteRef = doc(db, "estudiantes", dni);
    const estudianteSnap = await getDoc(estudianteRef);

    if (estudianteSnap.exists()) {
      // Actualizar la observación en Firestore
      await updateDoc(estudianteRef, { observaciones: nuevaObservacion });
      console.log(`Observación actualizada para el estudiante con DNI: ${dni}`);
      return true;
    } else {
      console.error("El estudiante no existe en la base de datos.");
      return false;
    }
  } catch (error) {
    console.error("Error al actualizar la observación: ", error);
    return false;
  }
}


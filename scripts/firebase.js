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
// agregarDatosAFirebase(tuObjetoJSON);

const datos = [
  ['Física II', 'Grupo 1', 'BENITEZ, ADRIANO EZEQUIEL', '25001', 'usuario@dominio.com', '+54 379 XXXXXX', 'Pendiente'],
  ['Física II', 'Grupo 1', 'BAEZ, ENZO', '25002', 'usuario@dominio.com', '+54 379 XXXXXX', 'Pendiente'],
  ['Física II', 'Grupo 1', 'CEQUEIRA, LUCA', '25003', 'usuario@dominio.com', '+54 379 XXXXXX', 'Pendiente'],
  ['Física II', 'Grupo 2', 'BRITEZ, ANALIA', '25004', 'usuario@dominio.com', '+54 379 XXXXXX', 'Pendiente'],
  ['Física II', 'Grupo 2', 'CORIA, FABIO LEONEL', '25005', 'usuario@dominio.com', '+54 379 XXXXXX', 'Pendiente'],
  ['Física II', 'Grupo 3', 'OLIVEDA, NICOLAS', '25006', 'usuario@dominio.com', '+54 379 XXXXXX', 'Pendiente'],
  ['Física II', 'Grupo 3', 'SILVA, JUAN MARTÍN', '25007', 'usuario@dominio.com', '+54 379 XXXXXX', 'Pendiente'],
  ['Física II', 'Grupo 4', 'GATTO, NILSON FABRICIO', '25008', 'usuario@dominio.com', '+54 379 XXXXXX', 'Pendiente'],
  ['Física II', 'Grupo 4', 'OBREGÓN TORRENT, IGNACIO', '25009', 'usuario@dominio.com', '+54 379 XXXXXX', 'Pendiente'],
  ['Física II', 'Grupo 4', 'PEREIRA, ROSARIO ITATÍ', '25010', 'usuario@dominio.com', '+54 379 XXXXXX', 'Pendiente'],
  ['Física II', 'Grupo 5', 'GÓMEZ, RAMÓN ALBERTO', '25011', 'usuario@dominio.com', '+54 379 XXXXXX', 'Pendiente'],
  ['Física II', 'Grupo 5', 'TESTI, OCTAVIO', '25012', 'usuario@dominio.com', '+54 379 XXXXXX', 'Pendiente']
];

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
  //    agregarDatosAFirebase(datosEstudiantes);
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



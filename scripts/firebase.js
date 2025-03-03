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
            lu: estudiante.lu,
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
  ['Física A', 'Grupo 1', 'GOMEZ, RAMÓN ALBERTO', '41', null, 'ramoncito.rngm29@gmail.com', null, 'Pendiente'],
  ['Física A', 'Grupo 1', 'GATTO, NILSON FABRICIO', '40', null, 'nilsonfab2015@gmail.com', null, 'Pendiente']
//  ['Física II', 'Grupo 1', 'CORIA, FABIO LEONEL', '', null, 'coriafabioleonel@gmail.com', null, 'Pendiente']
];

if (ejecutarCargaAlumnos) {
  for (let i = 0; i < datos.length; i++) {
    const [materia, grupo, name, dni, lu, mail, celular, condicion] = datos[i];
    const datosEstudiantes = {
      "data": {
        [`${materia}`]: {
          [`${grupo}`]: [
            {
              "name": name,
              "dni": dni,
              "lu": lu,
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


export async function guardarNotas(notasSeleccionadas) {
  try {
    for (const alumno of notasSeleccionadas) {
      const alumnoRef = doc(db, "estudiantes", alumno.dni);
      const alumnoSnap = await getDoc(alumnoRef);

      if (alumnoSnap.exists()) {
        let notasActuales = alumnoSnap.data().notas || [];

        // Buscar si hay una nota con valores nulos
        const notaIndex = notasActuales.findIndex(n => (n.materia === null || n.fecha === null || n.valor === null || n.actividad === null));

        if (notaIndex !== -1) {
          // Reemplazar la nota vacía con la nueva
          notasActuales[notaIndex] = alumno.registro;
        } else {
          // Buscar si ya existe una nota con la misma materia, actividad y fecha
          const materiaIndex = notasActuales.findIndex(n => n.materia === alumno.registro.materia && n.actividad === alumno.registro.actividad && n.fecha === alumno.registro.fecha);

          if (materiaIndex !== -1) {
            // Actualizar la nota existente con el nuevo valor
            notasActuales[materiaIndex] = alumno.registro;
          } else {
            // Agregar la nueva nota si no hay coincidencias
            notasActuales.push(alumno.registro);
          }
        }

        // Actualizar el documento con la nueva lista de notas
        await updateDoc(alumnoRef, { notas: notasActuales });
      } else {
        // Si el documento NO existe, lo creamos con los datos básicos y la primera nota
        await setDoc(alumnoRef, {
          nombre: alumno.name,
          dni: alumno.dni,
          notas: [alumno.registro] // Se guarda como un array con el primer registro de nota
        });
      }
    }
    return true;
  } catch (error) {
    console.error("Error al guardar las notas: ", error);
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


// Función para buscar por DNI y actualizar LU en Firebase
async function actualizarLUporDNI(listaEstudiantes) {
  try {
    for (const { dni, lu } of listaEstudiantes) {
      const estudianteRef = doc(db, "estudiantes", String(dni));
      const estudianteSnap = await getDoc(estudianteRef);

      if (estudianteSnap.exists()) {
        const estudiante = estudianteSnap.data();
        if (!estudiante.lu) { // Solo actualiza si LU es null o no existe
          await updateDoc(estudianteRef, { lu: lu });
          console.log(`LU actualizada a ${lu} para el estudiante con DNI ${dni}`);
        } else {
          console.log(`El estudiante con DNI ${dni} ya tiene LU asignada.`);
        }
      } else {
        console.log(`No se encontró estudiante con DNI ${dni}`);
      }
    }
  } catch (error) {
    console.error("Error al actualizar LU de los estudiantes:", error);
  }
}

// Ejecutar la función con una lista de estudiantes
const datosLU = [{ dni: '44384856', lu: '13903' }, { dni: '44743202', lu: '14501' }, { dni: '41789490', lu: '14857' }, { dni: '45645678', lu: '13912' }, { dni: '41281636', lu: '12430' }, { dni: '39862157', lu: '13653' }, { dni: '42865427', lu: '13940' }, { dni: '45879852', lu: '14555' }, { dni: '30249166', lu: '9354' }, { dni: '45856979', lu: '14609' }, { dni: '45103279', lu: '14608' }, { dni: '46605581', lu: '14619' }, { dni: '43700700', lu: '14624' }, { dni: '43108974', lu: '15035' }, { dni: '45646144', lu: '14684' }, { dni: '45022321', lu: '14057' }, { dni: '43622747', lu: '14703' }, { dni: '38120197', lu: '13182' }, { dni: '46242436', lu: '14735' }, { dni: '46076800', lu: '14738' }, { dni: '45902472', lu: '14747' }, { dni: '45604806', lu: '15114' }, { dni: '46600066', lu: '15117' }, { dni: '46243548', lu: '15121' }, { dni: '46085281', lu: '14760' }, { dni: '40911421', lu: '12127' }, { dni: '40284075', lu: '11616' }, { dni: '44624778', lu: '14263' }];
//actualizarLUporDNI(datosLU);

export async function resetNotasDeEstudiantes() {
  try {
    const estudiantesRef = collection(db, "estudiantes"); // Referencia a la colección de estudiantes
    const querySnapshot = await getDocs(estudiantesRef); // Obtiene todos los documentos de la colección

    querySnapshot.forEach(async (docSnapshot) => {
      const estudianteRef = doc(db, "estudiantes", docSnapshot.id); // Usa la id del documento en lugar de doc
      await updateDoc(estudianteRef, {
        notas: [
          {
            actividad: null,
            fecha: null,
            valor: null
          }
        ] // Establece las notas como valor inicial
      });
      console.log(`Notas del estudiante con DNI ${docSnapshot.id} han sido restablecidas.`);
    });

    console.log("Proceso completado para todos los estudiantes.");
  } catch (error) {
    console.error("Error al restablecer las notas: ", error);
  }
}


//resetNotasDeEstudiantes()
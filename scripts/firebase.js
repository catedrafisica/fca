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
  ['Física I', 'Grupo Réplica', 'ANTONELLI, NAHUEL EXEQUIEL', '44384856', 'antonellinahuel2002@outlook.com.ar', null, 'Activo'],
  ['Física I', 'Grupo Réplica', 'AYALA, JUAN ESTEBAN', '44743202', 'estebiayala@hotmail.com', '+54 3777 209454', 'Activo'], 
  ['Física I', 'Grupo Réplica', 'AYALA, LUCAS ALBERTO', '41789490', 'lucasayala.arc@gmail.com', '+54 3794 339660', 'Activo'], 
  ['Física I', 'Grupo Réplica', 'BARRIOS, LEANDRO JAVIER', '45645678', 'leandrobarrios175@gmail.com', null, 'Activo'],
  ['Física I', 'Grupo Réplica', 'BAZZI FLEITAS, LUCIA ANTONELLA', '41281636', 'luciaantonellabazzifleitas@gmail.com', '+54 3794 287769', 'Activo'], 
  ['Física I', 'Grupo Réplica', 'CAÑETE, LUIS ALCIBIADES', '39862157', 'luiscaa97@gmail.com', '+54 3773 493495', 'Activo'], 
  ['Física I', 'Grupo Réplica', 'CASAS, DAVID DANTE', '42865427', 'deividcasas09@gmail.com', '+54 3731 623263', 'Activo'], 
  ['Física I', 'Grupo Réplica', 'CORDOBA, RENATO TOMAS', '45879852', 'renatocordoba123@gmail.com', '+54 3624 626088', 'Activo'], 
  ['Física I', 'Grupo Réplica', 'DA SILVA TAVARES, RAUL', '30249166', 'rdasiltava@hotmail.com', '+54 3794 682436', 'Activo'], 
  ['Física I', 'Grupo Réplica', 'GOMEZ, AGUSTINA', '45856979', 'agusgomez20058@gmail.com', '+54 3731 508642', 'Activo'], 
  ['Física I', 'Grupo Réplica', 'GOMEZ, FRANCISCO EZEQUIEL', '45103279', 'frangz420@gmail.com', '+54 362 4870261', 'Activo'], 
  ['Física I', 'Grupo Réplica', 'GONZALEZ, JONATHAN LEONEL', '46605581', 'titogonzal72@gmail.com', '+54 3644 678757', 'Activo'], 
  ['Física I', 'Grupo Réplica', 'GRENON, IGNACIO TAHIEL', '43700700', 'ignaciotahielgrenon@gmail.com', '+54 3764 604948', 'Activo'], 
  ['Física I', 'Grupo Réplica', 'MONTIEL, MAGALI', '43108974', 'maguimontiel15@gmail.com', '+54 3773 526497', 'Activo'], 
  ['Física I', 'Grupo Réplica', 'MONZON, MARIA ITATI', '45646144', 'mariamonzonitati13@gmail.com', '+54 3794 350022', 'Activo'], 
  ['Física I', 'Grupo Réplica', 'MOREIRA ALVAREZ, MARIA PAZ', '45022321', 'pazporqui@gmail.com', '+54 3773 465508', 'Activo'], 
  ['Física I', 'Grupo Réplica', 'PARRA, FRANCISCO JAVIER', '43622747', 'fp388122@gmail.com', '+54 3843 458823', 'Activo'], 
  ['Física I', 'Grupo Réplica', 'POGONZA, NICOLAS', '38120197', 'nicopogonza@gmail.com', '+54 3731 646955', 'Activo'], 
  ['Física I', 'Grupo Réplica', 'RODRIGUEZ ARSUAGA, MARIA SOL', '46242436', 'mariasolrodriguezarsuaga@gmail.com', '+54 3795 150803', 'Activo'], 
  ['Física I', 'Grupo Réplica', 'ROJAS MENDIAZ, DIOMEDES GUILLERMO', '46076800', 'guillermo.rojas0806@gmail.com', '+54 3794 961528', 'Activo'], 
  ['Física I', 'Grupo Réplica', 'SANCHEZ, FABRICIO EZEQUIEL', '45902472', 'fabrisan2004@gmail.com', null, 'Activo'], 
  ['Física I', 'Grupo Réplica', 'SCHENEBERGER, VALENTIN', '45604806', 'schenebergervalentin@gmail.com', '+54 3704 610216', 'Pendiente'], 
  ['Física I', 'Grupo Réplica', 'SCHUGURENSKY, IGNACIO', '46600066', 'npschugu@gmail.com', '+54 3777 238343', 'Activo'], 
  ['Física I', 'Grupo Réplica', 'SEGOVIA, SANTIAGO', '46243548', 'saraviasego@gmail.com', '+54 3773 419116', 'Activo'], 
  ['Física I', 'Grupo Réplica', 'SILVERO, LOURDES CONSTANZA', '46085281', 'cotysilvero@gmail.com', '+54 3754 477773', 'Activo'], 
  ['Física I', 'Grupo Réplica', 'SORIA ARTAVE, ANGELA ESTEFANIA', '40911421', 'angelasoria73@gmail.com', null, 'Activo'], 
  ['Física I', 'Grupo Réplica', 'SOSA BOFILL, TOMAS PABLO', '40284075', 'sbpablotomas@gmail.com', '+54 3794 712435', 'Activo'], 
  ['Física I', 'Grupo Réplica', 'STEVENS, FEDERICO DAVID', '44624778', 'federicodavidst@gmail.com', null, 'Activo']

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


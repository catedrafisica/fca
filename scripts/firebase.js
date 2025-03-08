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
  ['Física II', 'Grupo 4', 'OVIEDO, GABRIEL DAVID', '39363014', null, 'gabrieloviedo919@gmail.com', null, 'Pendiente'],
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

export async function actualizarMateria() {
  try {
    const estudiantesRef = collection(db, "estudiantes"); // Referencia a la colección de estudiantes
    const querySnapshot = await getDocs(estudiantesRef); // Obtiene todos los documentos de la colección

    querySnapshot.forEach(async (docSnapshot) => {
      const estudianteRef = doc(db, "estudiantes", docSnapshot.id); // Obtiene la referencia del estudiante
      const estudianteData = docSnapshot.data(); // Obtiene los datos del estudiante

      // Verificar si la materia es "Física I"
      if (estudianteData.materia === "Física I") {
        await updateDoc(estudianteRef, {
          materia: "Física I - Réplica" // Actualiza la materia
        });
        console.log(`Materia del estudiante con DNI ${docSnapshot.id} actualizada a "Física I - Réplica".`);
      }
    });

    console.log("Proceso completado para todos los estudiantes.");
  } catch (error) {
    console.error("Error al actualizar la materia: ", error);
  }
}
// actualizarMateria()


export async function cambiarCondicion() {
  try {
    const estudiantesRef = collection(db, "estudiantes"); // Referencia a la colección de estudiantes
    const querySnapshot = await getDocs(estudiantesRef); // Obtiene todos los documentos de la colección
    let contador = 0;
    querySnapshot.forEach(async (docSnapshot) => {
      const estudianteRef = doc(db, "estudiantes", docSnapshot.id); // Obtiene la referencia del estudiante
      const estudianteData = docSnapshot.data(); // Obtiene los datos del estudiante
      const nuevaCondicion = "Pendiente"
      // Verificar si la condición está en el valor que deseas actualizar
      if (estudianteData.condicion !== "Activo") {
        await updateDoc(estudianteRef, {
          condicion: nuevaCondicion // Actualiza
        });
        contador++;
        console.log(`Condición del estudiante ${contador}, con DNI ${docSnapshot.id} actualizada a "${nuevaCondicion}".`);
      }
    });

    console.log("Proceso completado para todos los estudiantes.");
  } catch (error) {
    console.error("Error al actualizar la condición: ", error);
  }
}


async function resetAsistencia() {
  try {
    const estudiantesRef = collection(db, "estudiantes");
    const querySnapshot = await getDocs(estudiantesRef);

    for (const docSnapshot of querySnapshot.docs) {
      const estudianteRef = doc(db, "estudiantes", docSnapshot.id);
      const estudianteData = docSnapshot.data();

      if (estudianteData.materia === "Física I - Réplica") {
        await updateDoc(estudianteRef, {
          asistencia: [
            {
              actividad: null,
              fecha: null,
              valor: null
            }
          ]
        });
        console.log(`Asistencia reseteada para ${docSnapshot.id}`);
      }
    }

    console.log("Asistencia de Física I - Réplica reseteada correctamente.");
  } catch (error) {
    console.error("Error al resetear la asistencia: ", error);
  }
}

// Llamar a la función
//resetAsistencia();




export async function actualizarCondicionAsist() {
  const maxInasist = 3;
  try {
    document.getElementById("miBotonAsist").disabled = true;
    const estudiantesRef = collection(db, "estudiantes");
    const querySnapshot = await getDocs(estudiantesRef);
    for (const docSnapshot of querySnapshot.docs) {
      const estudianteRef = doc(db, "estudiantes", docSnapshot.id);
      const estudianteData = docSnapshot.data();
      const notas = estudianteData.notas || [];
      const asistencia = estudianteData.asistencia || []
      // 📌 Contar inasistencias y evaluaciones desaprobadas
      let inasistencias = asistencia.filter(a => a.valor === 'A').length;
      let coloquiosDesaprobados = notas.filter(n => (n.actividad ?? "").includes("Coloquio Lab.") && n.valor < 6).length;
      let informesDesaprobados = notas.filter(n => (n.actividad ?? "").includes("Informe de Lab.") && n.valor < 6).length;
      let totalFaltas = inasistencias + coloquiosDesaprobados + informesDesaprobados;
      // 📌 Si supera las faltas permitidas, es No Regular
      if (totalFaltas > maxInasist) {
        if (estudianteData.condicion === "Pendiente") {
          await updateDoc(estudianteRef, { condicion: "No Regular-Pendiente" });
        } else {
          await updateDoc(estudianteRef, { condicion: "No Regular" });
          console.log(`Condición del estudiante con DNI ${docSnapshot.id} actualizada a "No Regular".`);
          continue;
        }
      }
    }
  } catch (error) {
    console.error("Error al actualizar la condición: ", error);
  }
}

/*
export async function actualizarCondicionCalif() {
  try {
    const estudiantesRef = collection(db, "estudiantes");
    const querySnapshot = await getDocs(estudiantesRef);
    for (const docSnapshot of querySnapshot.docs) {
      const estudianteRef = doc(db, "estudiantes", docSnapshot.id);
      const estudianteData = docSnapshot.data();

      // 📌 Si la condición ya es "Pendiente", no modificarla
       if (estudianteData.condicion === "Pendiente") {
        console.log(`Condición del estudiante con DNI ${docSnapshot.id} es "Pendiente", no se modifica.`);
        continue;
      }

      const notas = estudianteData.notas || [];
      const asistencia = estudianteData.asistencia || [];
      const materia = estudianteData.materia || ""; // Asumiendo que "materia" es una propiedad del estudiante

      // 📌 Contar inasistencias y evaluaciones desaprobadas
      let inasistencias = asistencia.filter(a => a.valor === 0).length;
      let coloquiosDesaprobados = notas.filter(n => (n.actividad ?? "").includes("Coloquio Lab.") && n.valor < 6).length;
      let informesDesaprobados = notas.filter(n => (n.actividad ?? "").includes("Informe de Lab.") && n.valor < 6).length;
      let totalFaltas = inasistencias + coloquiosDesaprobados + informesDesaprobados;

      // 📌 Si supera las faltas permitidas, es No Regular
      if (totalFaltas > 3) {
        await updateDoc(estudianteRef, { condicion: "No Regular" });
        console.log(`Condición del estudiante con DNI ${docSnapshot.id} actualizada a "No Regular".`);
        continue;
      }

      // 📌 Obtener calificaciones de parciales y recuperatorios
      let primerParcial = notas.find(n => n.actividad === "Primer Parcial")?.valor ?? null;
      let segundoParcial = notas.find(n => n.actividad === "Segundo Parcial")?.valor ?? null;
      let recupPrimerParcial = notas.find(n => n.actividad === "Recuperatorio del Primer Parcial")?.valor ?? null;
      let recupSegundoParcial = notas.find(n => n.actividad === "Recuperatorio del Segundo Parcial")?.valor ?? null;
      let extra = notas.find(n => n.actividad === "Parcial Extra")?.valor ?? null;

      // 📌 Verificar si la materia es "Física I - Réplica" y manejar la condición sin parcial extra
      if (materia === "Física I - Réplica") {
        // Si el primer parcial o su recuperatorio no existen (es decir, no rendido), se asigna "Activo"
        if (primerParcial === null && recupPrimerParcial === null) {
          await updateDoc(estudianteRef, { condicion: "Activo" });
          console.log(`Condición del estudiante con DNI ${docSnapshot.id} actualizada a "Activo" (no ha rendido el primer parcial ni su recuperatorio).`);
          continue;
        }

        // Si el primer parcial o su recuperatorio están desaprobados, se asigna "No Regular"
        let primerAprobado = (primerParcial !== null && primerParcial >= 6) || (recupPrimerParcial !== null && recupPrimerParcial >= 6);
        if (!primerAprobado) {
          await updateDoc(estudianteRef, { condicion: "No Regular" });
          console.log(`Condición del estudiante con DNI ${docSnapshot.id} actualizada a "No Regular" por desaprobar el primer parcial o su recuperatorio en Física I - Réplica.`);
          continue;
        }

        // Si el segundo parcial o su recuperatorio no existen (es decir, no rendido), se asigna "Activo"
        if (segundoParcial === null && recupSegundoParcial === null) {
          await updateDoc(estudianteRef, { condicion: "Activo" });
          console.log(`Condición del estudiante con DNI ${docSnapshot.id} actualizada a "Activo" (no ha rendido el segundo parcial ni su recuperatorio).`);
          continue;
        }

        // Si el segundo parcial o su recuperatorio están desaprobados, también se asigna "No Regular"
        let segundoAprobado = (segundoParcial !== null && segundoParcial >= 6) || (recupSegundoParcial !== null && recupSegundoParcial >= 6);
        if (!segundoAprobado) {
          await updateDoc(estudianteRef, { condicion: "No Regular" });
          console.log(`Condición del estudiante con DNI ${docSnapshot.id} actualizada a "No Regular" por desaprobar el segundo parcial o su recuperatorio en Física I - Réplica.`);
          continue;
        }
      }

      // 📌 Determinar si aprobó cada parcial
      let primerAprobado = (primerParcial !== null && primerParcial >= 6) || (recupPrimerParcial !== null && recupPrimerParcial >= 6);
      let segundoAprobado = (segundoParcial !== null && segundoParcial >= 6) || (recupSegundoParcial !== null && recupSegundoParcial >= 6);

      // 📌 Verificar si el estudiante aún tiene intentos pendientes
      let primerPendiente = (primerParcial === null || (primerParcial < 6 && recupPrimerParcial === null));
      let segundoPendiente = (segundoParcial === null || (segundoParcial < 6 && recupSegundoParcial === null));

      if (primerPendiente || segundoPendiente) {
        await updateDoc(estudianteRef, { condicion: "Activo" });
        console.log(`Condición del estudiante con DNI ${docSnapshot.id} actualizada a "Activo".`);
        continue;
      }

      // 📌 Evaluar si puede ser "Regular" o "No Regular"
      if (primerAprobado && segundoAprobado) {
        await updateDoc(estudianteRef, { condicion: "Regular" });
        console.log(`Condición del estudiante con DNI ${docSnapshot.id} actualizada a "Regular".`);
      } else if ((primerAprobado || segundoAprobado) && extra !== null && extra >= 6) {
        await updateDoc(estudianteRef, { condicion: "Regular" });
        console.log(`Condición del estudiante con DNI ${docSnapshot.id} actualizada a "Regular".`);
      } else {
        await updateDoc(estudianteRef, { condicion: "No Regular" });
        console.log(`Condición del estudiante con DNI ${docSnapshot.id} actualizada a "No Regular".`);
      }
    }

    console.log("Proceso completado para todos los estudiantes.");
  } catch (error) {
    console.error("Error al actualizar la condición: ", error);
  }
}
 */
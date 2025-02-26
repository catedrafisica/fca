import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, setDoc, getDocs, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const TU_API_KEY = "AIzaSyB2fn6CJSJCnfpwpvR6Bv0j8ep5zr7RQ7s";
const TU_AUTH_DOMAIN = "bd-catedra-fisica-i-y-ii.firebaseapp.com";
const TU_PROJECT_ID = "bd-catedra-fisica-i-y-ii";
const TU_STORAGE_BUCKET = "bd-catedra-fisica-i-y-ii.appspot.com";
const TU_MESSAGING_SENDER_ID = "334162853863";
const TU_APP_ID = "1:334162853863:web:74be4219443b957e5c8742";

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

async function agregarDatosAFirebase(datos) {
  for (const materia in datos.data) {
    for (const grupo in datos.data[materia]) {
      for (const estudiante of datos.data[materia][grupo]) {
        const estudianteRef = doc(db, "estudiantes", estudiante.dni.toString()); // Asegúrate de que 'dni' sea un string

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
}


// Llamar a la función con tus datos
// agregarDatosAFirebase(tuObjetoJSON);

const datos = [
['Física II','Grupo 1','ABALO, BLAS AUGUSTO','46717380','abaloblas@gmail.com', null,'Activo']
]

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

//  agregarDatosAFirebase(datosEstudiantes);

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
}

// Llamar a la función
export const alumnosFirebase = obtenerEstudiantes();

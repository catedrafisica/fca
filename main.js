import { db, collection, query, where, getDocs } from "./firebase.js";
import { registrarAlumno } from "./guardar.js";

const alertContainer = document.getElementById("alert-container");

function mostrarMensaje(mensaje, tipo = "success") {
  const alert = document.createElement("div");
  alert.className = `alert alert-${tipo}`;
  alert.textContent = mensaje;
  alertContainer.appendChild(alert);
  setTimeout(() => alert.remove(), 3000);
}

document.getElementById("studentForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const apellido = document.getElementById("surname").value.toUpperCase();
  const nombre = document.getElementById("name").value.toUpperCase();
  const dni = document.getElementById("dni").value;
  const estado = document.getElementById("status").value;
  const fecha = document.getElementById("date").value;
  const colegio = document.getElementById("school").value.toUpperCase();
  const curso = document.getElementById("course").value.toUpperCase();
  const asignatura = document.getElementById("subject").value.toUpperCase();
  const observaciones = document.getElementById("observations").value.toUpperCase();

  if (asignatura === "") {
    mostrarMensaje("Por favor, seleccione una asignatura válida.", "danger");
    return;
  }

  const alumno = {
    apellido,
    nombre,
    dni,
    alta: estado === "alta" ? fecha : "",
    baja: estado === "baja" ? fecha : "",
    colegio,
    curso,
    asignatura,
    observaciones,
    notas: [],
    asistencias: []
  };

  try {
    const alumnosRef = collection(db, "alumnos");
    const q = query(alumnosRef, where("dni", "==", dni));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      let alumnoRepetido = false;

      snapshot.forEach((doc) => {
        const datos = doc.data();
        if (datos.curso === curso && datos.colegio === colegio) {
          if (!datos.baja) {
            alumnoRepetido = true;
            mostrarMensaje(
              `El alumno con DNI ${dni} ya está registrado en el curso ${curso} del colegio ${colegio} y no está dado de baja.`,
              "danger"
            );
          } else if (estado === "alta") {
            alumnoRepetido = true;
            mostrarMensaje(
              `El alumno con DNI ${dni} tiene baja en el curso ${curso} del colegio ${colegio}. No se puede registrar en el mismo curso.`,
              "warning"
            );
          }
        }
      });

      if (alumnoRepetido) return;
    }

    const id = await registrarAlumno(alumno);
    mostrarMensaje(`¡Estudiante: ${nombre}, ${apellido} fue registrado exitosamente!`);
    event.target.reset();
  } catch (error) {
    console.error("Error al registrar el alumno:", error);
    mostrarMensaje("Error al registrar el alumno", "danger");
  }
});


// Función para buscar al alumno
async function buscarAlumno(event) {
  event.preventDefault(); // Evitar la recarga de la página

  const dni = document.getElementById("buscarDNI").value;

  // Referencia a la colección de alumnos
  const alumnosRef = collection(db, "alumnos");
  const q = query(alumnosRef, where("dni", "==", dni));

  try {
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      snapshot.forEach((doc) => {
        const datos = doc.data();

        // Completar los campos del formulario
        document.getElementById("surname").value = datos.apellido || "";
        document.getElementById("name").value = datos.nombre || "";
        document.getElementById("dni").value = datos.dni || "";
        document.getElementById("status").value = datos.baja ? "baja" : "alta";
        document.getElementById("date").value = datos.baja || datos.alta || "";
        document.getElementById("school").value = datos.colegio || "";
        document.getElementById("course").value = datos.curso || "";
        document.getElementById("subject").value = datos.asignatura || "";
        document.getElementById("observations").value = datos.observaciones || "";

        // Mensaje de éxito
        mostrarMensaje(`Datos del alumno con DNI ${dni} cargados correctamente.`);
      });
    } else {
      mostrarMensaje(`No se encontró ningún alumno con el DNI ${dni}.`, "warning");
    }
  } catch (error) {
    console.error("Error al buscar el alumno:", error);
    mostrarMensaje("Error al buscar el alumno", "danger");
  }
}

// Asociar el evento submit del formulario con la función
document.getElementById("searchForm").addEventListener("submit", buscarAlumno);

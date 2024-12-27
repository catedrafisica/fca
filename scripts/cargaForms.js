import { guardarAlumno } from './firebase.js';

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formulario-alumno");
  const alertaContenedor = document.getElementById("contenedor-alerta");

  form.addEventListener("submit", async (event) => { // Declarar async aquí
    event.preventDefault();
    alertaContenedor.innerHTML = "";

    const campos = {
      apellido: document.getElementById("apellido").value.trim().toUpperCase(),
      nombre: document.getElementById("nombre").value.trim().toUpperCase(),
      dni: document.getElementById("documento").value.trim(),
      carrera: document.getElementById("seleccion-ingreso").value.toUpperCase(),
      añoIngreso: document.getElementById("año-ingreso").value.trim(),

      materia: document.getElementById("materia").value.toUpperCase(),
      tipoCursada: document.getElementById("tipo-cursada").value.toUpperCase(),
      fechaCursada: document.getElementById("fecha-cursada").value,
      grupo: document.getElementById("grupo").value.toUpperCase(),
    };

    const camposFaltantes = Object.keys(campos).filter((campo) => !campos[campo]);

    if (camposFaltantes.length > 0) {
      mostrarAlerta("Por favor, complete todos los campos obligatorios.", "danger");
      return;
    }

    const materiasCursadas = [];
    const califAsist = {
      tp: [{ numero: null, fecha: null, asistencia: null, notaCuanti: null, notaCuali: null }],
      laboratorios: [{ numero: null, fecha: null, asistencia: null, notaCuanti: null, notaCuali: null }],
      parciales: [{ numero: null, fecha: null, asistencia: null, notaCuanti: null, notaCuali: null }],
      recuperatorios: [{ numero: null, fecha: null, asistencia: null, notaCuanti: null, notaCuali: null }],
      final: { numero: null, fecha: null, asistencia: null, notaCuanti: null, notaCuali: null }
    };

    materiasCursadas.push({
      nombreMateria: campos.materia,
      tipoCursada: campos.tipoCursada,
      fechaCursada: campos.fechaCursada,
      grupo: campos.grupo,
      condicion: campos.tipoCursada,
      calificacionesAsistencia: califAsist,
    });

    const observacionesCampo = document.getElementById("observaciones").value.toUpperCase();

    const alumnos = {
      apellido: campos.apellido,
      nombre: campos.nombre,
      dni: campos.dni,
      carrera: campos.carrera,
      añoIngreso: campos.añoIngreso,
      observaciones: observacionesCampo,
      materias: materiasCursadas,
    };

    try {
      const result = await guardarAlumno(alumnos);
      if (result) {
        mostrarAlerta(`El alumno ${campos.apellido}, ${campos.nombre} se ha registrado con éxito.`, "success");
      } else {
        mostrarAlerta(`Error: Ya existe un alumno con ese DNI: ${campos.dni} .`, "danger");
      }
    } catch (error) {
      mostrarAlerta("Ocurrió un error al guardar el alumno. Intente nuevamente.", "danger");
      console.error(error);
    }
  });

  function mostrarAlerta(mensaje, tipo) {
    const alerta = document.createElement("div");
    alerta.className = `alert alert-${tipo} alert-dismissible fade show`;
    alerta.role = "alert";
    alerta.style.position = "fixed";
    alerta.style.top = "50%";
    alerta.style.left = "50%";
    alerta.style.transform = "translate(-50%, -50%)";
    alerta.style.zIndex = "1055";
    alerta.style.maxWidth = "90%";
    alerta.style.textAlign = "center";
    alerta.style.padding = "5rem";

    alerta.innerHTML = `
      <span>${mensaje}</span>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    document.body.appendChild(alerta);

    setTimeout(() => {
      alerta.classList.remove("show");
      alerta.addEventListener("transitionend", () => alerta.remove());
      form.reset(); // Limpia todos los campos del formulario.
      // Reinicia la barra de progreso a 0%
      const barraProgreso = document.getElementById("barra-progreso");
      barraProgreso.style.width = "0%";
      barraProgreso.setAttribute("aria-valuenow", "0");
    }, 5000);
  }
});
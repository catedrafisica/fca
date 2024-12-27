import { guardarAlumno } from './firebase.js';

document.getElementById("boton-cargar-csv").addEventListener("click", async () => {
  const form = document.getElementById("formulario-alumno");
  const fileInput = document.getElementById("archivo-csv");
  const file = fileInput.files[0];

  if (!file) {
    alert("Por favor, selecciona un archivo CSV.");
    return;
  }

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: async function (results) {
      const campos = results.data.map((row) => ({
        apellido: row.apellido.trim().toUpperCase(),
        nombre: row.nombre.trim().toUpperCase(),
        dni: row.dni.trim(),
        carrera: row.carrera.trim().toUpperCase(),
        añoIngreso: row.añoIngreso,
        materia: row.nombreMateria.trim().toUpperCase(),
        tipoCursada: row.tipoCursada.trim().toUpperCase(),
        fechaCursada: row.fechaCursada.trim(),
        grupo: row.grupo.trim().toUpperCase(),
        observaciones: row.observaciones ? row.observaciones.trim().toUpperCase() : "SIN OBSERVACIONES"
      }));

      let totalAlumnos = campos.length;
      let alumnosExitosos = 0;
      let alumnosDuplicados = 0;
      let errores = 0;

      for (const campo of campos) {
        const califAsist = {
          tp: [{ numero: null, fecha: null, asistencia: null, notaCuanti: null, notaCuali: null }],
          laboratorios: [{ numero: null, fecha: null, asistencia: null, notaCuanti: null, notaCuali: null }],
          parciales: [{ numero: null, fecha: null, asistencia: null, notaCuanti: null, notaCuali: null }],
          recuperatorios: [{ numero: null, fecha: null, asistencia: null, notaCuanti: null, notaCuali: null }],
          final: { numero: null, fecha: null, asistencia: null, notaCuanti: null, notaCuali: null }
        };

        const materiasCursadas = [{
          nombreMateria: campo.materia,
          tipoCursada: campo.tipoCursada,
          fechaCursada: campo.fechaCursada,
          grupo: campo.grupo,
          condicion: campo.tipoCursada,
          calificacionesAsistencia: califAsist,
        }];

        const alumno = {
          apellido: campo.apellido,
          nombre: campo.nombre,
          dni: campo.dni,
          carrera: campo.carrera,
          añoIngreso: campo.añoIngreso,
          observaciones: campo.observaciones,
          materias: materiasCursadas,
        };

        try {
          const result = await guardarAlumno(alumno);
          if (result) {
            alumnosExitosos++;
          } else {
            alumnosDuplicados++;
          }
        } catch (error) {
          errores++;
          console.error(error);
        }
      }

      // Mostrar resumen final
      mostrarAlerta(`
        <strong>Resumen de carga:</strong><br>
        Total de alumnos: ${totalAlumnos}<br>
        Cargados exitosamente: ${alumnosExitosos}<br>
        Duplicados (DNI existente): ${alumnosDuplicados}<br>
        Errores durante la carga: ${errores}
      `, "success");
    },
    error: function (error) {
      mostrarAlerta("Error al procesar el archivo CSV.", "danger");
      console.error("Error al procesar el archivo CSV:", error);
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
      const campos = form.querySelectorAll("[disabled]"); // Selecciona todos los elementos deshabilitados
      campos.forEach((campo) => {
        campo.disabled = false; // Desbloquea el campo
      });
      // Reinicia la barra de progreso a 0%
      const barraProgreso = document.getElementById("barra-progreso");
      barraProgreso.style.width = "0%";
      barraProgreso.setAttribute("aria-valuenow", "0");
    }, 10000);
  }
});


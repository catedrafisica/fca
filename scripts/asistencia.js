import { getAlumnos } from './baseDatos.js';
import { guardarAsistencia } from './firebase.js';


async function mostrarAlumnosFB() {
  const alumnos = await getAlumnos();
  return alumnos;
};

document.addEventListener("DOMContentLoaded", async function () {
  // Esperar a que los alumnos sean recuperados
  const alumnos = await mostrarAlumnosFB();
  setTimeout(function () {
    document.getElementById('tituloAsistencia').classList.remove('d-none');
    document.getElementById('spinnerContainer').classList.add('d-none');
    document.getElementById('asistencia').classList.remove('d-none');
    document.getElementById('descripcionAsistencia').classList.remove('d-none');

    Object.keys(alumnos).forEach(materia => {
      Object.keys(alumnos[materia]).forEach(grupo => {
        alumnos[materia][grupo].sort((a, b) => a.name.localeCompare(b.name));
      });
    });

    const asistenciaDiv = document.getElementById("asistencia");
    asistenciaDiv.classList.remove("d-none");

    let html = "";
    Object.keys(alumnos).sort((a, b) => a.localeCompare(b)).forEach((materia, i) => {
      // Calculamos el total de alumnos por materia
      const totalMateria = Object.values(alumnos[materia]).reduce((acc, grupo) => acc + grupo.length, 0);

      html += `
      <div class="accordion mb-5" id="accordion${materia.replace(/\s+/g, '')}">
        <div class="accordion-item">
          <h2 class="accordion-header" id="heading${i}">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${i}" aria-expanded="false" aria-controls="collapse${i}">
              ${materia} (Total: ${totalMateria} alumnos)
            </button>
          </h2>
          <div id="collapse${i}" class="accordion-collapse collapse" aria-labelledby="heading${i}">
            <div class="accordion-body">
              <div class="accordion mb-4" id="accordionGrupos${materia.replace(/\s+/g, '')}">`;

      const gruposOrdenados = Object.keys(alumnos[materia]).sort();
      gruposOrdenados.forEach((grupo, j) => {
        const grupoId = `collapseGrupo${materia.replace(/\s+/g, '')}${j}`;
        const fechaId = `fecha-${materia.replace(/\s+/g, '')}-${grupo.replace(/\s+/g, '')}`;

        // Calculamos el total de alumnos por grupo
        const totalGrupo = alumnos[materia][grupo].length;

        html += `
        <div class="accordion-item mb-3">
          <h2 class="accordion-header" id="headingGrupo${grupoId}">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${grupoId}" aria-expanded="false" aria-controls="${grupoId}">
              ${grupo} (Total: ${totalGrupo} alumnos)
            </button>
          </h2>
          <div id="${grupoId}" class="accordion-collapse collapse" aria-labelledby="headingGrupo${grupoId}">
            <div class="accordion-body">
              <label for='${fechaId}' class='form-label'>Fecha:</label>
              <input type='date' class='form-control mb-2' id='${fechaId}' value='${getCurrentDate()}'>
              <label for='actividad-${materia.replace(/\s+/g, '')}-${grupo.replace(/\s+/g, '')}' class='form-label'>Actividad:</label>
              <select class='form-select mb-2' id='actividad-${materia.replace(/\s+/g, '')}-${grupo.replace(/\s+/g, '')}'>
                ${generarOpcionesLabProblem(10)}
              </select>
      
              <!-- Botón para marcar todos como presentes -->
              <button class='btn btn-success mb-2 colocar-todos-presentes' data-grupo="${grupo}" data-materia="${materia}">Poner todos presentes</button>
      
              <table class='table table-bordered text-center'>
                <thead>
                  <tr>
                    <th>Orden</th>
                    <th>Apellido y Nombre</th>
                    <th>D.N.I.</th>
                    <th>Asistencia</th>
                  </tr>
                </thead>
                <tbody>`;


        alumnos[materia][grupo].forEach((nombre, index) => {
          const dni = parseInt(nombre.dni);
          const formatDNI = dni.toLocaleString('es-AR').replace(/,/g, '.');
          html += `
                          <tr>
                            <td>${index + 1}</td>
                            <td class="text-start">${nombre.name}</td>
                            <td>${formatDNI}</td>
                            <td>
                              <select class='form-select asistencia text-center' data-grupo="${grupo}" data-materia="${materia}">
                                <option value='' selected disabled>Seleccione un tipo de asistencia...</option>
                                <option value='P'>Presente</option>
                                <option value='A' style='color: red;'>Ausente</option>
                                <option value='AJ'>Ausente Justificado</option>
                              </select>
                            </td>
                          </tr>`;
        });

        html += `</tbody></table>
                        <button class='btn btn-primary mt-2 cargar-asistencia' data-grupo="${grupo}" data-materia="${materia}" data-fecha="${fechaId}">Cargar Asistencia</button>
                      </div>
                    </div>
                  </div>`;
      });

      html += `</div></div></div></div></div></div></div></div>`;

    });


    asistenciaDiv.innerHTML = html;

    document.querySelectorAll('.colocar-todos-presentes').forEach(button => {
      button.addEventListener('click', function () {
        const grupo = this.getAttribute('data-grupo');
        const materia = this.getAttribute('data-materia');
    
        // Cambiar todos los selectores de asistencia a "Presente"
        const selects = document.querySelectorAll(`select[data-grupo="${grupo}"][data-materia="${materia}"]`);
        selects.forEach(select => {
          select.value = 'P';
        });
      });
    });
    

    document.querySelectorAll('.cargar-asistencia').forEach(button => {
      button.addEventListener('click', async function () {
        const grupo = this.getAttribute('data-grupo');
        const materia = this.getAttribute('data-materia');
        const fechaId = this.getAttribute('data-fecha');
        const fecha = document.getElementById(fechaId).value;

        // Obtener el valor del select de actividad
        const actividadId = `actividad-${materia.replace(/\s+/g, '')}-${grupo.replace(/\s+/g, '')}`;
        const actividad = document.getElementById(actividadId).value;

        if (!actividad) {
          mostrarAlerta('⚠️ Por favor seleccione una actividad antes de continuar.', 'danger');
          return;
        }

        const asistenciaSeleccionada = [];
        const selects = document.querySelectorAll(`select[data-grupo="${grupo}"][data-materia="${materia}"]`);

        let allFieldsCompleted = true;
        selects.forEach(select => {
          const asistencia = select.value;
          if (!asistencia) {
            allFieldsCompleted = false;
          }
          const studentName = select.closest('tr').querySelector('td:nth-child(2)').textContent;
          const dni = select.closest('tr').querySelector('td:nth-child(3)').textContent;

          asistenciaSeleccionada.push({
            name: studentName,
            dni: dni.replace(/\./g, ''),
            materia: materia,
            grupo: grupo,
            registro: {
              actividad: actividad,
              fecha: fecha,
              valor: asistencia
            }
          });
        });

        if (!allFieldsCompleted) {
          mostrarAlerta('⚠️ Por favor complete todos los campos de asistencia antes de continuar.', 'danger');
          return;
        };

        document.getElementById("spinnerFB").classList.remove("d-none"); // Mostrar spinner

        try {
          const success = await guardarAsistencia(asistenciaSeleccionada);
          if (success) {
            mostrarAlerta(
              `✅ Asistencia de ${grupo} de ${materia} en la fecha ${fecha} con actividad "${actividad}" se está cargada...`,
              "success",
              async function () {
                console.log(asistenciaSeleccionada);
                resetForm();
                setTimeout(function () {
                  const modal = bootstrap.Modal.getInstance(document.getElementById("alertModal"));
                  modal.hide();
                }, 2000);
              }
            );
          } else {
            mostrarAlerta("⛔ Hubo un error al cargar la asistencia, por favor intenta nuevamente.", "danger");
          }
        } catch (error) {
          console.error("Error al cargar la asistencia:", error);
          mostrarAlerta("⛔ Hubo un error al cargar la asistencia, por favor intenta nuevamente.", "danger");
        } finally {
          document.getElementById("spinnerFB").classList.add("d-none"); // Ocultar spinner
        }


      });
    });


    // Función para reiniciar el formulario
    function resetForm() {
      // Restablecer las fechas al valor actual
      const fechaInputs = document.querySelectorAll('input[type="date"]');
      fechaInputs.forEach(input => {
        input.value = getCurrentDate();
      });

      // Restablecer todos los selectores de asistencia a la opción por defecto
      const selects = document.querySelectorAll('select.asistencia');
      selects.forEach(select => {
        select.value = '';
      });

      // Restablecer todos los selectores de actividad a la opción por defecto
      const actividadSelects = document.querySelectorAll('select[id^="actividad-"]');
      actividadSelects.forEach(select => {
        select.value = '';
      });
    };


    // Función para mostrar el modal de alerta
    function mostrarAlerta(mensaje, tipo, callback = null) {
      document.getElementById("alertModalBody").innerHTML = mensaje;

      const modalTitle = document.getElementById("alertModalLabel");
      modalTitle.className = "modal-title"; // Resetear clases
      if (tipo === "success") {
        modalTitle.innerHTML = "✳️ Carga Éxitosa";
        modalTitle.classList.add("text-success");
      } else if (tipo === "danger") {
        modalTitle.innerHTML = "⛔ Atención";
        modalTitle.classList.add("text-danger");
      } else {
        modalTitle.innerHTML = "ℹ️ Información";
        modalTitle.classList.add("text-muted");
      }

      const modal = new bootstrap.Modal(document.getElementById("alertModal"));

      // Evento al cerrar el modal: ejecuta la función opcional si existe
      document.getElementById("alertModal").addEventListener("hidden.bs.modal", function () {
        if (callback) callback();
      }, { once: true });

      modal.show();
    }

  }, 1000);

  function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
});

function generarOpcionesLabProblem(n) {
  let opciones = "<option value='' selected disabled>Seleccione una actividad...</option>";
  for (let i = 1; i <= n; i++) {
    opciones += `<option value='Problemas - Serie ${i}'>Problemas - Serie ${i}</option>`;
    opciones += `<option value='Laboratorio ${i}'>Laboratorio ${i}</option>`;
  };
  return opciones;
}
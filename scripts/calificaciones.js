import { getAlumnos } from './baseDatos.js';

async function mostrarAlumnosFB() {
    const alumnos = await getAlumnos();
    console.log("Alumnos cargados:", alumnos);
    return alumnos;
};

document.addEventListener("DOMContentLoaded", async function () {
    // Esperar a que los alumnos sean recuperados
    const alumnos = await mostrarAlumnosFB();
    setTimeout(function () {
        document.getElementById('tituloCalificaciones').classList.remove('d-none');
        document.getElementById('spinnerContainer').classList.add('d-none');
        document.getElementById('calificaciones').classList.remove('d-none');
        document.getElementById('descripcionCalificaciones').classList.remove('d-none');

        const n1 = 5; // Cantidad de coloquios Lab. antes del primer parcial
        const n2 = 5; // Cantidad de coloquios Lab. después del primer parcial y antes del segundo

        Object.keys(alumnos).forEach(materia => {
            Object.keys(alumnos[materia]).forEach(grupo => {
                alumnos[materia][grupo].sort((a, b) => a.name.localeCompare(b.name));
            });
        });

        const asistenciaDiv = document.getElementById("calificaciones");
        asistenciaDiv.classList.remove("d-none");

        let html = "";

        Object.keys(alumnos).forEach((materia, i) => {
            const totalMateria = calcularTotalAlumnosPorMateria(materia); // Total de alumnos por materia
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
                const actividadId = `actividad-${materia.replace(/\s+/g, '')}-${grupo.replace(/\s+/g, '')}`;

                const totalGrupo = alumnos[materia][grupo].length; // Total de alumnos por grupo

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
                          <label for='${actividadId}' class='form-label'>Actividad:</label>
                          <select class='form-select mb-3' id='${actividadId}'>
                            ${generarOpcionesColoquios(n1, n2)}
                          </select>

                          <table class='table table-bordered text-center'>
                            <thead>
                              <tr>
                                <th>Orden</th>
                                <th>Apellido y Nombre</th>
                                <th>D.N.I.</th>
                                <th>Nota</th>
                                <th>Calificación</th>
                              </tr>
                            </thead>
                            <tbody>`;

                alumnos[materia][grupo].forEach((nombre, index) => {
                    const dni = parseInt(nombre.dni);
                    const formatDNI = dni.toLocaleString('es-AR').replace(/,/g, '.');
                    const calificacionId = `calificacion-${materia.replace(/\s+/g, '')}-${grupo.replace(/\s+/g, '')}-${index}`;

                    html += `
                            <tr>
                              <td>${index + 1}</td>
                              <td class="text-start">${nombre.name}</td>
                              <td>${formatDNI}</td>
                              <td>
                                <input type="number" class="form-control text-center nota" min="0" max="10" step="0.1" data-calificacion="${calificacionId}" data-grupo="${grupo}" data-materia="${materia}">
                              </td>
                              <td id="${calificacionId}">---</td>
                            </tr>`;
                });

                html += `</tbody></table>
                          <button class='btn btn-primary mt-2 cargar-notas' data-grupo="${grupo}" data-materia="${materia}" data-fecha="${fechaId}" data-actividad="${actividadId}">Cargar Notas</button>
                        </div>
                      </div>
                    </div>`;
            });

            html += `</div></div></div></div></div></div></div></div>`;

        });

        asistenciaDiv.innerHTML = html;

        document.querySelectorAll('.nota').forEach(input => {
            input.addEventListener('input', function () {
                const calificacionId = this.getAttribute('data-calificacion');
                const nota = parseFloat(this.value);
                const calificacion = clasificarNota(nota);
                if (calificacion === "⚠️ Nota invalida") {
                    this.value = "";
                }
                document.getElementById(calificacionId).textContent = clasificarNota(nota);
            });
        });

        document.querySelectorAll('.cargar-notas').forEach(button => {
            button.addEventListener('click', function () {
                const grupo = this.getAttribute('data-grupo');
                const materia = this.getAttribute('data-materia');
                const fechaId = this.getAttribute('data-fecha');
                const actividadId = this.getAttribute('data-actividad');
                const fecha = document.getElementById(fechaId).value;
                const actividad = document.getElementById(actividadId).value;

                const inputs = document.querySelectorAll(`input.nota[data-grupo="${grupo}"][data-materia="${materia}"]`);

                let notasSeleccionadas = [];
                let camposIncompletos = false;

                // Validar que todas las notas estén completas
                inputs.forEach(input => {
                    const studentName = input.closest('tr').querySelector('td:nth-child(2)').textContent;
                    const dni = input.closest('tr').querySelector('td:nth-child(3)').textContent;
                    const nota = input.value ? parseFloat(input.value) : null;

                    if (nota === null || isNaN(nota) || nota > 10 || nota < 0) {
                        camposIncompletos = true;
                    }

                    //                    const calificacion = clasificarNota(nota);

                    notasSeleccionadas.push({
                        name: studentName,
                        dni: dni,
                        materia: materia,
                        grupo: grupo,
                        registro: {
                            actividad: actividad,
                            fecha: fecha,
                            valor: nota
                        }
                    });



                });

                // Validar que se haya seleccionado una actividad
                if (!actividad) {
                    mostrarAlerta("⚠️ Por favor, seleccione una actividad evaluada antes de continuar.", "danger");
                    return;
                }

                if (camposIncompletos) {
                    mostrarAlerta("⚠️ Por favor, complete todas las notas antes de continuar.", "danger");
                    return;
                }

                // Mostrar éxito y limpiar el formulario después de cerrar el modal
                mostrarAlerta(`✅ Notas de ${grupo} de ${materia} en la fecha ${fecha} para ${actividad} cargadas correctamente.`, "success", function () {
                    console.log(notasSeleccionadas);
                    resetearFormulario(grupo, materia, fechaId, actividadId);
                });

            });
        });

    }, 1000);

    function calcularTotalAlumnosPorMateria(materia) {
        return Object.keys(alumnos[materia]).reduce((total, grupo) => {
            return total + alumnos[materia][grupo].length;
        }, 0);
    }

    function generarOpcionesColoquios(n1, n2) {
        let opciones = "<option value='' selected disabled>Seleccione la actividad evaluada...</option>";
        for (let i = 1; i <= n1; i++) {
            opciones += `<option value='Coloquio Lab. ${i}'>Coloquio Lab. ${i}</option>`;
        }
        opciones += `<option value='Primer Parcial'>Primer Parcial</option>` +
            `<option value='Recuperatorio del Primer Parcial'>Recuperatorio del Primer Parcial</option>`;
        for (let i = 1; i <= n2; i++) {
            opciones += `<option value='Coloquio Lab. ${n1 + i}'>Coloquio Lab. ${n1 + i}</option>`;
        }
        opciones += `<option value='Segundo Parcial'>Segundo Parcial</option>` +
            `<option value='Recuperatorio del Segundo Parcial'>Recuperatorio del Segundo Parcial</option>` +
            `<option value='Parcial Extra'>Parcial Extra</option>`;
        return opciones;
    }

    function getCurrentDate() {
        const today = new Date();
        return today.toISOString().split('T')[0];
    }

    function clasificarNota(nota) {
        if (nota >= 0 && nota <= 10) {
            if (nota >= 10) return "🫶🏼 Sobresaliente";
            if (nota >= 9) return "👏🏼 Distinguido";
            if (nota >= 8) return "💪🏼 Muy Bueno";
            if (nota >= 7) return "👍🏼 Bueno";
            if (nota >= 6) return "🤏🏼 Aprobado";
            if (nota > 0) return "🙏🏼 Insuficiente";
            return "🤌🏼 Ausente"; //Reprobado
        } else {
            return "⚠️ Nota invalida"
        }
    }

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
    };

    function resetearFormulario(grupo, materia, fechaId, actividadId) {
        // Resetear las notas
        document.querySelectorAll(`input.nota[data-grupo="${grupo}"][data-materia="${materia}"]`).forEach(input => {
            input.value = "";
        });

        // Resetear las calificaciones en la tabla
        document.querySelectorAll(`td[id^="calificacion-${materia.replace(/\s+/g, '')}-${grupo.replace(/\s+/g, '')}"]`).forEach(td => {
            td.textContent = "---";
        });

        // Resetear la fecha a la actual
        document.getElementById(fechaId).value = getCurrentDate();

        // Resetear la selección de actividad
        document.getElementById(actividadId).selectedIndex = 0;
    }

});
import { getAlumnos } from './baseDatos.js';
import { guardarNotas } from './firebase.js';

async function mostrarAlumnosFB() {
    const alumnos = await getAlumnos();
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

        const n1 = 5; // Cantidad de coloquios Lab.
        const n2 = 5; // Cantidad de Informe de Lab.

        Object.keys(alumnos).forEach(materia => {
            Object.keys(alumnos[materia]).forEach(grupo => {
                alumnos[materia][grupo].sort((a, b) => a.name.localeCompare(b.name));
            });
        });

        const asistenciaDiv = document.getElementById("calificaciones");
        asistenciaDiv.classList.remove("d-none");

        let html = "";
        Object.keys(alumnos).sort((a, b) => a.localeCompare(b)).forEach((materia, i) => {
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

                          <!-- Tabla de calificaciones responsiva -->
                          <div class="table-responsive">
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
                              <tbody>
                                ${alumnos[materia][grupo].map((nombre, index) => {
                    const dni = parseInt(nombre.dni);
                    const formatDNI = dni.toLocaleString('es-AR').replace(/,/g, '.');
                    const calificacionId = `calificacion-${materia.replace(/\s+/g, '')}-${grupo.replace(/\s+/g, '')}-${index}`;
                    return `
                                    <tr>
                                      <td>${index + 1}</td>
                                      <td class="text-start">${nombre.name}</td>
                                      <td>${formatDNI}</td>
                                      <td>
                                        <input type="number" class="form-control text-center nota" min="0" max="10" step="0.1" data-calificacion="${calificacionId}" data-grupo="${grupo}" data-materia="${materia}">
                                      </td>
                                      <td id="${calificacionId}">---</td>
                                    </tr>`;
                }).join('')}
                              </tbody>
                            </table>
                          </div>
                          <button class='btn btn-primary mt-2 cargar-notas' data-grupo="${grupo}" data-materia="${materia}" data-fecha="${fechaId}" data-actividad="${actividadId}">Cargar Notas</button>

                        </div>
                      </div>
                    </div>`;
            });

            html += `</div></div></div></div></div></div></div></div>`;

        });

        asistenciaDiv.innerHTML = html;






        document.querySelectorAll('.nota').forEach(input => {
            input.addEventListener('focus', async function () {
                const actividadId = this.closest('.accordion-body').querySelector('select').id;
                const actividadElement = document.getElementById(actividadId);

                if (!actividadElement) {
                    console.error("❌ No se encontró el elemento de actividad.");
                    return;
                }

                const actividad = actividadElement.value;
                const dni = this.closest('tr').querySelector('td:nth-child(3)').textContent.replace(/\./g, '');
                const grupo = this.getAttribute('data-grupo');
                const materia = this.getAttribute('data-materia');

                // 🔹 Pasamos "alumnos" como parámetro
                const alumnoData = await obtenerNotasAlumno(dni, materia, grupo, alumnos);

                console.log(`🔍 Verificando alumno ${dni} para ${actividad}:`, alumnoData);

                if (alumnoData.condicion === "No Regular") {
                    this.disabled = true;
                    this.value = -1;
                    this.classList.add("disabled-no-regular"); // Aplicar la clase CSS
                    mostrarAlerta(`❌ El alumno con DNI ${dni} es No Regular y no puede rendir ninguna actividad.`, "danger");
                    return;
                }

                if (debeBloquearse(actividad, alumnoData)) {
                    this.disabled = true;
                    this.value = -1;
                    this.classList.add("disabled-no-regular"); // Aplicar la clase CSS
                    mostrarAlerta(`❌ El alumno con DNI ${dni} ya aprobó una instancia y no puede rendir ${actividad}.`, "danger");
                } else {
                    this.disabled = false;
                }
            });
        });

        async function obtenerNotasAlumno(dni, materia, grupo, alumnos) {
            try {
                // Verificar si la materia y el grupo existen en los datos
                if (!alumnos[materia] || !alumnos[materia][grupo]) {
                    console.warn(`⚠️ No se encontraron datos para la materia ${materia} y grupo ${grupo}`);
                    return {
                        primerParcial: null,
                        recPrimerParcial: null,
                        segundoParcial: null,
                        recSegundoParcial: null,
                        extraParcial: null,
                        condicion: "Activo" // Si no hay datos, se asume que el alumno es "Activo"
                    };
                }
        
                // Buscar al alumno por DNI en el grupo y materia especificados
                const alumno = alumnos[materia][grupo].find(alumno => alumno.dni === dni);
        
                if (!alumno) {
                    console.warn(`⚠️ No se encontró al alumno con DNI ${dni} en ${materia} - ${grupo}`);
                    return {
                        primerParcial: null,
                        recPrimerParcial: null,
                        segundoParcial: null,
                        recSegundoParcial: null,
                        extraParcial: null,
                        condicion: "Activo" // Si no se encuentra, se asume que el alumno es "Activo"
                    };
                }
        
                // Devolver los datos del alumno (notas y condición)
                function obtenerNotasDeActividad(alumno, actividad) {
                    // Filtrar las notas que coincidan con la actividad especificada
                    const notasDeActividad = alumno.notas.filter(nota => nota.actividad === actividad);
        
                    // Si no se encuentran notas para la actividad, devolver null
                    if (notasDeActividad.length === 0) {
                        return null;
                    }
                    // Devolver la primera nota encontrada
                    return notasDeActividad[0].valor;
                }
        
                return {
                    primerParcial: obtenerNotasDeActividad(alumno, "Primer Parcial"),
                    recPrimerParcial: obtenerNotasDeActividad(alumno, "Recuperatorio del Primer Parcial"),
                    segundoParcial: obtenerNotasDeActividad(alumno, "Segundo Parcial"),
                    recSegundoParcial: obtenerNotasDeActividad(alumno, "Recuperatorio del Segundo Parcial"),
                    extraParcial: obtenerNotasDeActividad(alumno, "Parcial Extra"),
                    condicion: alumno.condicion ?? "Activo" // Si no se especifica, se asume "Activo"
                };
        
            } catch (error) {
                console.error(`❌ Error al obtener datos del alumno ${dni}:`, error);
                return {
                    primerParcial: null,
                    recPrimerParcial: null,
                    segundoParcial: null,
                    recSegundoParcial: null,
                    extraParcial: null,
                    condicion: "Activo" // Si hay un error, se asume "Activo"
                };
            }
        }

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
            button.addEventListener('click', async function () {
                const grupo = this.getAttribute('data-grupo');
                const materia = this.getAttribute('data-materia');
                const fechaId = this.getAttribute('data-fecha');
                const actividadId = this.getAttribute('data-actividad'); // Obtener la actividad seleccionada
                const fecha = document.getElementById(fechaId).value;
                const actividad = document.getElementById(actividadId).value; // Obtener la actividad seleccionada
        
                if (!actividad) {
                    mostrarAlerta("⚠️ Por favor, seleccione una actividad evaluada antes de continuar.", "danger");
                    return;
                }
        
                const inputs = document.querySelectorAll(`input.nota[data-grupo="${grupo}"][data-materia="${materia}"]`);
        
                let notasSeleccionadas = [];
                let camposIncompletos = false;
        
                // Validar que todas las notas estén completas
                inputs.forEach(input => {
                    const studentName = input.closest('tr').querySelector('td:nth-child(2)').textContent;
                    const dni = input.closest('tr').querySelector('td:nth-child(3)').textContent.replace(/\./g, ''); // Eliminar puntos del DNI
                    const nota = input.value.trim(); // Eliminar espacios en blanco
        
                    // Si la nota es -1, excluir al alumno del arreglo
                    if (nota === "-1") {
                        return; // Continuar con el siguiente input sin agregar al alumno
                    }
        
                    // Validar que la nota sea un número válido
                    const notaNumerica = parseFloat(nota);
                    if (isNaN(notaNumerica)) {
                        camposIncompletos = true;
                    } else if (notaNumerica > 10 || notaNumerica < 0) {
                        camposIncompletos = true;
                    }
        
                    notasSeleccionadas.push({
                        name: studentName,
                        dni: dni,
                        materia: materia,
                        grupo: grupo,
                        registro: {
                            actividad: actividad, // Incluir la actividad en el registro
                            fecha: fecha,
                            valor: notaNumerica // Usar el valor numérico
                        }
                    });
                });
        
                if (camposIncompletos) {
                    mostrarAlerta("⚠️ Por favor, complete todas las notas antes de continuar.", "danger");
                    return;
                }
        
                document.getElementById("spinnerFB").classList.remove("d-none"); // Mostrar spinner
        
                try {
                    const success = await guardarNotas(notasSeleccionadas);
                    if (success) {
                        mostrarAlerta(
                            `✅ Notas de ${grupo} de ${materia} en la fecha ${fecha} para la actividad "${actividad}" se han cargado correctamente...`,
                            "success",
                            function () {
                                resetearFormulario(grupo, materia, fechaId, actividadId);
                            }
                        );
                    } else {
                        mostrarAlerta("⛔ Hubo un error al cargar las notas, por favor intenta nuevamente.", "danger");
                    }
                } catch (error) {
                    console.error("Error al cargar las notas:", error);
                    mostrarAlerta("⛔ Hubo un error al cargar las notas, por favor intenta nuevamente.", "danger");
                } finally {
                    document.getElementById("spinnerFB").classList.add("d-none"); // Ocultar spinner
                }
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
            opciones += `<option value='Informe de Lab. ${i}'>Informe de Lab. ${i}</option>`;
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
            input.value = ""; // Limpiar el valor del input
            input.disabled = false; // Habilitar el input
            input.classList.remove("disabled-no-regular"); // Eliminar la clase CSS que oculta el valor
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

function debeBloquearse(actividad, notas) {
    if (actividad === "Recuperatorio del Primer Parcial" && notas.primerParcial >= 6) return true;
    if (actividad === "Recuperatorio del Segundo Parcial" && notas.segundoParcial >= 6) return true;
    if (actividad === "Parcial Extra") {
        if ((notas.primerParcial >= 6 || notas.recPrimerParcial >= 6) &&
            (notas.segundoParcial >= 6 || notas.recSegundoParcial >= 6)) {
            return true;
        }
        if ((notas.primerParcial === null || notas.primerParcial < 6) &&
            (notas.recPrimerParcial === null || notas.recPrimerParcial < 6) &&
            (notas.segundoParcial === null || notas.segundoParcial < 6) &&
            (notas.recSegundoParcial === null || notas.recSegundoParcial < 6)) {
            return true;
        }
    }
    return false;
}

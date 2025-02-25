import { alumnos } from "./baseDatos.js";

document.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
        document.getElementById('tituloFicha').classList.remove('d-none');
        document.getElementById('spinnerContainer').classList.add('d-none');
        document.getElementById('ficha').classList.remove('d-none');
        document.getElementById('descripcionFicha').classList.remove('d-none');
        document.getElementById('fichaAlumnoForm').classList.remove('d-none');


        // Datos de ejemplo
        const alumnosData = { data: alumnos };

        // Objeto de mapeo para los nombres de las actividades
        const nombresActividades = {
            parcial1: "Primer Parcial",
            parcial2: "Segundo Parcial",
            recup1: "Recuperatorio del Primer Parcial",
            recup2: "Recuperatorio del Segundo Parcial",
            extra: "Parcial Extra"
        };

        // Función para evaluar la nota y devolver la descripción
        function evaluarNota(valor) {
            if (valor === 0) {
                return "Ausente";
            } else if (valor === 10) {
                return "Sobresaliente";
            } else if (valor < 10 && valor >= 9) {
                return "Distinguido";
            } else if (valor < 9 && valor >= 8) {
                return "Muy Bueno";
            } else if (valor < 8 && valor >= 7) {
                return "Bueno";
            } else if (valor < 7 && valor >= 6) {
                return "Aprobado";
            } else if (valor < 6 && valor > 0) {
                return "Insuficiente";
            }
            return "";
        }

        // Referencias a los selects y contenedor de ficha
        const materiaSelect = document.getElementById("materiaSelect");
        const grupoSelect = document.getElementById("grupoSelect");
        const alumnoSelect = document.getElementById("alumnoSelect");
        const fichaAlumnoContainer = document.getElementById("fichaAlumnoContainer");

        // Llenar select de materias
        Object.keys(alumnosData.data).forEach(materia => {
            const option = document.createElement("option");
            option.value = materia;
            option.textContent = materia;
            materiaSelect.appendChild(option);
        });

        // Evento para seleccionar materia
        materiaSelect.addEventListener("change", function () {
            const materia = this.value;
            grupoSelect.innerHTML =
                '<option value="" selected disabled>Seleccionar Grupo...</option>';
            alumnoSelect.innerHTML =
                '<option value="" selected disabled>Seleccionar Alumno...</option>';
            grupoSelect.disabled = !materia;
            alumnoSelect.disabled = true;
            fichaAlumnoContainer.innerHTML = ""; // Limpiar ficha anterior

            if (materia) {
                const grupos = Object.keys(alumnosData.data[materia]);
                grupos.forEach(grupo => {
                    const option = document.createElement("option");
                    option.value = grupo;
                    option.textContent = grupo;
                    grupoSelect.appendChild(option);
                });
                grupoSelect.disabled = false;
            }
        });

        // Evento para seleccionar grupo
        grupoSelect.addEventListener("change", function () {
            const materia = materiaSelect.value;
            const grupo = this.value;
            alumnoSelect.innerHTML =
                '<option value="" selected disabled>Seleccionar Alumno...</option>';
            alumnoSelect.disabled = !grupo;
            fichaAlumnoContainer.innerHTML = "";

            if (materia && grupo) {
                const alumnos = alumnosData.data[materia][grupo];
                alumnos.forEach(alumno => {
                    const option = document.createElement("option");
                    option.value = alumno.dni;
                    option.textContent = alumno.name;
                    alumnoSelect.appendChild(option);
                });
                alumnoSelect.disabled = false;
            }
        });

        // Evento para seleccionar alumno y construir la ficha
        alumnoSelect.addEventListener("change", function () {
            const materia = materiaSelect.value;
            const grupo = grupoSelect.value;
            const dni = this.value;
            fichaAlumnoContainer.innerHTML = "";

            if (dni) {
                // Buscar al alumno en la estructura de datos
                const alumnos = alumnosData.data[materia][grupo];
                const alumno = alumnos.find(a => a.dni === dni);

                // Crear elementos de la ficha de alumno
                const fichaDiv = document.createElement("div");
                //                fichaDiv.className = "table-responsive";
                fichaDiv.id = "fichaAlumno";

                // Título Datos Personales
                const h4Datos = document.createElement("h4");
                h4Datos.textContent = "Datos Personales";
                fichaDiv.appendChild(h4Datos);

                // Tabla Datos Personales
                const tablaDatos = document.createElement("table");
                tablaDatos.className = "table table-bordered";
                const tbodyDatos = document.createElement("tbody");

                const trDatos1 = document.createElement("tr");
                const dniInt = parseInt(alumno.dni);
                const formatDNI = dniInt.toLocaleString('es-AR').replace(/,/g, '.');
                const mail = alumno.mail ? alumno.mail : "usuario@dominio.com";
                const celular = alumno.celular ? alumno.celular : "+54 XXXX XXXXXX";
                trDatos1.innerHTML = `
      <th>Apellido y Nombre</th>
      <td>${alumno.name}</td>
      <th>DNI</th>
      <td>${formatDNI}</td>
      <th>Mail</th>
      <td>${mail}</td>
      <th>Celular</th>
      <td>${celular}</td>
    `;
                tbodyDatos.appendChild(trDatos1);
                const trDatos2 = document.createElement("tr");
                trDatos2.innerHTML = `
      <th>Materia</th>
      <td>${materia}</td>
      <th>Grupo</th>
      <td>${grupo}</td>
      <th>Asistencia</th>
      <td>${calcularPorcentajeAsistencia(alumno)}</td>
      <th>Condición</th>
      <td>${alumno.condicion}</td>            
    `;
                tbodyDatos.appendChild(trDatos2);
                tablaDatos.appendChild(tbodyDatos);
                fichaDiv.appendChild(tablaDatos);

                // Sección Asistencias
                const h4Asist = document.createElement("h4");
                h4Asist.textContent = "Asistencias";
                fichaDiv.appendChild(h4Asist);

                const tablaAsist = document.createElement("table");
                tablaAsist.className = "table table-sm table-striped";
                const theadAsist = document.createElement("thead");
                theadAsist.innerHTML = `
      <tr>
        <th>Actividad</th>
        <th>Fecha</th>
        <th>Asistencia</th>
      </tr>
    `;
                tablaAsist.appendChild(theadAsist);

                const tbodyAsist = document.createElement("tbody");
                alumno.asistencia.forEach(asist => {
                    if (asist.actividad) {
                        const tr = document.createElement("tr");
                        let asistenciaTexto = "";
                        if (asist.valor === "P") asistenciaTexto = "Presente";
                        else if (asist.valor === "A") asistenciaTexto = `<span style='color: red;'>Ausente</span>`;
                        else if (asist.valor === "AJ") asistenciaTexto = "Ausente Justificado";
                        else asistenciaTexto = asist.valor;
                        tr.innerHTML = `<td>${asist.actividad}</td><td>${asist.fecha}</td><td>${asistenciaTexto}</td>`;
                        tbodyAsist.appendChild(tr);
                    }
                });
                tablaAsist.appendChild(tbodyAsist);
                fichaDiv.appendChild(tablaAsist);

                // Sección Notas
                const h4Notas = document.createElement("h4");
                h4Notas.textContent = "Notas";
                fichaDiv.appendChild(h4Notas);

                // Tabla de Parciales
                const h5Parciales = document.createElement("h5");
                h5Parciales.textContent = "Parciales";
                fichaDiv.appendChild(h5Parciales);

                const tablaParciales = document.createElement("table");
                tablaParciales.className = "table table-sm table-striped";
                const theadParciales = document.createElement("thead");
                theadParciales.innerHTML = `
      <tr>
        <th>Actividad</th>
        <th>Fecha</th>
        <th>Nota</th>
      </tr>
    `;
                tablaParciales.appendChild(theadParciales);

                const tbodyParciales = document.createElement("tbody");

                // Tabla de Coloquios
                const h5Coloquios = document.createElement("h5");
                h5Coloquios.textContent = "Coloquios";
                const tablaColoquios = document.createElement("table");
                tablaColoquios.className = "table table-sm table-striped";
                const theadColoquios = document.createElement("thead");
                theadColoquios.innerHTML = `
      <tr>
        <th>Actividad</th>
        <th>Fecha</th>
        <th>Nota</th>
      </tr>
    `;
                tablaColoquios.appendChild(theadColoquios);
                const tbodyColoquios = document.createElement("tbody");

                // Procesar las notas utilizando el objeto de mapeo y evaluando la nota
                alumno.notas.forEach(nota => {
                    if (nota.actividad) {
                        const tr = document.createElement("tr");
                        const actividadKey = nota.actividad.toLowerCase();
                        const actividadTexto =
                            nombresActividades[actividadKey] || nota.actividad;
                        let notaTexto = "";
                        // Si la nota es 0 se muestra solo "Ausente"
                        if (nota.valor === 0) {
                            notaTexto = evaluarNota(nota.valor);
                            notaTexto = `<span style='color: red;'>${notaTexto}</span>`
                        } else if (nota.valor !== null && !isNaN(nota.valor)) {
                            notaTexto = nota.valor + " (" + evaluarNota(nota.valor) + ")";
                            if (nota.valor < 6) {
                                notaTexto = `<span style='color: red;'>${notaTexto}</span>`
                            };
                        };
                        tr.innerHTML = `<td>${actividadTexto}</td><td>${nota.fecha}</td><td>${notaTexto}</td>`;
                        if (
                            actividadKey.includes("parcial") ||
                            actividadKey.includes("recup") ||
                            actividadKey.includes("extra")
                        ) {
                            tbodyParciales.appendChild(tr);
                        } else {
                            tbodyColoquios.appendChild(tr);
                        }
                    }
                });
                tablaParciales.appendChild(tbodyParciales);
                fichaDiv.appendChild(tablaParciales);

                h5Coloquios.style.marginTop = "1rem";
                fichaDiv.appendChild(h5Coloquios);
                tablaColoquios.appendChild(tbodyColoquios);
                fichaDiv.appendChild(tablaColoquios);

                // Sección Observaciones
                const h4Obs = document.createElement("h4");
                h4Obs.textContent = "Observaciones";
                fichaDiv.appendChild(h4Obs);

                // Contenedor de observaciones
                const obsContainer = document.createElement("div");

                // Crear un párrafo para mostrar la observación actual
                const pObs = document.createElement("p");
                pObs.id = "observacionTexto";
                pObs.textContent = alumno.observaciones && alumno.observaciones.trim().length > 0
                    ? alumno.observaciones
                    : "Sin observaciones.";
                obsContainer.appendChild(pObs);

                // Crear un campo de texto oculto para editar la observación
                const textareaObs = document.createElement("textarea");
                textareaObs.id = "observacionInput";
                textareaObs.className = "form-control d-none mt-2"; // Bootstrap para diseño
                textareaObs.value = alumno.observaciones || "";
                obsContainer.appendChild(textareaObs);

                // Contenedor de botones con espacio
                const btnContainer = document.createElement("div");
                btnContainer.className = "mt-2"; // Espaciado superior

                // Botón Editar
                const btnEditar = document.createElement("button");
                btnEditar.textContent = "Editar";
                btnEditar.className = "btn btn-primary btn-sm me-2"; // Espacio a la derecha
                btnEditar.addEventListener("click", function () {
                    pObs.classList.add("d-none"); // Oculta el párrafo
                    textareaObs.classList.remove("d-none"); // Muestra el textarea
                    btnGuardar.classList.remove("d-none"); // Muestra el botón guardar
                });
                btnContainer.appendChild(btnEditar);

                // Botón Guardar
                const btnGuardar = document.createElement("button");
                btnGuardar.textContent = "Guardar";
                btnGuardar.className = "btn btn-success btn-sm d-none"; // Inicialmente oculto
                btnGuardar.addEventListener("click", function () {
                    pObs.textContent = textareaObs.value.trim() || "Sin observaciones.";
                    pObs.classList.remove("d-none"); // Muestra el párrafo
                    textareaObs.classList.add("d-none"); // Oculta el textarea
                    btnGuardar.classList.add("d-none"); // Oculta el botón guardar

                    // Guardar en la estructura de datos (opcionalmente en base de datos)
                    alumno.observaciones = textareaObs.value.trim();
                });
                btnContainer.appendChild(btnGuardar);

                // Agregar el contenedor de botones
                obsContainer.appendChild(btnContainer);

                // Agregar todo a la ficha
                fichaDiv.appendChild(obsContainer);



                // Insertar la ficha completa en el contenedor
                fichaAlumnoContainer.appendChild(fichaDiv);
            }
        });
    }, 1000);
});


function calcularPorcentajeAsistencia(alumno, max = 80) {
    const asistencias = alumno.asistencia.filter(a => a.actividad !== null);
    if (asistencias.length === 0) {
        console.log("No hay registros de asistencia.");
        return `<span style='color: red;'>0,0%</span>`;
    }
    const asistenciasFiltradas = asistencias.filter(a => a.valor !== "AJ");
    const totalAsistencias = asistenciasFiltradas.length;
    const asistenciasPresentes = asistenciasFiltradas.filter(a => a.valor === "P").length;

    if (totalAsistencias === 0) {
        console.log("No hay asistencias válidas para calcular el porcentaje.");
        return `<span style='color: red;'>0,0%</span>`;
    }

    const porcentaje = (asistenciasPresentes / totalAsistencias) * 100;
    const porcentajeTexto = porcentaje.toFixed(1).replace('.', ',') + "%";

    return porcentaje < max
        ? `<span style='color: red;'>${porcentajeTexto}</span>`
        : porcentajeTexto;
};



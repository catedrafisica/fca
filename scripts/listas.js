import { getAlumnos } from './baseDatos.js';

async function mostrarAlumnosFB() {
    const alumnos = await getAlumnos();
//    console.log("Alumnos cargados:", alumnos);
    return alumnos;
};

document.addEventListener("DOMContentLoaded", async function () {
    // Esperar a que los alumnos sean recuperados
    const alumnos = await mostrarAlumnosFB();

    setTimeout(function () {

        document.getElementById('tituloListas').classList.remove('d-none');
        document.getElementById('spinnerContainer').classList.add('d-none');
        document.getElementById('listas').classList.remove('d-none');
        document.getElementById('descripcionListas').classList.remove('d-none');
        const asistenciaDiv = document.getElementById("listas");
        asistenciaDiv.classList.remove("d-none");

        let html = "";
        Object.keys(alumnos)
            .sort()
            .forEach((materia, i) => {
                // Calculamos el total de alumnos por materia
                const totalMateria = Object.values(alumnos[materia]).reduce((acc, grupo) => acc + grupo.length, 0);

                html += `<div class="accordion mb-5" id="accordion${materia.replace(/\s+/g, '')}">
                    <div class="accordion-item">
                        <h2 class="accordion-header" id="heading${i}">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${i}" aria-expanded="false">
                                ${materia} (Total: ${totalMateria} alumnos)
                            </button>
                        </h2>
                        <div id="collapse${i}" class="accordion-collapse collapse" aria-labelledby="heading${i}">
                            <div class="accordion-body">
                                <select class="form-select mb-3 selectGrupo" data-materia="${materia}" data-index="${i}">
                                    <option value="" selected disabled>Seleccione para generar la lista...</option>
                                    <option value="Todos">Todos los alumnos</option>`;

                Object.keys(alumnos[materia])
                    .sort()
                    .forEach((grupo) => {
                        // Calculamos el total de alumnos por grupo
                        const totalGrupo = alumnos[materia][grupo].length;
                        html += `<option value="${grupo}">${grupo} (Total: ${totalGrupo} alumnos)</option>`;
                    });

                html += `</select>
                                <div class="listas" id="listas-${i}"></div>
                                <button class='btn btn-primary mt-2' id='btn-pdf-${i}' onclick='generarPDF(${i})' disabled>Generar PDF</button>
                            </div>
                        </div>
                    </div>
                </div>`;
            });

        asistenciaDiv.innerHTML = html;

        document.querySelectorAll(".selectGrupo").forEach(select => {
            select.addEventListener("change", function () {
                const materia = this.dataset.materia;
                const index = this.dataset.index;
                const grupoSeleccionado = this.value;
                let listaAlumnos = [];

                const btnPDF = document.getElementById(`btn-pdf-${index}`);
                btnPDF.disabled = false;

                if (grupoSeleccionado === "Todos") {
                    Object.values(alumnos[materia]).forEach(grupo => {
                        listaAlumnos = listaAlumnos.concat(grupo);
                    });
                } else {
                    listaAlumnos = alumnos[materia][grupoSeleccionado] || [];
                }

                listaAlumnos.sort((a, b) => a.name.localeCompare(b.name));
                mostrarAlumnos(listaAlumnos, document.getElementById(`listas-${index}`));
            });
        });
    }, 1000);
});

function mostrarAlumnos(lista, contenedor) {
    let html = `<div class="table-responsive"><table class='table table-bordered text-center'>
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Apellido y Nombre</th>
                            <th>D.N.I.</th>
                            <th>Asistencia</th>
                            <th>1° Parcial</th>
                            <th>Recup. 1° Parcial</th>
                            <th>2° Parcial</th>
                            <th>Recup 2° Parcial</th>
                            <th>Extra Parcial</th>                            
                            <th>Coloquios Aprob.</th>
                            <th>Condición</th>
                        </tr>
                    </thead>
                    <tbody>`;
    lista.forEach((alumno, index) => {
        const dni = parseInt(alumno.dni);
        const formatDNI = dni.toLocaleString('es-AR').replace(/,/g, '.');
        let registros = calcularPorcentajeAsistencia(alumno);
        html += `<tr>
                    <td>${index + 1}</td>
                    <td class="text-start">${alumno.name}</td>
                    <td>${formatDNI}</td>
                    <td>${registros ? registros : '---%'}</td>
                    <td>${alumno.notas[0].actividad ? evaluarParcial(alumno.notas, "Primer Parcial") : '---'}</td>
                    <td>${alumno.notas[0].actividad ? evaluarParcial(alumno.notas, "Recuperatorio del Primer Parcial") : '---'}</td>
                    <td>${alumno.notas[0].actividad ? evaluarParcial(alumno.notas, "Segundo Parcial") : '---'}</td>
                    <td>${alumno.notas[0].actividad ? evaluarParcial(alumno.notas, "Recuperatorio del Segundo Parcial") : '---'}</td>
                    <td>${alumno.notas[0].actividad ? evaluarParcial(alumno.notas, "Parcial Extra") : '---'}</td>                    
                    <td>${alumno.notas[0].actividad ? calcularPorcentajeAprobados(alumno.notas) : '---%'}</td>
                    <td>${alumno.condicion || '---'}</td>
                 </tr>`;
    });
    html += "</tbody></table></div>"; // Cierre del div table-responsive
    contenedor.innerHTML = html;
}

const { jsPDF } = window.jspdf;
import { dataImag } from "../images/membrete.js";

window.generarPDF = function (index) {
    const doc = new jsPDF(); // Orientación vertical

    // Cargar imagen de membrete (Base64 o URL)
    const imgData = dataImag;

    // Añadir imagen de membrete
    doc.addImage(imgData, 'PNG', 5, 5, 200, 30); // Ajusta tamaño/posición según tu imagen

    const selectElement = document.querySelector(`.selectGrupo[data-index="${index}"]`);
    const materia = selectElement ? selectElement.getAttribute('data-materia') : "Materia no especificada";
    const grupo = selectElement ? selectElement.value : "Grupo no especificado";

    // Texto debajo del membrete
    const fecha = new Date().toLocaleDateString('es-ES');
    doc.setFontSize(10);
    doc.text(`PDF Generado para: ${materia} - ${grupo} - Fecha: ${fecha}`, 105, 45, { align: "center" });

    // Obtener la tabla y generar PDF
    const table = document.getElementById(`listas-${index}`).querySelector("table");
    if (table) {
        doc.autoTable({
            html: table,
            startY: 52,
            margin: { top: 10, left: 5, right: 5 }, // Márgenes reducidos
            tableWidth: 'wrap', // Ajuste automático al nuevo ancho
            styles: {
                overflow: 'linebreak', // Divide texto largo en varias líneas
                cellWidth: 'wrap',
                fontSize: 7, // Tamaño reducido para mayor espacio
                halign: 'center',
                valign: 'middle',
            },
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: [255, 255, 255],
                halign: 'center',
                fontSize: 8,
            },
            bodyStyles: {
                halign: 'center',
            },
            columnStyles: {
                0: { cellWidth: 8, halign: 'center' },   // Orden
                1: { cellWidth: 37, halign: 'left' },   // Apellido y Nombre alineado a la derecha
                2: { cellWidth: 20, halign: 'center' },  // DNI
                3: { cellWidth: 18, halign: 'center' },  // Asistencia
                4: { cellWidth: 15, halign: 'center' },  // 1° Parcial
                5: { cellWidth: 17, halign: 'center' },  // Recup. 1° Parcial
                6: { cellWidth: 15, halign: 'center' },  // 2° Parcial
                7: { cellWidth: 17, halign: 'center' },  // Recup. 2° Parcial
                8: { cellWidth: 17, halign: 'center' },  // Extra Parcial
                9: { cellWidth: 18, halign: 'center' },  // Coloquios Aprob.
                10: { cellWidth: 18, halign: 'center' }, // Condición
            },
            didDrawPage: function (data) {
                // Si es la primera página, dibujar la línea separadora
                if (data.pageNumber === 1) {
                    doc.line(5, 50, 205, 50);
                }

                // Número de página centrado en el pie de página
                const pageNumber = doc.internal.getNumberOfPages();
                doc.setFontSize(6);
                doc.text(`Pág. ${data.pageNumber}`, 105, 290, { align: 'center' });
            }
        });
    }

    doc.save(`Lista de Alumnos_${materia}_${grupo}_${fecha}.pdf`);
};


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
        return `<span style='color: red;'>0,0%</span>`;;
    }

    const porcentaje = (asistenciasPresentes / totalAsistencias) * 100;
    const porcentajeTexto = porcentaje.toFixed(1).replace('.', ',') + "%";

    return porcentaje < max
        ? `<span style='color: red;'>${porcentajeTexto}</span>`
        : porcentajeTexto;
};



function evaluarParcial(notasArr, actividad = "Primer Parcial") {
    const parcial = notasArr.find(nota => nota.actividad.toLowerCase() === actividad.toLowerCase());
    if (!parcial) {
        return "---";
    };
    let estado = parcial.valor >= 6
        ? `${parcial.valor} (Aprob.)`
        : `<span style='color: red;'>${parcial.valor} (Desap.)</span>`;
    if (parcial.valor === 0) {
        return `<span style='color: red;'>Ausente</span>`;
    } else {
        return estado;
    };
};


function calcularPorcentajeAprobados(actividades, max = 80) {
    if (actividades.length === 1 && actividades[0].valor === null) {
        return "---%";
    };
    const actividadesExcluidas = ["Primer Parcial", "Segundo Parcial", "Recuperatorio del Primer Parcial", "Recuperatorio del Segundo Parcial", "Parcial Extra"];
    const actividadesValidas = actividades.filter(actividad =>
        !actividadesExcluidas.includes(actividad.actividad)
    );
    if (actividadesValidas.length === 0) {
        return "---%";
    }
    const totalActividades = actividadesValidas.length;
    const aprobados = actividadesValidas.filter(actividad => actividad.valor >= 6).length;
    const porcentajeAprobados = (aprobados / totalActividades) * 100;
    const porcentajeTexto = porcentajeAprobados.toFixed(1) + "%";
    return porcentajeAprobados < max
        ? `<span style='color: red;'>${porcentajeTexto}</span>`
        : porcentajeTexto;
};
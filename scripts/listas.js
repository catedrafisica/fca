import { alumnos } from "./baseDatos.js";

document.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
        document.getElementById('tituloListas').classList.remove('d-none');
        document.getElementById('spinnerContainer').classList.add('d-none');
        document.getElementById('listas').classList.remove('d-none');
        document.getElementById('descripcionListas').classList.remove('d-none');
        const asistenciaDiv = document.getElementById("listas");
        asistenciaDiv.classList.remove("d-none");

        let html = "";
        Object.keys(alumnos).forEach((materia, i) => {
            html += `<div class="accordion mb-5" id="accordion${materia.replace(/\s+/g, '')}">
                    <div class="accordion-item">
                        <h2 class="accordion-header" id="heading${i}">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${i}" aria-expanded="false">
                                ${materia}
                            </button>
                        </h2>
                        <div id="collapse${i}" class="accordion-collapse collapse" aria-labelledby="heading${i}">
                            <div class="accordion-body">
                                <select class="form-select mb-3 selectGrupo" data-materia="${materia}" data-index="${i}">
                                    <option value="" selected disabled>Seleccione para generar la lista...</option>
                                    <option value="Todos">Todos los alumnos</option>`;
            
            Object.keys(alumnos[materia]).forEach((grupo) => {
                html += `<option value="${grupo}">${grupo}</option>`;
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
    let html = `<table class='table table-bordered text-center'>
                    <thead>
                        <tr>
                            <th>Orden</th>
                            <th>Apellido y Nombre</th>
                            <th>D.N.I.</th>
                            <th>Asistencia</th>
                            <th>Parciales Aprob.</th>
                            <th>Coloquios Aprob.</th>
                            <th>Condición</th>
                        </tr>
                    </thead>
                    <tbody>`;
    lista.forEach((alumno, index) => {
        const dni = parseInt(alumno.dni);
        const formatDNI = dni.toLocaleString('es-AR').replace(/,/g, '.');
        html += `<tr>
                    <td>${index + 1}</td>
                    <td class="text-start">${alumno.name}</td>
                    <td>${formatDNI}</td>
                    <td>${alumno.asistencia ? alumno.asistencia + '%' : '---'}</td>
                    <td>${alumno.notas ? alumno.notas.parciales + '%' : '---'}</td>
                    <td>${alumno.notas ? alumno.notas.coloquios + '%' : '---'}</td>
                    <td>${alumno.condicion || '---'}</td>
                 </tr>`;
    });
    html += "</tbody></table>";
    contenedor.innerHTML = html;
}

const { jsPDF } = window.jspdf;

window.generarPDF = function (index) {
    const doc = new jsPDF();
    doc.text("Lista de Alumnos", 14, 10);
    
    const table = document.getElementById(`listas-${index}`).querySelector("table");
    if (table) {
        doc.autoTable({
            html: table,
            startY: 20,
        });
    }
    
    doc.save("lista_alumnos.pdf");
};
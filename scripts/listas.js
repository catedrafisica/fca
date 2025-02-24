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

            Object.keys(alumnos[materia]).forEach((grupo) => {
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
    let html = `<table class='table table-bordered text-center'>
                    <thead>
                        <tr>
                            <th>Orden</th>
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
        let registros = contarAsist(alumno.asistencia);
        html += `<tr>
                    <td>${index + 1}</td>
                    <td class="text-start">${alumno.name}</td>
                    <td>${formatDNI}</td>
                    <td>${registros ? registros + "%" : '---%'}</td>
                    <td>${alumno.notas[0].valor ? evaluarParcial(alumno.notas, "parcial1") : '---'}</td>
                    <td>${alumno.notas[0].valor ? evaluarParcial(alumno.notas, "recup1") : '---'}</td>
                    <td>${alumno.notas[0].valor ? evaluarParcial(alumno.notas, "parcial2") : '---'}</td>
                    <td>${alumno.notas[0].valor ? evaluarParcial(alumno.notas, "recup2") : '---'}</td>
                    <td>${alumno.notas[0].valor ? evaluarParcial(alumno.notas, "extra") : '---'}</td>                    
                    <td>${alumno.notas[0].valor ? calcularPorcentajeAprobados(alumno.notas) + "%" : '---%'}</td>
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

function contarAsist(registros) {
    let n = 0;
    let nj = 0;
    let nPorcent = 0;
    const primerReg = registros[0].valor;
    const total = registros.length;
    if (primerReg == null && total == 1) {
        nPorcent = "---";
    } else {
        registros.forEach(item => {
            if (item.valor == "P") {
                n++;
            } else if (item.valor == "AJ") {
                nj++;
            };
        });
        const m = total - nj;
        if (m != 0) {
            nPorcent = (n / total) * 100;
            nPorcent = nPorcent.toFixed(1).replace('.', ',')
        };
    };
    return nPorcent;
};


function evaluarParcial(notasArr, actividad = "parcial1") {
    const parcial = notasArr.find(nota => nota.actividad.toLowerCase() === actividad);
    if (!parcial) {
        return "---";
    };
    const estado = parcial.valor >= 6 ? "Aprob" : "Desp";
    return `${parcial.valor} (${estado}.)`;
}

function calcularPorcentajeAprobados(actividades) {
    if (actividades.length === 1 && actividades[0].valor === null) {
        return "---";
    };
    const actividadesExcluidas = ["parcial1", "parcial2", "recup1", "recup2", "extra"];
    const actividadesValidas = actividades.filter(actividad =>
        !actividadesExcluidas.includes(actividad.actividad)
    );
    if (actividadesValidas.length === 0) {
        return "---";
    }
    const totalActividades = actividadesValidas.length;
    const aprobados = actividadesValidas.filter(actividad => actividad.valor >= 6).length;
    const porcentajeAprobados = (aprobados / totalActividades) * 100;
    return porcentajeAprobados.toFixed(1);
};






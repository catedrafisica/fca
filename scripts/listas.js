import { obtenerAlumnos } from "./firebase.js";

// Función para agrupar alumnos por materia y año de cursada
const agruparPorMateriaAnio = (alumnos) => {
    const agrupados = {};
    alumnos.forEach((alumno) => {
        const { nombreMateria, fechaCursada } = alumno.materias[0];
        const anio = fechaCursada ? new Date(fechaCursada).getFullYear() : "Año no especificado";
        const clave = `${nombreMateria} (${anio})`;
        if (!agrupados[clave]) {
            agrupados[clave] = [];
        }
        agrupados[clave].push(alumno);
    });
    return agrupados;
};

// Función para renderizar los acordeones
const renderizarAcordeones = (agrupados) => {
    const contenedor = document.getElementById("acordeonTabla");
    contenedor.innerHTML = ""; // Limpiar contenido anterior

    Object.keys(agrupados).sort().forEach((materiaAnio, index) => {
        const alumnos = agrupados[materiaAnio].sort((a, b) => {
            const nombreCompletoA = `${a.apellido}, ${a.nombre}`;
            const nombreCompletoB = `${b.apellido}, ${b.nombre}`;
            return nombreCompletoA.localeCompare(nombreCompletoB);
        });

        let filas = "";
        alumnos.forEach((alumno, i) => {
            filas += `
                <tr>
                    <td>${i + 1}</td>
                    <td>${alumno.apellido}, ${alumno.nombre}</td>
                    <td>${alumno.dni}</td>
                    <td>${alumno.carrera} / ${alumno.añoIngreso}</td>
                    <td>${alumno.materias[0].nombreMateria}</td>
                    <td>${alumno.materias[0].fechaCursada || "No especificada"}</td>
                </tr>
            `;
        });

        contenedor.innerHTML += `
            <div class="accordion-item">
                <h2 class="accordion-header" id="heading${index}">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="false" aria-controls="collapse${index}">
                        ${materiaAnio}
                    </button>
                </h2>
                <div id="collapse${index}" class="accordion-collapse collapse" aria-labelledby="heading${index}" data-bs-parent="#acordeonTabla">
                    <div class="accordion-body">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Apellido, Nombre</th>
                                    <th>DNI</th>
                                    <th>Carrera / Ingreso</th>
                                    <th>Materia</th>
                                    <th>Fecha de Cursada</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${filas}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    });
};

// Llama a la función para obtener los alumnos y renderizar los acordeones
document.addEventListener("DOMContentLoaded", async () => {
    const alumnos = await obtenerAlumnos();
    const agrupados = agruparPorMateriaAnio(alumnos);
    renderizarAcordeones(agrupados);
});

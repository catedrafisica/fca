import Alumnos from './alumnosClass.js';
import { alumnosFirebase } from './firebase.js';

async function esperarEstudiantes() {
    const estudiantes = await alumnosFirebase;
    const alumnosObj = new Alumnos();

    for (const alumnosFB of estudiantes) {
        const { materia, grupo, nombre, dni, lu, condicion, email, celular, asistencia, notas, observaciones } = alumnosFB;
        alumnosObj.agregarAlumno(materia, grupo, nombre, dni, lu, condicion, email, celular, asistencia, notas, observaciones);
    };
    return alumnosObj.data;
};

// Exportar la función, no el resultado directo
export async function getAlumnos() {
    return await esperarEstudiantes();
};

document.addEventListener("DOMContentLoaded", function () {
    const fechaEspecifica = new Date("2025-02-27T00:00:00"); // Cambia esta fecha según lo necesites de la revisión SIU Guaraní

    const fechaFormateada = fechaEspecifica.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    document.querySelectorAll("#actualSIU").forEach(elemento => {
        elemento.textContent = `${fechaFormateada}.`;
    });
});


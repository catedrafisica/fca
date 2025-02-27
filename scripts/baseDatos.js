import Alumnos from './alumnosClass.js';
import { alumnosFirebase } from './firebase.js';

async function esperarEstudiantes() {
    const estudiantes = await alumnosFirebase;
    const alumnosObj = new Alumnos();

    for (const alumnosFB of estudiantes) {
        const { materia, grupo, nombre, dni, condicion, email, celular, asistencia, notas, observaciones } = alumnosFB;
        alumnosObj.agregarAlumno(materia, grupo, nombre, dni, condicion, email, celular, asistencia, notas, observaciones);
    };
    return alumnosObj.data;
};

// Exportar la función, no el resultado directo
export async function getAlumnos() {
    return await esperarEstudiantes();
}

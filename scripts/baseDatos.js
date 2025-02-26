import Alumnos from './alumnosClass.js';
import { alumnosFirebase } from './firebase.js';

async function esperarEstudiantes() {
    const estudiantes = await alumnosFirebase;
    const alumnosObj = new Alumnos();

    for (let i = 0; i < estudiantes.length; i++) {
        const alumnosFB = estudiantes[i]; // Obtiene el primer estudiante
        const [materia, grupo, nombre, dni, condicion, mail, celular] = [
            alumnosFB.materia, alumnosFB.grupo, alumnosFB.nombre,
            alumnosFB.dni, alumnosFB.condicion, alumnosFB.email, alumnosFB.celular
        ];
        alumnosObj.agregarAlumno(materia, grupo, nombre, dni, condicion, mail, celular);
    };
    return alumnosObj.data;
}

// Exportar la función, no el resultado directo
export async function getAlumnos() {
    return await esperarEstudiantes();
}

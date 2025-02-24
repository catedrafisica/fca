import Alumnos from './alumnosClass.js';

const alumnosObj = new Alumnos();

alumnosObj.agregarAlumno("Física I", "Grupo Réplica", "Sabao, Roberto Augusto", "27465601", "Activo");
alumnosObj.agregarAlumno("Física I", "Grupo Réplica", "Elena Sánchez", "27465602");
alumnosObj.agregarAlumno("Física II", "Grupo 1", "Abalo, Blas Augusto", "27865601","Readm.");
alumnosObj.agregarAlumno("Física II", "Grupo 1", "Acevedo, Ramiro German", "27469602");
alumnosObj.agregarAlumno("Física II", "Grupo 2", "Romero, Jose", "27425601");
alumnosObj.agregarAlumno("Física II", "Grupo 2", "Alvares, Rodolfo", "27465602");

alumnosObj.agregarNota("Física I", "Grupo Réplica", "27465601", "parcial1", 5, "10/03/2025");
alumnosObj.agregarNota("Física I", "Grupo Réplica", "27465601", "coloquio1", 8, "12/03/2025");
alumnosObj.agregarAsistencia("Física I","Grupo Réplica","27465601","Lab1","12/03/2025","P");
alumnosObj.agregarAsistencia("Física I","Grupo Réplica","27465601","Lab2","15/03/2025","A")
alumnosObj.agregarAsistencia("Física I","Grupo Réplica","27465601","Lab3","18/03/2025","A")
alumnosObj.agregarAsistencia("Física I","Grupo Réplica","27465601","Lab4","20/03/2025","A")
alumnosObj.agregarAsistencia("Física I","Grupo Réplica","27465602","Lab4","20/03/2025","P")

/* for (const materia in alumnosObj.data) {
    for (const grupo in alumnosObj.data[materia]) { // Corrección aquí
        alumnosObj.data[materia][grupo].forEach(estudiante => {
            console.log(`Materia: ${materia}, Grupo: ${grupo}, Nombre: ${estudiante.name}, DNI: ${estudiante.dni}, Asist.: ${estudiante.asistencia[0].valor}`);
        });
    }
}
 */
export const alumnos = alumnosObj.data;

class Alumnos {
    constructor() {
        this.data = {};
    }

    agregarAlumno(materia, grupo, nombre, dni, condicion = "Activo", mail = null, celular = null, asistencia = [], notas = [], observaciones = "") {
        if (!this.data[materia]) {
            this.data[materia] = {};
        }
        if (!this.data[materia][grupo]) {
            this.data[materia][grupo] = [];
        }
        this.data[materia][grupo].push({
            name: nombre,
            dni: dni,
            mail: mail,
            celular: celular,
            condicion: condicion,
            asistencia: asistencia.length ? asistencia : [{ actividad: null, fecha: null, valor: null }],
            notas: notas.length ? notas : [{ actividad: null, fecha: null, valor: null }],
            observaciones: observaciones
        });
    };
/* 
    agregarNota(materia, grupo, dni, actividad, valor, fecha) {
        if (!this.data[materia] || !this.data[materia][grupo]) {
            console.log("Materia o grupo no encontrado.");
            return;
        }

        const alumno = this.data[materia][grupo].find(a => a.dni === dni);
        if (!alumno) {
            console.log("Alumno no encontrado.");
            return;
        }

        if (alumno.notas.length === 1 && alumno.notas[0].actividad === null) {
            alumno.notas[0] = { actividad, fecha, valor };
        } else {
            alumno.notas.push({ actividad, fecha, valor });
        }
    }

    agregarAsistencia(materia, grupo, dni, actividad, fecha, valor) {
        if (!this.data[materia] || !this.data[materia][grupo]) {
            console.log("Materia o grupo no encontrado.");
            return;
        }

        const alumno = this.data[materia][grupo].find(a => a.dni === dni);
        if (!alumno) {
            console.log("Alumno no encontrado.");
            return;
        }

        if (alumno.asistencia.length === 1 && alumno.asistencia[0].actividad === null) {
            alumno.asistencia[0] = { actividad, fecha, valor };
        } else {
            alumno.asistencia.push({ actividad, fecha, valor });
        }
    }

    modificarNota(materia, grupo, dni, actividad, nuevoValor, nuevaFecha) {
        if (!this.data[materia] || !this.data[materia][grupo]) {
            console.log("Materia o grupo no encontrado.");
            return;
        }

        const alumno = this.data[materia][grupo].find(a => a.dni === dni);
        if (!alumno) {
            console.log("Alumno no encontrado.");
            return;
        }

        const nota = alumno.notas.find(n => n.actividad === actividad);
        if (!nota) {
            console.log("Nota no encontrada.");
            return;
        }

        nota.valor = nuevoValor;
        nota.fecha = nuevaFecha;

        console.log(`Nota modificada para ${alumno.name}: ${actividad} - Nuevo Valor: ${nuevoValor}, Nueva Fecha: ${nuevaFecha}`);
    }

    modificarAsistencia(materia, grupo, dni, actividad, nuevoValor, nuevaFecha) {
        if (!this.data[materia] || !this.data[materia][grupo]) {
            console.log("Materia o grupo no encontrado.");
            return;
        }

        const alumno = this.data[materia][grupo].find(a => a.dni === dni);
        if (!alumno) {
            console.log("Alumno no encontrado.");
            return;
        }

        const asistencia = alumno.asistencia.find(a => a.actividad === actividad);
        if (!asistencia) {
            console.log("Registro de asistencia no encontrado.");
            return;
        }

        asistencia.valor = nuevoValor;
        asistencia.fecha = nuevaFecha;

        console.log(`Asistencia modificada para ${alumno.name}: ${actividad} - Nuevo Valor: ${nuevoValor}, Nueva Fecha: ${nuevaFecha}`);
    }

    editarObservaciones(materia, grupo, dni, nuevaObservacion) {
        if (!this.data[materia] || !this.data[materia][grupo]) {
            console.log("Materia o grupo no encontrado.");
            return;
        }

        const alumno = this.data[materia][grupo].find(a => a.dni === dni);
        if (!alumno) {
            console.log("Alumno no encontrado.");
            return;
        }

        alumno.observaciones = nuevaObservacion;

        console.log(`Observaciones actualizadas para ${alumno.name}: ${nuevaObservacion}`);
    }

    editarCondicion(materia, grupo, dni, nuevaCondicion) {
        if (!this.data[materia] || !this.data[materia][grupo]) {
            console.log("Materia o grupo no encontrado.");
            return;
        }

        const alumno = this.data[materia][grupo].find(a => a.dni === dni);
        if (!alumno) {
            console.log("Alumno no encontrado.");
            return;
        }

        alumno.condicion = nuevaCondicion;

        console.log(`Condición actualizada para ${alumno.name}: ${nuevaCondicion}`);
    }
 */    
}

export default Alumnos;
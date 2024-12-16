// Importar Firebase
import { db, collection, query, where, getDocs, doc, getDoc, updateDoc } from "./firebase.js";

function cargarDatosFormulario(alumno) {
    // Asignar valores al formulario
    document.getElementById("surname").value = alumno.apellido || "";
    document.getElementById("name").value = alumno.nombre || "";
    document.getElementById("dni").value = alumno.dni || "";
    document.getElementById("dni").dataset.id = alumno.id; // Asignar el ID al atributo data-id
    document.getElementById("status").value = "alta";
    document.getElementById("date").value = alumno.alta; // Campo de fecha
    llenarSelect(alumno.colegio, "school");
    llenarSelect(alumno.curso, "course");
    llenarSelect(alumno.asignatura, "subject");
    document.getElementById("observations").value = alumno.observaciones || ""; // Observaciones
}

function llenarSelect(dato = alumno.colegio, id = "school") {
    var valorABuscar = dato;
    var selectElement = document.getElementById(id);
    for (var i = 0; i < selectElement.options.length; i++) {
        if (selectElement.options[i].value.toUpperCase() === valorABuscar) {
            selectElement.options[i].selected = true;
            break;
        };
    };
};

function deshabilitarCampos() {
    // Deshabilitar todos los campos del formulario
    const campos = document.querySelectorAll("#studentForm input, #studentForm textarea, #studentForm select");
    campos.forEach((campo) => campo.setAttribute("disabled", "true"));
    document.getElementById("saveNewButton").hidden = true;
    document.getElementById("saveEditButton").hidden = false;
}

function habilitarCampos() {
    // Habilitar todos los campos del formulario
    const campos = document.querySelectorAll("#studentForm input, #studentForm textarea, #studentForm select");
    campos.forEach((campo) => campo.removeAttribute("disabled"));
    document.getElementById("saveEditButton").disabled = false; // Habilitar botón "Guardar Cambios"
    document.getElementById("editButton").disabled = true;
    document.getElementById("baja").disabled = false;
};

async function buscarAlumno(event) {
    event.preventDefault();

    const dni = document.getElementById("buscarDNI").value;
    const alumnosRef = collection(db, "alumnos");
    const q = query(alumnosRef, where("dni", "==", dni));

    try {
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            mostrarMensaje("No se encontró ningún alumno con el DNI ingresado.", "warning");
            return;
        }

        const alumnos = [];
        snapshot.forEach((doc) => alumnos.push({ id: doc.id, ...doc.data() }));

        if (alumnos.length === 1) {
            // Cargar datos en el formulario
            cargarDatosFormulario(alumnos[0]);
            deshabilitarCampos();
            document.getElementById("editButton").disabled = false;
            document.getElementById("saveEditButton").disabled = true;
        } else {
            mostrarOpcionesModal(alumnos);
        }
    } catch (error) {
        console.error("Error al buscar el alumno:", error);
        mostrarMensaje("Error al buscar el alumno.", "danger");
    };
};

function mostrarOpcionesModal(alumnos) {
    const modalOptions = document.getElementById("modal-options");
    modalOptions.innerHTML = "";
    alumnos.forEach((alumno) => {
        const li = document.createElement("li");
        li.className = "list-group-item list-group-item-action";
        li.textContent = `Curso: ${alumno.curso} del Colegio: ${alumno.colegio}`;
        li.addEventListener("click", () => {
            cargarDatosFormulario(alumno);
            deshabilitarCampos();
            document.getElementById("editButton").disabled = false;
            document.getElementById("saveEditButton").disabled = true;
            const modal = bootstrap.Modal.getInstance(document.getElementById("selectionModal"));
            modal.hide();
        });
        modalOptions.appendChild(li);
    });

    const modal = new bootstrap.Modal(document.getElementById("selectionModal"));
    modal.show();
}

function mostrarMensaje(mensaje, tipo = "success") {
    const alertContainer = document.getElementById("alert-container");
    const alert = document.createElement("div");
    alert.className = `alert alert-${tipo}`;
    alert.textContent = mensaje;
    alertContainer.appendChild(alert);
    setTimeout(() => alert.remove(), 3000);
}

// Eventos
document.getElementById("searchForm").addEventListener("submit", buscarAlumno);
document.getElementById("editButton").addEventListener("click", habilitarCampos);


function resetFormulario() {
    document.getElementById("studentForm").reset(); // Resetea los inputs automáticamente
    document.getElementById("dni").removeAttribute("data-id"); // Elimina el atributo data-id

    // Restablecer select al valor inicial manualmente (si es necesario)
    const selects = document.querySelectorAll("#studentForm select");
    selects.forEach(select => {
        select.selectedIndex = 0; // Pone el select en la primera opción
    });

    // Ocultar o deshabilitar botones según sea necesario
    document.getElementById("saveNewButton").hidden = false;
    document.getElementById("saveEditButton").hidden = true;
    document.getElementById("editButton").disabled = true;
    document.getElementById("baja").disabled = true;
}

// Botón de guardar cambios
document.getElementById("saveEditButton").addEventListener("click", async function () {
    const idAlumno = document.getElementById("dni").dataset.id;

    if (!idAlumno) {
        mostrarMensaje("No se encontró el ID del alumno. Selecciona un alumno antes de guardar.", "danger");
        return;
    }

    try {
        // Obtener los datos actuales del alumno desde Firebase
        const alumnoDoc = doc(db, "alumnos", idAlumno);
        const alumnoSnapshot = await getDoc(alumnoDoc);

        if (!alumnoSnapshot.exists()) {
            mostrarMensaje("No se encontró el alumno en la base de datos.", "danger");
            return;
        }

        const alumnoActual = alumnoSnapshot.data();

        // Obtener valores del formulario
        const estadoFormulario = document.getElementById("status").value;
        const fechaFormulario = document.getElementById("date").value;

        // Preparar objeto con los nuevos datos
        const nuevoAlumno = {
            apellido: document.getElementById("surname").value.toUpperCase(),
            nombre: document.getElementById("name").value.toUpperCase(),
            dni: document.getElementById("dni").value,
            colegio: document.getElementById("school").value.toUpperCase(),
            curso: document.getElementById("course").value.toUpperCase(),
            asignatura: document.getElementById("subject").value.toUpperCase(),
            observaciones: document.getElementById("observations").value.toUpperCase(),
            // Condicional para las fechas de alta y baja
            alta: estadoFormulario === "alta" ? fechaFormulario : alumnoActual.alta || "",
            baja: estadoFormulario === "baja" ? fechaFormulario : alumnoActual.baja || "",
        };

        // Actualizar en Firebase
        await updateDoc(alumnoDoc, nuevoAlumno);
        mostrarMensaje("Datos actualizados correctamente.", "success");

        // Restablecer el formulario
        resetFormulario();
    } catch (error) {
        console.error("Error al actualizar los datos del alumno:", error);
        mostrarMensaje("Error al actualizar los datos del alumno.", "danger");
    }
});



document.getElementById("status").addEventListener("change", async function () {
    const idAlumno = document.getElementById("dni").dataset.id;
    if (!idAlumno) {
        mostrarMensaje("No se encontró el ID del alumno. Selecciona un alumno antes de guardar.", "danger");
        return;
    };
    try {
        // Obtener los datos actuales del alumno desde Firebase
        const alumnoDoc = doc(db, "alumnos", idAlumno);
        const alumnoSnapshot = await getDoc(alumnoDoc);
        if (!alumnoSnapshot.exists()) {
            mostrarMensaje("No se encontró el alumno en la base de datos.", "danger");
            return;
        };
        const alumnoActual = alumnoSnapshot.data();
        if(document.getElementById("status").value === "baja"){
            document.getElementById("date").value = alumnoActual.baja;
        } else {
            document.getElementById("date").value = alumnoActual.alta;
        }





    } catch (error) {
        console.error("Error al actualizar la fecha:", error);
        mostrarMensaje("Error al actualizar la fecha.", "danger");
    }
});

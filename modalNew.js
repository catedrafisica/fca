import { db, collection, addDoc, getDocs } from "./firebase.js";

// Cargar opciones dinámicamente
document.addEventListener("DOMContentLoaded", async () => {
  const loadOptions = async (collectionName, selectElement) => {
    const querySnapshot = await getDocs(collection(db, collectionName));
    querySnapshot.forEach((doc) => {
      const option = document.createElement("option");
      option.value = doc.id;
      option.textContent = doc.data().name;
      selectElement.appendChild(option);
    });

    // Agregar opción para "Nuevo"
    const newOption = document.createElement("option");
    newOption.value = `nuevo_${collectionName}`;
    newOption.textContent = `Nuevo ${collectionName.slice(0, -1)}`;
    newOption.classList.add("text-primary");
    selectElement.appendChild(newOption);
  };

  await loadOptions("colegios", document.getElementById("school"));
  await loadOptions("cursos", document.getElementById("course"));
  await loadOptions("asignaturas", document.getElementById("subject"));
});

// Abrir modales
document.getElementById("school").addEventListener("change", () => {
  if (event.target.value === "nuevo_colegios") {
    new bootstrap.Modal(document.getElementById("newSchoolModal")).show();
  }
});
document.getElementById("course").addEventListener("change", () => {
  if (event.target.value === "nuevo_cursos") {
    new bootstrap.Modal(document.getElementById("newCourseModal")).show();
  }
});
document.getElementById("subject").addEventListener("change", () => {
  if (event.target.value === "nuevo_asignaturas") {
    new bootstrap.Modal(document.getElementById("newSubjectModal")).show();
  }
});

const showAlert = (message, type = "success") => {
  const alertContainer = document.getElementById("alert-container");

  // Crear el elemento del mensaje
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`; // Clase de alerta Bootstrap
  alertDiv.role = "alert";
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

  // Añadir el mensaje al contenedor
  alertContainer.appendChild(alertDiv);

  // Configurar tiempo para que desaparezca automáticamente
  setTimeout(() => {
    alertDiv.classList.remove("show"); // Inicia la transición de desaparición
    alertDiv.addEventListener("transitionend", () => {
      alertDiv.remove(); // Elimina el mensaje del DOM después de la transición
    });
  }, 3000); // Tiempo en milisegundos
};


// Guardar nuevo colegio
document.getElementById("saveNewSchool").addEventListener("click", async () => {
  const input = document.getElementById("newSchoolInput").value.trim();
  if (input) {
    try {
      await addDoc(collection(db, "colegios"), { name: input });
      showAlert("El nuevo colegio se añadió exitosamente.", "success");
      location.reload(); // Recargar para actualizar las opciones dinámicas
    } catch (error) {
      console.error("Error al guardar el colegio:", error);
      showAlert("Hubo un problema al añadir el colegio. Inténtelo de nuevo.", "danger");
    }
  } else {
    showAlert("El nombre del colegio no puede estar vacío.", "warning");
  }
});

// Guardar nuevo curso
document.getElementById("saveNewCourse").addEventListener("click", async () => {
  const input = document.getElementById("newCourseInput").value.trim();
  if (input) {
    try {
      await addDoc(collection(db, "cursos"), { name: input });
      showAlert("El nuevo curso se añadió exitosamente.", "success");
      location.reload(); // Recargar para actualizar las opciones dinámicas
    } catch (error) {
      console.error("Error al guardar el curso:", error);
      showAlert("Hubo un problema al añadir el curso. Inténtelo de nuevo.", "danger");
    }
  } else {
    showAlert("El nombre del curso no puede estar vacío.", "warning");
  }
});

// Guardar nueva asignatura
document.getElementById("saveNewSubject").addEventListener("click", async () => {
  const input = document.getElementById("newSubjectInput").value.trim();
  if (input) {
    try {
      await addDoc(collection(db, "asignaturas"), { name: input });
      showAlert("La nueva asignatura se añadió exitosamente.", "success");
      location.reload(); // Recargar para actualizar las opciones dinámicas
    } catch (error) {
      console.error("Error al guardar la asignatura:", error);
      showAlert("Hubo un problema al añadir la asignatura. Inténtelo de nuevo.", "danger");
    }
  } else {
    showAlert("El nombre de la asignatura no puede estar vacío.", "warning");
  }
});

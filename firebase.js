
// Importar funciones necesarias
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBr7W7aBgK3_fZVSxm72J1E1U34WN67TDo",
  authDomain: "registro-de-alumnos-d1f44.firebaseapp.com",
  projectId: "registro-de-alumnos-d1f44",
  storageBucket: "registro-de-alumnos-d1f44.firebasestorage.app",
  messagingSenderId: "998037573498",
  appId: "1:998037573498:web:382f7cbe17f007318dd0c3",
  measurementId: "G-GEEEWNEW6Q"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const studentForm = document.getElementById("studentForm");
const schoolsAccordion = document.getElementById("schoolsAccordion");

studentForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.toUpperCase();
  const surname = document.getElementById("surname").value.toUpperCase();
  const dni = document.getElementById("dni").value;
  let school = document.getElementById("school").value.toUpperCase();
  let course = document.getElementById("course").value.toUpperCase();

  if (school === "NUEVO_COLEGIO") {
    school = document.getElementById("newSchool").value.toUpperCase();
  }
  if (course === "NUEVO_CURSO") {
    course = document.getElementById("newCourse").value.toUpperCase();
  }

  try {
    await addDoc(collection(db, "students"), {
      name,
      surname,
      dni,
      school,
      course,
      status: { state: "Alta", date: new Date().toLocaleDateString("es-ES") },
    });

    // Crear el alert de Bootstrap dinámicamente
    const alertBox = document.createElement('div');
    alertBox.classList.add('alert', 'alert-success', 'alert-dismissible', 'fade', 'show');
    alertBox.setAttribute('role', 'alert');
    alertBox.innerHTML = 'Alumno registrado con éxito. <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';

    // Añadir el alert al contenedor
    const alertContainer = document.getElementById('alert-container');
    alertContainer.appendChild(alertBox);

    // Esperar 2 segundos y luego ocultar el alert, resetear el formulario y cargar los estudiantes
    setTimeout(() => {
      // Ocultar el alert
      alertBox.classList.remove('show');
      alertBox.classList.add('fade');

      // Restablecer el formulario
      studentForm.reset();

      // Restablecer los valores de los selects a su estado predeterminado
      document.getElementById("school").selectedIndex = 0;  // Primer valor predeterminado
      document.getElementById("course").selectedIndex = 0;  // Primer valor predeterminado

      // Si tienes campos adicionales de tipo "Nuevo" (como newSchool, newCourse), también puedes resetearlos:
      document.getElementById("newSchool").value = '';  // Limpiar el campo 'Nuevo Colegio'
      document.getElementById("newCourse").value = '';  // Limpiar el campo 'Nuevo Curso'

      // Llamar a la función que recarga los estudiantes
      loadStudents();
    }, 2000); // Espera 2 segundos antes de ejecutar la acción

  } catch (error) {
    console.error("Error al registrar el alumno:", error);
  }
});

const loadStudents = async () => {
  // Mostrar el spinner de "Cargando..."
  schoolsAccordion.innerHTML = `
    <div class="d-flex justify-content-center my-3">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
  `;

  try {
    const querySnapshot = await getDocs(collection(db, "students"));
    const students = [];

    querySnapshot.forEach((doc) => {
      students.push(doc.data());
    });

    const groupedBySchool = students.reduce((groups, student) => {
      const school = student.school || "Sin colegio";
      if (!groups[school]) {
        groups[school] = {};
      }
      const course = student.course || "Sin curso";
      if (!groups[school][course]) {
        groups[school][course] = [];
      }
      groups[school][course].push(student);
      return groups;
    }, {});

    // Limpiar el spinner antes de añadir los datos
    schoolsAccordion.innerHTML = "";

    Object.keys(groupedBySchool).forEach((school, schoolIndex) => {
      const schoolId = `school-${schoolIndex}`;
      const courses = groupedBySchool[school];

      let courseContent = Object.keys(courses)
        .map((course, courseIndex) => {
          const courseId = `${schoolId}-course-${courseIndex}`;
          const studentsInCourse = courses[course]
            .map(
              (student, idx) =>
                `<tr>
                  <td>${idx + 1}</td>
                  <td>${student.surname}</td>
                  <td>${student.name}</td>
                  <td>${student.dni}</td>
                  <td>${student.status.state} (${student.status.date})</td>
                </tr>`
            )
            .join("");

          return `
            <div class="accordion-item">
              <h2 class="accordion-header" id="heading-${courseId}">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${courseId}" aria-expanded="false" aria-controls="collapse-${courseId}">
                  Curso: ${course}
                </button>
              </h2>
              <div id="collapse-${courseId}" class="accordion-collapse collapse">
                <div class="accordion-body">
                  <table class="table table-bordered">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Apellido</th>
                        <th>Nombre</th>
                        <th>DNI</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>${studentsInCourse}</tbody>
                  </table>
                </div>
              </div>
            </div>`;
        })
        .join("");

      schoolsAccordion.innerHTML += `
        <div class="accordion-item">
          <h2 class="accordion-header" id="heading-${schoolId}">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${schoolId}" aria-expanded="false" aria-controls="collapse-${schoolId}">
              Colegio: ${school}
            </button>
          </h2>
          <div id="collapse-${schoolId}" class="accordion-collapse collapse">
            <div class="accordion-body">
              <div class="accordion" id="coursesAccordion-${schoolId}">
                ${courseContent}
              </div>
            </div>
          </div>
        </div>`;
    });
  } catch (error) {
    console.error("Error al cargar los alumnos:", error);
    schoolsAccordion.innerHTML = `
      <div class="alert alert-danger" role="alert">
        Ocurrió un error al cargar los alumnos. Por favor, inténtelo nuevamente.
      </div>
    `;
  }
};



// Cargar colegios y cursos cuando se cargue la página
document.addEventListener("DOMContentLoaded", () => {
  loadSchoolsAndCourses();
  loadStudents(); // Cargar los alumnos al cargar la página
});

// Función para cargar colegios y cursos desde Firebase
const loadSchoolsAndCourses = async () => {
  try {
    // Consulta a Firebase para obtener todos los estudiantes
    const querySnapshot = await getDocs(collection(db, "students"));
    const schools = new Set();
    const courses = new Set();

    // Recorrer cada estudiante y agregar el colegio y curso a los sets
    querySnapshot.forEach(doc => {
      const student = doc.data();
      if (student.school) {
        schools.add(student.school);  // Agregar colegio
      }
      if (student.course) {
        courses.add(student.course);  // Agregar curso
      }
    });

    // Actualizar las opciones del select de colegios
    const schoolSelect = document.getElementById('school');
    schoolSelect.innerHTML = ''; // Limpiar las opciones existentes

    // Agregar la opción predeterminada "Seleccione un colegio"
    const defaultSchoolOption = document.createElement('option');
    defaultSchoolOption.value = '';
    defaultSchoolOption.disabled = true;
    defaultSchoolOption.selected = true;
    defaultSchoolOption.textContent = 'Seleccione un colegio';
    schoolSelect.appendChild(defaultSchoolOption);

    // Agregar los colegios desde Firebase
    schools.forEach(school => {
      const option = document.createElement('option');
      option.value = school;
      option.textContent = school;
      schoolSelect.appendChild(option);
    });

    // Agregar la opción "Nuevo Colegio"
    const newSchoolOption = document.createElement('option');
    newSchoolOption.value = 'nuevo_colegio';
    newSchoolOption.textContent = 'Nuevo Colegio';
    schoolSelect.appendChild(newSchoolOption);

    // Actualizar las opciones del select de cursos
    const courseSelect = document.getElementById('course');
    courseSelect.innerHTML = ''; // Limpiar las opciones existentes

    // Agregar la opción predeterminada "Seleccione un curso"
    const defaultCourseOption = document.createElement('option');
    defaultCourseOption.value = '';
    defaultCourseOption.disabled = true;
    defaultCourseOption.selected = true;
    defaultCourseOption.textContent = 'Seleccione un curso';
    courseSelect.appendChild(defaultCourseOption);

    // Agregar los cursos desde Firebase
    courses.forEach(course => {
      const option = document.createElement('option');
      option.value = course;
      option.textContent = course;
      courseSelect.appendChild(option);
    });

    // Agregar la opción "Nuevo Curso"
    const newCourseOption = document.createElement('option');
    newCourseOption.value = 'nuevo_curso';
    newCourseOption.textContent = 'Nuevo Curso';
    courseSelect.appendChild(newCourseOption);
  } catch (error) {
    console.error("Error al cargar los colegios y cursos:", error);
  }
};

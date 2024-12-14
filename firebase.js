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
    alert("Alumno registrado con éxito");
    studentForm.reset();
    loadStudents();
  } catch (error) {
    console.error("Error al registrar el alumno:", error);
  }
});

const loadStudents = async () => {
  schoolsAccordion.innerHTML = "";

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
  }
};

document.addEventListener("DOMContentLoaded", loadStudents)

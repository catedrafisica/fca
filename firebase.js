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

  // Inicializar Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  // Captura del formulario
  const studentForm = document.getElementById("studentForm");
  const studentTableBody = document.getElementById("studentTableBody");

  // Guardar datos al enviar el formulario
  studentForm.addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevenir el reinicio del formulario

    // Obtener valores del formulario y convertirlos a mayúsculas
    const name = document.getElementById("name").value.toUpperCase();
    const surname = document.getElementById("surname").value.toUpperCase();
    const dni = document.getElementById("dni").value; // DNI puede mantenerse tal cual
    const school = document.getElementById("school").value.toUpperCase();
    const course = document.getElementById("course").value.toUpperCase();
    const division = document.getElementById("division").value.toUpperCase();

    try {
      // Guardar datos en Firestore
      await addDoc(collection(db, "students"), {
        name,
        surname,
        dni,
        school,
        course,
        division
      });

      alert("¡Alumno registrado con éxito!");
      studentForm.reset(); // Limpiar el formulario
      loadStudents(); // Actualizar tabla
    } catch (error) {
      console.error("Error al guardar alumno:", error);
    }
  });

  // Cargar datos desde Firestore y mostrarlos en la tabla
  const loadStudents = async () => {
    studentTableBody.innerHTML = ""; // Limpiar la tabla

    try {
      const querySnapshot = await getDocs(collection(db, "students"));
      let index = 1;

      querySnapshot.forEach((doc) => {
        const student = doc.data();
        const row = `
          <tr>
            <td>${index++}</td>
            <td>${student.name}</td>
            <td>${student.surname}</td>
            <td>${student.dni}</td>
            <td>${student.school}</td>
            <td>${student.course}</td>
            <td>${student.division}</td>
          </tr>
        `;
        studentTableBody.innerHTML += row;
      });
    } catch (error) {
      console.error("Error al cargar alumnos:", error);
    }
  };

  // Cargar estudiantes al cargar la página
  document.addEventListener("DOMContentLoaded", loadStudents);

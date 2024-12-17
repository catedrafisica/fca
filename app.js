import { db, collection, getDocs, query, where } from "./firebase.js";

// Función para generar acordeones de colegios
async function generarAcordeones() {
  const acordeonContainer = document.getElementById("colegios-accordion");

  // Mostrar spinner de cargando antes de iniciar
  acordeonContainer.innerHTML = `
  <div class="d-flex flex-column justify-content-center align-items-center my-4">
    <div class="spinner-border text-primary" role="status"></div>
    <p class="mt-2 text-center">Cargando...</p>
  </div>
  `;

  try {
    const colegiosSnapshot = await getDocs(collection(db, "colegios"));

    // Limpiar el contenido del contenedor después de cargar
    acordeonContainer.innerHTML = "";

    if (colegiosSnapshot.empty) {
      acordeonContainer.innerHTML = `
        <div class="alert alert-warning text-center">
          No hay colegios registrados.
        </div>`;
      return;
    }

    // Ordenar colegios alfabéticamente
    const colegiosArray = colegiosSnapshot.docs
      .map((doc) => doc.data())
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    let index = 0; // Contador para IDs únicos
    for (const colegio of colegiosArray) {
      const colegioName = colegio.name || "Colegio sin nombre";

      // Crear un acordeón por cada colegio
      const acordeonItem = document.createElement("div");
      acordeonItem.classList.add("accordion-item");

      // Generar HTML del acordeón
      acordeonItem.innerHTML = `
        <h2 class="accordion-header" id="heading-${index}">
          <button class="accordion-button collapsed" 
                  type="button" 
                  data-bs-toggle="collapse" 
                  data-bs-target="#collapse-${index}" 
                  aria-expanded="false" 
                  aria-controls="collapse-${index}">
            ${colegioName}
          </button>
        </h2>
        <div id="collapse-${index}" 
             class="accordion-collapse collapse" 
             aria-labelledby="heading-${index}" 
             data-bs-parent="#colegios-accordion">
          <div class="accordion-body">
            <!-- Acordeón de Cursos -->
            <div class="accordion" id="cursos-accordion-${index}">
              <div class="d-flex justify-content-center align-items-center my-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visualmente-hidden">Cargando...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      acordeonContainer.appendChild(acordeonItem);

      // Cargar los cursos basados en los alumnos del colegio
      await cargarCursosPorAlumnos(colegioName, `cursos-accordion-${index}`);
      index++;
    }
  } catch (error) {
    console.error("Error al obtener colegios: ", error);
    acordeonContainer.innerHTML = `
      <div class="alert alert-danger text-center">
        Error al cargar los datos. Inténtalo más tarde.
      </div>`;
  }
}

// Función para procesar y ordenar los cursos por año y división
function parseCurso(curso) {
  const match = curso.match(/(\d+)°\s(\d+)°/); // Extraer año y división
  return match ? { year: parseInt(match[1]), division: parseInt(match[2]) } : { year: 0, division: 0 };
}

// Función para cargar los cursos filtrados por alumnos de un colegio
async function cargarCursosPorAlumnos(colegioName, cursosAccordionId) {
  const cursosAccordion = document.getElementById(cursosAccordionId);

  // Mostrar spinner mientras se cargan los cursos
  cursosAccordion.innerHTML = `
    <div class="d-flex justify-content-center align-items-center my-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visualmente-hidden">Cargando...</span>
      </div>
    </div>
  `;

  try {
    const alumnosQuery = query(
      collection(db, "alumnos"),
      where("colegio", "==", colegioName) // Filtrar por nombre del colegio
    );

    const alumnosSnapshot = await getDocs(alumnosQuery);

    // Limpiar el contenido después de cargar
    cursosAccordion.innerHTML = "";

    if (alumnosSnapshot.empty) {
      cursosAccordion.innerHTML = `
        <div class="alert alert-warning text-center">
          No hay alumnos registrados en este colegio.
        </div>`;
      return;
    }

    // Agrupar los cursos únicos a partir de los datos de los alumnos
    const cursosMap = new Map();
    alumnosSnapshot.forEach((doc) => {
      const alumno = doc.data();
      if (alumno.curso && alumno.asignatura) {
        if (!cursosMap.has(alumno.curso)) {
          cursosMap.set(alumno.curso, new Set());
        }
        cursosMap.get(alumno.curso).add(alumno.asignatura);
      }
    });

    // Ordenar cursos por año y división
    const cursosArray = Array.from(cursosMap.keys()).sort((a, b) => {
      const cursoA = parseCurso(a);
      const cursoB = parseCurso(b);
      if (cursoA.year !== cursoB.year) return cursoA.year - cursoB.year;
      return cursoA.division - cursoB.division;
    });

    let cursoIndex = 0;
    for (const cursoName of cursosArray) {
      const asignaturasSet = cursosMap.get(cursoName);
      const asignaturasList = Array.from(asignaturasSet).sort().join(", ");

      const cursoItem = document.createElement("div");
      cursoItem.classList.add("accordion-item");

      cursoItem.innerHTML = `
        <h2 class="accordion-header" id="heading-curso-${cursoIndex}">
          <button class="accordion-button collapsed" 
                  type="button" 
                  data-bs-toggle="collapse" 
                  data-bs-target="#collapse-curso-${cursoIndex}" 
                  aria-expanded="false" 
                  aria-controls="collapse-curso-${cursoIndex}">
            ${cursoName} (${asignaturasList})
          </button>
        </h2>
        <div id="collapse-curso-${cursoIndex}" 
             class="accordion-collapse collapse" 
             aria-labelledby="heading-curso-${cursoIndex}" 
             data-bs-parent="#${cursosAccordionId}">
          <div class="accordion-body">
            <h5>Alumnos del curso:</h5>
            <table class="table table-striped table-hover">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Apellido</th>
                  <th>Nombre</th>
                  <th>DNI</th>
                  <th>Alta</th>
                  <th>Baja</th>
                  <th>Asistencia</th>
                  <th>Notas</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody id="tabla-alumnos-curso-${cursoIndex}">
                <tr>
                  <td colspan="5" class="text-center">Cargando alumnos...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;

      cursosAccordion.appendChild(cursoItem);

      // Cargar alumnos por curso
      await cargarAlumnosPorCurso(colegioName, cursoName, `tabla-alumnos-curso-${cursoIndex}`);
      cursoIndex++;
    }
  } catch (error) {
    console.error(`Error al obtener cursos para el colegio ${colegioName}: `, error);
    cursosAccordion.innerHTML = `
      <div class="alert alert-danger text-center">
        Error al cargar los cursos.
      </div>`;
  }
}

// Función para cargar los alumnos de un curso
async function cargarAlumnosPorCurso(colegioName, cursoName, tablaId) {
  const tablaAlumnos = document.getElementById(tablaId);
  tablaAlumnos.innerHTML = ""; // Limpiar antes de cargar

  try {
    const alumnosQuery = query(
      collection(db, "alumnos"),
      where("colegio", "==", colegioName),
      where("curso", "==", cursoName)
    );

    const alumnosSnapshot = await getDocs(alumnosQuery);

    if (alumnosSnapshot.empty) {
      tablaAlumnos.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-warning">
            No hay alumnos registrados en este curso.
          </td>
        </tr>`;
      return;
    }

    const alumnosArray = [];
    alumnosSnapshot.forEach((doc) => {
      const alumno = doc.data();
      alumnosArray.push({
        apellido: alumno.apellido || "Sin apellido",
        nombre: alumno.nombre || "Sin nombre",
        dni: alumno.dni || "Sin DNI",
        alta: alumno.alta || "Sin alta",
        baja: alumno.baja || "Sin baja",
        asistencia: alumno.asistencias || "Sin asistencia",
        nota: alumno.notas || "Sin notas",
        observaciones: alumno.observaciones || "Sin observaciones"
      });
    });

    // Ordenar alumnos por apellido y nombre
    alumnosArray.sort((a, b) => {
      if (a.apellido.toLowerCase() !== b.apellido.toLowerCase()) {
        return a.apellido.toLowerCase().localeCompare(b.apellido.toLowerCase());
      }
      return a.nombre.toLowerCase().localeCompare(b.nombre.toLowerCase());
    });

    let contador = 1;
    alumnosArray.forEach((alumno) => {
      tablaAlumnos.innerHTML += `
        <tr>
          <td>${contador++}</td>
          <td>${alumno.apellido}</td>
          <td>${alumno.nombre}</td>
          <td>${alumno.dni}</td>
          <td>${alumno.alta}</td>
          <td>${alumno.baja}</td>
          <td>${alumno.asistencia}</td>
          <td>${alumno.nota}</td>
          <td>${alumno.observaciones}</td>
        </tr>`;
    });
  } catch (error) {
    console.error(`Error al obtener alumnos del curso ${cursoName}: `, error);
    tablaAlumnos.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-danger">
          Error al cargar los alumnos.
        </td>
      </tr>`;
  }
}

// Llamar a la función principal
generarAcordeones();

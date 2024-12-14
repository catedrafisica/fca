document.addEventListener('DOMContentLoaded', function () {
    // Obtener elementos del DOM
    const schoolSelect = document.getElementById('school');
    const courseSelect = document.getElementById('course');
    const saveNewSchoolButton = document.getElementById('saveNewSchool');
    const saveNewCourseButton = document.getElementById('saveNewCourse');
    const newSchoolInput = document.getElementById('newSchoolInput');
    const newCourseInput = document.getElementById('newCourseInput');

    // Abrir modal "Nuevo Colegio" al seleccionar "Nuevo Colegio"
    schoolSelect.addEventListener('change', function () {
      if (this.value === 'nuevo_colegio') {
        const newSchoolModal = new bootstrap.Modal(document.getElementById('newSchoolModal'));
        newSchoolModal.show();
      }
    });

    // Abrir modal "Nuevo Curso" al seleccionar "Nuevo Curso"
    courseSelect.addEventListener('change', function () {
      if (this.value === 'nuevo_curso') {
        const newCourseModal = new bootstrap.Modal(document.getElementById('newCourseModal'));
        newCourseModal.show();
      }
    });

    // Guardar el nuevo colegio y añadirlo al select
    saveNewSchoolButton.addEventListener('click', function () {
      const newSchoolName = newSchoolInput.value.trim();
      if (newSchoolName) {
        const option = document.createElement('option');
        option.value = newSchoolName; // Usar el texto ingresado como valor directamente
        option.textContent = newSchoolName;
        schoolSelect.appendChild(option);
        schoolSelect.value = option.value; // Seleccionar automáticamente la nueva opción
        newSchoolInput.value = ''; // Limpiar el input
        const newSchoolModal = bootstrap.Modal.getInstance(document.getElementById('newSchoolModal'));
        newSchoolModal.hide();
      } else {
        alert('Por favor, ingrese un nombre válido para el colegio.');
      }
    });

    // Guardar el nuevo curso y añadirlo al select
    saveNewCourseButton.addEventListener('click', function () {
      const newCourseName = newCourseInput.value.trim();
      if (newCourseName) {
        const option = document.createElement('option');
        option.value = newCourseName; // Usar el texto ingresado como valor directamente
        option.textContent = newCourseName;
        courseSelect.appendChild(option);
        courseSelect.value = option.value; // Seleccionar automáticamente la nueva opción
        newCourseInput.value = ''; // Limpiar el input
        const newCourseModal = bootstrap.Modal.getInstance(document.getElementById('newCourseModal'));
        newCourseModal.hide();
      } else {
        alert('Por favor, ingrese un nombre válido para el curso.');
      }
    });
  });
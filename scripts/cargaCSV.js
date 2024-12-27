document.getElementById("boton-cargar-csv").addEventListener("click", () => {
    const fileInput = document.getElementById("archivo-csv");
    const file = fileInput.files[0];
  
    if (!file) {
      alert("Por favor, selecciona un archivo CSV.");
      return;
    }
  
    Papa.parse(file, {
      header: true, // El archivo CSV tiene encabezados
      skipEmptyLines: true, // Ignorar filas vacías
      complete: function(results) {
        // Array para almacenar los objetos de alumnos
        const alumnos = results.data.map((row) => ({
          apellido: row.apellido.trim(),
          nombre: row.nombre.trim(),
          dni: row.dni.trim(),
          carrera: row.carrera.trim(),
          añoIngreso: parseInt(row.añoIngreso, 10),
          nombreMateria: row.nombreMateria.trim(),
          grupo: row.grupo.trim(),
          tipoCursada: row.tipoCursada.trim(),
          fechaCursada: row.fechaCursada.trim(),
          observaciones: row.observaciones ? row.observaciones.trim() : "Sin observaciones"
        }));
  
        // Mostrar los objetos alumnos en la consola
        console.log("Alumnos procesados:", alumnos);
  
        // Aquí puedes usar el array `alumnos` para otras tareas, como cargarlo en Firebase
      },
      error: function(error) {
        console.error("Error al procesar el archivo CSV:", error);
      }
    });
  });
  
document.addEventListener("DOMContentLoaded", () => {
  // Valores predeterminados
  const valoresPredeterminados = {
    apellido: "GoMEZ",
    nombre: "JuAN",
    documento: "12.345.678",
    seleccionIngreso: "FCA - UNNE",
    añoIngreso: new Date().getFullYear(),
    materia: "FÍSICA I",
    grupo: "GRUPO 1",
    tipoCursada: "NUEVO CURSANTE",
    fechaCursada: new Date().toISOString().split("T")[0], // Fecha actual en formato YYYY-MM-DD
    observaciones: "SIN OBSERVACIONES"
  };

  // Rellenar los campos del formulario
  document.getElementById("apellido").value = valoresPredeterminados.apellido;
  document.getElementById("nombre").value = valoresPredeterminados.nombre;
  document.getElementById("documento").value = valoresPredeterminados.documento;
  document.getElementById("seleccion-ingreso").value = valoresPredeterminados.seleccionIngreso;
  document.getElementById("año-ingreso").value = valoresPredeterminados.añoIngreso;
  document.getElementById("materia").value = valoresPredeterminados.materia;
  document.getElementById("grupo").value = valoresPredeterminados.grupo;
  document.getElementById("tipo-cursada").value = valoresPredeterminados.tipoCursada;
  document.getElementById("fecha-cursada").value = valoresPredeterminados.fechaCursada;
  document.getElementById("observaciones").value = valoresPredeterminados.observaciones;

  // Mensaje de notificación
  console.log("Borrar linea:1 al 30 - Formulario rellenado con valores predeterminados.");
});



// 1- Apellido, nombre y DNI
document.getElementById("documento").addEventListener("input", (event) => {
  let valor = event.target.value.replace(/\D/g, ''); // Remover caracteres no numéricos
  if (valor.length > 8) valor = valor.slice(0, 8);   // Limitar a 8 dígitos
  valor = valor.replace(/(\d{2})(\d{3})(\d{3})/, '$1.$2.$3'); // Formato XX.XXX.XXX
  event.target.value = valor;
});
// 2- Ingreso a Carrera año
document.getElementById("año-actual").addEventListener("change", (event) => {
  const añoIngreso = document.getElementById("año-ingreso");
  if (event.target.checked) {
    const añoActual = new Date().getFullYear();
    añoIngreso.value = añoActual;  // Establecer el año actual
    añoIngreso.disabled = true;    // Deshabilitar el campo
  } else {
    añoIngreso.value = '';         // Limpiar el valor
    añoIngreso.disabled = false;   // Habilitar el campo
  }
});

// 3- Incripción a materia fecha
document.getElementById("fecha-actual").addEventListener("change", function () {
  let fechaCursada = document.getElementById("fecha-cursada");
  if (this.checked) {
    fechaCursada.value = new Date().toISOString().split('T')[0];
    fechaCursada.disabled = true;
  } else {
    fechaCursada.value = ""
    fechaCursada.disabled = false;
  };
});
// 4- Controla la barra de progreso y si carga .csv 
document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("formulario-alumno");
  const barraProgreso = document.getElementById("barra-progreso");
  const camposRequeridos = Array.from(formulario.querySelectorAll("input[required], select[required], textarea[required]"));
  const archivoCSVInput = document.getElementById("archivo-csv");
  const añoIngresoInput = document.getElementById("año-ingreso");
  const añoActualCheckbox = document.getElementById("año-actual");
  const fechaCursadoInput = document.getElementById("fecha-cursada");
  const fechaActualCheckbox = document.getElementById("fecha-actual");

  // Función para actualizar el progreso
  const actualizarProgreso = (porcentaje = null) => {
    if (typeof porcentaje === "number") {
      barraProgreso.style.width = `${porcentaje}%`;
      barraProgreso.setAttribute("aria-valuenow", porcentaje);
      barraProgreso.textContent = `${porcentaje}%`;
      return;
    }

    const camposLlenos = camposRequeridos.filter(campo => {
      if (campo.type === "checkbox") {
        return campo.checked;
      }
      return campo.value.trim() !== "";
    }).length;

    const progreso = Math.round((camposLlenos / camposRequeridos.length) * 100);
    barraProgreso.style.width = `${progreso}%`;
    barraProgreso.setAttribute("aria-valuenow", progreso);
    barraProgreso.textContent = `${progreso}%`;
  };

  // Función para gestionar el cambio en los checkboxes de año actual y fecha actual
  const gestionarCheckboxesAño = () => {
    const añoActual = new Date().getFullYear();

    if (añoActualCheckbox.checked) {
      añoIngresoInput.value = añoActual;
      añoIngresoInput.disabled = true;
    } else {
      if (añoIngresoInput.value === String(añoActual)) {
        // Mantener el valor actual si coincide con el año asignado automáticamente
        añoIngresoInput.value = "";
      }
      añoIngresoInput.disabled = false;
    }
    actualizarProgreso();
  };
  // Función para gestionar el cambio en los checkboxes
  const gestionarCheckboxesFecha = () => {
    const fechaActual = new Date().toISOString().split("T")[0];

    if (fechaActualCheckbox.checked) {
      fechaCursadoInput.value = fechaActual;
      fechaCursadoInput.disabled = true;
    } else {
      if (fechaCursadoInput.value === fechaActual) {
        // Mantener el valor actual si coincide con la fecha asignada automáticamente
        fechaCursadoInput.value = "";
      }
      fechaCursadoInput.disabled = false;
    }

    actualizarProgreso();
  };


  // Función para gestionar la interacción con el campo de archivo CSV
  const gestionarCargaArchivo = () => {
    if (!archivoCSVInput.disabled) {
      archivoCSVInput.disabled = false; // Habilitar el campo CSV
      actualizarProgreso(0); // Resetear barra de progreso a 0%
    }
  };

  // Función para bloquear y limpiar todos los campos
  const bloquearCampos = () => {
    camposRequeridos.forEach(campo => {
      campo.value = "";
      campo.checked = false;
      campo.disabled = true;
    });
    document.getElementById("observaciones").value = "";
    document.getElementById("observaciones").disabled = true;
    // Deshabilitar y deschequear los checkboxes
    añoActualCheckbox.checked = false;
    añoActualCheckbox.disabled = true;

    fechaActualCheckbox.checked = false;
    fechaActualCheckbox.disabled = true;
  };

  // Función para restaurar el formulario cuando no se carga un archivo
  const restaurarFormulario = () => {
    archivoCSVInput.value = ""; // Limpiar el valor del archivo

    // Habilitar todos los campos del formulario
    camposRequeridos.forEach(campo => {
      campo.disabled = false;
    });

    // Habilitar los checkboxes
    añoActualCheckbox.disabled = false;
    fechaActualCheckbox.disabled = false;
    document.getElementById("observaciones").disabled = false;

    // Restaurar el progreso
    actualizarProgreso();
  };

  // Evento para manejar clic en el campo de archivo CSV
  archivoCSVInput.addEventListener("click", gestionarCargaArchivo);

  // Restaurar formulario si el archivo no se selecciona
  archivoCSVInput.addEventListener("change", () => {
    const cargarCSV = document.getElementById("boton-cargar-csv");
    const guardarNuevo = document.getElementById("boton-guardar-nuevo");
    const barraProgreso = document.getElementById("barra-progreso");
    if (archivoCSVInput.files.length > 0) {
      bloquearCampos(); // Bloquear otros campos si el archivo se selecciona
      actualizarProgreso(100); // Archivo cargado: progreso al 100%
      cargarCSV.disabled = false;
      guardarNuevo.disabled = true;
      barraProgreso.classList.remove("bg-primary"); 
      barraProgreso.classList.add("bg-success");
    } else {
      restaurarFormulario(); // Restaurar si se cancela la carga
      cargarCSV.disabled = true;
      guardarNuevo.disabled = false;
      barraProgreso.classList.remove("bg-success"); 
      barraProgreso.classList.add("bg-primary"); 
    }
  });

  // Escuchar cambios en los checkboxes de año y fecha actuales
  añoActualCheckbox.addEventListener("change", gestionarCheckboxesAño);
  fechaActualCheckbox.addEventListener("change", gestionarCheckboxesFecha);

  // Escuchar cambios en todos los campos requeridos
  camposRequeridos.forEach(campo => {
    campo.addEventListener("input", () => actualizarProgreso());
    campo.addEventListener("change", () => actualizarProgreso());
  });

  // Inicializar progreso al cargar la página
  actualizarProgreso();
});





//En la UNNE la forma de calificación básica es con números que van del 0 (cero) al 10 (diez). (Art. 2, Res. 473/08 CS)
function obtenerEscalaCualitativa(calificacion) {
  const escalas = {
    0: "Reprobado",
    6: "Aprobado",
    7: "Bueno",
    8: "Muy Bueno",
    9: "Distinguido",
    10: "Sobresaliente"
  };

  if (calificacion >= 1 && calificacion <= 5) return "Insuficiente";
  return escalas[calificacion] || "Calificación inválida";
};

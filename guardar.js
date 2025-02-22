    // Espera 3 segundos (3000 milisegundos) antes de reemplazar el spinner con el título
    setTimeout(function () {
        // Cambia el spinner por el título
        document.getElementById('tituloCarga').innerHTML = '🗓️ Calendario de la Cátedra';
        // Oculta el spinner después de que se haya insertado el texto
        document.getElementById('spinnerContainer').style.visibility = 'hidden';
      }, 1000); 
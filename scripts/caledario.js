document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
        document.getElementById('tituloCalendario').classList.remove('d-none');
        document.getElementById('spinnerContainer').classList.add('d-none');
        document.getElementById('calendario').classList.remove('d-none');
        document.getElementById('descripcionCalendario').classList.remove('d-none');
        const acordeonesContainer = document.getElementById('acordeones');

        // Agregar estilos dinámicamente desde JavaScript
        const style = document.createElement("style");
        style.innerHTML = `
            #descripcionCalendario .accordion {
                margin-bottom: 30px !important; /* Espaciado entre acordeones */
            }
        `;
        document.head.appendChild(style);

        acordeonesContainer.innerHTML = `
        <div class="accordion mb-4" id="accordionFisicaI">
            <div class="accordion-item">
                <h2 class="accordion-header" id="headingFisicaI">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFisicaI" aria-expanded="false" aria-controls="collapseFisicaI">
                        Física I
                    </button>
                </h2>
                <div id="collapseFisicaI" class="accordion-collapse collapse" aria-labelledby="headingFisicaI" data-bs-parent="#accordionFisicaI">
                    <div class="accordion-body">
                        <ul>
                            <li>Este <strong>calendario</strong> incluye las fechas de clases teóricas, laboratorios, prácticas, evaluaciones parciales y exámenes finales.</li>
                            <li>La <strong>réplica de Física I</strong> Trabajos Prácticos y Laboratorios con un solo grupo son de <strong>08:00 a 10:00</strong>.</li>
                            <ul>
                                <li>Hasta el <strong>1° Parcial</strong>: Ing. Agr. (Mgter.) YFRAN ELVIRA, María de las Mercedes y Ing. Agr. (Dra) ESPASANDIN, Fabiana Daniela.</li>
                                <li>Hasta el <strong>2° Parcial</strong>: Lic. MARTINEZ, Fernando A. y Prof. ALTERATS, Augusto Rodrigo.</li>
                            </ul>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    
        <div class="accordion mb-4" id="accordionFisicaII">
            <div class="accordion-item">
                <h2 class="accordion-header" id="headingFisicaII">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFisicaII" aria-expanded="false" aria-controls="collapseFisicaII">
                        Física II
                    </button>
                </h2>
                <div id="collapseFisicaII" class="accordion-collapse collapse" aria-labelledby="headingFisicaII" data-bs-parent="#accordionFisicaII">
                    <div class="accordion-body">
                        <ul>
                            <li>Las fechas de <strong>exámenes finales de Física II (*)</strong> se solicitarán para ser trasladadas al viernes siguiente.</li>
                            <li>Horarios de <strong>Grupos de Laboratorio de Física II</strong>, los días viernes:
                                <ul>
                                    <li><strong>Grupo 1:</strong> de 07:00 a 09:00 - Lic. MARTINEZ, Fernando A. y Prof. ALTERATS, Augusto Rodrigo.</li>
                                    <li><strong>Grupo 2:</strong> de 09:00 a 11:00 - Lic. MARTINEZ, Fernando A. y Prof. ALTERATS, Augusto Rodrigo.</li>
                                    <li><strong>Grupo 3:</strong> de 11:00 a 13:00 - Lic. MARTINEZ, Fernando A. y Prof. ALTERATS, Augusto Rodrigo.</li>
                                    <li><strong>Grupo 4:</strong> de 14:00 a 16:00 - Ing. Agr. (Mgter.) CESPEDES FLORES, Flora Elizabet.</li>
                                    <li><strong>Grupo 5:</strong> de 16:00 a 18:00 - Ing. Agr. (Mgter.) CESPEDES FLORES, Flora Elizabet.</li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;




        var calendarEl = document.getElementById('calendario');
        var calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'es',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            buttonText: {
                today: 'Hoy',
                month: 'Mes',
                week: 'Semana',
                day: 'Día',
                list: 'Lista'
            },
            allDayText: 'Todo',

            eventSources: [{
                events: function (fetchInfo, successCallback, failureCallback) {
                    let eventos = [
                        //Replica Física I
                        { title: 'FI - Práctico Serie 01:\nMediciones', start: '2025-02-19', className: 'event-practico' },
                        { title: 'FI - Práctico Serie 02:\nEstática', start: '2025-02-26', className: 'event-practico' },
                        { title: 'FI - Práctico Serie 03:\nCinemática', start: '2025-03-05', className: 'event-practico' },
                        { title: 'FI - Práctico Serie 04:\nDinámica', start: '2025-03-12', className: 'event-practico' },
                        { title: 'FI - Práctico Serie 05:\nTrabajo y Energía', start: '2025-04-09', className: 'event-practico' },
                        { title: 'FI - Práctico Serie 06:\nMovimiento Armónico Simple', start: '2025-04-16', className: 'event-practico' },
                        { title: 'FI - Práctico Serie 07:\nCalor y temperatura', start: '2025-04-23', className: 'event-practico' },
                        { title: 'FI - Práctico Serie 08:\nTermodinámica', start: '2025-04-30', className: 'event-practico' },
                        { title: 'FI - Práctico Serie 09:\nCircuitos eléctricos', start: '2025-05-07', className: 'event-practico' },

                        { title: 'FI - Primer Parcial', start: '2025-03-19', className: 'event-parciales' },
                        { title: 'FI - Recuperatorio del Primer Parcial', start: '2025-03-26', className: 'event-parciales' },
                        { title: 'FI - Segundo Parcial', start: '2025-05-14', className: 'event-parciales' },
                        { title: 'FI - Recuperatorio del Segundo Parcial', start: '2025-05-16', className: 'event-parciales' },



                        //Clases Teóricas
                        { title: 'FII - Clase Inaugural\nUnidad 01:\nHidrostática', start: '2025-02-20', className: 'event-teoria' },
                        { title: 'FII - Unidad 02:\nHidrodinámica', start: '2025-02-27', className: 'event-teoria' },
                        { title: 'FII - Unidad 03:\nSoluciones no electrolíticas', start: '2025-03-06', className: 'event-teoria' },
                        { title: 'FII - Unidad 04:\nSoluciones diluidas', start: '2025-03-13', className: 'event-teoria' },
                        { title: 'FII - Unidad 05:\nSistemas coloidales', start: '2025-03-20', className: 'event-teoria' },
                        { title: 'FII - Unidad 06:\nAdsorción', start: '2025-04-10', className: 'event-teoria' },
                        { title: 'FII - Unidad 07:\nSoluciones electrolíticas', start: '2025-04-03', className: 'event-teoria' },
                        { title: 'FII - Unidad 08:\nOndas electromagnéticas. Luz', start: '2025-05-08', className: 'event-teoria' },
                        { title: 'FII - Unidad 09:\nIntroducción a la radiactividad', start: '2025-04-24', className: 'event-teoria' },
                        { title: 'FII - Unidad 10:\nEspectro electromagnético', start: '2025-05-08', className: 'event-teoria' },
                        //Laboratorios
                        { title: 'FII - Laboratorio 01:\nTensión Superficial', start: '2025-02-21', className: 'event-laboratorio' },
                        { title: 'FII - Laboratorio 02:\nViscosidad', start: '2025-02-28', className: 'event-laboratorio' },
                        { title: 'FII - Laboratorio 03:\nSolubilidad. Destilación por arrastre', start: '2025-03-07', className: 'event-laboratorio' },
                        { title: 'FII - Laboratorio 04:\nOsmosis', start: '2025-03-14', className: 'event-laboratorio' },
                        { title: 'FII - Laboratorio 05:\nSistemas Coloidales', start: '2025-03-28', className: 'event-laboratorio' },
                        { title: 'FII - Laboratorio 06:\nConductividad y problemas', start: '2025-04-04', className: 'event-laboratorio' },
                        { title: 'FII - Laboratorio 07:\nPH y buffer y problemas', start: '2025-04-11', className: 'event-laboratorio' },
                        //Problemas
                        { title: 'FII - Práctico Serie 01:\nHidrostática', start: '2025-02-22', className: 'event-practico' },
                        { title: 'FII - Práctico Serie 02:\nHidrodinámica', start: '2025-03-08', className: 'event-practico' },
                        { title: 'FII - Práctico Serie 03:\nSoluciones no electrolíticas', start: '2025-03-15', className: 'event-practico' },
                        { title: 'FII - Práctico Serie 04:\nSoluciones diluidas', start: '2025-03-15', className: 'event-practico' },
                        { title: 'FII - Práctico Serie 07:\nRadioactividad (Problemas)', start: '2025-04-25', className: 'event-practico' },
                        //Parciales, Consultas y Recuperatorios
                        { title: 'FII - Consultas del Primer Parcial', start: '2025-03-20', className: 'event-parciales' },
                        { title: 'FII - Primer Parcial', start: '2025-03-21', className: 'event-parciales' },
                        { title: 'FII - Recuperatorio del Primer Parcial', start: '2025-03-27', className: 'event-parciales' },
                        { title: 'FII - Clases de Consulta', start: '2025-05-15', className: 'event-parciales' },
                        { title: 'FII - Segundo Parcial', start: '2025-05-09', className: 'event-parciales' },
                        { title: 'FII - Recuperatorio del Segundo Parcial', start: '2025-05-16', className: 'event-parciales' },
                        { title: 'Cierre de Trimestre', start: '2025-05-17', className: 'event-primary' },
                        // Mesas Finales
                        { title: 'FI - 01° Mesa de Examen', start: '2025-02-10', className: 'event-final' },
                        { title: 'FI - 02° Mesa de Examen', start: '2025-03-21', className: 'event-final' },
                        { title: 'FI - 03° Mesa de Examen', start: '2025-04-21', className: 'event-final' },
                        { title: 'FI - 04° Mesa de Examen', start: '2025-05-26', className: 'event-final' },
                        { title: 'FI - 05° Mesa de Examen', start: '2025-06-30', className: 'event-final' },
                        { title: 'FI - 06° Mesa de Examen (13 h)', start: '2025-08-20', className: 'event-final' },
                        { title: 'FI - 07° Mesa de Examen', start: '2025-09-18', className: 'event-final' },
                        { title: 'FI - 08° Mesa de Examen (13 h)', start: '2025-10-22', className: 'event-final' },
                        { title: 'FI - 09° Mesa de Examen (13 h)', start: '2025-11-12', className: 'event-final' },
                        { title: 'FI - 10° Mesa de Examen', start: '2025-12-18', className: 'event-final' },

                        { title: 'FII - 01° Mesa de Examen', start: '2025-02-12', className: 'event-final' },
                        { title: 'FII - 02° Mesa de Examen *', start: '2025-03-26', className: 'event-final' },
                        { title: 'FII - 03° Mesa de Examen *', start: '2025-04-23', className: 'event-final' },
                        { title: 'FII - 04° Mesa de Examen *', start: '2025-05-28', className: 'event-final' },
                        { title: 'FII - 05° Mesa de Examen *', start: '2025-07-02', className: 'event-final' },
                        { title: 'FII - 06° Mesa de Examen', start: '2025-08-14', className: 'event-final' },
                        { title: 'FII - 07° Mesa de Examen', start: '2025-09-12', className: 'event-final' },
                        { title: 'FII - 08° Mesa de Examen', start: '2025-10-17', className: 'event-final' },
                        { title: 'FII - 09° Mesa de Examen', start: '2025-11-07', className: 'event-final' },
                        { title: 'FII - 10° Mesa de Examen', start: '2025-12-19', className: 'event-final' },



                    ];
                    successCallback(eventos);
                }
            }],

            eventContent: function (arg) {
                let eventTitle = arg.event.title.split("\n").map(line => `<div>${line}</div>`).join("");
                return { domNodes: [document.createRange().createContextualFragment(eventTitle)] };
            }
        });

        calendar.render();
    }, 1000);
});

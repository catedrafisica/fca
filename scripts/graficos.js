import Alumnos from './alumnosClass.js';
import { alumnosFirebase } from './firebase.js';

setTimeout(function () {
    Chart.register(ChartDataLabels);
    let chartInstance = null; // Para almacenar el gráfico actual
    let chartInstanceAsistencia = null; // Para almacenar el gráfico de asistencia por grupo
    let materiaSeleccionada = "Física I"; // Materia predeterminada

    // ✅ Mostrar elementos gráficos
    document.getElementById('tituloGraficos').classList.remove('d-none');
    document.getElementById('spinnerContainer').classList.add('d-none');
    document.getElementById('descripcionGraficos').classList.remove('d-none');
    document.getElementById('selectMateria').classList.remove('d-none');

    // ✅ Obtener datos de alumnos desde Firebase
    async function getAlumnosData() {
        const estudiantes = await alumnosFirebase;
        const alumnosObj = new Alumnos();
        for (const alumno of estudiantes) {
            const { materia, grupo, name, dni, lu, condicion, mail, celular, asistencia, notas, observaciones } = alumno;
            alumnosObj.agregarAlumno(materia, grupo, name, dni, lu, condicion, mail, celular, asistencia, notas, observaciones);
        }
        return alumnosObj.data;
    }

    // ✅ Función para destruir el gráfico anterior antes de generar uno nuevo
    function destruirGraficoAnterior() {
        if (chartInstance && chartInstance.destroy) {
            chartInstance.destroy();
            chartInstance = null;
        }
    }

    // ✅ Función para generar gráficos
    async function generarGraficos(materia) {
        destruirGraficoAnterior();
        const alumnos = await getAlumnosData();
        materiaSeleccionada = materia;

        if (!alumnos[materiaSeleccionada]) {
            if (chartInstanceAsistencia) {
                chartInstanceAsistencia.destroy();
            };
            console.error("No hay datos para la materia seleccionada:", materiaSeleccionada);
            return;
        };

        // 🔹 Convertir los datos en un array
        const alumnosArray = Object.entries(alumnos[materiaSeleccionada])
            .sort(([grupoA], [grupoB]) => grupoA.localeCompare(grupoB))
            .flatMap(([grupo, lista]) => lista.map(alumno => ({ ...alumno, grupo })));

        // Inicializar Asistencias
        const topeInasist = 3, topeColoq = 3;
        let totalP = 0, totalA = 0, totalAJ = 0, nulos = 0;
        let alumnosConMasDeTresA = 0, alumnosSinA = 0;
        let matricula = 0;
        let alumnosRegulares = 0, noRegInsitYColoq = 0, regularesPrimeraInstancia = 0,
            regularesSegundaInstancia = 0, regularesTerceraInstancia = 0;

        // Inicializar notas
        let totalNotasAprobadas = 0, totalNotasDesaprobadas = 0, totalNotasAusentes = 0, desapColoqAlumno = 0, aprobColoqAlumno = 0;
        let sinDesaprobados = 0, entre1y3Desaprobados = 0, masDe3Desaprobados = 0;

        // 🔹 Inicializar contadores
        let aprobParcial1 = 0, desapParcial1 = 0, ausentesParcial1 = 0;
        let aprobRecup1 = 0, desapRecup1 = 0, ausentesRecup1 = 0;
        let aprobParcial2 = 0, desapParcial2 = 0, ausentesParcial2 = 0;
        let aprobRecup2 = 0, desapRecup2 = 0, ausentesRecup2 = 0;
        let aprobExtra = 0, desapExtra = 0, ausentesExtra = 0;

        // Recorrer todos los alumnos y contar los valores de asistencia
        alumnosArray.forEach(({ asistencia, notas, dni }) => {
            let ausentes = 0;

            if (Array.isArray(asistencia)) {
                totalP += asistencia.filter(a => a?.valor === "P").length;
                totalA += asistencia.filter(a => a?.valor === "A").length;
                totalAJ += asistencia.filter(a => a?.valor === "AJ").length;
                ausentes = asistencia.filter(a => a?.valor === "A").length; // Contar las "A" de este alumno
                nulos += asistencia.filter(a => a?.valor === null).length
            };
            const arrayParciales = [
                "Primer Parcial",
                "Recuperatorio del Primer Parcial",
                "Segundo Parcial",
                "Recuperatorio del Segundo Parcial",
                "Parcial Extra"
            ];

            if (Array.isArray(notas)) {
                totalNotasAprobadas += notas.filter(a => a?.valor !== null && a?.valor >= 6 && !arrayParciales.includes(a?.actividad)).length;
                totalNotasDesaprobadas += notas.filter(a => a?.valor !== null && a?.valor > 0 && a?.valor < 6 && !arrayParciales.includes(a?.actividad)).length;
                totalNotasAusentes += notas.filter(a => a?.valor === 0 && !arrayParciales.includes(a?.actividad)).length;
                desapColoqAlumno = notas.filter(a => a?.valor !== null && a?.valor > 0 && a?.valor < 6 && !arrayParciales.includes(a?.actividad)).length;
                aprobColoqAlumno = notas.filter(a => a?.valor !== null && a?.valor >= 6 && !arrayParciales.includes(a?.actividad)).length;
            };

            if (ausentes > topeInasist) {
                alumnosConMasDeTresA++; // 🔹 Sumar al contador si tiene más de topeInasist "A"
            } else if (ausentes === 0) {
                alumnosSinA++;
            }

            if (dni) {
                matricula++;
            };

            if (desapColoqAlumno > topeColoq) {
                masDe3Desaprobados++;
            } else if (desapColoqAlumno > 0 && desapColoqAlumno <= 3) {
                entre1y3Desaprobados++;
            } else if (desapColoqAlumno === 0 && aprobColoqAlumno > 0) {
                sinDesaprobados++;
            };

            if (ausentes + desapColoqAlumno > topeInasist) {
                noRegInsitYColoq++;
            }


            if (Array.isArray(notas)) {
                notas.forEach(a => {
                    if (a?.valor !== null) {
                        if (a.actividad === "Primer Parcial") {
                            if (a.valor >= 6) aprobParcial1++;
                            else if (a.valor > 0 && a.valor < 6) desapParcial1++;
                            else if (a.valor === 0) ausentesParcial1++;
                        }
                        else if (a.actividad === "Recuperatorio del Primer Parcial") {
                            if (a.valor >= 6) aprobRecup1++;
                            else if (a.valor > 0 && a.valor < 6) desapRecup1++;
                            else if (a.valor === 0) ausentesRecup1++;
                        }
                        else if (a.actividad === "Segundo Parcial") {
                            if (a.valor >= 6) aprobParcial2++;
                            else if (a.valor > 0 && a.valor < 6) desapParcial2++;
                            else if (a.valor === 0) ausentesParcial2++;
                        }
                        else if (a.actividad === "Recuperatorio del Segundo Parcial") {
                            if (a.valor >= 6) aprobRecup2++;
                            else if (a.valor > 0 && a.valor < 6) desapRecup2++;
                            else if (a.valor === 0) ausentesRecup2++;
                        }
                        else if (a.actividad === "Parcial Extra") {
                            if (a.valor >= 6) aprobExtra++;
                            else if (a.valor > 0 && a.valor < 6) desapExtra++;
                            else if (a.valor === 0) ausentesExtra++;
                        };
                    };
                });
                let totalAprobados = aprobParcial1 + aprobRecup1 + aprobParcial2 + aprobRecup2 + aprobExtra;
                if (totalAprobados >= 2) alumnosRegulares++;
                // Verificar regularidad en orden, asegurando que solo cuente en una instancia
                if (aprobParcial1 && aprobParcial2) {
                    regularesPrimeraInstancia++; // Primera instancia
                } else if ((aprobParcial1 || aprobRecup1) && (aprobParcial2 || aprobRecup2)) {
                    regularesSegundaInstancia++; // Segunda instancia (con recuperatorio)
                } else if ((aprobParcial1 || aprobRecup1 || aprobParcial2 || aprobRecup2) && aprobExtra) {
                    regularesTerceraInstancia++; // Tercera instancia (con extra)
                }
            };
        });

        // 🔹 Destruir gráfico anterior antes de crear uno nuevo
        destruirGraficoAnterior();

        let activo = false;
        const alumnosRegularesPorc = (100 * alumnosRegulares / matricula);
        let alumnosNoRegPorc = 100 - alumnosRegularesPorc;
        const noRegInsitYColoqPorc = (100 * noRegInsitYColoq / matricula);
        if (alumnosRegulares === 0){
            activo = true;
            alumnosNoRegPorc = 100 - noRegInsitYColoqPorc;
        };
        const regularesPrimeraInstanciaPorc = (100 * regularesPrimeraInstancia / matricula);
        const regularesSegundaInstanciaPorc = (100 * regularesSegundaInstancia / matricula);
        const regularesTerceraInstanciaPorc = (100 * regularesTerceraInstancia / matricula);
    
        crearGrafico(materiaSeleccionada, matricula, activo, [alumnosRegularesPorc, alumnosNoRegPorc, noRegInsitYColoqPorc, regularesPrimeraInstanciaPorc, regularesSegundaInstanciaPorc, regularesTerceraInstanciaPorc]);
        // 📌 Gráfico N° 1
        let alumnosSinA2 = alumnosSinA;
        if (nulos === matricula) {
            alumnosSinA2 = 0;
        };
        const totalAsist = (totalP + totalA) ? (totalP + totalA) : 1;
        const asistenciaPorc = totalP / totalAsist;
        const inasistenciaPorc = (totalA) / totalAsist;
        const alumnosConMasDeTresAPorc = alumnosConMasDeTresA / matricula;
        const alumnosSinAPorc = alumnosSinA2 / matricula;
        const alumnosEntreCeroYTresPorc = 1 - (alumnosConMasDeTresA + alumnosSinA) / matricula;

        const totalColoq = (totalNotasAprobadas + totalNotasAusentes + totalNotasDesaprobadas) ? (totalNotasAprobadas + totalNotasAusentes + totalNotasDesaprobadas) : 1;
        const coloqAprobPorc = totalNotasAprobadas / totalColoq;
        const coloqDesapPorc = (totalNotasDesaprobadas + totalNotasAusentes) / totalColoq;
        const masDe3DesaprobadosPorc = masDe3Desaprobados / matricula;
        const sinDesaprobadosPorc = sinDesaprobados / matricula;
        const entre1y3DesaprobadosPorc = entre1y3Desaprobados / matricula;

        const aprobParcial1Porc = aprobParcial1 / matricula;
        const aprobRecup1Porc = aprobRecup1 / matricula;
        const aprobParcial2Porc = aprobParcial2 / matricula;
        const aprobRecup2Porc = aprobRecup2 / matricula;
        const aprobExtraPorc = aprobExtra / matricula;

        const datosEvaluaciones = {
            "Asist./Aprob./1° Parcial": [asistenciaPorc, coloqAprobPorc, aprobParcial1Porc],
            "Inasist./Desap.Coloquios/Aprob.1° Recup.": [inasistenciaPorc, coloqDesapPorc, aprobRecup1Porc],
            "Cant. = 0 y Aprob. 2° Parcial": [alumnosSinAPorc, sinDesaprobadosPorc, aprobParcial2Porc],
            ["0 < Cant. ≤ " + topeInasist + " y Aprob. 2° Recup."]: [alumnosEntreCeroYTresPorc, entre1y3DesaprobadosPorc, aprobRecup2Porc],
            ["Cant. > " + topeInasist + " y Aprob. Extra"]: [alumnosConMasDeTresAPorc, masDe3DesaprobadosPorc, aprobExtraPorc],
        };

        // 📌 Función para formatear los valores como porcentaje con un decimal
        function formatearPorcentaje(valor) {
            return (valor.toFixed(1)).replace(".", ",") + "%";
        }

        // 📌 Convertir los datos en porcentajes
        const datasets = Object.keys(datosEvaluaciones).map((evaluacion, index) => ({
            label: evaluacion,
            data: datosEvaluaciones[evaluacion].map(valor => parseFloat((valor * 100).toFixed(1))), // Convertimos a porcentaje
            backgroundColor: ["rgba(75, 192, 192, 0.4)", "rgba(255, 206, 86, 0.4)", "rgba(54, 162, 235, 0.4)", "rgba(153, 102, 255, 0.4)", "rgba(255, 99, 132, 0.4)"][index],
            borderColor: "rgba(169, 169, 169, 1)",
            borderWidth: 1
        }));

        // 📌 Crear gráfico de Evaluaciones
        chartInstance = new Chart(document.getElementById("datosChart"), {
            type: "bar",
            data: {
                labels: ["Asistencias e Inasistencias", "Coloquios e Informes de Laboratorios", "Parciales y Recuperatorios"],
                datasets
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: `Gráfico de Asistencias, Coloquios, Informes de Lab. y Parciales - ${materiaSeleccionada} (${matricula} alumnos)`,
                        font: { size: 25, weight: "bold" }
                    },
                    datalabels: {
                        anchor: 'end',
                        align: 'top',
                        formatter: value => formatearPorcentaje(value),
                        font: { size: 12, weight: 'bold', color: '#333' }
                    },
                    tooltip: {  // 🔹 Corregí la estructura del tooltip
                        callbacks: {
                            label: function (tooltipItem) {
                                let datasetIndex = tooltipItem.datasetIndex; // Grupo de barras
                                let dataIndex = tooltipItem.dataIndex; // Posición dentro del grupo

                                // 🔹 Definir textos personalizados para cada barra dentro de cada grupo
                                let mensajesPersonalizados = [
                                    ["Asistencia Total", "Coloquios e Informes de Lab. Aprob.", "Alumnos con el 1° Parcial Aprob."],
                                    ["Inasistencias Total", "Coloquios e Informes de Lab. Desap.", "Alumnos con el Recup. del 1° Parcial Aprob."],
                                    ["Alumnos sin Inasistencias", "Alumnos sin Desap.", "Alumnos con el 2° Parcial Aprob."],
                                    ["Alumnos entre 1 y 3 Inasistencias", "Alumnos entre 1 y 3 Desap.", "Alumnos con el Recup. del 2° Parcial Aprob."],
                                    ["Alumnos con más de 3 Insasitencias", "Alumnos con más de 3 Desap.", "Alumnos con el Extra Parcial Aprob."]
                                ];

                                // Verificar que no haya errores de índice fuera de rango
                                if (datasetIndex < mensajesPersonalizados.length &&
                                    dataIndex < mensajesPersonalizados[datasetIndex].length) {

                                    let texto = mensajesPersonalizados[datasetIndex][dataIndex];
                                    let valor = tooltipItem.raw; // Valor de la barra
                                    return `${texto}: ${formatearPorcentaje(valor)}`;
                                } else {
                                    return `Valor: ${formatearPorcentaje(tooltipItem.raw)}`;
                                }
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        categoryPercentage: 0.8,
                        barPercentage: 0.6
                    },
                    y: {
                        beginAtZero: true,
                        max: 110,
                        ticks: {
                            stepSize: 10,
                            callback: value => value > 100 ? "" : `${value.toFixed(0)}`
                        }
                    }
                }
            }
        });
    };


    // 📊 Gráfico de barras: Asistencia por grupo
    function crearGrafico(materiaSeleccionada, matricula, activo, array) {
        // Verificar si ya existe un gráfico y destruirlo
        if (chartInstanceAsistencia) {
            chartInstanceAsistencia.destroy();
        };
        let labelNoReg = "No Regulares";
        if (activo) labelNoReg = "Activos/Pendientes"
        // Crear un nuevo gráfico
        chartInstanceAsistencia = new Chart(document.getElementById("regularChart"), {
            type: "bar",
            data: {
                labels: ["Regulares", labelNoReg, "No Reg. por Inasist. y Coloquios", "Reg. en 1° Instancia", "Reg. en 2° Instancia", "Reg. en el Parcial Extra"],
                datasets: [{
                    label: `Regularidades de ${materiaSeleccionada}`,
                    data: array,
                    backgroundColor: [
                        "rgba(56, 74, 238, 0.3)",
                        "rgba(56, 238, 80, 0.3)",
                        "rgba(216, 205, 49, 0.3)",
                        "rgba(238, 56, 208, 0.3)",
                        "rgba(238, 62, 56, 0.3)"
                    ],
                    borderColor: "rgba(169, 169, 169, 0.62)",
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: `Gráfico de Regularidades - ${materiaSeleccionada} (${matricula} alumnos)`,
                        font: { size: 25, weight: 'bold' },
                    },
                    datalabels: {
                        anchor: 'end',
                        align: 'top',
                        formatter: value => `${value.toFixed(1)}%`,
                        font: { size: 12, weight: 'bold', color: '#333' }
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 110,
                        ticks: {
                            stepSize: 10,
                            callback: value => value > 100 ? "" : `${value.toFixed(0)}`
                        },
                    },
                }
            },
            plugins: [ChartDataLabels]
        });
    };

    // ✅ Event listener para cambio de materia
    document.getElementById('materia').addEventListener('change', () => {
        let nuevaMateria = document.getElementById('materia').value;
        generarGraficos(nuevaMateria);
    });

    // ✅ Cargar gráfico al inicio
    document.addEventListener("DOMContentLoaded", () => generarGraficos());



}, 3000)
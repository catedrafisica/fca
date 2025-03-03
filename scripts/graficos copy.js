        // 📊 Gráfico de barras: Asistencia por grupo
        /* 
                chartInstance = new Chart(document.getElementById("regularChart"), {
                    type: "bar",
                    data: {
                        labels: grupos,
                        datasets: [{
                            label: `Asistencias ${materiaSeleccionada}`,
                            data: asistenciaPromedio,
                            backgroundColor: ["rgba(56, 74, 238, 0.3)", "rgba(56, 238, 80, 0.3)", "rgba(216, 205, 49, 0.3)", "rgba(238, 56, 208, 0.3)", "rgba(238, 62, 56, 0.3)"],
                            borderColor: "rgba(169, 169, 169, 0.62)",
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            title: {
                                display: true,
                                text: `Gráfico de Asistencia - ${materiaSeleccionada} (${matricula} alumnos)`,
                                font: { size: 30, weight: 'bold' },
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
                                max: 100,
                                ticks: { callback: value => `${value.toFixed(1)}%` }
                            }
                        }
                    },
                    plugins: [ChartDataLabels]
                });
         */

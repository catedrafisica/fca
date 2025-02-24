import { alumnos } from "./baseDatos.js";

document.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
        document.getElementById('tituloListas').classList.remove('d-none');
        document.getElementById('spinnerContainer').classList.add('d-none');
        document.getElementById('listas').classList.remove('d-none');
        document.getElementById('descripcionListas').classList.remove('d-none');
        const asistenciaDiv = document.getElementById("listas");
        asistenciaDiv.classList.remove("d-none");

        let html = "";
        Object.keys(alumnos).forEach((materia, i) => {
            // Calculamos el total de alumnos por materia
            const totalMateria = Object.values(alumnos[materia]).reduce((acc, grupo) => acc + grupo.length, 0);

            html += `<div class="accordion mb-5" id="accordion${materia.replace(/\s+/g, '')}">
                    <div class="accordion-item">
                        <h2 class="accordion-header" id="heading${i}">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${i}" aria-expanded="false">
                                ${materia} (Total: ${totalMateria} alumnos)
                            </button>
                        </h2>
                        <div id="collapse${i}" class="accordion-collapse collapse" aria-labelledby="heading${i}">
                            <div class="accordion-body">
                                <select class="form-select mb-3 selectGrupo" data-materia="${materia}" data-index="${i}">
                                    <option value="" selected disabled>Seleccione para generar la lista...</option>
                                    <option value="Todos">Todos los alumnos</option>`;

            Object.keys(alumnos[materia]).forEach((grupo) => {
                // Calculamos el total de alumnos por grupo
                const totalGrupo = alumnos[materia][grupo].length;
                html += `<option value="${grupo}">${grupo} (Total: ${totalGrupo} alumnos)</option>`;
            });

            html += `</select>
                                <div class="listas" id="listas-${i}"></div>
                                <button class='btn btn-primary mt-2' id='btn-pdf-${i}' onclick='generarPDF(${i})' disabled>Generar PDF</button>
                            </div>
                        </div>
                    </div>
                </div>`;
        });

        asistenciaDiv.innerHTML = html;

        document.querySelectorAll(".selectGrupo").forEach(select => {
            select.addEventListener("change", function () {
                const materia = this.dataset.materia;
                const index = this.dataset.index;
                const grupoSeleccionado = this.value;
                let listaAlumnos = [];

                const btnPDF = document.getElementById(`btn-pdf-${index}`);
                btnPDF.disabled = false;

                if (grupoSeleccionado === "Todos") {
                    Object.values(alumnos[materia]).forEach(grupo => {
                        listaAlumnos = listaAlumnos.concat(grupo);
                    });
                } else {
                    listaAlumnos = alumnos[materia][grupoSeleccionado] || [];
                }

                listaAlumnos.sort((a, b) => a.name.localeCompare(b.name));
                mostrarAlumnos(listaAlumnos, document.getElementById(`listas-${index}`));
            });
        });
    }, 1000);
});

function mostrarAlumnos(lista, contenedor) {
    let html = `<div class="table-responsive"><table class='table table-bordered text-center'>
                    <thead>
                        <tr>
                            <th>N°</th>
                            <th>Apellido y Nombre</th>
                            <th>D.N.I.</th>
                            <th>Asistencia</th>
                            <th>1° Parcial</th>
                            <th>Recup. 1° Parcial</th>
                            <th>2° Parcial</th>
                            <th>Recup 2° Parcial</th>
                            <th>Extra Parcial</th>                            
                            <th>Coloquios Aprob.</th>
                            <th>Condición</th>
                        </tr>
                    </thead>
                    <tbody>`;
    lista.forEach((alumno, index) => {
        const dni = parseInt(alumno.dni);
        const formatDNI = dni.toLocaleString('es-AR').replace(/,/g, '.');
        let registros = contarAsist(alumno.asistencia);
        html += `<tr>
                    <td>${index + 1}</td>
                    <td class="text-start">${alumno.name}</td>
                    <td>${formatDNI}</td>
                    <td>${registros ? registros + "%" : '---%'}</td>
                    <td>${alumno.notas[0].valor ? evaluarParcial(alumno.notas, "parcial1") : '---'}</td>
                    <td>${alumno.notas[0].valor ? evaluarParcial(alumno.notas, "recup1") : '---'}</td>
                    <td>${alumno.notas[0].valor ? evaluarParcial(alumno.notas, "parcial2") : '---'}</td>
                    <td>${alumno.notas[0].valor ? evaluarParcial(alumno.notas, "recup2") : '---'}</td>
                    <td>${alumno.notas[0].valor ? evaluarParcial(alumno.notas, "extra") : '---'}</td>                    
                    <td>${alumno.notas[0].valor ? calcularPorcentajeAprobados(alumno.notas) + "%" : '---%'}</td>
                    <td>${alumno.condicion || '---'}</td>
                 </tr>`;
    });
    html += "</tbody></table></div>"; // Cierre del div table-responsive
    contenedor.innerHTML = html;
}


const { jsPDF } = window.jspdf;
const dataImag = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAACCCAYAAAC+TKwQAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAEzGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4KPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRhLyc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpBdHRyaWI9J2h0dHA6Ly9ucy5hdHRyaWJ1dGlvbi5jb20vYWRzLzEuMC8nPgogIDxBdHRyaWI6QWRzPgogICA8cmRmOlNlcT4KICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0nUmVzb3VyY2UnPgogICAgIDxBdHRyaWI6Q3JlYXRlZD4yMDI1LTAyLTI0PC9BdHRyaWI6Q3JlYXRlZD4KICAgICA8QXR0cmliOkV4dElkPmM1NzUwYTY1LTQ4OWYtNGEzZi1iNTY4LTk5MDc3MGU5ZTM4MTwvQXR0cmliOkV4dElkPgogICAgIDxBdHRyaWI6RmJJZD41MjUyNjU5MTQxNzk1ODA8L0F0dHJpYjpGYklkPgogICAgIDxBdHRyaWI6VG91Y2hUeXBlPjI8L0F0dHJpYjpUb3VjaFR5cGU+CiAgICA8L3JkZjpsaT4KICAgPC9yZGY6U2VxPgogIDwvQXR0cmliOkFkcz4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6ZGM9J2h0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvJz4KICA8ZGM6dGl0bGU+CiAgIDxyZGY6QWx0PgogICAgPHJkZjpsaSB4bWw6bGFuZz0neC1kZWZhdWx0Jz5CYW5uZXIgQTQgLSAxPC9yZGY6bGk+CiAgIDwvcmRmOkFsdD4KICA8L2RjOnRpdGxlPgogPC9yZGY6RGVzY3JpcHRpb24+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpwZGY9J2h0dHA6Ly9ucy5hZG9iZS5jb20vcGRmLzEuMy8nPgogIDxwZGY6QXV0aG9yPkF1Z3VzdG8gUm9kcmlnbyBBbHRlcmF0czwvcGRmOkF1dGhvcj4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6eG1wPSdodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvJz4KICA8eG1wOkNyZWF0b3JUb29sPkNhbnZhIChSZW5kZXJlcikgZG9jPURBR2ZrdVFjM1hZIHVzZXI9VUFEY05qcUtsaUEgYnJhbmQ9QkFEY051bzYzMGsgdGVtcGxhdGU9RUFGajJTRkFzLTQ8L3htcDpDcmVhdG9yVG9vbD4KIDwvcmRmOkRlc2NyaXB0aW9uPgo8L3JkZjpSREY+CjwveDp4bXBtZXRhPgo8P3hwYWNrZXQgZW5kPSdyJz8+KpuAZgAAXPZJREFUeJzs3Xd8FNXawPHfbEnvvVASAoTQqyBVigWwgQrYEDsWFMVyRS/q9drRa3ntYpdiowlI753QCS0hpGwS0vtm67x/7O5klxQSSAjo+fJZ7047c2aTm51nznPOkRAEQRAEQRAEQbhIpNpW3nPPPTc+++yz4zUaTYJarfa42JW6lEhSrR+RIAiCIAiCIAiALMsuyxaLpcpsNh999913f//++++Xnr2/y931s88+G3jvvfeuad++fW+tVtvMVRUEQRAEQRAE4e/KaDSSnJyc+N1331397rvvFjnWqx1vBgwYoH3llVeWJSQkXKlWq2svRRAEQRAEQRAEoQHUajWhoaFRrVq1GrBnz56fdDqdFUDl2OGuu+6aEh8fP6zlqigIgiAIgiAIwt9NfHz8sHvuuWeKY1kJQEaMGHGfSqWq9SBBEARBEARBEITzoVKpGDZs2H3KsuONp6dnp5apkiAIgiAIgiAIf2deXl4JjvdKAOLu7u7dMtURBEEQBEEQBOHvzM3NzcvxXuN4c/bwWf9kJcYKMsrPkKsvIk9fTLlJT7mpErNscdlPJanw1njgrfUkyN2XMM9AorxDifQKbqGaC4IgCIIgCMKlxznW0NSz3z9CoaGU/fknOVSYwqGCFA4XniK9/MwFlRno7kvXoHZ0C4qjW3AcPYLbE+Mb2UQ1FgRBEARBEITL1z8uADFYjGzOPsB63V62nTnEieJ0mrrtp8hQxubsA2zOPqCsC/cMYmBEV4ZG9mRUq34Ee/g38VkFQRAEQRAE4dKnTESo0+mMUVFRf8vZB40WE2syd7Pw9CbWZSaitxgafKxGUuOj9cJb64G3xhMfrQdqSU2FWU+FuYpyk54Kk54qi7HBZaqQ6BPaifHtruLGmMEEuvuex1UJgiAIgiAIwuVBp9MZW7Vq5Q5/8wDkVGkWPxxfwYKUNZQYK+rdt4N/azoHxhDrF0WcXzTt/KJo5xeFv5tPg85lsBg5XZbDqVIdp0qzOFWaxYmSdA4WpGCymus8TqtSc13rAdzbaSwDwrs26voEQRAEQRAE4XLwtw5ArLLMOl0ic44tZWPWvjr3a+/fioHh3RgU0Y0rI7oS4hHQLPWpNFexJ/cY284cYlvOIfbnn6zRmd0hITCG++LHMr7dVXhq3JulPoIgCIIgCIJwsf1tA5AV6dt5Y+8PpJTqat0+MKIbY9pcyXWt+xPlHXqRa2dTZqxkjW43KzN28Vf6DoxWU419At19mdb1Nu7rNBY39WX9IxEEQRAEQRCEv18AsjfvOK/smcOevGM1tvloPZkYN4p74kfT3r9VC9SubkWGMuaeXMX3x5eTWZFXY3uUVwgze9/D+HbDWqB2giAIgiAIgtA0/jYBSHZFPq/s+YalaVtqbIvxjeCBhBuZGDcSb61nC9Su4SyylVUZO/kyaTE7c5NqbO8V0pHXr3iYniEdWqB2giAIgiAIgnBh/hYByMLUjczc+XmNzuXt/VrxRPfbGBczFLVK3UK1O387zhzhvQPz2Jpz0GW9WlLxRLfbeKr7RDSqf9zoyYIgCIIgCMJl7LIOQEqNFTy34xOWnHZt9Qh292NGjzu4q+O1aC7DwONsazP38Frid5woSXdZ3yO4PZ8MmUE7v+gWqpkgCIIgCIIgNM5lG4Dsyk3ikU3vkl1Z4LJ+csfRzOw9GT837xaqWfMwWy3MObaUd/b97DJ3iafGnVf73s9dHa9rwdoJgiAIgiAIQsNclgHIl0mLeS3xWyyyVVkX4xvJB4Oe5Iqwzi1Ys+aXXn6GGds+YmvOIZf1k9qP4q3+j4iRsgRBEARBEIRL2mUVgJisZp7e9hG/n9rgsn5C3Ehev+KhS76DeVP6v0O/8c7+n13mEekdEs8PI/5NkIdfC9ZMEARBEARBEOrmHICoWroy9SkzVnLHmpddgg93lZYPB03ng0FP/qOCD4DHu93K79e+QajTpIl7849z44rnOF2W3YI1EwRBEARBEISGuWQDkDx9MeNXvuCSdhTlFcLi0W9zW9yIFqxZy+oXlsDK6/9Hr5COyrpTZVmMXf4M+/JOtGDNBEEQBEEQBOHcLskAJKsin/ErX+BIUaqyrk9IPCvGvk/34PYtWLNLQ4RXMH9c+ybjY69S1hUZyrhl1UzWZO5uuYoJgiAIgiAIwjlccgFIrr6I21a9SEqpTll3TasrbKlHngH1HPnP4q7W8n9DnmZ6twnKuiqLkfvWv8E6XWIL1kwQBEEQBEEQ6nZJBSAFVSXctupFUp36M4yI7s2Xw54XIz3V4bledzGz92Rl2SxbuH/DG2zLOdyCtRIEQRAEQRCE2l0yAYjBYuLe9a9zsiRTWTcoojtzrpopgo9zeLzrrczqc6+ybLCYuG/D65wozmjBWgmCIAiCIAhCTZdMADJ96wfsyTumLF8R1pnvR7yEu9qtBWt1+ZjaZRzP9rhDWS41VjB53X8oqCppwVoJgiAIgiAIgqtLIgD5+NCvLD69WVnu6N+aH0fMwkvj0YK1uvw81WMSd3S4RllOLz/Dw5vewWy11HOUIAiCIAiCIFw8LR6ArNcl8ta+n5TlYA9/fhgxC183rxas1eXrrf6PMCSyh7K8LecQryV+24I1EgRBEARBEIRqLRqA5OqLmLblf8jIAGgkNV8Ne542vuEtWa3Lmkal5qth/6Ktb4Sy7qujS1iVsasFayUIgiAIgiBcqmSrBbO++KKdr0UDkOlbP6TQUKosv9rvAQaEd23BGv09+Ll5M+eqmXhp3JV1z2z/mPyqi/eLJQiCIAiCIFy6DMXplOv2AZC1+X0OfjIAs74IAHMz9yFusQDkpxMr2ZC1V1ke0+ZK7u009oLLlZGRZaeX8z/5Mnld8KcAnQNjeKXvA8pyflUJz23/pAlKFgRBEARBEC53WVs/4sT8O6kqTEVSa5HUWtTufug2zebwF8OxGMqb7dyaZiu5HrqKPP6T+I2yHOYZyOwrH7/gcmVkPj28kAUpa5V1VvvtvIR0weWfy9lnkO3rZGVb7XWQ7Ktl2fb+tX4PMiSiO5J0YXW+q+O1rM7czepMW/rVXxk7+TNtK9e3HXRB5QqCIAiCIAiXt+ghT1OevpOszf/Dt01/3ANjqDxzhDO75xDQ4WrU7j7Ndm7lDlen0xmjoqIuyoQbD254i2Xp25TlH0b8m1Gt+l1wuWcqC+nyy92UGCsuSsDRXEa36c+ia9+84AAEIE9fzNDFj1JitEWxoZ6BbLnpM9HJXxAEQRAE4R8oc/1blKZuInLg47gHxnBiwd2E9boLfUEKhuI0vMK60Obqlyk+uRpJ405gx2ub5Lw6nc7YqlUrd2iBFKwt2Qddgo+bY4Y2SfAhyzILUzdSaqq0rZAux5ctVWxV5m525x1rklSsUM8AXu17v7Kcpy/ig0MLmqBkQRAEQRAE4XLjEdwOi7Gc1D+f5vSyZwjseB35h36jPGMn7v6t0PqEcOjL4Zxe/hw525onff+iByCv7pmjvPfVevGfKx5sknLLzXpmH5wPMk3SctAybPW2yFY+PfIHNEkIAhPaj+RKp879c47+SWZ5XpOULQiCIAiCIFw+QrpPoNvUTXR9cC2BnW+gXJeIubIAi6EMfX4yFkMF4X3vI+b694i75ctmqcNFDUAWpm7iSFGqsvxktwmEePhfcLkyMj+dWEWG46ZavnxfEhLIts8qqej0BX82Di/3vU9JSjNaTbx/cF6TlS0IgiAIgiBcHnSb3+fwV1dz+Ourydv3M+7+rVC5eYOkRu3mTfHJlVSeOYKlsqjZ6nDROqFbZSuz989Vllt5h3J/wg1NUraERBvfcGYPeFTp8O242ZZd9kPp8S25rq2DXMu7862j47+1j3Ll2G4brcu2rsKkR5blJmnR6R7cnvGxV/F76gYAfktZz9PdJ9HKJ+yCyxYEQRAEQRAuD6byPNz8Ioge+jQarxBSlzxBYPxozJVFGIrTaHvdm2Rv/5SMdf+lNH07cTc3fRrWRQtAVqTvILUsS1l+svtE3NVN1+d9TOsByK2brLhLgkTTppM93WMSi05vwiJbMcsWPktayOtXPNxk5QuCIAiCIAiXtpjRbwJQrttL8u8PEtZnCobiNLwju2EqzyE38Xvib59LWdpWtL6RzVKHi5aC9dmRhcr7Nj7hTIwb2STlyshYZSsWrK5zflyC/xztKCpJUl6Oa6jeLitXZkXG2kTzggDE+kVxa9xwZXn+yTXK6FiCIAiCIAjCP4PFWEHy7w+i9Qomov9D6M8kYTGUE97/YcrStpG19UP8YofiGdKhWc5/UVpADhQkszf/uLL8UOeb0KjUF1yuDGzLOcyMbR9jtJprbFfSnhyTcbisd56fw775rP2c961eUbNForZ0r7r28XPzZtF1b+Kr9cJstTDqz+mUGysd+WH29DFJCUn8tF7MG/UKYV5BTTKw8MOdb2ZBsm2eFL3FwM8nVvFo1/FNULIgCIIgCIJwOVC7eRNxxUP4tRsKyFQVncbHUEZgx2sojBuBWuvdrOe/KAHI98eXK+/9tF5N1vphspj4187P2VtwsknKuxgC3HywWK0AGCxG9uWfQG8x1rm/JMMnR/6wDaXbBOlYnQLaMiSiB5tzDgDw44m/eKTLuMt45DBBEARBEAShsSIG2NLwZauZ0J534G/Pkokb92mzn7vZU7DKTXoWp25Wlm+LG4m31rNJyt6dd4y9ecebarTalnGOuluR+fLoEnKrmm4kgns6jVHep5XnsP3M4SYrWxAEQRAEQbh8SCoNrUe+hF/MoIt2zmYPQJalbUVvMSjLd3a4uknKNVstvL73B0xWC7L94b3Se0I+d0Qiy3Kd+zm2NaSc8+Mo13m8Lqdz43ruoqoyfj21oY7xsxrv6lb9CHL3U5YdKVmCIAiCIAiC0NyaPQD5I3Wj8r57cHs6BcZccJmyLLMv/ySbsvcDsu0WXgbJKWiw/a/t5dzJ2/FPqq1HhQzI9m2SI+PprHLkC3zV7Hnicl0SElpJY+sHYh+CVwbe2fcTpYaKC/7sALQqDbe0u0pZXpGxA6PF1CRlC4IgCIIgCEJ9mrUPSJGhjG05h5TlcbFDm6RcGfjg0AKMFrPtFt5+4+6t9eLZnpPw1XohOY8yZb/PlyTbTb1Kkph3cg07ziS5FmrfJ84vmlvbXUWkV7ASAMhYbSNSuYxKJSs92ZV1stUW/Egqp2F0qzuX+7l546Vxt53L0UHeiVqlYlafKczaPccpTJHJrixkfspaHkq4sUn6a9wcO5Svji4BoNxUyfqsvVzbuv8FlysIgiAIgiAI9WnWAGRVxi4sslVZvr7theeW2Vo/TvBH6iZba4Jkv7mXYVzsYP7V8+5z3qAfL07j37u/VlpCHC0PHmotM3vfzeNdb8Vb42FvAnFusaizUliMFUgqNaayHGTZisYrCKtJj0rrhcYx2/tZkyBKKtd2GEfAcmeHa/gjdSP785Ndtn18+DemxI9pkvlTeoZ0INo7FF2Fbfb4tZl7RAAiCIIgCIIgNLtmTcFan5WovO8cGEu0d+iFFyrB10eXKiNJIdtmDteo1DzdfRIqR0BSxwtZZtbuOUo6kyP48NS48fu1r/N8r7vw0XoiSdWtFvWVJ5sNVBWmIJv1VGYfoPT0VvR5xylL24a5Ig9DYSpVBSeRrSawWs4KOKRagyWVJPFgwg1gT/lytMKcLMlkbvLqJumbIiFxdat+yvI6XWI9ewuCIAiCIAhC02i2AERGZqtT+tWwqJ5NUCacKM5gbvJqoHqWcAm4MWYwXQJjz1nG/oKTLE/fjlMnDzQqFd8Nf5FR0X1r7xtSW11kK7LVgj7/JBIqCg7/QUXWAfS5RzEUplByaiP6vBMYS3VUFZyiIsvWX0V2ahGqi1W2MqHdCCK9Q8C5L4gMXyQtblD9GmJoZPXPJKsyn1OlWfXsLQiCIAiCIAgXrtlSsJKLMymoKlGWnW926yMD+foisisLXae9sGdCvXdgPnqz0aUjuYzMoIhuHCk6jaM3RpxfNJ72vhZKEbLM50mL7X1HbAVKSExqP5KbYoY0rm+FbEWffwKrSU9Jyjpkqxl97jGMZTmU6/YiW82YKwrQeAbgE90HtbsvZek78WnVB9Tu9Z5LxjZh4Ywek3hm2yfVo3tJMvvzT7Lw9CbGxQy94L4ggyK6o0LCaj9DYt4x2vlFXVCZgiAIgiAIglCfZgtAnGc+l5DoHRrfsANlmQ8O/co7++fV0RYhO8a9cvH09v+zpUTJthSmv8a+x7DIni436UariW05hwFZ6ZDurnbjyW4TGj3Hn6k8F2NpNhZjBebKQsoydmEozgAluAFjaTZan1BkqxlTZT5+MYPQ5x3HK6IbOKV21UaSJCbFjeStfT+Rry9RUsWsyHx06DdubDsYjXRhs8n7unnRMaANx4rTANibf4Lb4kZcUJmCIAiCIAiCUJ9mS8Hal189O3mnwLb4ar0afOzZQ+a6/rPtAa7zfciybBulyh6gWGpJdSo0lJFenuNybLR3CB39Wzc49QqwBR1VxajdfChJ2UBlbhKGwtO2fh6SjGTP7pKtZkxlOZRn7sFYmk3lmSQ0Hv6Y9Y5JBR2jdDmNriWj1CXUI4BpXW+t8bnsPJPkkt52IfqGdlLeH8i/fGaUFwRBEARBEC5PzdYCcrTotPK+W1C7Rh0b4WugS2TxeU+7p5ZUeLu5zmshI1NozCIuLB+LbAFst//9QuJrpGrVT0a2GMFqpaooDUmlQp93Elm21mhFccwjYtYXYSzV4RHcDlNlEe5uviDLqCRIiCij3FyuHKNRaXBTy/bjJabEX8PyM19RZipxmb5wQcb/MTjyC9QX2ArS1elnc7w4Hat9mGJBEARBEARBaA7NFoCcLMlU3icExDT8QAmCfYy0Dy+z33A3cChcJypUeLqZzypWwkAhcWFlWLHgaGfoFOhe98SEdVRQ0rhjMZTbO5gnI1uq6j1atloxlOioyj+J1jsUrU+YvSSZdqHlVFqrAxA1ajTq6tArwjOUyZ2GszL3J5dJDIukbZyuTKKdd9dGtd6crVNgW+W93mIgrTyHWN/I8y5PEARBEARBEOrTLAFIYVUpxcYyZbljQJtGHa+RtGhVHvbQQ8IqmzHL5rNus2Uk1GhUDZ0TwzXIcLyrtJQ16vZdlmVMFfmY9EVIKjWSSotslc/dh0SSlMDDYihFJsrWRHL2XIQSIEsuyzdF3s+mgkXoLWVKCppJNrI46yue6vBhI2pfU0f/1i7Lp0uzRAAiXDQnSzLIrix0WaeWVHhpPGjrG06Qu5+y3mAxsTPXNnlomGcgnRrxdyWrIp/kUp2y3D8sAXe1m8s+pcYK9hdUz70T6xtBa5/wGmVtP3MEk9WMj8ZD6du2JfsgVmT8tN70DGlf57q67M49ht5iwF2tpX9Y5wZfV6W5ij151f3tOgW0IcwzsM79k4pOszFrH/lVpfhoPekd0pGhkT3qHNDiUEEKRcZyl3VqSYWf1osO/q3wqKP12HHt9Qlw86F7cFyd2xt6bY35nHecOYLRasZb40GfWvolFlSV2AczgfZ+0UR5h9T4Ha3rPEaLmR25R1zW9QrpgK/Wq0YZ/cM615jPqbCqlMNFqQDE+UXVGLbeIltJzDvOnrxjFBrK8Na4096/FVdF9ao3xfl0WTZrMhPJ0RfgoXaja2A7Rrbqg1bVrNOACYIg1KtZ/gJl2ie3c2htv/FuCAmJm6MeZmToBNtQtxL8deZHluR8XX2nLgOomNJmJn0DRyKhAmSsshUZKyrUBLmFu3ypyoCfNqj6Zl+ydVjPNWRishrRqhqWhuWYG8RqLAdZtgUVkmOo3Jr7O7qpaNz9bH1H9EVIyh9+p27ojoaeWj6PELdo+vgPZ0vhUhwd6JFhV/Ea0itP0Mar43m3ggS4++Kt8aTCrAdq/uwEoTm9d2AB3xxfVuf2K8O78OHAJ+kZ0oH8qmJG/TkdgIlxI/lxxEsNPs/MXV8qw3cD/DxiFrfFDXfZ52BhilI+QI/g9uwc92WNlMTxq16koKqErkGx7L3lGwCuXf40JquFAWGd2XTTJ3Wuq8vk9a+RUppFpFcwaXf+1uDrmp+8lqmbZyvLDyfcxMeDp9fYr9hQzoOb3mbx6S01tvUK7sAvV/+Htr4RNbY9s+NT1mftrfXcGknN0MiePNfzDkZE93bZ5rj2+gyL7Mnq6/9X5/aGXltjPudbVr1EXlUxnQNj2H/rtzW2b8k5yG2rZwHw/pXTeLzr+Bq/o4FuPmRNXoxacu1CuSlnP2OWP+ta3k2fckVYQo0y3hnwCNO7TXDZd/uZw4xb9SIA7w54lCe73aZsW6/by5PbPuRYcXqNOvtoPXm2x+081/NOlzoZLCamb/uQb48trxEMxvpG8svV/6FHcP0BmyAIQnNplk7oWZXnH4AAuKs8CHGPJNQjGj9NIDuLViuNAkrncY92XB02iXD31oS5RxPm3ooIjzZEesQQ7tEarcr16aaERKA2FI2kdQpMZPJN2eQbs6n17r82koSbXyTekd1Re/iBpELt5l3/IWotKjcvtN5h+ET3wc0v6hwjYLkuqyQV46MeQatydxl62CwbWZO34IJSsMD155MlAhChhfhoPPHTetsmArX/Tm8/c4SRf04n2Smls7HKTXoWn97ssm5+ytpzHnegIJl5TkHL2ZpgPtAL9vNZ9fs9dQMmq2v6qYzMhDWzlOBjQFgXHu8ynkER3QDYV3CScatm1jjubMHufgS7+ylP282yhXVZiVy3fAYv7fqq1mM0KjXBHv61vvzdfC742lpCkbGc3blHa6xfm9nwyVzf2vczxYbyOrc7/2r9dmoDY1c8x7HidFRIjIjqzWNdxjMxbgT+bt6Um/S8vOcbJq97zWVglse2vM+cY8uwItM1qB2PdhnHda37A5Bals31K56nyFCGIFzOTFYzz+34jC3ZB1u6Ks3ij9SNvLXvJ6yXwhdOE2uWACRfXz3/h7+bT41Uh4aSkdlXspFcY7rybe8YvHZU2CS0UmM6j4OPJoAQd9d5LkzWKnYUrmxUh3fZYkbt4Y/awx/PoHZ4BMeh0rjbx6hSKo8sgySpcPeLxDuiGyqtB2oPf2SruWaUcQ6tvTrQN8B1iFwZmdW588muSmtUWWdzTmsoqCq9oLIE4XztGP8F+VP+pHDKcrInL+b29qMAKDNV8v7BBedd7uLTm6kwVwEwOKI7ACszdlLYgJuvl/d8g8FiPO9zN6f08jPKl+7A8K4A5FeVsDpzt8t++/OT2ZC1D4CrW/Vl400f8/7Aaay/4SMmtR8JwOHCVBambqr/fHf9TvbkxRRMWUbW3Yt4u/8jeNj/tr9zYC7fH19R45i+IfFk372o1tdv17x2wdd2sTnSplZn7qmxbWXmLgDlM6lPoaGUdw/MrWcP2zdJWtkZHtz4NmbZgo/Wk1Vj3+evse/xv4HT+HHEv0ma8BP97CMZ/npqA58nLQJsn9XPJ1cBkBDQll3jvuSDgU+w5Lq3+FfPOwE4oy9kzrE/G3bhgnCJWp6+A0+Nm/JA5e+k3KTn15T13NHh6r/l4EDNEoA40nkAlxzuxrLIZv7I+sz2VMee5gQQ7t6aa8Nub/REfFrJjVjvLvbgQFaOX5ozh2JjfoPLUWk9sJqr8G19BSqNB75tr8QzNB611gtJUtm+OiQVKo07HiEd8I0ZjKTSEBA3AouhDLW7L1A9rO7Z5Doi3dFhk1FJKpe6m2QjK884Oqifn0B7fQCXvjuC0FKC3H15te99yvLuvGPnXdbPJ21P0mN9I5nZ624AjFYzC1M31nlMnxBb/4D08jN8emTReZ+7Oc1LXqPMivTpkBnKg575ya6tO6fLspX3rb3DXVpMp3W5he5BcXQPiiPVab9zCfHw56nuE/hu+IvKulcTv8VyjrSrhmrotV1svYI7ArDKHmw4ZFcWcKTwFAC9QzrWW4YjYPj48O9kltfe4uz4Cvj48G9K8Pxq3/sYGuU6oW+oZwA/jZyl9Od4a//PmK0W0svPKEPRR3oFo1FVj5b4cOeblJ95RnnuOa9Z+PtILslk9PJn+O3UBuX96OXPkOLUP+79gwsYvfwZ5f/LR4vSuGf963RecDddf5nMQ5veJdP+e7MwdZNShvNrTeYePk9azOjlz/DYlvdd6jBm+bO8s/9nAG5d9RKzdn9NuUlfaznP7/jMpZ6jlz/DzStn8uKuL9HZszV+PPGXyz2R0Wrm5pUzGb38GTZnH6jzs/jfwV8YvfwZZu3+usa2Fek7GbviWeLn30G/Px7k1cRvqTIbAHh1zzdKXcaueI571r/Or6fWK/dg2ZUFTN/2IT1/u5eEBXdyy6qXXKZNeHTze4xe/gxfJC1W1h0sSGH08mf4K2MnACXGCl7a/RXDlz7B3vwTTN00mz/Ttin7O+pww1/PY3RqFZ6fvEapW1pZjvLzOW5P3cyvKubp7f9Hj1+n0GnBnUxc87JLv0eAucmrGb38GR7e9G6dn11TaZYApNL+BxMg0L3+Zva6yLLM/uLNpFYetX0ROd2Ujwi9rdGtHwBIMDjoBvv855J97g2ZEnMhv2V93KibePeANlgMZfi3H4nWOxSviG4EdBiFV0RXfFv1xTO8M/5xV+EV0RWv8C74xQ7BVFmAZ2g8klOebkPPKCGR4NuXHn5DlLo77iPWF/xOkfFMIz4IVy4BiKHivMsRhKbk3En2fJufsysLlD4M42KHMiyqJwH21J+5yWvqPO6mmMH0DO4AwNv7f6o1XeZCgv6m4AiseofE0zkwhhFRtn4YS9K2UmGqfggU7R2ivP/l1DqWp+9QlvuFJbDnlq/Zc8vXPG9/Mt4Y42OH0j3I1pE8syKPA2d9mZ2vhl7bxeZ4yron75hL+tLqzN3IgKfa3WVupdq82HsyEhJVFiOvJtbsh+Lsz3TbTYdGUnNPx9G17hPrG8nI6D6A7fc9Mf840d4hSpi5MXs/P5z4C6s9IIn2DlV+5h8OevJclyz8jZSaKlmrSyStLEd5v1aXyKzdc5R9kopOs1aXiBWZxLzjDFw0lb15J3iy261M7ngdi1M3M+LPJyk3VZJefoa1ukQC3X2JD2ijvPzcvDhRksFaXSJfHV2q3FgDrNUlcqjQNtjChqz97Cs4iclqZq0ukTP6IpdyWvuEKfXUmw109G+Nm0rD+wcXMGTxYxitZqUMh5UZO1mevp0t2QfrbOEzWy3MPjCPLTkH+fDQb5QZK5VtXyQt4aaV/0IlqXih110Mi+zJG3t/ZMqGNwHYX5DMxuz9xAe0oa1POLtzj3Ln2v/w1dGl5OqLGLzoURYkr+PO9tcwo/vt5FQWMurP6UoAsSP3CGt1iczc9SW59jnhigylrNUlklmRh95s4Oo/p/Px4d8Z22YgL/S6C0mSGL/qRT6zPwzbX5DMWl0iKzN2sc0puPn+xF/Kz7TcpFd+PiXGCgoNpQxZ/DhzT65mcvx1PNH1Vg7kJzN8yRMuo9Z+cPAXtmQf5Nvjy0kuqQ5Mm0OzBCDONwuNbaVwtvzM9yidru2pVwHaUK4Nu+O8ypWQ6BNwFW28OinLkmR7Hrgqdx4b8v5o8E2FJEl4hXZCtprxieqJX+xgvMK74hXWGf/2I/EK70JA+5EEdhiFxjMQtdYb78geqC5w5JEx4feAJClBFJJMhbmU5Wd+OO8bIud5UJxbrwShpZisZt7dP09Z7h3S4bzKWZCyTnkSfHPMELQqDWPaDABsoydl1vEE2GS18MYVDwG2CUzfqTdd5uLbm3+CY8W21MtxsUMBW9AEtgdAS9K2Kvv2De2k3BSXm/TcvPIFEhbcxfRtH/FX+g7MF9hq4Zz6cHYn6azKfGYfmFfrq66n7425tovNcaNvka2s01X3+XCkZA2L6nnO0aU6B8YwMc6WTvvTyZUcsd+MuZKpshg5VZoFQDu/KPzq6WvoaLEDOFKYSrhnEDfbPzuLbOWBjW/Tbu5Epm6azR+nNl6yaYXCxRfjG8Fvpzawp5ZW5qe3f4wkSay5/n883Pkmnut5B28PeITTZTkuA1pM7zaBDwY+obyucBrJL9Y3khd3faUEwDa136sMjujmUs7jXW9Rtt3QdhAfDnqSX67+DxPiRpBZkVfr3++5J1fT2juM2zuMYvHprS4PxB1WZe4ir6qYZ3vcgd5iYJG9j2CRoYx/7fyMK8ISWHTtm0yJH8PsKx/jzg7X8EfqRuV8biotHwx8gk+HzGDJdW8Btv6Ksw/MJ6Mil3mjXuHZnrfzQML1rBr7PuGeQTy17SMluyXKOwSDxcgbe390rZgs883xZewvSOajgU/ySt97mRI/hiXXvUXvkI68uPtLSo22h8Q+Wk+C3P1Yo7P97dGbDWzNOUScX3Stn+17BxaQUqrjpxH/Zkb3STzaZRw/j5xFhVnPN8dsA2QkFZ1mf0Eyz/a8AwmYn1L3Q7qm0GwzoTvUlU50rmMOl+7kcNn26nX25vhrwu7AW3P+aV2SpGJM+GRbSpdT2TIyX6W9TGLRugbeyNuO9wpLQOMZiFdYAr5tr8QvZiAegTH4xQzCK6I7Wt9IPIPb4xmegDJFutN11pqCVcf5JUmiu/9AOnr3Uo6X7FODbMxfRKX5/NKnPNXVAUh5Cz5dFP7Zxi5/ji6/3E2nBXcS9v2NfJq0ELD9fj7VfeJ5lenIg4/yClGGt72xre1mVkZmQcq6Wo+zylZGterLKPsN5/8d/l358rkUMnGdO8ffHDsEgOvbDkRlb12d59S6o5JULL72TcbHDlXqnlKq49MjC7lx5Qt0+eVu1utqH+mqIZzTbCvO+rJPL89l5q4va33VlfLVmGu72Nr6RihDlzv6o1hlmbX2m4AxbQac8/vDYrXyat/7cVNpsMhWXtxt78B/1kO1YqcWloBzZBI4by+xD5v8zbB/8UCn69HYJ6vNqsznm+PLmLT2FeLmTeLXOn73hX+We+PHEu4ZyMxdX7qsLzFWsONMEiOiehPuFaSsv6vDNWTfvZjxscOUdbtyk1iduVt5OQ8W8UKvuzlUmMLck3UP6OGQUZ7rUk5aWY6yzWQ1U2GuIq0sh8OFp2jnG1VjgKMSYwXL0rdzc+wQbmw7mAqznqWnaz6wmJe8hmB3P/7V805CPQKYZ7/R3pJ9kApzFRPjRrqMKPfp4KfIvnsxEV7B9jUyFeYqyoyVrLE/iBgW2ZO1uj2EeQZwVVQv5VhvrQdj2w4krfwMyaW2loZgdz8eTLiRr44tdUl/A1sLkYTkMkqjWlJxS+wwyk16dtiHopdlmaGRPViVYUsH3ZR9gCqLUWktPtuqzF0EufsyslUfZV2f0Hiy717Mi70nA7b0K7Wk4tEu4+gZ0rHZU16bfSBwi0vU20ASLM/9zj6srqw87fdQezMi9NYLGvVJQmJ4yC1syl/EkbKdSoAkI2O0VvFe8hM8FPMfhoXchOQ8y3htcyHaRsNF6xeJ1WxA7RGAxisIq9mASutla11Ru6HSeCjHOn85yViRa/l8bOvlWu90VKgZHzmVt09ORcZi+9KSociUy5853zIheprLF1lDPivn/GDzJTDKjPDPlFaeU2NdQmAMnw95hs6BMUrOb0MlFZ1WUoLKTJX0+eN+wDZfg8O85DXM6DGpxrGOv1uvX/Ewaxc+TJXFyCuJ3/L1sOeVG+GWSsCyWC3MT7bdPKqQmLTmZWWbWpKwyrBWt4d8fTEhngGAra/A/FGvcqI4g99OrWdl5m525SZhka2klmVzw1/Ps+HGj8+ZPlSbIqd+Y35nzUcR4OZDv7CEWo8Lckr9vJBru5hkZMa2vZITBzNYZQ9A9uYfJ7/KNvDK6NYD+Cyp/j5DFqzE+UXzcOeb+Pjw7yxP386m7AOonP5Wy4C31lNZ1tvzz+vivN1LYzvOW+vJp0Nm8EKvu/nt1AZWZu5iS/YBjFYzufoi7lr3Gu5qN260ty4J/0zuai3/7jOFx7a8z18ZO5XfwkJDKTIyQR7VDxjuXvea8pDysS7jlfVPb/8/lzKz767u33B924EMCOvCy4nfcGvc8HrH31mWvp1l6dUPnt/u/wjD7P2eZu2Zw6w9tlSxCM8gNt30SY3Wxj9SN1JlMRLk7odFtqCWVMxLWcNE+2AbAGXGSpakbaVPSDzrs/aSENiW9bq95OqLKDDYBuFxpKWnlmXz9LaPlWM/HTIDgEqzgcBvq1Min+1xB1PiR/Pa3u8IrKXfc7B9XZE9lddstTKz1938cOIvZu2ew0MJNwK2/98XG8rxULvhpfFwKcNRbolTOvC1ra/g0c3vk6svYq1uDx39W9c56myhoRR/N58a94TB9p+vVZaZl7yGdn7RJOYdo71fFL+e2kBi3vFa50xqCs0egJzPsImnKg6zt3ij65MkCUaH3U2wW82x6htLkiQeiHmFmUdus89CbkvzkmUZk2zgs9MzWZP3C74ax+hQslIXq1VGJbnOFVjHWZymLalua0EJp1SYrAaMVgOyVD0NiEW28NGpZ/FU+8BZxzlK1Vsqanw2yDJ/5nxLcsVBJQCJdI9hSpuZyg1TXZx/RmJyKqGlvHflY0R4BaNChZfGnVi/SOID2pz3AwfnJ25lpkoO15LqcrAwhaSi03QOjKm1jF4hHZgYN4L5KWv56eQqpne7rTpgb6FhEdfoEjmjt01qZ0Wu9bpMVgu/pW5gauebXdZ3DGjNzN6Tmdl7MunlZ3h407us1SVitJqZfWAe80e92uj67DyTpLzvHBTjsq1TQBuWjX6nwWVdyLU1hGMkmbpa5p3Th+sadeb6NgP538FfyKzII6noNGvs6VfdgtrVOpdKXV7odTffH19BqamSF3Z+4TLoAsj4ar0I8fAnv6qElNIszFaLy8MiZ0eLq0dCjPVzrUNrnzCe6j6Bp7pPIF9fzNM7/o/5yWuRgTf3/SQCkH84WZa5N34MHx76lRd3fUWfUNsgCiEe/qiQSC+r7l8a5hlEmUnH8vTt3NB2kLJ+zfUfuNykejllVciyzBv9H2LE0if57Mgi1FLtv8MAD3S6nnevfExZdlNpOGQf3OHxLrdwV4er2ZRzkOd2fMr3J1bwcp97XY53tHg7961anbmHgqoSgj38AVh0ejN6s4EtOQfZ8lf10L2/pKynnZ9tEmZHeqhWUhPpFcze/BPszT9BhcnWwuuhdmPDjR+jNxuYvu0jPk9axHM9byfKK4SjRadr/H81vdz2GTr648nIhHoGMKPHJF7d8y1XOD2kifIOYUvOQfL0xYQ6PWTJrLDVKdI72F4GjG1zpXKNKzN2MbbtwDo/23DPQJKKTmOympX7vCqLkUWpm+jg35pyk1657hv++pdy3PyUtZdvAOL8tLEhrLKV33SfYJFNKLflMmhVHgy/wNYPBwmJVp7tebzdO7yf8gQWubqOMjJW2cKx8sRaz2QstaD1VTd2FF0XsgyyVUallmyBhIw9aLB9+SWV7az3OmWn/zqvq7SWsa+kemSf/ajo7NuX/kHX1luewWJS3rupGzqzvCA0rWtb91fSWy6U42kO2J4+vXvloy7b9+Wf5OPDvwO2kZX+0+/+Ost6te/9/JG6EaPVzIu7v1KGWW2pFhDnCRXf6f8IIZ7+ynKl2cC0Lf9Dxta6M7Xzzfx37/cUGspwU2l484qHlf5zbXzCmTPsX8TMtU14d7So8cN5b805RGK+bbbyGN8IugS2u4Ara/y1NZa31hP0ReRVFSut684cnULBlmNdm4ER3ZTAYHXmbqUl5HqnG7KGCPHw55ketzNrzxx25x11efLriINGRPfhl5R1VJqrWJ6+vdZgodykZ4V9YAFPjTsDw7vxyZGFSmrHK33uVfqPhHgG8NXQ51l6eisV5iqlr43wz6ZRqfnvFQ8yYfUs8qqKAdu8TAMjurE55wCHCk/RLagd7135GM/t+JTlZx3voXbD+6wn9s4GR3TnhrYDeWv/T3XNuazUo65yor1D6B0aT+/QeD489CtrMve4BCAZ5blsyT7IffFjlcEVFqZuZPL61/n91EYe6mxrZfj55Cr8tF6k3vkrbiotZquZmLm3MS95DSvGvIuP1pMfTqzg8S7jaeUTxkeDpjNsyeMudVFJKmW0u0c638zUzbPZmXuUcbFD2ZmbxPcnVnB/p+sBSCvLYUnaFvqFJhDtHepSzpNdb+PzI4t4z2mY+XExQ/klZR0fH/5d+V4qMpTx44mVRHuHuPSvifAKpl9oJ74/sYKjxWl8PHg623IO1/r5Xd92EHvyjvPd8RU8mHADAAtS1vLgxnf4cOATHChIQULi+KS5RNpTzfr98QC/pKzjrf5Ta0y82hSaJQDxcWqGLzU1ZlQlmcyqZA6U2nL2JKn6D/Gw4JuJ9GjbZHWUkOgXOIrJrV/g+4w3sMoW21rJMd9I7dz8647eG3xuCSRVdYtG9fqGRTWS03/rOtbeXsOyMz9wReA19ZZdYqz+GfmelUIhCJejTdn7ybA/Mbo5dgh3dbjWZfv1bQbxRdJijFYz81PWnPX02VWsX6SSLrMifYfTPA8XPwQpN+lZYu/82d4vmundJ9TY59tjy0nMP86OM0mklmWzJ+84y+03t7YWnep0hCqnzsiOJ4QNtf3MYW5f+4qyPLPX5Asaq/58ri3WN7JR5+geFMep0izyq0pYlbGba1tfoWyzylYWOE1Q6Rjd62xqScWYNgP44cRK/kjdpHTedTyNbIwnut3KZ0mLyK4sUDqCOpvW9RZ+TVmHDDy38zMGhHdxmbdJlmVmbP8/iu39Pu6Pvx4frScnSzL49IitD1W4Z6DLCGdGq0lpQXdOrxH+2W6KGcyAsC7syD2irHt/4DSu/nM6w5c8wbjYIWRVFpBVUXPKgvs2vImX02A2DyXcVGOf1/o9SJ/f7683Lf+3UxvYcab6/JFeIbzc994a+3ULase2nEMuA2jMT1mDFZnb4oYr8/Vc33YQHmo35qWs4aHON5JVkc+G7P1MjBuh3Ou4q7WMbTOQucmryasq5v0rp/Hwpnfp+8cDjIzuw87cpHpHYewWZHvocqgghWldb2Flxk4e2/I/VqTvIMjDj6Vp2/BQu/HF0GdqHOut9VDS3xzGxw7lzg5X89b+n9idd4xY3wj+ss9btfDa13E7K0vlxpjBvLT7K4LcfRkY3q3OAOSpbhNYkb6DJ7Z+wFrdHjQqDYtSN9EzuD2T2o9k1p45XBnehRinVtzxscN4Y9+PbMzax4joPrWWeyGaJQAJcJrhtjEzrcqyzB9Zn2O06l36frirPG0dx5uYSlIxOvwurLKVubp3MVmNtoBHki9KR1PH77RzcGAbcpgG93S1TZFy9s62MmQJjpft4VDpNrr7D6qzFaTIUD35YGAtedmCcKlZnbmLAQsfrnVbe79ol/xZ586SDgHuPlwV1YtVmbs5XZbDdqcvvdo4p8s4btobGn4cKjxVZ129NZ6sveEDZTm/qqTOfQGmxI9WOnrf0u6qWvcZ324oifnHkZH5JXkd07reogQg9294m335JxkY3pUcfSEfHPxFOe7ODtfUex23r30VFRJmq4XUsmyOFFWnR90XP5Yp8TWHiT1RksGE1bNqLc9T4873TvOIOE8Y2dBre75X9Y11Qz7nx7vewuLTm5GBO9a+ylPdJ9AzuAOlxgp+PLmSLfYhLYdE9KBnPSOv3dB2MD+cWMn2M7Yv+wjPIGV+j8bw0ngwq88UHtn8HnpLzX4e/cM683T3Sbx3cD6nSrPo98eDPN5lPPEBbSgwlPLzyVVsss91EB/Qhlf72QLphxJu5OujSzFazczaPYe0shyuaX0FJYZyPktaRKW9z8id7a9udJ2Fy1ekVzD/7n0PV4Z3dXkPtoehHw+erjwEUEsqega3J/GWOcw5toxTpTq6BsbyyeCnmJ+8ll4hHTBYTPy79z01ztMxoBWtfcIIdPNR/hZ3Dozhi6HPklaWQ5egWACe63kHrXxC8VC71VqOv5tPjXoCPN19Iv1CO5FdWaCUYbFamdVnCsMiq+fK8dF68uGgJ9FV5GGymsmvKuHFXnfXSFV6otutxPlFUWwoZ0r8aDoFtGFByjryqoqZEDeCm2OG8EvKOoLcfZkYN1IZ0ARs8/7M6jOFcK8g3NRalo1+l19PrWdD1j6qLEae6jaBKfGjlQcHDyfc5BLQ3Bs/hvyqEsxWM71DOiJJEt8Me4HxscNYmbGLUmMF98SPZnLH65QHLs51mBg3AoPFSJxfNBqVmsER3fl373sI9Qygf1hn/t37HqK9Q/DUuLPm+g/46eRKtuYcBmRmX/k493S8jlx9MU90vVWZqNdhcsfr7C0fzXNHrJSq0+mMUVFRTZJ/szpzN/esq57l9sTtC+psznaQkcmpSue5IzdRaXEELbZb5r4Bo3iuw6fn7MtwvmRZZnvhCuak/YcSc769Ps3zkTuX69yPw9EHBWrvOH52fRzLjkBNlpzSCWTXvTv79mdW/HdoVLX/eMetfIGd9huwuzpeyzsDHqt1P0FoalM3zeab47Ynv4cn/FBvCpauIo/YuTWfip8tIaAtuop8Sk0VBLv7kXHXH7Xmzn9zbBlTN8+21aPzzUyIG86Ipbam+3/1vKtGWtZb+35SOkGC7Ybv0G3fA+A9ZxQmq4UBYZ3ZdNMnLuvq46f1Jn/KnyQsuJMU+5Cr9RkU0U2Z1GrXuC9rvUlOKdWRsOAu+2cRw4HbvuWTI3/w/I7PMVpNNfaXkJjW9RbeHfBojYcZ1y6bocyjUptgdz9e6nMPj3Ye53JsY67dYczyZ5UhJRtzbY091+dJi5ix/ZM6+yf2CG7PkuveUtIQavsdrTRXEfnDzUrQcH+nsXw2xPaE8187P+d9e0rFlps+5YqwhHp/z81WC71+v0+ZLAzgjSse4pketwO276fX9n7H2/vn1lnnYZE9+XnkLJfWkT9SN/LgxncoM1XWesxt7YbzzVUvKE+LBUEQmptOpzO2atXKHZqpBSTaK8RlOaM8l4TAc6RPybDizI/oLbZ0IMeXmRott0Y92qzT0EuSxJXBo4nz6c7Rst2AjAo1tpQs2xe069POWlocGhCuyMhYsdi7tciUm4v5IeMte/qXjQoVk1o9RaA2XAkwVKhQSWp7kGIbJUtCwoqVxOL1bC9crkQksj34GBx0PT38ByMjo5G0tvNS+xdNhlMns6izfnaC0JyubztQ6ZgXXMvoIc58tV61PiU7m7fWU5msrmNAmzo77t4UM0QZWSvIw582PuFK+Wc/CQLbUzKzbFEeFDinLM3sNRmrbKWVU46vY119HDN8P9ZlfINai1WSihFRvXFXu9X5hD7OL5p3+j+i3HiWmyp5rMt4xrYZyLzk1ezOPUa+oQRPtRvdguK4vf2oOjsZ3tXhGgY7zfNhq4OEr9abhMC2DI3soVyDs8ZcO9hGHRsc0Z0rw7s0+toae66pnW9mVHQ/5iWvZm/+CQoMpbipNMT6RjGqVR/Gxw5zGYyjtt9RL40HHwycRqb998e5Q+6o6L5KHrvjuPp+zzUqNV8NfU4Z1hdgoNPTXkmSmNXnXu7ueB0LktexOy+J/KpSvDUexAe04fq2A5X5SZyNjx3G4IjuzE1ezfacI5zRF6JRqekU0IZb2w13GSpUEAThYmuWFpASYzkJ8+9Qlr8f/hJXO+Xa1ibXkMnTh8dSZalQbqQlJLr49uflTj+gqmfkhKbXXO0frmVXWsq4f98ATFaD0t9eJan5uNsawj1a13qM67JMmbmEJw9dS4kp36kVRaKDd0/+23keGqn+H6nJaibmp1uU1piPBj/Fre2G13uMIAiCIAiCIDSGcwtIs+Q0+bv5uPQlcEy+UhcZmXV5v2GyGlBLGtRo0EhaNJKWmyIfQmqm1Ku6NWcPkOqybdfoplyzWtLYW17OVR9J+V8fjT8jQ25D4/K5aUitOMz+4s3nnBQrpUTnsk8bn/DzuyxBEARBEARBaIBmG4a3vV8rducdBc49vKOExNiIexgVNtGlZ6dGpSVA+/dNCXJTefBp93UYZYOS1qGSVARqQ89xZDUJiQnRT3Bt2B3KR+cY5s5XE3DOUOpo8WmX5fiANg0+tyAIgiAIgiA0VrMFIB0D2igBSJLTaCl18dUE8k8cf8lXG3junc5Bq3IjxD3qvI494jTRV4RnEP5OI5gJgiAIgiBcjsrKylCr1Xh5Ne30Anv27CE8PJzWrc9/3qpFixZx882Nn8voXKqqqvDwqHtOlktJswUgPYLb8/PJlQAcK06nwlSFt7bmh2KWTeRWZSJjRUktcp6ppq5Za85eX9+j/hrH22fScB40qraTSNUzbjhX50LVnIVXss95Un+6lFTrLL6yU92kGmvdVR6EuEfV2Uk+Me+48r5rcO3j3guCIAiCIFwOCgsLeeWVV5BlGTc3N4qLi3nrrbcIDbVllxw+fJgtW7YwdepUAH799VeGDx9OSEjDMm5Wr15N//79LygA+fTTTxsUgPTv35+ePauHFr766qtJSEhgw4YNPPZYzRFLp02bxqxZs86rbg888ACvvPIKarWamTNn8u233577oAvQbAFIL6dRTKyylf0FJxh01sgyMjLLc37g58x3qRlNyDT9rf9ZqsfDPfc+TalGwCM5XWpdkZd0Vn2rt7l+Qo6xs2zcJHf+2/kX2nrF1whCTFYzBwpOKstXhCac5wUJgiAIgiC0vJkzZzJ+/HiuucY2t9GKFSuYPXs2b7/9Nunp6axZs4bo6GiqqqrIzc3ll19+oaqqinHjxuHh4cHKlSspLCxk+PDhtGrVCoDTp0+zceNGAgICMJttw2Hn5+eTkZGBTqdjwIABVFZWsnbtWvz8/Bg7dqxLS4Qsy2zcuJGUlBT69u3rsn7Dhg2kpaUxcOBAOnbs6HItvr6+fPHFFy7rNm7cyG233YbVamX16tXodDqGDRtGXFwc9957L8HBtiHEDx06xJ49e4iLi2PIkCFIksTRo0fZtm0bERERXHfddajV1f2OLZbqUR4d19icmq13d0JgjMus2tvsY9c7s8hmVufNxSKbMctmLMo/81n/63jfxC/Z/mrIPk35crkuS/V5alxvLfvUcrzV/nI+zooFi2xGb63kd90n1bMeOtmbd9xlJuS+YY2fSEsQBEEQBOFSkJOTQ1pamhJ8gK3VYMyYMRQVFTFt2jQGDx5MTk4OH330EVarFavVislkQpZlnnzyScrLy4mPj+epp54iNzeXffv28cILL9ClSxfMZjPLltnm9Dl16hTTp0+nrKwMvV7PtGnT6NatG1lZWXz00Ucu9XrjjTfYvXs3/fr1Y8GCBej1tqHi//vf/3L06FF69OjBa6+9xtGjR895jStXriQ9PZ2FCxeyYcMGunbtytSpUyksLOSLL76gpKSE5cuX8/XXX9OnTx/++usvvvvuO06dOsXLL79M37592blzJ/Pnz2/CT77xmq0FRCWpGBDeRRnbfGPWfp7tWT1rrYzMhrzfya6yTb5UczZv4UJJkgQy7CvZxBlDJuEerV1aQZwnGPPSuNPnPGbyFQRBEARBuBTodDqio6Nd1mk0GoYNG0ZxcTGvv/46fn5+xMXFsXTpUmJiYggLC2Po0KFkZWVRWlrKqFGjALjqqqtYtWoVe/bs4YknnqBv37707duXzZs3K2V37dqV22+/vdayHSoqKli/fj2rVq1CpVLRrl07rrnmGsrKytiyZQtz584FYNy4cSxdupSEhOpslMLCQiVVDODVV19V3hsMBqqqqmjdujXff/+9S4vLN998w4cffkh0dDRt27Zl69ateHl58d///hetVku7du1ITT13/+zm1GwBCMCgiO5KALK/4CRFhjJleF6z1ciK3J9Bku0JQyIAaR4yVdYKlubM4cGYV122rNdVByADI7q7TL4lCIIgCIJwOQkNDSU7O9tlXVVVFfv376d169a8/vrrDBw4EFmWsVpdJzDNy8sjLy+PTz75RFnXpUsX/vzzT8LCwpR1gYGBNd5XVFTUWXZOTg7BwcGoVLakI29vb9zc3MjLy6OystLlfN27u3ZVCAoK4vPPP6/1WidOnIhareaZZ54hKCiI2bNnK9tyc3OVVCx/f3/GjBnDkSNHeO2117jqqqvIzc2t51O8OJp1go3rWvdX3ltlK8vSttqXZPYWbyS7KhUtbrjhjpv41zz/JHe0khvbCleQZ9ApP4/TZdkcKkxRlkdFV+ckCoIgCIIgXG5at26Nn58fmzZtUtYtW7aMNWvWsGrVKgYNGsS0adNc+mGArS9GbGws7u7uvPTSS8yaNYuYmBh8fX3p0KED+/btU/Y7cOBAjfPWV3ZUVBQ5OTmUlpYCcPToUQwGA9HR0bi5ufHss88ya9Ys+vbt26gRuxYuXEj//v35+eefcXNzY9euXcq2du3acfjwYQCSkpKYM2cOCxcuZNKkSUydOtWllaWlNOsj7za+EXTwb8XJEttEhEvTtnJXx+sAic5+/Xi/6zJlXxnZnh4kKWlCyn8l527pTTIOVR3rGzWU1oWdXXZZamRdXI917o4uKx3QZXsp1eU4z6my5PQW5b1aUjG27cAGnE8QBEEQBOHSJEkS7777Li+88AJLliwBQK/X8+abb5Kens7zzz9PUVERRUVFVFRUALab9XfeeYf33nuPMWPG8MgjjxAWFkZxcTETJ04kMjKSp556isOHD1NYWIi3t3eN8/br16/WsgE8PT2ZMWMGDzzwAD169KC0tBRvb2/c3d15/PHHeeSRR4iLiyM1NZX33nuvwdcaHR3N888/T9euXcnOzqZLly7KthkzZvDKK6/Qp08fjhw5wssvv4xOp+ODDz7g8OHDZGZm4u/vf74fc5NQ7k51Op0xKipK29QnmL1/Lu8fnG8/mcTuW+YQ5X1hkwtaLBby8vKIiIhoiio2mizLl32flcGLpnKqNMv2PqIHv1zzWgvXSBAEQRAEoWnk5ubi7e3tEjBUVVVRXFxMeHi4y31cRUUFXl5eSJJEZWUler1eSWFyyM/Px9/fH6229lvlusp2MJlMFBcXExIS4rLdaDRSUlJSY31DGAwGioqKCAsLU1K8HCwWC/n5+YSEhCijXZWXl6PX65UhiS82nU5nbNWqlTuAMv7WjBkz/u3r66uu+7DzE+UdwpxjfyrLAe4+DAjvCthu5FesWEFBQQFGo5G8vDw2bNhA586dAUhMTCQjI4OCggIMBgMnTpwgOjqaZcuWERwczKFDhygsLOTo0aOcOnWKiooK9u/fT1lZGWFhYWzbto2jR4+SnZ1NZGQkarWa1NRUNm7cSEFBASqVCjc3N5YsWYJerycyMhKw/RJt3bqVtLQ0VCoVhw4dIiUlhYKCAvbv34/JZGLx4sXExcWh1Wr5888/iY2N5dixY6SmppKVlUVFRQUbNmwgKiqKjRs3UlZWRmRkJHl5eSQmJmIymQgKCqKoqIgff/yRXr16IUkSycnJHDlyhLS0NNq0acNff/1FRkYGAG5ubnz33Xd06dIFSZJYunQpOp0OLy8vTpw4wbZt25TOSF26dEGj0ZCUlMSxY8fw9/dXOijtOHOEz5MWKT+T6d0n0jWoXVP/6AVBEATh/9u787gqq/yB4597L/siywgqIIsGuGGmGKmpKJhpTcvoOE05lU44pjVuTZb9Wl7NmJnGvHTGXHDLaXEnl7RJSqERREENQ8GNTQivLArcy4W7/f4gnsCtXOC6fN9/3fM85znP93L5437vc873CGETjWstmrKzs8PNze2SL/oODg7KMXt7+8tOhXJxcWlWtvZiVxq7kUajwdXV9ZLzVzr+a1ztnmq1Gjc3t2aJiYODw2Wf4LSW6upqc3x8/D+ghdeAAAS7d+B+325K+9MTX2OymIGGR2UrVqygZ8+e+Pr6EhoayocffkhRURGrVq0iOzubqKgoXFxcOHPmDLt27QJAr9dTVVXFhg0bCAgIQKvVUlxcTGhoKOHh4bz88sucP38evV5PTk4OoaGhxMXFYTab8fT0ZMWKFfTv35+33nqL8vJyVq1aRWhoqFL/+JlnnqFnz54MGDCA/Px81Go1u3fvJj09HZVKRWBgIL169eLpp5/GYDDw6aef8t133/HFF18QFRWFl5cXdnZ2rFy5kjZt2igxWa1WEhISMJvNSpUGLy8vjh07xsaNGzlx4gRz5sxh4MCB+Pv7o1KpWL16Nffeey8vvPACrq6u1NXVsWDBAjQaDcuXLyc8PJyXXnoJHx8fVq1ahbu7u9IHYP78+QQHBzerjrAmd6fy2lnjyG+DBrTsP4EQQgghhBA/afEEBODZsIeV18W6c/y3aF+z84cOHWLPnj188803PP744yQkJJCenk5ERAQAnTt3pqKiQkkQGjM9JyenZo+RnJycSE5OpkuXLnz//fdKv/bt21NYWIhGo1EqFjQmErm5ueh0OpKSkpTxS0tLlSSia9euzR63nTp1SlnYc//997N48WLq6urIzMykR4+GJzuhoaG4u7sr1zTGtHv3bsaPH8+KFSv46KOPACgvLyckJIRly5aRnZ1Nly4NpXAzMjLIyckBYMmSJYwbNw6j0YhKpSIxMRGzuSGJW7hwIZMnT1Z2vWzax2QyMWXKFJ599lnS09Mb3pu+nO1KMQB4LPhBXO2df/2HKYQQQgghxA1olQTk0aAB/MapjdJeerRhYZDVakWn0xEaGsrw4cM5ffo0L774IikpKYwfP57NmzeTlZVFamoqAwYMoKCggMOHD+Pm5oZOp1PKnOl0OvR6PWVlZTg4ODB9+nSWLVuGTqejqKiITZs28fTTTwM/z7Xbt28fer2eyMhIjEYjAQEB7NmzB4BRo0axceNGjhw5glarRafTodPpqKmpARqShjNnzmAymZg4cSIajYYxY8aQnJzM4cOHSUtLw9nZGb1eT35+frOYGqdcZWZmArBp0ybGjRtHYGAgvr6+lJSUkJmZyfbt25V7jxo1ipUrV5KQkMDo0aN5+OGH2b59O1VVVcTFxTF37lzOnz9PdXU169evV/p89tlntG/fnmXLlvH1118DsCJnOyarWfks/tL9iZb98IUQQgghhGiixRehN1pwZD1zD32itNfGvssgv16X7bt7926Sk5OZNm0aDg4OODs3/EJvtVoxGAw4OztjMplIS0vjwIEDqNVqgoKCeOSRR5T5fvHx8bRr144xY8ZcccHQ1ZjNZsxm8yXzBy+nsrKSpKQkYmJicHFxaTbdqan4+Hjq6uqIjIwkLCyMoKAg5VxxcTHvvvsus2bNwsfHh8rKSpYsWcL48eMJCQnh8OHDfPDBB8TFxREZGcmMGTOYMmUK3bt3Z9euXXz22We89NJL9OnTB4Dq6mpmzJhBbGwsHh4eDBgwgHo7C/dvfgG9yQBAjH8k/4l565r/NkIIIYQQQlyLpovQWy0BqarX0XfTn6k26gHo49OFbSM+uGL/i6dbXU1paSlOTk54eno2u95qtV5SFcDWLBbLVWP6pfPX2rdpn3czVjZbfL51xAdEyu7nQgghhBCihTVNQFrt23kbB1cmNpnuk3kuhx0FqVfsr1KpfnVFgPbt2yvJh16vp6CgQNny/nqVlpYqSdD12rFjhzJtq9HlYrJYLJw9e/aK56/k1/Rt7HOmRsuqnJ/3XRncoZckH0IIIYQQotW1eBnepnp6d+azk7uoNdUBkFVximfDR6BRXX+icOTIERITEzEajRw9epROnToxc+ZMRo0aRXZ2Nrm5ucyZMwd3d3feeecdVCoVbdu2ZcOGDWzZsoWysjIKCws5fvw4a9euZcuWLURGRlJQUEB8fDzDhw/HYDBw6NAhZsyYQdu2bdm5cycBAQFMmjSJjh07KhWtZs2aRXV1NXl5eeTk5JCYmIi/vz+pqalUV1eTlZXF66+/TmxsLAsXLsTe3p69e/fStWtXVq9eTWlpKV26dCEnJ0eZVlVXV8frr7/O6NGjbyihmrnvI7Ir85T2vwZOv+H9WIQQQgghhPg1WrUMb1Ou9s5M7/mU0s6v/pHF2Yk3NOYbb7zB6NGj6devH4MGDcLe3p7g4GAWLFhAZGQk3bt3x2QyMWTIEGpqavDy8qK6uho/Pz88PT0ZPXo0H3zwAWq1GovFwrlz5zAajeh0OnJzc9FqtTg6OnLvvfdSW1tLdHQ0//vf/ygrK+Ps2bNcuHBBicVgMGAymQC47777MJlMODk5sXz5cjw9PRk+fDh1dXWsWbOGsLAwoqKiGD16NGazmY4dO7J48WIAwsPDCQkJwd7eXrnmarWnf8l3P37PlvzvlPajQQPk6YcQQgghhLCJVl8g8aewh+ni+fPi6/jvP+dUVfF1jxcYGEhhYSEAhYWFpKWlERkZyb59+5QqWU317dsXR0dHpa3T6WjTpqFCl7OzMzqdDicnJ3JycoiOjmb16tWXTAWrq6vD09MTLy8voqKiqK6uVs5169aNgQMHKgvf/fz8SEhIIC4uDjs7OwA6duyoxFxTU0NeXh5arRYvLy9lr5HGhKPxmuulNxl4Je1fSttBbc9bfcbd0JhCCCGEEEJcr1adggWgVqkJ8+jI+lPfAmC2Wvi+7CR/uCcW9XXsAjl06FAyMzOpqanB09OTyspKhg4diouLCykpKURERKBWq+nRowd6fcMC+DNnztCuXTuMRiOlpaVMnDgRi8WCt7c30dHRxMXF8fzzz/P4448ze/ZsnnjiCYxGIwaDAb1ez8iRI/H29qaurg61Wo1Op6Ndu3bodDqlnK5er0elUuHs7Ex5eTmurq707t0bg8HA2LFjuXDhAmVlZdTX16PX6xk6dCh9+/Zl7ty5jBo1Cr1ej6OjI4GBgRgMBnr37n1du2S+m7GSPSWHlParvcYyrGPfax5HCCGEEEKI69V0ClarVcG62N/SFvHpif8q7Zm9xjKl55ibeo+tW7cSERFBSEjINV2XlZXFoUOHGDVqFFVVVRw4cICRI0deVznfa5WRkUF9fT39+/e/4bGSSw7xdNLbNC6l7+4Vws5H4rFTt3ieKYQQQgghhMImZXgvVmPUM2TryxTrzgGgUalJHP4+kb6yNuFm0NZWMnz7VM7WVgJgr7bjq0fi6eoVbNvAhBBCCCHEXccmZXgv5mbvwr8fnI76pwpYZquFuOT30f70hVlcP6PFRFzy+0ryATCr97OSfAghhBBCCJuz6S59Ue2689eI3yvts7UVjN/9HnXmehtGdft7I30pB7THlHa0X2/+0u2Jq1whhBBCCCFE67ixEks3wYx7/8j3ZSfYXXIQgINluUzdu4CPBr5yXYuu73ZLsr/gkyZra4Ld27Nk0N9sGJEQQgghxI378ccfSUxMxGAwtMj4Dz/8MN26dWuRsUVzNk9ANCo1Hw16hZFfvkJedQkAW/K/I9i9AzPvG2vj6G4vOwv38W7mSqXtZu/Myug3aOPgasOohBBCCCFuTElJCa+99hovvfQSfn5+LfIjtY+Pz00fU1yezRMQAA8HN/4T8xaP7HiFC/U1ACw4sp62zh78uctvbRzd7eFw2QkmfzdfaWtUapYOepUuXkFXuUoIIYQQ4ta3evVqZs2aRZcuUqzoeh05cgS9Xk9UVJStQ7HtGpCmOrXxY9WQN3DSOCjH3tyfwJrcnTaM6vaQU1nAn759F0OTtTOz7/8LQ/z72DAqIYQQQoibo6Ki4rqTD4PBQGlpKRaLRdkIGuD06dOX7f/DDz8AUFBQgFarxWq1kpaWRmlpKVarlYyMDADy8/M5ePDgJX1zcnIAsFqt7N27lz179mC1WrFYLOzevZt9+/Zx/PhxtFot2dnZFBQUAJCbmwuAyWTi9OnTaLVacnNz2bZtG1qtlqqqKo4fP8727duV91FUVMTOnTupqqpq9n6//vprZbxz587x5ZdfcuzYMSorKy+5T6OCggK2bdtGRUUFVVVVHD16lOPHj1/X3/yX3DIJCMAD7bqzasgbOGp+rgb8Wvpi/nVkgw2jurXt1x7l8a9mUm64oBx7/b4/8Wz4CBtGJYQQQghx82g0zfcwW7RokfI6KSkJo9FIcnLyZa/dvn07ZWVlpKWlKV++AaZPn87cuXMv6b9+/XqqqqpYt24d69atIzc3l5SUFNasWUNeXh5vvvkmer2eFStWsHnz5kv6pqenA5CamkphYSGFhYWkpKQwb9483NzcqKmpYcGCBWRkZJCYmIiXlxcAa9asAUCv17Np0yYyMjJYs2YNYWFhvPfee+Tl5TFv3jzCw8OZM2cOZ86cYfXq1XTp0oX3339fiX/27NkEBwezdetWsrKymDt3Lj169ODw4cOXvQ+A2WwmISGB8PBw4uPjycvLY+nSpXh7e1/bB/Ur3VIJCMBgv/v4eOibOGsclWNzDv2HN9KXYrFabBjZree/Rek8testqo165dik7r/j5SaVxYQQQggh7jQHDx5k+vTpbNu2jeXLl7N582aWL1/OokWLmD59Om+++Sb79++npqaG7OxsevTowZ49e4iOjlbGcHBwoKioiNmzZzcbe+jQoaSmpuLk5IROpyM1NZWxY8dy/vx50tPTmTBhAvv27cPZ2ZnY2NhL+sbGxgLg7+9PeXk5BQUFnD9/ntLSUvr27UtsbCxubm4AREdH06ZNm2b3N5lMyuuYmBjCw8NxdW1Yzzt48GBCQ0Px9vYmIyOD2tpakpKSqK2tVZ6yZGdnk5ycjMViYdeuXfTu3ZugoCCGDRt2xfsABAcHs3fvXmpqGpZDDBgwgLZt297Ap3Rlt1wCAjCoQy/WDXu32eLpVblfMjFlnpTo/cnHuTv48573mk27mtX7Wf6vz/O2C0oIIYQQohV07tyZCRMmYDQaCQ8PZ8SIEYSGhuLu7s7gwYOxWCx06NABrVZLUFAQ1dXVuLi4YG//8ywbb29vYmJiCAgI4O2338Ziafihu1+/fmzcuJGwsDDc3d0pKCjA39+f4OBgsrOzGTFiBKtWraJfv36X7evn58fx48f5/PPPefTRR+nZsydWqxWVSkVlZSX5+flUV1cDDU926urqyM/PR6PRoNVqlScVAM7Ozs3et5OTEwAqlYqgoCA6derE+PHj6dy5M+fOneP8+fN07NiRcePGER4eTr9+/Th69CjQsAak8Z5N73Pq1CmOHj1KTU0NY8aMURITtbrl0gTledaMGTPedHd311ytc2vyc/Uh1r8vO4v2oTM1lFs7fqGI3SWZDPHvc9dWdqo3G3lj/1Lis9Zi/emYWqVi7gOTeaHrYzaNTQghhBCiJSQlJTX7Bd/Dw4OAgAC8vb3x8PDAwaFhDbFWq8VoNDJgwAAAUlJSePLJJ9m/fz+RkZHNftH/8ssvGTRoECNGjKC0tJRPP/2UoUOHYm9vj9VqZeDAgfj7++Pj40NQUBAdOnTAxcWF8PBwjEYjw4YNw9HR8ZK+HTp0IDk5meHDh7Nlyxbc3NwIDQ2lQ4cOpKSkcOHCBWpqahgyZAje3t5YrVaysrIYOXIk69atw9XVlfDwcAIDA5X3BxASEoKbm5tSrat///6UlJSQlJTEQw89RHl5OQaDgf79+7N+/Xrc3Nx46KGHsLe3Z8eOHYSEhBAWFsYDDzzQ7D75+fn07NmTEydOkJOTQ9++fenUqVOze90M1dXV5vj4+H8AKDXMiouL6/38/OyvfJltFNWc5ZmkdzhZVawc83Zsw78HTifar7cNI2t9hTVnmZQyn4NlP89fdNI4sHjQ3xje0fYVDYQQQgghWsIrr7zC/Pnzf7Hf6dOn8fX1VaY4Xc3EiRNZtGgRxcXFBAYGsmHDBlJTU5k3bx52dje/UOzatWuVxeMxMTH06XN3FQsqLi6uDwgIcIRbpAzv1XR0a8cXI+YyOeVDkn88BEBFXRVPJ73DhK6P8Xrv55otWr9TJeYl89q+xc3We/i7+pAweCa92obZMDIhhBBCiJbVpk0b8vPzCQ4Ovmq/Tp06XdO4Go2GwMBAAH7/+9/j6OjIjBkzmDdvnvJU5WZ56qmnbup4t7Nbcg3Ixbwd2/Bp7NvM7DUWjernkJcd28qwbVNIP5ttw+haVomujOe+/TuTv/uwWfIR6x9J0m8XSPIhhBBCiDveH//4R/7+979TXFz8y51vwGOPPcaIESOYOnUqdXV1LXqvu9ktPwXrYulnjzL5u/mU6MuaHX/qnlheu28svs4tUy6stdWbjazI2cY/s9ZRY6xVjtur7fi/Ps8TJ+s9hBBCCHEXOXLkCBs2bFD2zfg17OzsWLhwoVJFqqkXX3yRxYsXK+2qqiqKi4uprKxk8+bNVFRUsHLlypsSu7jNpmBdLKpdN5J+u4CZ+z5iW8Fe5fjak0lszf8fk7o/SVzXx3F3cLFhlNfPbLXwRV4KHxz+hKIabbNz4Z6BLHxwGhHenW0UnRBCCCGEbURERBAREXHTxrNaG8r56HQ6MjMzycrK4uTJkzzwwAPExMTg6+t70+4lmrvtEhAAT0d3lg6eyROFabyevgRtbSUAepOB+d9/TsKxrbzQ9TGeCx9JWycPG0f769SbjWzOS+ZfRzaSV13S7JydWsPLPUYztecfsFfflh+ZEEIIIcQtR6fTMWXKFKqqqoiPj2f+/PmyVqMV3HZTsC5WbdSzJDuRpUe3oP+pXG8jR7U9jwUP5LnwEfT2CbdRhFdXWF3K5yeT+OTEf5vtZt7oyZBBvNLrGULcO9ggOiGEEEKIO9O4ceNQq9VMnjyZvLw8VCoVe/fuZdq0aQQEBNg6vDtO0ylYt30C0qis9jwLf9jAf45/RZ3ZeMn5Tu5+jLknht+FDCbAzbaP1C7U17CjII11p5LYrz122T7DAvoy876xdPMKaeXohBBCCCHufBMmTGDSpEn06tULg8HApEmTmDp1Kl999RWvvvqqrcO749yRCUijUn05C49sYO3JpGa7hDcV5dud2IBIBrSPIOI39zSrrNUSrFg5XVVCaukR9pQc5JszmdRbLk2SVEBsQF+m9vwD90l1KyGEEEKIVvPhhx8SHR1NQkIC//znPy/ZhVzcmDs6AWlUYahide4OPjn+FaW1FVfs527vQpRvNx5o34PuXiGEtPEj0K3dDd1bW1vJ6aoScs4XsF97lLTSHzh7lRhc7Bz5XUg0cd0eI9Sj4w3dWwghhBBCXLvi4mKmTZuGSqVi9uzZ3HPPPbYO6Y5yVyQgjcwWM0nFGaw/9S0pJYfQXbRO5HIc1PYEu3egcxs/fuPkgau9M272l8+Ca0111BhrOV9fTV7Vj5yqKr5kLcrlaFQaotp14/HggTwRMgh3+9uzapcQQgghxJ0iOzub0NDQm74JobjLEpCm6i0m0s9m801xBt8WZ3LywplWvb+vsxdD/fswxK830X69b9tSwUIIIYQQQlyLuzYBudiZGi3p2mz2a4+See44Jy4UYrSYb9r4Ie4d6NU2lPt9u3G/bze6egXftLGFEEIIIYS4XdzWGxHeTAFuvgS4+TKq0xCgYS+OExeKKKrRoq2tpKKuilJ9BWWG81QYqtCZatGb6jBbzbjYOeFq54yXozttnT1p6+SBr7MXPk5e+Lm2patXEC52TjZ+h0IIIYQQQtxa7uoE5GIOGnu6e3eiu3cnW4cihBBCCCHEHall688KIYQQQgghRBNKAqJSqa7WTwghhBBCCCGuS9NcQ0lA6urqdDaJRgghhBBCCHFHq6+v1ze+VhIQvV6fY5twhBBCCCGEEHeyprmGkoDs3r17pcVisU1EQgghhBBCiDuS2WwmOTl5RWNb0/iivLz88IMPPjjEx8cnyDahCSGEEEIIIe40OTk5yY888shfG9tKAlJcXGw9cODAFw8++GBfDw+PThqN5vIjCCGEEEIIIcQvqK+vJzc395tx48Y9WVxcXNd4/LKlr5577rlHX3311dEajaarRqOR3fSEEEIIIYQQv4rZbDaYTKZj8+bN2/Txxx9vu/i81N4VQgghhBBCtJr/B/Y0sisvbgRHAAAAAElFTkSuQmCC";

window.generarPDF = function (index) {
    const doc = new jsPDF(); // Orientación vertical

    // Cargar imagen de membrete (Base64 o URL)
    const imgData = dataImag;

    // Añadir imagen de membrete
    doc.addImage(imgData, 'PNG', 5, 5, 200, 30); // Ajusta tamaño/posición según tu imagen

    const selectElement = document.querySelector(`.selectGrupo[data-index="${index}"]`);
    const materia = selectElement ? selectElement.getAttribute('data-materia') : "Materia no especificada";
    const grupo = selectElement ? selectElement.value : "Grupo no especificado";

    // Texto debajo del membrete
    const fecha = new Date().toLocaleDateString('es-ES');
    doc.setFontSize(10);
    doc.text(`PDF Generado para: ${materia} - ${grupo} - Fecha: ${fecha}`, 105, 45, { align: "center" });

    // Obtener la tabla y generar PDF
    const table = document.getElementById(`listas-${index}`).querySelector("table");
    if (table) {
        doc.autoTable({
            html: table,
            startY: 52,
            margin: { top: 10, left: 5, right: 5 }, // Márgenes reducidos
            tableWidth: 'wrap', // Ajuste automático al nuevo ancho
            styles: {
                overflow: 'linebreak', // Divide texto largo en varias líneas
                cellWidth: 'wrap',
                fontSize: 7, // Tamaño reducido para mayor espacio
                halign: 'center',
                valign: 'middle',
            },
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: [255, 255, 255],
                halign: 'center',
                fontSize: 8,
            },
            bodyStyles: {
                halign: 'center',
            },
            columnStyles: {
                0: { cellWidth: 8, halign: 'center' },   // Orden
                1: { cellWidth: 38, halign: 'left' },   // Apellido y Nombre alineado a la derecha
                2: { cellWidth: 20, halign: 'center' },  // DNI
                3: { cellWidth: 17, halign: 'center' },  // Asistencia
                4: { cellWidth: 15, halign: 'center' },  // 1° Parcial
                5: { cellWidth: 17, halign: 'center' },  // Recup. 1° Parcial
                6: { cellWidth: 15, halign: 'center' },  // 2° Parcial
                7: { cellWidth: 17, halign: 'center' },  // Recup. 2° Parcial
                8: { cellWidth: 17, halign: 'center' },  // Extra Parcial
                9: { cellWidth: 18, halign: 'center' },  // Coloquios Aprob.
                10: { cellWidth: 18, halign: 'center' }, // Condición
            },
            didDrawPage: function (data) {
                // Línea separadora en cada página
                doc.line(5, 50, 205, 50);
            }
        });
    }

    doc.save(`Lista de Alumnos_${materia}_${grupo}_${fecha}.pdf`);
};



function contarAsist(registros) {
    let n = 0;
    let nj = 0;
    let nPorcent = 0;
    const primerReg = registros[0].valor;
    const total = registros.length;
    if (primerReg == null && total == 1) {
        nPorcent = "---";
    } else {
        registros.forEach(item => {
            if (item.valor == "P") {
                n++;
            } else if (item.valor == "AJ") {
                nj++;
            };
        });
        const m = total - nj;
        if (m != 0) {
            nPorcent = (n / total) * 100;
            nPorcent = nPorcent.toFixed(1).replace('.', ',')
        };
    };
    return nPorcent;
};


function evaluarParcial(notasArr, actividad = "parcial1") {
    const parcial = notasArr.find(nota => nota.actividad.toLowerCase() === actividad);
    if (!parcial) {
        return "---";
    };
    const estado = parcial.valor >= 6 ? "Aprob" : "Desp";
    return `${parcial.valor} (${estado}.)`;
}

function calcularPorcentajeAprobados(actividades) {
    if (actividades.length === 1 && actividades[0].valor === null) {
        return "---";
    };
    const actividadesExcluidas = ["parcial1", "parcial2", "recup1", "recup2", "extra"];
    const actividadesValidas = actividades.filter(actividad =>
        !actividadesExcluidas.includes(actividad.actividad)
    );
    if (actividadesValidas.length === 0) {
        return "---";
    }
    const totalActividades = actividadesValidas.length;
    const aprobados = actividadesValidas.filter(actividad => actividad.valor >= 6).length;
    const porcentajeAprobados = (aprobados / totalActividades) * 100;
    return porcentajeAprobados.toFixed(1);
};






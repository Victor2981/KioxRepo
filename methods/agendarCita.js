var selIdAppointmentGlobal = "";
var urlCitasGlobal = "/Appointment"
var selIdPatientAgendarGlobal;
var selIdServiceAgendarGlobal;
$(document).ready(function(){
    const urlQueryString = new URLSearchParams(window.location.search);
    const idAppointmentQuery = urlQueryString.get('idCita');
    const operacionCita = urlQueryString.get('op');
    if (idAppointmentQuery != "" && idAppointmentQuery != null) {
        selIdAppointmentGlobal = idAppointmentQuery;
    }

    $(".chkRegendar").change(function() {
        var valor = $(this).val();
        $(".dvReagendar").hide();
        $(".dvNoReagendar").hide();
        if (valor == "1") {
            $(".dvReagendar").show();
        } else {
            $(".dvNoReagendar").show();
        }
    });

    $(".txtFechaCita").change(async function() {
        var fecha = $(this).val();
        if (fecha != "" && fecha != null) {
            populateAppointmentData(selIdAppointmentGlobal,fecha);
        }
    });

    $(".ddlMotivoNoReagendar").change(function() {
        var valor = $(this).val();
        if (valor == "5") {
            $(".rowComentariosNoReagendar").show();
        } else {
            $(".txtComentariosNoReagendar").val("");
            $(".rowComentariosNoReagendar").hide();
        }
    });

    $(".btnAceptarReagendar").click(async function() {
        var tipoRegendar = $(".chkRegendar:checked").val();
        if (tipoRegendar == "1") {
            var banValidacion = true;
            var idService = $(".ddlServicio").val();
            var fecha = $(".txtFechaCita").val().substring(8,10) + "/" + $(".txtFechaCita").val().substring(5,7) + "/" + $(".txtFechaCita").val().substring(0,4);
            var horario = $(".itemHorario.selected").data("horario");
            var horarioFin = $(".itemHorarioFin.selected").data("horario");
            horario = horario.padStart(5,"0");
            horarioFin = horarioFin.padStart(5,"0");
            // // convertir horario a fecha
            // var [hora, minutos] = horario.split(":").map(Number);
            // var [horaFin, minutosFin] = horarioFin.split(":").map(Number);

            // var fechaHora = new Date();
            // fechaHora.setHours(hora);
            // fechaHora.setMinutes(minutos);
            // fechaHora.setSeconds(0);

            // // sumar 1 hora
            // fechaHora.setHours(fechaHora.getHours() + 1);

            // // formatear HH:mm
            // var horaFin = fechaHora.toLocaleTimeString('es-MX', {
            //     hour: '2-digit',
            //     minute: '2-digit',
            //     hour12: false
            // });
            var datosCuentaUsusario = JSON.parse(sessionStorage.sesionUsuario);
            datosEmpleados = Object.values(parent.lstEmployeesGlobal).filter(x => x.uId == datosCuentaUsusario.uId)[0];
            if(banValidacion == true){banValidacion = Validador($(".ddlServicio"),"servicio",idService,1,'')};
            if(banValidacion == true){banValidacion = Validador($(".txtFechaCita"),"fecha",fecha,10,'')};
            if(banValidacion == true){banValidacion = Validador($(".itemHorario.selected"),"horario",horario,8,'')};
            if (banValidacion) {
                await agendarCita(selIdPatientAgendarGlobal,datosEmpleados.IdBranch, datosEmpleados.uId, $(".ddlCategoria").val(), $(".ddlServicio").val(), fecha, horario, horarioFin,"");
                await db.runTransaction(async (transaction) => {
                    const citaRef = db.collection(urlCitasGlobal).doc(selIdAppointmentGlobal);
                    transaction.update(citaRef, {
                        Status: StatusAppointment.Finalizado
                    });
                });
                Redireccionar("/views/IngresosEgresos/validacionPago.html?idPacientePago=" + selIdPatientAgendarGlobal +"&idCita=" + selIdAppointmentGlobal);
            }
        }
        else {
            var banValidacion = true;
            var motivoNoReagendar = parseInt($(".ddlMotivoNoReagendar").val());
            var comentariosNoReagendar = $(".txtComentariosNoReagendar").val();
            var datos = await selectDb(urlCitasGlobal,selIdAppointmentGlobal);
            var datosPaciente = parent.lstPatientsGlobal[datos.IdPatient];
            selIdPatientAgendarGlobal = datos.IdPatient;
            if(banValidacion == true){banValidacion = Validador($(".ddlMotivoNoReagendar"),"motivo",motivoNoReagendar,2,'',false)};
            if (motivoNoReagendar != "" && motivoNoReagendar != null) {
                if (motivoNoReagendar == 5) {
                    if(banValidacion == true){banValidacion = Validador($(".txtComentariosNoReagendar"),"comentarios",comentariosNoReagendar,1,'',false)};
                }                
                if (banValidacion) {
                    var datosCuentaUsusario = JSON.parse(sessionStorage.sesionUsuario);
                    datosEmpleados = Object.values(parent.lstEmployeesGlobal).filter(x => x.uId == datosCuentaUsusario.uId)[0];
                    var datos = await selectDb(urlCitasGlobal,selIdAppointmentGlobal);
                    saveNotReschedule(datos,motivoNoReagendar,comentariosNoReagendar, datosEmpleados.uId);
                    await db.runTransaction(async (transaction) => {
                        const citaRef = db.collection(urlCitasGlobal).doc(selIdAppointmentGlobal);
                        transaction.update(citaRef, {
                            Status: StatusAppointment.Finalizado
                        });
                    });
                    Redireccionar("/views/IngresosEgresos/validacionPago.html?idPacientePago=" + selIdPatientAgendarGlobal +"&idCita=" + selIdAppointmentGlobal);
                }
            }                
        }
    });


});

document.querySelector('.LstHorariosDisponibles').addEventListener('click', function(e) {

    if (e.target.classList.contains('itemHorario')) {

        // =========================
        // SELECCIONAR HORARIO INICIO
        // =========================

        document
            .querySelectorAll('.LstHorariosDisponibles .itemHorario')
            .forEach(i => i.classList.remove('selected'));

        e.target.classList.add('selected');

        let horarioInicio = e.target.dataset.horario;

        console.log("Inicio:", horarioInicio);

        // =========================
        // GENERAR HORARIOS FIN
        // =========================

        const contenedorFin = document.querySelector('.LstHorariosFinDisponibles');

        contenedorFin.innerHTML = "";

        // convertir hora inicio a minutos
        const [hora, minuto] = horarioInicio.split(":").map(Number);

        const minutosInicio = (hora * 60) + minuto;

        // opciones permitidas:
        // +1 hora
        // +1.5 horas
        // +2 horas
        const opciones = [
            60,
            90,
            120
        ];

        opciones.forEach(minutosExtra => {

            const totalMinutos = minutosInicio + minutosExtra;

            const horaFin = Math.floor(totalMinutos / 60);
            const minutoFin = totalMinutos % 60;

            const textoHora =
                horaFin.toString().padStart(2, "0") +
                ":" +
                minutoFin.toString().padStart(2, "0");

            const li = document.createElement("li");

            li.className = "itemHorarioFin";

            li.dataset.horario = textoHora;

            li.innerHTML = textoHora;

            contenedorFin.appendChild(li);
        });
    }
});

// ==========================================
// SELECCIONAR SOLO UN HORARIO FINAL
// ==========================================

document.querySelector('.LstHorariosFinDisponibles')
.addEventListener('click', function(e) {

    if (e.target.classList.contains('itemHorarioFin')) {

        document
            .querySelectorAll('.LstHorariosFinDisponibles .itemHorarioFin')
            .forEach(i => i.classList.remove('selected'));

        e.target.classList.add('selected');

        let horarioFin = e.target.dataset.horario;

        console.log("Fin:", horarioFin);
    }
});

async function populateAppointmentData(idAppointment,fecha) {
    $(".dvLoader").show();    
    $(".LstHorariosDisponibles").empty();
    $(".LstHorariosFinDisponibles").empty();
    var datos = await selectDb(urlCitasGlobal,idAppointment);
    if (datos != null) {        
        var datosPaciente = parent.lstPatientsGlobal[datos.IdPatient];
        selIdPatientAgendarGlobal = datos.IdPatient;
        selIdServiceAgendarGlobal = datos.Service.IdService;
        var lstHorarios = await obtenerHorariosDisponibles(datos.IdEmployee,fecha,datos.IdBranch);
        lstHorarios.forEach(function(horario) {
            $(".LstHorariosDisponibles").append('<li class="itemHorario" data-horario="'+ horario.hora +'">'+ horario.hora +'</li>');
        });
                        
    }
    $(".dvLoader").hide();
}


async function saveNotReschedule(data,IdObservation,Observation, idEmployeeRegistration) {
    try {

        // referencia a la colección
        const ref = firebase.firestore().collection("NotReschedule");

        // objeto a guardar
        const appointment = {
            AppointmentDateStart: data.AppointmentDateStart || firebase.firestore.Timestamp.now(),
            IdBranch: data.IdBranch || "",
            IdCategory: data.Category.idCategory || "",
            IdEmployeeAttended: data.IdEmployeeAttended || "",
            IdObservation: IdObservation || 0,
            IdPatient: data.IdPatient || "",
            IdService: data.Service.IdService || "",
            Observation: Observation || "",
            IdEmployeeRegistration: idEmployeeRegistration || "",
            RegistrationDate: firebase.firestore.Timestamp.now(),
            Status: 1
        };

        // guardar documento
        const docRef = await ref.add(appointment);

        console.log("Documento guardado:", docRef.id);

        return {
            success: true,
            id: docRef.id
        };

    } catch (error) {

        console.error("Error al guardar NotReschedule:", error);

        return {
            success: false,
            error: error
        };
    }
}
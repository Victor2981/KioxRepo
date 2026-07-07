var urlCitasGlobal = "/Appointment"
// let lstAppointmentsGlobal = parent.lstAppointmentsGlobal;
let cargandoCalendario = false;
var idPatientSelected;
var TitleAppointment;
var AppointmentStart;
var AppointmentEnd;
var selIdAppointmen = "";
let selIdPacienteFiltro = "";

var lstCitasPorConfirmar = [];
var calendar;
var unsubscribeAppointments = null;
var mapaEventos = {};
var rangoActualCalendario = {
    inicio: null,
    fin: null
};
var lstCitasPorFisioterapeuta = [];
let abierto = false;

$(document).ready(function(){        

    $(".rowSucursal").hide();

    $(".btnConfirmAppointments").click(function(){
        window.location.href ="confirmacionCitas.html";
    });

    $('.txtHoraInicioCita').change(function(){
        var hora = parseInt($('.txtHoraInicioCita').val().substring(0,2));
        hora += 1;
        $('.txtHoraFinCita').val(hora.toString().padStart(2, "0") + ":" + $('.txtHoraInicioCita').val().substring(3,6));
    });
    
    $(".txtEmpleadoGeneral").keyup(function(){
        var textSearch = $(".txtEmpleadoGeneral").val().trim();
        var idTxtEmp = $(".txtEmpleadoGeneral")[0].id;
        $(".autocomplete-items").empty();
        $(".autocomplete-items").remove();
        if (textSearch != "") {
            var lstPatients = searchPatients(textSearch);
            //llenarTablaPacientes(lstPatients);
            var a, b, i;
            currentFocus = -1;
            a = document.createElement("DIV");
            a.setAttribute("id", idTxtEmp + "autocomplete-list");
            a.setAttribute("class", "autocomplete-items");
            this.parentNode.appendChild(a);
            for (i = 0; i < lstPatients.length; i++) {
              b = document.createElement("DIV");
                const idPatient = Object.keys(lstPatients[i])[0];
                const dato = lstPatients[i][Object.keys(lstPatients[i])[0]].datos;
              b.innerHTML = "<strong>" + dato.Name + " " + dato.LastName + " " + dato.SecondLastName + "</strong>";
              b.innerHTML += "<input type='hidden' value='" + idPatient + "'>";
                  b.addEventListener("click", function(e) {
                    $(".autocomplete-items").empty();
                    $(".autocomplete-items").remove();
                    idPatientSelected = idPatient;
                  //inp.value = idPatient;
                  //closeAllLists();                  
                  var datosCuentaUsusario = JSON.parse(sessionStorage.sesionUsuario);
                  TitleAppointment = dato.Name + " " + dato.LastName + " " + dato.SecondLastName;
                  $(".txtEmpleadoGeneral").val(dato.Name + " " + dato.LastName + " " + dato.SecondLastName);
                    if (datosCuentaUsusario.Position == KioxPositions.Administrador || datosCuentaUsusario.Position == KioxPositions.ResponsableDeCitas) {
                        $(".lUltimoAtendiente").text(parent.lstEmployeesGlobal[dato.IdLastEmployeeAtendent] ? "Último fisioterapeuta: " + parent.lstEmployeesGlobal[dato.IdLastEmployeeAtendent].Name + " " + parent.lstEmployeesGlobal[dato.IdLastEmployeeAtendent].LastName + " " + parent.lstEmployeesGlobal[dato.IdLastEmployeeAtendent].SecondLastName : "No hay información");
                    }
                  $(".pTelefono").text(dato.Phone);
                  $(".pCorreo").text(dato.Email);              
                  $(".dvDatosCita").show();
              });
              a.appendChild(b);
            }
            $(".autocomplete-items").append(a);
        }
     
    });

     $(".txtEmpleadoGeneralFiltro").keyup(function(){
        var textSearch = $(".txtEmpleadoGeneralFiltro").val().trim();
        var idTxtEmp = $(".txtEmpleadoGeneralFiltro")[0].id;
        $(".autocomplete-items").empty();
        $(".autocomplete-items").remove();
        if (textSearch != "") {
            var lstPatients = searchPatients(textSearch);
            //llenarTablaPacientes(lstPatients);
            var a, b, i;
            currentFocus = -1;
            a = document.createElement("DIV");
            a.setAttribute("id", idTxtEmp + "autocomplete-list");
            a.setAttribute("class", "autocomplete-items");
            this.parentNode.appendChild(a);
            for (i = 0; i < lstPatients.length; i++) {
              b = document.createElement("DIV");
                const idPatient = Object.keys(lstPatients[i])[0];
                const dato = lstPatients[i][Object.keys(lstPatients[i])[0]].datos;
              b.innerHTML = "<strong>" + dato.Name + " " + dato.LastName + " " + dato.SecondLastName + "</strong>";
              b.innerHTML += "<input type='hidden' value='" + idPatient + "'>";
                  b.addEventListener("click", async function(e) {
                    $(".autocomplete-items").empty();
                    $(".autocomplete-items").remove();
                    $(".txtEmpleadoGeneralFiltro").val(dato.Name + " " + dato.LastName + " " + dato.SecondLastName);
                    
                        selIdPacienteFiltro = idPatient;

                        $(".btnBorrarFiltro").show();

                        // detener listener anterior INMEDIATAMENTE
                        if (unsubscribeAppointments) {
                            unsubscribeAppointments();
                            unsubscribeAppointments = null;
                        }

                        // limpiar calendario
                        calendar.removeAllEvents();

                        // limpiar mapa
                        mapaEventos = {};

                        // limpiar cache
                        parent.lstAppointmentsGlobal = {};

                        // cambiar vista
                        calendar.changeView('listPatient');

                        // esperar un frame para que FullCalendar termine
                        requestAnimationFrame(async () => {

                            await SeleccionarDatosCitas();

                        });

              });
              a.appendChild(b);
            }
            $(".autocomplete-items").append(a);
        }
     
    });

   $(".btnBorrarFiltro").click(async function(){

        selIdPacienteFiltro = "";

        $(".txtEmpleadoGeneralFiltro").val("");

        $(".btnBorrarFiltro").hide();

        if (unsubscribeAppointments) {
            unsubscribeAppointments();
            unsubscribeAppointments = null;
        }

        calendar.removeAllEvents();

        mapaEventos = {};

        parent.lstAppointmentsGlobal = {};

        calendar.changeView('timeGridWeek');

        requestAnimationFrame(async () => {

            await SeleccionarDatosCitas();

        });
    });
    
    $(".btnAcceptAppointment").click(async function(){
        var banValidacion = true;
        var fecha = $('.txtFechaCita').val().substr(8,2) + "/" + $('.txtFechaCita').val().substr(5,2) + "/" + $('.txtFechaCita').val().substr(0,4);
        if (parent.lstCategoriesGlobal[$(".ddlCategoria").val()].Name != "Bloqueo") {
            banValidacion = Validador($(".txtEmpleadoGeneral"),"paciente",idPatientSelected,1,'',$('.modalNewDate'));    
        }
        if(banValidacion == true){banValidacion = Validador($(".ddlSucursal"),"sucursal",$(".ddlSucursal").val(),1,'',$('.modalNewDate'))};
        if(banValidacion == true){banValidacion = Validador($(".ddlEmpleados"),"empleado",$(".ddlEmpleados").val(),1,'',$('.modalNewDate'))};
        if(banValidacion == true){banValidacion = Validador($(".ddlCategoria"),"categoría",$(".ddlCategoria").val(),1,'',$('.modalNewDate'))};
        if(banValidacion == true){banValidacion = Validador($(".ddlServicio"),"servicio",$(".ddlServicio").val(),1,'',$('.modalNewDate'))};
        if(banValidacion == true){banValidacion = Validador($(".txtFechaCita"),"fecha",fecha,10,'',$('.modalNewDate'))};
        if(banValidacion == true){banValidacion = Validador($(".txtHoraInicioCita"),"hora inicio",$(".txtHoraInicioCita").val(),8,'',$('.modalNewDate'))};
        if(banValidacion == true){banValidacion = Validador($(".txtHoraFinCita"),"hora fin",$(".txtHoraFinCita").val(),8,'',$('.modalNewDate'))};
        if(banValidacion){
            var AppointmentStart = new Date(fecha.substring(6,11),fecha.substring(3,5) -1 ,fecha.substring(0,2),$(".txtHoraInicioCita").val().substring(0,2),$(".txtHoraInicioCita").val().substring(3,6));
            await agendarCita(idPatientSelected,$(".ddlSucursal").val(), $(".ddlEmpleados").val(), $(".ddlCategoria").val(), $(".ddlServicio").val(), fecha, $(".txtHoraInicioCita").val(), $(".txtHoraFinCita").val(),$(".txtNotaCita").val());
            calendar.gotoDate(AppointmentStart);
            $('.modalNewDate').modal('toggle');                    
        }        
    });       
    
    $(".btnAcceptArrived").click(async function(){
        await UpdateStatusAppointment($(".btnAcceptArrived"),selIdAppointmen,StatusAppointment.ConfirmacionLlegada);       
        $('.modalRecepcion').modal('toggle');
        MostrarMensajePrincipal("La cita fue enviada para su atención","success");
        setTimeout(function() {$(".alert-success").alert('close');}, 2000);
    });

    // $(".btnStartAppointment").click(async function(){
    //     await UpdateStatusAppointment(selIdAppointmen,StatusAppointment.Atendido);
    //     window.location.href ="seguiminetoCita.html?idAppointment=" + selIdAppointmen;
    // });

    $(".btnStartAppointment").click(async function(){
        selIdAppointmentGlobal = selIdAppointmen;
        var datos = await selectDb(urlCitasGlobal,selIdAppointmentGlobal);
        switch (datos.Status) {
            case StatusAppointment.Registrado:
            case StatusAppointment.Confirmado:
            case StatusAppointment.ConfirmacionLlegada:
                await UpdateStatusAppointment($(".btnStartAppointment"),selIdAppointmen,StatusAppointment.Atendido);
                await UpdateAvailabilityEmployee($(".btnStartAppointment"),selIdAppointmen,parent.idUsuarioSistema,false);
                window.location.href ="seguiminetoCita.html?idAppointment=" + selIdAppointmen;
                break;
            case StatusAppointment.Atendido:
                window.location.href ="seguiminetoCita.html?idAppointment=" + selIdAppointmen;
            break;
            case StatusAppointment.Reagendar:
                window.location.href = "/views/agendaCita.html?idPacientePago=" + selIdPatientGlobal + "&idCita=" + selIdAppointmen
            break;
            case StatusAppointment.Finalizado:
                $('.modalNewDate').modal('toggle');
                MostrarMensajePrincipal("Serás enviado a el pago","success");
                
                selIdPatientGlobal = idPatientSelected;
                parent.tipoConceptoCobro = 1;
                
                if (datos != null) {
                    await db.collection(urlPackagesGlobal).where("IdPatient","==",selIdPatientGlobal).where("IdService","==",selIdServiceGlobal).where("IsPack","==",true).where("IsPackCompleted","==",false).get().then(async (obj)=>{
                        if (obj.docs.length > 0) {
                            var datosPaquete = obj.docs[0].data();
                            datosPaquete.TakenNumbreSesions += 1;
                            if (datosPaquete.NumbreSesions == datosPaquete.TakenNumbreSesions) {
                                datosPaquete.IsPackCompleted = true;
                            }                    
                            await GuardarDatosPaquete($(".btnStartAppointment"),datosPaquete,1,obj.docs[0].id);    
                        }
                        else{
                            await agregarConceptosCobroOptimizado(datos);
                        }
                    });            
                    Redireccionar("/views/IngresosEgresos/validacionPago.html?idPacientePago=" + selIdPatientGlobal + "&idCita=" + selIdAppointmentGlobal);
                }
            break;
            default:
                break;
        }
    });
    
    $(".btnPaidAppointment").on("click", async function () {
        const $btn = $(this);
    
        try {
            // Evita doble clic
            $btn.prop("disabled", true);
    
            $('.modalNewDate').modal('toggle');
            MostrarMensajePrincipal("Serás enviado al pago", "success");
    
            selIdAppointmentGlobal = selIdAppointmen;
            selIdPatientGlobal = idPatientSelected;
            parent.tipoConceptoCobro = 1;
    
            // Obtener datos de la cita
            const datos = await selectDb(urlCitasGlobal, selIdAppointmentGlobal);
            if (!datos) return;
    
            // Buscar paquete activo del paciente para ese servicio
            const snapshot = await db.collection(urlPackagesGlobal)
                .where("IdPatient", "==", selIdPatientGlobal)
                .where("IdService", "==", selIdServiceGlobal)
                .where("IsPack", "==", true)
                .where("IsPackCompleted", "==", false)
                .limit(1)
                .get();
    
            // Si existe paquete activo
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                const datosPaquete = doc.data();
    
                datosPaquete.TakenNumbreSesions += 1;
    
                if (datosPaquete.NumbreSesions === datosPaquete.TakenNumbreSesions) {
                    datosPaquete.IsPackCompleted = true;
                }
    
                await GuardarDatosPaquete(
                    $btn,
                    datosPaquete,
                    1,
                    doc.id
                );
            } 
            // Si NO hay paquete → cobrar normal
            else {
                await agregarConceptosCobroOptimizado(datos);
            }
    
            // Redirigir a pago
            Redireccionar(
                "/views/IngresosEgresos/validacionPago.html" +
                "?idPacientePago=" + selIdPatientGlobal +
                "&idCita=" + selIdAppointmentGlobal
            );
    
        } catch (error) {
            console.error("Error al procesar pago:", error);
            MostrarMensajePrincipal("Ocurrió un error al procesar el pago", "error");
        } finally {
            $btn.prop("disabled", false);
        }
    });
    
    
    $(".btnCancelAppointment").click(async function(){
        await UpdateStatusAppointment($(".btnCancelAppointment"),selIdAppointmen,StatusAppointment.Cancelado);
        $('.modalNewDate').modal('toggle');
        MostrarMensajePrincipal("La cíta se cancelo","success");
    });
    
    $(".btnNewPatient").click(async function(){
        window.location.href ="altaPacientes.html";
    });

    $(".btnConfirmar").click(async function(){
        lstCitasPorConfirmar.forEach(element => {
            var as ="";
            var lstParametrosMensaje =[];
            var nombrePaciente = element.Title;
            var saludo = "";
            var cita = "";
            var diaMañana = new Date(new Date().setDate(new Date().getDate()+1))            
            if (new Date().toLocaleDateString() == element.AppointmentDateStart.toDate().toLocaleDateString()) {
                cita = "hoy a las " + element.AppointmentDateStart.toDate().getHours().toString().padStart(2,"0") + ":"+ element.AppointmentDateStart.toDate().getMinutes().toString().padStart(2,"0")                
            } 
            else if(diaMañana.toLocaleDateString() == element.AppointmentDateStart.toDate().toLocaleDateString()) {
                cita = "para mañana " + new Date().toLocaleString().substring(0, 16);
            }
            else{
                cita = "para el " + new Date().toLocaleString().substring(0, 16);
            }            

            var horaActual = new Date().getHours();
            if (horaActual > 4 && horaActual < 12) {
                saludo = "Buenos días ☀️ " + nombrePaciente;
            }
            else if (horaActual > 12 && horaActual < 18) {
                saludo = "Buenas tardes ☀️ " + nombrePaciente;
            }
            else{
                saludo = "Buenas noches 🌙 " + nombrePaciente;
            }
            //cita = "mañana 10 pm"
            lstParametrosMensaje.push(saludo);
            lstParametrosMensaje.push(cita);
            //EnviarWhatsApp(TipoMensajeWhatsApp.Confirmacion,lstParametrosMensaje);     
        });
    });

    $(".ddlSucursalFiltro").change(async function () {

        calendar.removeAllEvents();

        mapaEventos = {};

        parent.lstAppointmentsGlobal = {};

        await SeleccionarDatosCitas();
    });

    $(".ddlFisioterapeutaFiltro").change(async function () {

        calendar.removeAllEvents();

        mapaEventos = {};

        parent.lstAppointmentsGlobal = {};

        await SeleccionarDatosCitas();
    });

    $(".dvCitasFisio").on("click", function () {
        const abierto = $(this).data("abierto");

        $(this).css({
            transition: "transform 0.3s ease",
            transform: abierto ? "translateX(0px)" : "translateX(200px)"
        });

        $(this).data("abierto", !abierto);
    });

    
});

    function agendarCita(idPaciente, idSucursal, idEmpleado, idCategoria, idService, fecha, horaInicio, horaFin,nota) {
         return new Promise(resolve => {setTimeout(async function(){
                var TitleAppointment = "";
                AppointmentStart = new Date(fecha.substring(6,11),fecha.substring(3,5) -1 ,fecha.substring(0,2),horaInicio.substring(0,2),horaInicio.substring(3,6));
                AppointmentEnd = new Date(fecha.substring(6,11),fecha.substring(3,5) -1 ,fecha.substring(0,2),horaFin.substring(0,2),horaFin.substring(3,6));
                if (Object.values(parent.lstEmployeesGlobal).filter(x => x.uId != idEmpleado).length > 0) {
                    var datosEmpleados;
                    var datosCuentaUsusario = JSON.parse(sessionStorage.sesionUsuario);
                    if (datosCuentaUsusario.Position == KioxPositions.Administrador || datosCuentaUsusario.Position == KioxPositions.ResponsableDeCitas) {
                        datosEmpleados = Object.values(parent.lstEmployeesGlobal).filter(x => x.uId == idEmpleado)[0];
                    }   
                    else{
                        datosEmpleados = Object.values(parent.lstEmployeesGlobal).filter(x => x.uId == datosCuentaUsusario.uId)[0];
                    }

                    if (parent.lstCategoriesGlobal[idCategoria].Name != "Bloqueo") {
                        TitleAppointment = parent.lstPatientsGlobal[idPaciente].Name + " " + parent.lstPatientsGlobal[idPaciente].LastName + " " + parent.lstPatientsGlobal[idPaciente].SecondLastName;
                    }
                    else{
                        TitleAppointment = JSON.parse(JSON.stringify(parent.lstServicesGlobal[idService])).Name;
                    }
                    var Appointment={
                        AppointmentDateStart: AppointmentStart,
                        AppointmentDateEnd: AppointmentEnd,
                        Title:TitleAppointment,
                        Service: JSON.parse(JSON.stringify(parent.lstServicesGlobal[idService])),
                        Category: JSON.parse(JSON.stringify(parent.lstCategoriesGlobal[idCategoria])),
                        IdBranch: idSucursal,
                        Branch: parent.lstSucursalesGlobal[idSucursal].Name,
                        IdPatient: idPaciente,
                        IdEmployee: datosEmpleados.uId,
                        EmployeeName: datosEmpleados.Name + ' ' + datosEmpleados.LastName + ' ' + datosEmpleados.SecondLastName,
                        Status:StatusAppointment.Registrado,
                        Note: nota
                    };
                    Appointment.Service.IdService = idService;        
                    Appointment.Category.idCategory = idCategoria;
                    
                        if (selIdAppointmen == "") {
                            resolve(await insertDb($(".btnAcceptAppointment"),urlCitasGlobal,Appointment));
                            MostrarMensajePrincipal("La cita fue registrada correctamente","success");    
                        }
                        else{
                            resolve(await updateDb($(".btnAcceptAppointment"),urlCitasGlobal,selIdAppointmen,Appointment));
                            MostrarMensajePrincipal("La cita fue registrada correctamente","success");    
                        }                        
                }
            }, 250);});
    }

function enviarMensaje(element) {
     var as ="";
        var lstParametrosMensaje =[];
        var nombrePaciente = parent.lstPatientsGlobal[element.IdPatient].Name;
        var celular = parent.lstPatientsGlobal[element.IdPatient].Phone;
        var saludo = "";
        var cita = "nos comunicamos de Clínica Kiox para confirmar tu cita ";
        var diaMañana = new Date(new Date().setDate(new Date().getDate()+1))            
        if (new Date().toLocaleDateString() == element.AppointmentDateStart.toDate().toLocaleDateString()) {
            cita += "hoy a las " + element.AppointmentDateStart.toDate().getHours().toString().padStart(2,"0") + ":"+ element.AppointmentDateStart.toDate().getMinutes().toString().padStart(2,"0") + " horas"
        } 
        else if(diaMañana.toLocaleDateString() == element.AppointmentDateStart.toDate().toLocaleDateString()) {
            cita += "mañana a las " + element.AppointmentDateStart.toDate().getHours().toString().padStart(2,"0") + ":" + element.AppointmentDateStart.toDate().getMinutes().toString().padStart(2,"0") + " horas"
        }
        else{
            cita += "el " + new Date().toLocaleString().substring(0, 16);
        }            

        var horaActual = new Date().getHours();
        if (horaActual > 4 && horaActual < 12) {
            saludo = "Buenos días " + nombrePaciente;
        }
        else if (horaActual >= 12 && horaActual < 19) {
            saludo = "Buenas tardes " + nombrePaciente;
        }
        else{
            saludo = "Buenas noches " + nombrePaciente;
        }
        //cita = "mañana 10 pm"
        lstParametrosMensaje.push(saludo);
        lstParametrosMensaje.push(cita);
        var mensaje = saludo.replace(" ","%20") + " " + cita.replace(" ","%20");
        var url = "";
        if (celular.length>10) {
            url = "https://wa.me/" + celular + "?text="+mensaje;
        }
        else{
            url = "https://wa.me/52" + celular + "?text="+mensaje;
        }

        window.open(url, "_blank");
        //EnviarWhatsApp(TipoMensajeWhatsApp.Confirmacion,lstParametrosMensaje);   
}

async function UpdateStatusAppointment(ctrl,idAppoitment,Status) {
    var Appointment = await selectDb(urlCitasGlobal,idAppoitment);
    Appointment.Status = Status;
    await updateDb(ctrl,urlCitasGlobal,idAppoitment,Appointment);    
}

const SeleccionarDatosCitas = async function () {
    clearTimeout(window.timerLoaderCalendario);
    cargandoCalendario = true;

    if (!calendar) return;

    $(".dvLoader").show();

    const datosCuentaUsusario =
        JSON.parse(sessionStorage.sesionUsuario);

    const inicio = calendar.view.activeStart;

    const fin = calendar.view.activeEnd;

    // destruir listener anterior
    if (unsubscribeAppointments) {
        unsubscribeAppointments();
        unsubscribeAppointments = null;
    }

    let consultadb;        

    // =========================
    // FILTRO PACIENTE
    // =========================

    if (selIdPacienteFiltro != "") {
        consultadb = db.collection(urlCitasGlobal).where("IdPatient","==",selIdPacienteFiltro);
    }
    else {
        consultadb = db.collection(urlCitasGlobal).where("AppointmentDateStart", ">=", inicio).where("AppointmentDateStart", "<=", fin);
        // =========================
        // FILTRO FISIOTERAPEUTA
        // =========================

        if (
            datosCuentaUsusario.Position ==
            parseInt(KioxPositions.Fisioterapeuta)
        ) {

            consultadb = consultadb.where(
                "IdEmployee",
                "==",
                datosCuentaUsusario.uId
            );
        }

        else if (datosCuentaUsusario.Position == parseInt(KioxPositions.Administrador) || datosCuentaUsusario.Position == parseInt(KioxPositions.ResponsableDeCitas)) {
            if ($(".ddlFisioterapeutaFiltro").val() != "" && $(".ddlFisioterapeutaFiltro").val() != null) {
                consultadb = consultadb.where("IdEmployee","==",$(".ddlFisioterapeutaFiltro").val()
                );
            }
        }
    }


    unsubscribeAppointments = consultadb.onSnapshot(snapshot => {

        calendar.batchRendering(() => {

            snapshot.docChanges().forEach(change => {

                const id = change.doc.id;

                const datos = change.doc.data();

                // =========================
                // VALIDAR STATUS LOCALMENTE
                // =========================

                const statusPermitidos = [1,2,3,4,5,6,7];

                if (!statusPermitidos.includes(datos.Status)) {

                    if (mapaEventos[id]) {

                        mapaEventos[id].remove();

                        delete mapaEventos[id];
                    }

                    delete parent.lstAppointmentsGlobal[id];

                    return;
                }

                // =========================
                // FILTRO SUCURSAL LOCAL
                // =========================

                if (
                    $(".ddlSucursalFiltro").val() != "" &&
                    datos.IdBranch != $(".ddlSucursalFiltro").val()
                ) {

                    if (mapaEventos[id]) {

                        mapaEventos[id].remove();

                        delete mapaEventos[id];
                    }

                    return;
                }

                // =========================
                // ADDED
                // =========================

                if (change.type === "added") {

                    parent.lstAppointmentsGlobal[id] = datos;

                    if (!mapaEventos[id]) {

                        const evento = calendar.addEvent(
                            convertirEventoCalendario(id, datos)
                        );

                        mapaEventos[id] = evento;
                    }
                }

                // =========================
                // MODIFIED
                // =========================

                else if (change.type === "modified") {

                    parent.lstAppointmentsGlobal[id] = datos;
                    if (selIdPacienteFiltro == "") {
                         const fechaEvento = datos.AppointmentDateStart.toDate();
                        const inicioVista = calendar.view.activeStart;
                        const finVista = calendar.view.activeEnd;

                        if (fechaEvento < inicioVista || fechaEvento > finVista) {

                            if (mapaEventos[id]) {
                                mapaEventos[id].remove();
                                delete mapaEventos[id];
                            }

                            delete parent.lstAppointmentsGlobal[id];

                            return;
                        }
                    }
                   

                    const eventoExistente = mapaEventos[id];

                    if (eventoExistente) {

                        eventoExistente.setProp(
                            'title',
                            construirTitulo(datos)
                        );

                        eventoExistente.setStart(
                            datos.AppointmentDateStart.toDate()
                        );

                        eventoExistente.setEnd(
                            datos.AppointmentDateEnd.toDate()
                        );

                        eventoExistente.setProp(
                            'backgroundColor',
                            datos.Category.Color
                        );

                        eventoExistente.setProp(
                            'borderColor',
                            datos.Category.Color
                        );

                    }
                    else {

                        const evento = calendar.addEvent(
                            convertirEventoCalendario(id, datos)
                        );

                        mapaEventos[id] = evento;
                    }
                }

                // =========================
                // REMOVED
                // =========================

                else if (change.type === "removed") {

                    delete parent.lstAppointmentsGlobal[id];

                    if (mapaEventos[id]) {

                        mapaEventos[id].remove();

                        delete mapaEventos[id];
                    }
                }

            });

        });

        requestAnimationFrame(() => {

            llenarContadorFisioterapeutas();

            $(".dvLoader").hide();

            window.timerLoaderCalendario = setTimeout(() => {
                cargandoCalendario = false;
            }, 100);
        });

    });
   
};


function convertirEventoCalendario(idAppoitment, AppoitmentData) {

    var Editable = false;
    var ClassAppointment = "";
    var branchClass = "";

    if (AppoitmentData.IdBranch === "WbZ7Uj46y6wP2MEox6p1") {
        branchClass = "BranchV";
    } else {
        branchClass = "BranchL";
    }

    switch (AppoitmentData.Status) {

        case StatusAppointment.Registrado:
            Editable = true;
            break;

        case StatusAppointment.Confirmado:
            ClassAppointment = "AppoitmentConfirmed";
            break;

        case StatusAppointment.ConfirmacionLlegada:
            ClassAppointment = "AppoitmentArrived";
            break;

        case StatusAppointment.Atendido:
            ClassAppointment = "AppoitmentAttended";
            break;

        case StatusAppointment.Pagado:
            ClassAppointment = "AppoitmentPayed";
            break;
            
        case StatusAppointment.Reagendar:
            ClassAppointment = "AppoitmentReschedule";
            break;

        case StatusAppointment.Finalizado:
            ClassAppointment = "AppoitmentFinished";
            break;
    }

    var cadenaBloqueo = ""
    var datosCuentaUsusario = JSON.parse(sessionStorage.sesionUsuario);
    if (datosCuentaUsusario.Position == KioxPositions.Administrador || datosCuentaUsusario.Position == KioxPositions.ResponsableDeCitas) {
        if (AppoitmentData.IdPatient != "" && parent.lstPatientsGlobal[AppoitmentData.IdPatient].IdLastEmployeeAtendent != undefined){
            if (AppoitmentData.IdEmployee == parent.lstPatientsGlobal[AppoitmentData.IdPatient].IdLastEmployeeAtendent) {
                cadenaBloqueo = "*";
            }    
        }
    }

    if (new Date() >= AppoitmentData.AppointmentDateStart.toDate()) {
        Editable = false;
    }

    var colorCita = AppoitmentData.Category.Color;

    var arregloServiciosDomicilio = [
        "ufTlPtQbyTo96kom1dlI",
        "bu6SNfhtfBSoR78qh3sH",
        "LWmtdB1oWYb0RfA2JqKX"
    ];

    if (arregloServiciosDomicilio.includes(AppoitmentData.Service.IdService)) {
        colorCita = "#396680";
    }

    return {
        id: idAppoitment,
        title: cadenaBloqueo + construirTitulo(AppoitmentData),
        start: AppoitmentData.AppointmentDateStart.toDate(),
        end: AppoitmentData.AppointmentDateEnd.toDate(),
        editable: Editable,
        backgroundColor: colorCita,
        borderColor: colorCita,
        classNames: ClassAppointment + " " + branchClass,
        display: 'block'
    };
}


// function construirTitulo(AppoitmentData) {

//     var tituloCita = AppoitmentData.Title;

//     var datosCuentaUsusario = JSON.parse(sessionStorage.sesionUsuario);

//     if (
//         datosCuentaUsusario.Position ==
//         parseInt(KioxPositions.Administrador)
//     ) {

//         tituloCita +=
//             " (" +
//             obtenerTresIniciales(AppoitmentData.EmployeeName) +
//             ")";
//     }

//     return tituloCita;
// }

function construirTitulo(AppoitmentData) {

    var tituloCita = AppoitmentData.Title;

    var datosCuentaUsusario = JSON.parse(sessionStorage.sesionUsuario);

    if (datosCuentaUsusario.Position == parseInt(KioxPositions.Administrador) || datosCuentaUsusario.Position == parseInt(KioxPositions.ResponsableDeCitas)) {

        var datosPaquete = Object.values(parent.lstPacksGlobal).filter(
            item =>
                item.IdPatient === AppoitmentData.IdPatient &&
                item.IdService === AppoitmentData.Service.IdService &&
                item.IsPackCompleted == false
        );

        if (datosPaquete.length > 0) {

            datosPaquete = datosPaquete[0];

            var sesionActual = datosPaquete.TakenNumbreSesions + 1;

            if (AppoitmentData.Status > StatusAppointment.Atendido) {
                sesionActual = datosPaquete.TakenNumbreSesions;
            }

            tituloCita +=
                "<br>(" +
                obtenerTresIniciales(AppoitmentData.EmployeeName) +
                " | Paquete:" +
                sesionActual +
                "/" +
                datosPaquete.NumbreSesions +
                ")";
        }
        else {

            tituloCita +=
                "<br>(" +
                obtenerTresIniciales(AppoitmentData.EmployeeName) +
                ")";
        }
    }

    return tituloCita;
}

function actualizarEventoCalendario(id, datos) {

    const eventoExistente = calendar.getEventById(id);

    // eliminar evento viejo
    if (eventoExistente) {
        eventoExistente.remove();
    }

    // validar filtros actuales
    if (
        $(".ddlSucursalFiltro").val() != "" &&
        datos.IdBranch != $(".ddlSucursalFiltro").val()
    ) {
        return;
    }

    // validar rango visible
    const inicioVista = calendar.view.activeStart;
    const finVista = calendar.view.activeEnd;

    const fechaEvento = datos.AppointmentDateStart.toDate();

    if (selIdPacienteFiltro == "") {
        if (fechaEvento < inicioVista || fechaEvento > finVista) {
            return;
        }
    }

    // agregar nuevamente
    calendar.addEvent(
        convertirEventoCalendario(id, datos)
    );
    //calendar.render();

    llenarContadorFisioterapeutas();
}

function llenarContadorFisioterapeutas() {

    lstCitasPorFisioterapeuta = {};

    calendar.getEvents().forEach(ev => {

        var AppointmentData = parent.lstAppointmentsGlobal[ev.id];

        if (!AppointmentData) return;

        var idEmp = AppointmentData.IdEmployee;

        var nombreEmp = AppointmentData.EmployeeName;

        if (!lstCitasPorFisioterapeuta[idEmp]) {

            lstCitasPorFisioterapeuta[idEmp] = {
                id: idEmp,
                nombre: nombreEmp,
                totalCitas: 0
            };
        }

        lstCitasPorFisioterapeuta[idEmp].totalCitas++;
    });

    llenarCitasPorFisioterapeuta(calendar.view.type);
}

const StatusAppointment = {
    Cancelado: -1,
    Registrado: 1,
    Confirmado: 2,
    ConfirmacionLlegada: 3,
    Atendido: 4,
    Pagado: 5,
    Finalizado: 6,
    Reagendar: 7,
};

function llenarEventos(){
    var appointments = [];
    const lstAppointments = JSON.parse(JSON.stringify(parent.lstAppointmentsGlobal));
    if (Object.keys(lstAppointments).length >0) {
        for (const ap in lstAppointments) {
            var idAppoitment= ap;
            var AppoitmentData = parent.lstAppointmentsGlobal[idAppoitment];
            var Editable = false;
            var ClassAppointment = "";             
            var branchClass = "";
            if (AppoitmentData.IdBranch === "WbZ7Uj46y6wP2MEox6p1") {
                branchClass = "BranchV";
            } else {
                branchClass = "BranchL";
            }           
            switch (AppoitmentData.Status) {
                case StatusAppointment.Registrado:
                    Editable = true;    
                    break;
                case StatusAppointment.Confirmado:
                    ClassAppointment = "AppoitmentConfirmed";
                    Editable = false;    
                break;
                case StatusAppointment.ConfirmacionLlegada:
                    ClassAppointment = "AppoitmentArrived";
                    Editable = false;    
                break;
                case StatusAppointment.Atendido:
                    ClassAppointment = "AppoitmentAttended";
                    Editable = false;    
                break;
                case StatusAppointment.Pagado:
                    ClassAppointment = "AppoitmentPayed";
                    Editable = false;    
                break;
                case StatusAppointment.Finalizado:
                    ClassAppointment = "AppoitmentFinished";
                    Editable = false;    
                break;
                default:
                    break;
            }
            if (new Date() >= AppoitmentData.AppointmentDateStart.toDate()) {
                Editable = false;
            }
            //,
            var tituloCita = AppoitmentData.Title;
            var datosCuentaUsusario = JSON.parse(sessionStorage.sesionUsuario);
            if (datosCuentaUsusario.Position ==  parseInt(KioxPositions.Administrador) || datosCuentaUsusario.Position ==  parseInt(KioxPositions.ResponsableDeCitas)) {
                tituloCita = AppoitmentData.Title;
                //  parent.lstPacksGlobal
                //  parent.lstPatientsGlobal[idPatientQuery]
                //&& item.IsPackCompleted == false
                var datosPaquete = Object.values(parent.lstPacksGlobal).filter(item => item.IdPatient === AppoitmentData.IdPatient && item.IdService === AppoitmentData.Service.IdService && item.IsPackCompleted == false)
                if (datosPaquete.length > 0) {
                    datosPaquete = datosPaquete[0];
                    var sesionActual = datosPaquete.TakenNumbreSesions + 1
                    if(AppoitmentData.Status > StatusAppointment.Atendido) {
                        sesionActual = datosPaquete.TakenNumbreSesions;
                    }
                    tituloCita += "<br>(" + obtenerTresIniciales(AppoitmentData.EmployeeName) + " | Paquete:" + sesionActual + "/" + datosPaquete.NumbreSesions +")";    
                }
                else{
                    tituloCita += "<br>(" + obtenerTresIniciales(AppoitmentData.EmployeeName) + ")";
                }
            }
            if ($(".ddlSucursalFiltro").val() == "" || AppoitmentData.IdBranch == $(".ddlSucursalFiltro").val()) {
                var colorCita = AppoitmentData.Category.Color;
                var arregloServiciosDomicilio = ["ufTlPtQbyTo96kom1dlI","bu6SNfhtfBSoR78qh3sH","LWmtdB1oWYb0RfA2JqKX"];
                if (arregloServiciosDomicilio.includes(AppoitmentData.Service.IdService)) {
                    colorCita = "#396680"; // Azul para servicios de domicilio
                }
                appointments.push({
                    id: idAppoitment,
                    title: tituloCita,
                    start: AppoitmentData.AppointmentDateStart.toDate(),
                    end: AppoitmentData.AppointmentDateEnd.toDate(),
                    editable:Editable,
                    backgroundColor: colorCita,
                    borderColor: colorCita,
                    classNames:ClassAppointment + " " + branchClass                    
                });     
            }
           
        }
    }
    return appointments;
}

function generarCalendario() {  
    var eventoEditable = true;
    var datosCuentaUsusario = JSON.parse(sessionStorage.sesionUsuario);
    if (datosCuentaUsusario.Position ==  parseInt(KioxPositions.Fisioterapeuta)) {
        eventoEditable = false;
        $(".ddlSucursalFiltro").val(datosCuentaUsusario.IdBranch);
        $(".rowSucursal").hide();
    }   
    if (datosCuentaUsusario.Position ==  parseInt(KioxPositions.Administrador) || datosCuentaUsusario.Position ==  parseInt(KioxPositions.ResponsableDeCitas)) {                
        $(".ddlSucursalFiltro").val("");
        $(".rowSucursal").show();
    }   
    var calendarEl = document.getElementById('calendar');    
    //FullCalendar.Calendar(calendarEl)
    var header = {};
    var vistainicial  = "";
    var duracionCaleendario = 1;
    var slotInicio = "08:00";
    var slotFin = "22:00";
    var editorCalendario = true;
    //datosCuentaUsusario.Position = parseInt(KioxPositions.Recepcion);
    if (datosCuentaUsusario.Position ==  parseInt(KioxPositions.Recepcion) || datosCuentaUsusario.Position ==  parseInt(KioxPositions.Practicantes)) {
        header = {left: '',center: 'title',right: ''};
        vistainicial = "timeGridDay";
        $(".btnEdicion").remove();
        $(".dvMenuAdmin").remove();
        editorCalendario = false;
        if (datosCuentaUsusario.Position ==  parseInt(KioxPositions.Recepcion)) {
            if (new Date().getDay() == 6 || new Date().getDay() ==0) {
                slotInicio = "08:00";
                slotFin = "13:00";
            }
        }
    }
    else{
     if ($(window).width() < 760) {
        header = {left: 'prev,next today',center: 'title',right: 'timeGridWeek,timeGridDay,listWeek'};
        vistainicial = "timeGridDay";
     }
     else {
        header = {left: 'prev,next today',center: 'title',right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'};
        vistainicial = "timeGridWeek";
     }
    }
    var vistas;
    if (selIdPacienteFiltro != "") {
        vistainicial = "list";
          vistas = {
            listPatient: {
                type: 'list',
                duration: { years: 1 },
                buttonText: 'Historial'
            }
        }
    }
    else{
        vistas = {
            listPatient: {
                type: 'list',
                duration: { years: 10 },
                buttonText: 'Historial'
            },
            dayGrid: {
                titleFormat: { year: '2-digit', month: '2-digit'}
            },
            week: {
                titleFormat: { year: '2-digit', month: '2-digit'}
            },
            day: {
                titleFormat: { year: '2-digit', month: '2-digit', day: '2-digit' }
            },
            timeGrid: {
                titleFormat: { year: '2-digit', month: '2-digit', day: '2-digit' }
            }
        }
    }

    lstCitasPorFisioterapeuta = [];
    calendar = new FullCalendar.Calendar(calendarEl, {
        lazyFetching: true,
        themeSystem: 'bootstrap5', // importante
        initialView: 'dayGridMonth',
        height:'75vh',
        locale: 'es',
        slotMinTime: slotInicio,
        slotMaxTime: slotFin,
        allDaySlot: false,
        headerToolbar: header,
    views: vistas,
    initialView: vistainicial,
    initialDate: new Date(),
    navLinks: editorCalendario, // can click day/week names to navigate views
    editable: editorCalendario,
    selectable: editorCalendario,
    nowIndicator: true,
    dayMaxEvents: editorCalendario, // allow "more" link when too many events
    slotDuration:'01:00:00',
    eventContent: function(arg) {
        const div = document.createElement("div");
        div.innerHTML = arg.event.title;
        return { domNodes: [div] };
    },
    events: [],
    datesSet: async function () {

        if (window.cambiandoVistaCalendario) return;

        window.cambiandoVistaCalendario = true;

        await SeleccionarDatosCitas();

        setTimeout(() => {

            window.cambiandoVistaCalendario = false;

        }, 150);
    },
    select: async function(info) {
        $(".msjCitaPendiente").hide();               
        clearFields();
        hideButtons();
        if (datosCuentaUsusario.Position ==  parseInt(KioxPositions.Fisioterapeuta)) {
            $(".rwFisioterapeuta").hide();
            $(".ddlEmpleados").val(datosCuentaUsusario.uId);
            $(".ddlSucursal").val(datosCuentaUsusario.IdBranch);
        }
        $(".btnCancelAppointment").hide();
        $(".btnAcceptAppointment").show();
        selIdAppointmen = "";        
        $('.txtFechaCita').val(info.start.getFullYear().toString().padStart(4, "0")  + "-" + (info.start.getMonth() + 1).toString().padStart(2, "0")  + "-" + info.start.getDate().toString().padStart(2, "0"));
        $('.txtHoraInicioCita').val(info.start.getHours().toString().padStart(2, "0") + ":" + info.start.getMinutes().toString().padStart(2, "0"));
        $('.txtHoraFinCita').val(info.end.getHours().toString().padStart(2, "0") + ":" + info.end.getMinutes().toString().padStart(2, "0"));              
        hideShowFields(false);
        $('.modalNewDate').modal('toggle');            
    },
    eventClick: function(info) {
        $(".msjCitaPendiente").hide();
        $(".lUltimoAtendiente").text("");
        if (datosCuentaUsusario.Position !=  parseInt(KioxPositions.Recepcion) && datosCuentaUsusario.Position !=  parseInt(KioxPositions.Practicantes)) {
            clearFields();
            operacionCitas = 1;
            return new Promise(resolve => {setTimeout(async function(){
            var datos = await selectDb(urlCitasGlobal,info.el.fcSeg.eventRange.def.publicId);
            if (datos != null) {
                selIdAppointmen = info.el.fcSeg.eventRange.def.publicId;
                var patient = parent.lstPatientsGlobal[datos.IdPatient];
                var DateI = datos.AppointmentDateStart.toDate();
                var DateF = datos.AppointmentDateEnd.toDate();           
                $('.ddlSucursal').val(datos.IdBranch);   
                hideButtons();
                var datosCuentaUsusario = JSON.parse(sessionStorage.sesionUsuario);            
                switch (datos.Status) {
                    case StatusAppointment.Registrado:
                        if (new Date() < DateI) {
                            $(".btnAcceptAppointment").show();
                        }
                        else{                        
                            $(".btnStartAppointment").show();
                        }
                        $(".btnCancelAppointment").show();
                        break;
                    case StatusAppointment.Confirmado:
                        if (new Date() < DateI) {
                            $(".btnAcceptAppointment").show();
                        }
                        else{
                            $(".btnStartAppointment").show();
                        }
                        $(".btnCancelAppointment").show();
                    break;
                    case StatusAppointment.Atendido:
                        if (datosCuentaUsusario.Position ==  parseInt(KioxPositions.Administrador)) {
                            $(".btnPaidAppointment").show();
                        }   
                        else{
                            $(".btnStartAppointment").show();
                        }
                        $(".btnStartAppointment").show();
                    break;
                    case StatusAppointment.Finalizado:
                        if (datosCuentaUsusario.Position ==  parseInt(KioxPositions.Administrador)) {
                            $(".btnPaidAppointment").show();
                        }
                        $(".btnStartAppointment").show();
                    break;
                    case StatusAppointment.Reagendar:
                        if (datosCuentaUsusario.Position ==  parseInt(KioxPositions.Administrador)) {
                            $(".btnPaidAppointment").show();
                        }
                        $(".btnStartAppointment").show();
                    break;
                    default:
                        break;
                }
            
                if (datosCuentaUsusario.Position ==  parseInt(KioxPositions.Administrador) || datosCuentaUsusario.Position ==  parseInt(KioxPositions.ResponsableDeCitas)) {
                    $(".btnAcceptAppointment").show();
                    if (datosCuentaUsusario.Position ==  parseInt(KioxPositions.ResponsableDeCitas)) {                        
                        $(".btnStartAppointment").hide();    
                    }                    
                }
                else{
                    // if (datosCuentaUsusario.Position ==  parseInt(KioxPositions.ResponsableDeCitas)) {
                    //     $(".btnAcceptAppointment").show();    
                    // }
                    // else{
                    //     $(".btnAcceptAppointment").hide();
                    // }
                    $(".btnCancelAppointment").hide();
                }

                var datosEmpleados = Object.values(parent.lstEmployeesGlobal).find(x => x.uId == datosCuentaUsusario.uId);
                if ( datosEmpleados.Available == false && datosEmpleados.IdLastAppointment != selIdAppointmen) {
                    $(".btnStartAppointment").hide();
                    $(".msjCitaPendiente").show();
                }
                // $(".btnStartAppointment").show();
                // $(".btnPaidAppointment").show();
                // $(".btnFinishAppointment").show();
                // $(".btnCancelAppointment").show();
                // $(".btnAcceptAppointment").show();
                idPatientSelected = datos.IdPatient;
                if (info.event._def.ui.startEditable && new Date() < DateI || (datosCuentaUsusario.Position ==  parseInt(KioxPositions.Administrador || datosCuentaUsusario.Position ==  parseInt(KioxPositions.ResponsableDeCitas)))) {
                    if (patient != undefined) {
                        $(".pEmpleadoGeneral").text(patient.NameComplete);
                        $(".pTelefono").text(patient.Phone);
                        $(".pCorreo").text(patient.Email);       
                        $(".lUltimoAtendiente").text(parent.lstEmployeesGlobal[patient.IdLastEmployeeAtendent] ? "Último fisioterapeuta: " + parent.lstEmployeesGlobal[patient.IdLastEmployeeAtendent].Name + " " + parent.lstEmployeesGlobal[patient.IdLastEmployeeAtendent].LastName + " " + parent.lstEmployeesGlobal[patient.IdLastEmployeeAtendent].SecondLastName : "No hay información");
                    }
                    $('.txtFechaCita').val(DateI.getFullYear().toString().padStart(4, "0")  + "-" + (DateI.getMonth() + 1).toString().padStart(2, "0")  + "-" + DateI.getDate().toString().padStart(2, "0"));
                    $('.txtHoraInicioCita').val(DateI.getHours().toString().padStart(2, "0") + ":" + DateI.getMinutes().toString().padStart(2, "0"));
                    $('.txtHoraFinCita').val(DateF.getHours().toString().padStart(2, "0") + ":" + DateF.getMinutes().toString().padStart(2, "0"));    
                    $('.ddlCategoria').val(datos.Category.idCategory);    
                    $('.ddlCategoria').change();
                    $('.ddlServicio').val(datos.Service.IdService);      
                    $('.ddlEmpleados').val(datos.IdEmployee); 
                    if (datos.Note != undefined) {
                        $(".txtNotaCita").val(datos.Note);    
                    }            
                    TitleAppointment = datos.Title
                    hideShowFields(false);
                    $(".txtEmpleadoGeneral").hide();
                    $(".pEmpleadoGeneral").show();
                }
                else{
                    if (patient != undefined) {
                        $(".pEmpleadoGeneral").text(patient.NameComplete);
                        $(".pTelefono").text(patient.Phone);
                        $(".pCorreo").text(patient.Email);   
                    }
                    $('.pFechaCita').text(DateI.getFullYear().toString().padStart(4, "0")  + "-" + (DateI.getMonth() + 1).toString().padStart(2, "0")  + "-" + DateI.getDate().toString().padStart(2, "0"));
                    $('.pHoraInicioCita').text(DateI.getHours().toString().padStart(2, "0") + ":" + DateI.getMinutes().toString().padStart(2, "0"));
                    $('.pHoraFinCita').text(DateF.getHours().toString().padStart(2, "0") + ":" + DateF.getMinutes().toString().padStart(2, "0"));    
                    $('.pCategoria').text(datos.Category.Name);   
                    $('.pEmpleado').text(datos.EmployeeName);   
                    $('.pServicio').text(datos.Service.Name);    
                    $('.ddlEmpleados').val(datos.IdEmployee);  
                    if (datos.Note != undefined) {
                        $(".pNotaCita").text(datos.Note);
                    }                             
                    hideShowFields(true);
                }
                
                $('.modalNewDate').modal('toggle');    
            }
            resolve(true);
            }, 250);});
        }      
        else if(datosCuentaUsusario.Position ==  parseInt(KioxPositions.Recepcion)){
            return new Promise(resolve => {setTimeout(async function(){
                var datos = await selectDb(urlCitasGlobal,info.el.fcSeg.eventRange.def.publicId);
                if (datos != null && datos.Status == StatusAppointment.Registrado) {
                    clearFields();
                    operacionCitas = 1;
                    return new Promise(resolve => {setTimeout(async function(){
                    var datos = await selectDb(urlCitasGlobal,info.el.fcSeg.eventRange.def.publicId);
                    if (datos != null) {
                        selIdAppointmen = info.el.fcSeg.eventRange.def.publicId;
                        var patient = parent.lstPatientsGlobal[datos.IdPatient];
                        $(".pEmpleadoGeneral").text("La cita del paciente " + patient.NameComplete + " será notificada para su atención, ¿deseas continuar?");
                        $('.modalRecepcion').modal('toggle');
                    }
                    resolve(true);
                    }, 250);});
                }
            })});
        }
        
    },
    eventResize: function (info) {
        return new Promise(resolve => {setTimeout(async function(){
            var Appointment = await selectDb(urlCitasGlobal,info.el.fcSeg.eventRange.def.publicId);//new Appoitments(cita);
            Appointment.AppointmentDateStart = info.event.start;
            Appointment.AppointmentDateEnd = info.event.end;
            resolve(await updateDb(urlCitasGlobal,info.el.fcSeg.eventRange.def.publicId, Appointment));
            MostrarMensajePrincipal("La cita fue actualizada correctamente","success");
        }, 250);});
    },
    eventDrop: function (info) {
        return new Promise(resolve => {setTimeout(async function(){
            var Appointment = await selectDb(urlCitasGlobal,info.el.fcSeg.eventRange.def.publicId);//new Appoitments(cita);
            Appointment.AppointmentDateStart = info.event.start;
            Appointment.AppointmentDateEnd = info.event.end;
            resolve(await updateDb(urlCitasGlobal,info.el.fcSeg.eventRange.def.publicId, Appointment));
            calendar.gotoDate(Appointment.AppointmentDateStart);
            MostrarMensajePrincipal("La cita fue actualizada correctamente","success");
        }, 250);});
    },
    eventDidMount: function(info) {

        const bgColor = info.event.backgroundColor;

        if (info.el.classList.contains("BranchV")) {
            info.el.setAttribute("data-branch", "V");
        }

        if (info.el.classList.contains("BranchL")) {
            info.el.setAttribute("data-branch", "L");
        }

        if (bgColor) {
            const rgbaColor = hexToRGBA(bgColor, 0.18);
            info.el.style.setProperty('--watermark-color', rgbaColor);
        }
    },
    eventsSet: function(events) {

        const vistaActual = this.view.type;

        lstCitasPorFisioterapeuta = {};

        const inicioVista = this.view.activeStart;
        const finVista = this.view.activeEnd;

        events.forEach(ev => {

            // validar rango visible
            if (selIdPacienteFiltro == "") {
                if (ev.start >= finVista || ev.end <= inicioVista) return;
            }

            // validar existencia
            const AppointmentData = parent.lstAppointmentsGlobal?.[ev.id];

            if (!AppointmentData) {
                return;
            }

            // validar campos mínimos
            if (!AppointmentData.IdEmployee) {
                return;
            }

            const idEmp = AppointmentData.IdEmployee;
            const nombreEmp = AppointmentData.EmployeeName || "";

            if (!lstCitasPorFisioterapeuta[idEmp]) {

                lstCitasPorFisioterapeuta[idEmp] = {
                    id: idEmp,
                    nombre: nombreEmp,
                    totalCitas: 0
                };
            }

            lstCitasPorFisioterapeuta[idEmp].totalCitas++;
        });

        llenarCitasPorFisioterapeuta(vistaActual);
    }
    });
    calendar.render();
    
};

function llenarCitasPorFisioterapeuta(vistaActual) {
    $(".ListaEmpleadosCitas").empty();
    var numeroCitasTiempo = 0;
    switch (vistaActual) {
        case 'timeGridDay':
            numeroCitasTiempo = 8;
        break;
        case 'timeGridWeek':
            numeroCitasTiempo = 48;
        break;
        case 'dayGridMonth':
            numeroCitasTiempo = 224; // Lógica para vista mensual
        break;
        default:
            break;
    }

    for (const idEmp in lstCitasPorFisioterapeuta) {
        const fisio = lstCitasPorFisioterapeuta[idEmp];
        $(".ListaEmpleadosCitas").append(
            `<li class="itemEmpleadoCitas"><b>${obtenerTresIniciales(fisio.nombre)} | ${fisio.totalCitas} / ${numeroCitasTiempo}
            </b></li>`
        );
    }
}

function hexToRGBA(hex, alpha) {
    let r = 0, g = 0, b = 0;

    if (hex.length == 7) {
        r = parseInt(hex.slice(1, 3), 16);
        g = parseInt(hex.slice(3, 5), 16);
        b = parseInt(hex.slice(5, 7), 16);
    }

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function pasoMasDeHoraYMedia(fecha) {
    const ahora = new Date();
    const fechaComparar = new Date(fecha);
    
    const diferencia = ahora - fechaComparar;
    return diferencia >= (1.5 * 60 * 60 * 1000);
}

function hideButtons(){
    $(".btnStartAppointment").hide();
    $(".btnPaidAppointment").hide();
    $(".btnFinishAppointment").hide();
    $(".btnCancelAppointment").hide();
    $(".btnAcceptAppointment").hide();
}

function hideShowFields(detail){
    $(".inputDetail").hide();
    $(".inputCapture").hide();
    if (detail) {
        $(".inputDetail").show();
    }
    else{
        $(".inputCapture").show();
    }
}

function clearFields(){
    idPatientSelected = '';
    TitleAppointment = '';
    AppointmentStart = '';
    AppointmentEnd = '';
    $(".txtEmpleadoGeneral").val('');
    $(".pTelefono").text('');
    $(".pCorreo").text('');   
    $('.txtFechaCita').val('');
    $('.txtHoraInicioCita').val('');
    $('.txtHoraFinCita').val('');
    $(".ddlServicio").val('');
    $(".ddlCategoria").val('');
    $(".ddlSucursal").val('');
    $(".txtNotaCita").val('');  
    $(".lUltimoAtendiente").text('');
}

function llenarTablaCitasPorConfirmar(){
    $(".tblCitasPorConfirmar").empty();
    var titulos = ["Nombre","Tratamiento","Fecha",""];    
    var TitulosDatos = ["Title","Service.Name","AppointmentDateStart"];    
    var FechaI = new Date(new Date().getFullYear(),new Date().getMonth() ,new Date().getDate() + 1 ,0,0,0);
    var FechaF = new Date(new Date().getFullYear(),new Date().getMonth() ,new Date().getDate() + 1,23,59,59,1000);
    let lstButtons = {};
    var lstDatos = {};
    db.collection(urlCitasGlobal).where("Status","==",1).where('AppointmentDateStart', '>=', FechaI).where('AppointmentDateStart', '<=', FechaF).orderBy("AppointmentDateStart", "desc").get().then((obj)=>{
        obj.docs.forEach(function(ap) {
            const datos =  ap.data();
            var evento = {[ap.id]:datos};
            Object.assign(lstDatos,evento);
            const idAppointment = ap.id;   
            var AppointmentData = datos;
            var Buttons = [];            
            var lblActivo = $("<label class='switch'>");
            var tgActivo = $("<input type='checkbox' class='chkActivo'><span class='slider round'></span>");
            // if (datos.Avalible) {
            //     tgActivo = $("<input type='checkbox' class='chkActivo' checked><span class='slider round'></span>");
            // }
            tgActivo.on('change',(chk)=>{
                //UpdateAvalibleCategory(idCategory,chk.currentTarget.checked);
                lstCitasPorConfirmar.push(AppointmentData);
            });
            //Object.assign(Buttons,tgActivo);
            lblActivo.append(tgActivo);
            //Buttons.push(lblActivo);

            //Object.assign(Buttons,btnEditar);

            let btnEliminar = $("<a class='btnTablaGlobal material-icons btnIcon' title='Enviar mensaje'>message</a>");
            btnEliminar.on('click',()=>{
                //var AppointmentData = parent.lstAppointmentsGlobal[idAppointment];
                enviarMensaje(AppointmentData);
            });
            Buttons.push(btnEliminar);

            var evento = {[idAppointment]:Buttons};
            Object.assign(lstButtons,evento);
        });
        generarTabla($(".tblCitasPorConfirmar"),titulos,TitulosDatos,lstDatos,lstButtons);
        $(".dvLoader").hide();
    });
}

async function obtenerHorariosDisponibles(idEmployee, fecha, idBranch) {

  const citasEmpleado = await getAppointmentsByEmployee(idEmployee, fecha);

  const capacidad = parent.lstSucursalesGlobal[idBranch].Capacity;

  const fechaBase = new Date(fecha);

  const year = fechaBase.getFullYear();
  const month = fechaBase.getMonth();
  const day = fechaBase.getDate() + 1;

  const inicioDia = new Date(year, month, day, 0, 0, 0);
  const finDia = new Date(year, month, day, 23, 59, 59);

  // obtener citas del día
  const snapshot = await db.collection("Appointment")
    .where("AppointmentDateStart", ">=", inicioDia)
    .where("AppointmentDateStart", "<=", finDia)
    .where("IdBranch", "==", idBranch)
    .get();

  const citasTotales = snapshot.docs.map(doc => {

    const data = doc.data();

    return {
      ...data,
      start: data.AppointmentDateStart.toDate().getTime(),
      end: data.AppointmentDateEnd.toDate().getTime()
    };

  });

  // convertir también las del empleado a timestamps
  const citasEmpleadoParseadas = citasEmpleado.map(c => ({
    start: c.AppointmentDateStart.toDate().getTime(),
    end: c.AppointmentDateEnd.toDate().getTime()
  }));

  const horarios = generarHorarios();

  return horarios.reduce((disponibles, hora) => {

    const [h, m] = hora.split(":").map(Number);

    const inicioBloque = new Date(year, month, day, h, m, 0, 0).getTime();

    const finBloque = inicioBloque + (60 * 60 * 1000);

    // validar terapeuta ocupado
    const ocupadoEmpleado = citasEmpleadoParseadas.some(c =>
      c.start < finBloque && c.end > inicioBloque
    );

    if (ocupadoEmpleado) return disponibles;

    // validar capacidad sucursal
    let totalEnHora = 0;

    for (const cita of citasTotales) {

      if (cita.start < finBloque && cita.end > inicioBloque) {
        totalEnHora++;

        // salir antes si ya no hay capacidad
        if (totalEnHora >= capacidad) {
          return disponibles;
        }
      }
    }

    disponibles.push({
      hora,
      disponible: true
    });

    return disponibles;

  }, []);
}

function generarHorarios(inicio = 8, fin = 21, intervalo = 60) {
  const horarios = [];
  for (let h = inicio; h < fin; h++) {
    horarios.push(`${h}:00`);
  }
  return horarios;
}

async function getAppointmentsByEmployee(idEmployee, fecha) {
  var FechaSeleccionada = new Date(fecha);
  var FechaI = new Date(FechaSeleccionada.getFullYear(),FechaSeleccionada.getMonth() ,FechaSeleccionada.getDate() + 1 ,0,0,0);
  var FechaF = new Date(FechaSeleccionada.getFullYear(),FechaSeleccionada.getMonth() ,FechaSeleccionada.getDate() + 1,23,59,59);
  const snapshot = await db.collection("Appointment").where("IdEmployee", "==", idEmployee).where('AppointmentDateStart', '>=', FechaI).where('AppointmentDateStart', '<=', FechaF).where("Status", "==", 1).get();
  return snapshot.docs.map(doc => doc.data());
}

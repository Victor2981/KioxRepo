var urlCitasGlobal = "/Appointment"
// let lstAppointmentsGlobal = parent.lstAppointmentsGlobal;

var idPatientSelected;
var TitleAppointment;
var AppointmentStart;
var AppointmentEnd;
var selIdAppointmen = "";

var lstCitasPorConfirmar = [];

$(document).ready(function(){        

    $(".btnConfirmAppointments").click(function(){
        window.location.href ="confirmacionCitas.html";
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
                  TitleAppointment = dato.Name + " " + dato.LastName + " " + dato.SecondLastName;
                  $(".txtEmpleadoGeneral").val(dato.Name + " " + dato.LastName + " " + dato.SecondLastName);
                  $(".pTelefono").text(dato.Phone);
                  $(".pCorreo").text(dato.Email);              
                  $(".dvDatosCita").show();
              });
              a.appendChild(b);
            }
            $(".autocomplete-items").append(a);
        }
     
    });
    
    $(".btnAcceptAppointment").click(async function(){
        var banValidacion = true;
        var fecha = $('.txtFechaCita').val().substr(8,2) + "/" + $('.txtFechaCita').val().substr(5,2) + "/" + $('.txtFechaCita').val().substr(0,4);
        if (parent.lstCategoriesGlobal[$(".ddlCategoria").val()].Name != "Bloqueo") {
            banValidacion = Validador($(".txtEmpleadoGeneral"),"paciente",idPatientSelected,1,'',$('.modalNewDate'));    
        }
        if(banValidacion == true){banValidacion = Validador($(".ddlEmpleados"),"empleado",$(".ddlEmpleados").val(),1,'',$('.modalNewDate'))};
        if(banValidacion == true){banValidacion = Validador($(".ddlCategoria"),"categoría",$(".ddlCategoria").val(),1,'',$('.modalNewDate'))};
        if(banValidacion == true){banValidacion = Validador($(".ddlServicio"),"servicio",$(".ddlServicio").val(),1,'',$('.modalNewDate'))};
        if(banValidacion == true){banValidacion = Validador($(".txtFechaCita"),"fecha",fecha,10,'',$('.modalNewDate'))};
        if(banValidacion == true){banValidacion = Validador($(".txtHoraInicioCita"),"hora inicio",$(".txtHoraInicioCita").val(),8,'',$('.modalNewDate'))};
        if(banValidacion == true){banValidacion = Validador($(".txtHoraFinCita"),"hora fin",$(".txtHoraFinCita").val(),8,'',$('.modalNewDate'))};
        if(banValidacion){
            return new Promise(resolve => {setTimeout(async function(){
                AppointmentStart = new Date($('.txtFechaCita').val().substring(0,4),$('.txtFechaCita').val().substring(5,7) -1 ,$('.txtFechaCita').val().substring(8,10),$('.txtHoraInicioCita').val().substring(0,2),$('.txtHoraInicioCita').val().substring(3,6));
                AppointmentEnd = new Date($('.txtFechaCita').val().substring(0,4),$('.txtFechaCita').val().substring(5,7) - 1 ,$('.txtFechaCita').val().substring(8,10),$('.txtHoraFinCita').val().substring(0,2),$('.txtHoraFinCita').val().substring(3,6));
                if (Object.values(parent.lstEmployeesGlobal).filter(x => x.uId != $(".ddlEmpleados").val()).length > 0) {
                    var datosEmpleados;
                    var datosCuentaUsusario = JSON.parse(sessionStorage.sesionUsuario);
                    if (datosCuentaUsusario.Position == KioxPositions.Administrador) {
                        datosEmpleados = Object.values(parent.lstEmployeesGlobal).filter(x => x.uId == $(".ddlEmpleados").val())[0];
                    }   
                    else{
                        datosEmpleados = Object.values(parent.lstEmployeesGlobal).filter(x => x.uId == datosCuentaUsusario.uId)[0];
                    }

                    if (parent.lstCategoriesGlobal[$(".ddlCategoria").val()].Name == "Bloqueo") {
                        TitleAppointment = parent.lstServicesGlobal[$(".ddlServicio").val()].Name;
                    }
                    var Appointment={
                        AppointmentDateStart: AppointmentStart,
                        AppointmentDateEnd: AppointmentEnd,
                        Title:TitleAppointment,
                        Service: parent.lstServicesGlobal[$(".ddlServicio").val()],
                        Category:parent.lstCategoriesGlobal[$(".ddlCategoria").val()],
                        IdPatient: idPatientSelected,
                        IdEmployee: datosEmpleados.uId,
                        EmployeeName: datosEmpleados.Name + ' ' + datosEmpleados.LastName + ' ' + datosEmpleados.SecondLastName,
                        Status:StatusAppointment.Registrado,
                        Note:$(".txtNotaCita").val()
                    };
                    Appointment.Service.IdService = $(".ddlServicio").val();        
                    Appointment.Category.idCategory = $(".ddlCategoria").val();
                    
                        if (selIdAppointmen == "") {
                            resolve(await insertDb(urlCitasGlobal,Appointment));
                            MostrarMensajePrincipal("La cita fue registrada correctamente","success");    
                        }
                        else{
                            resolve(await updateDb(urlCitasGlobal,selIdAppointmen,Appointment));
                            MostrarMensajePrincipal("La cita fue registrada correctamente","success");    
                        }
                        $('.modalNewDate').modal('toggle');                    
                }
            }, 250);});
        }        
    });       
    
    $(".btnAcceptArrived").click(async function(){
        await UpdateStatusAppointment(selIdAppointmen,StatusAppointment.ConfirmacionLlegada);       
        $('.modalRecepcion').modal('toggle');
        MostrarMensajePrincipal("La cita fue enviada para su atención","success");
        setTimeout(function() {$(".alert-success").alert('close');}, 2000);
    });

    $(".btnStartAppointment").click(async function(){
        await UpdateStatusAppointment(selIdAppointmen,StatusAppointment.Atendido);
        //$('.modalNewDate').modal('toggle');
        //MostrarMensajePrincipal("La cíta se inició","success");
        window.location.href ="seguiminetoCita.html?idAppointment=" + selIdAppointmen;
    });
    
    $(".btnPaidAppointment").click(async function(){
        //await UpdateStatusAppointment(selIdAppointmen,StatusAppointment.Pagado);
        $('.modalNewDate').modal('toggle');
        MostrarMensajePrincipal("Serás enviado a el pago","success");
        selIdAppointmentGlobal = selIdAppointmen;
        selIdPatientGlobal = idPatientSelected;
        parent.tipoConceptoCobro = 1;
        var datos = await selectDb(urlCitasGlobal,selIdAppointmentGlobal);
        if (datos != null) {
            await db.collection(urlPackagesGlobal).where("IdPatient","==",selIdPatientGlobal).where("IdService","==",selIdServiceGlobal).where("IsPack","==",true).where("IsPackCompleted","==",false).get().then(async (obj)=>{
                if (obj.docs.length > 0) {
                    var datosPaquete = obj.docs[0].data();
                    datosPaquete.TakenNumbreSesions += 1;
                    if (datosPaquete.NumbreSesions == datosPaquete.TakenNumbreSesions) {
                        datosPaquete.IsPackCompleted = true;
                    }                    
                    await GuardarDatosPaquete(datosPaquete,1,obj.docs[0].id);    
                }
                else{
                    agregarConceptosCobro(datos);
                }
            });            
            setTimeout(function(){Redireccionar("/views/IngresosEgresos/validacionPago.html?idPacientePago=" + selIdPatientGlobal + "&idCita=" + selIdAppointmentGlobal);},3000);
        }
        
    });
    
    
    $(".btnCancelAppointment").click(async function(){
        await UpdateStatusAppointment(selIdAppointmen,StatusAppointment.Cancelado);
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

});

function enviarMensaje(element) {
     var as ="";
        var lstParametrosMensaje =[];
        var nombrePaciente = parent.lstPatientsGlobal[element.IdPatient].Name;
        var celular = parent.lstPatientsGlobal[element.IdPatient].Phone;
        var saludo = "";
        var cita = "Nos comunicamos de Clínica Kiox para confirmar tu cita ";
        var diaMañana = new Date(new Date().setDate(new Date().getDate()+1))            
        if (new Date().toLocaleDateString() == element.AppointmentDateStart.toDate().toLocaleDateString()) {
            cita += "hoy a las " + element.AppointmentDateStart.toDate().getHours().toString().padStart(2,"0") + ":"+ element.AppointmentDateStart.toDate().getMinutes().toString().padStart(2,"0") + " horas"
        } 
        else if(diaMañana.toLocaleDateString() == element.AppointmentDateStart.toDate().toLocaleDateString()) {
            cita += "para mañana a las " + element.AppointmentDateStart.toDate().getHours().toString().padStart(2,"0") + ":" + element.AppointmentDateStart.toDate().getMinutes().toString().padStart(2,"0") + " horas"
        }
        else{
            cita += "para el " + new Date().toLocaleString().substring(0, 16);
        }            

        var horaActual = new Date().getHours();
        if (horaActual > 4 && horaActual < 12) {
            saludo = "Buenos días " + nombrePaciente;
        }
        else if (horaActual => 12 && horaActual < 19) {
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

async function UpdateStatusAppointment(idAppoitment,Status) {
    var Appointment = await selectDb(urlCitasGlobal,idAppoitment);
    Appointment.Status = Status;
    await updateDb(urlCitasGlobal,idAppoitment,Appointment);    
}

const SeleccionarDatosCitas = async function(){
    $(".dvLoader").show();
    var datosCuentaUsusario = JSON.parse(sessionStorage.sesionUsuario);
    let consultadb =db.collection(urlCitasGlobal).where("Status", ">",StatusAppointment.Cancelado);
    //datosCuentaUsusario.Position = parseInt(KioxPositions.Recepcion);
    if (datosCuentaUsusario.Position ==  parseInt(KioxPositions.Fisioterapeuta)) {
        consultadb = db.collection(urlCitasGlobal).where("Status", ">",StatusAppointment.Cancelado).where("IdEmployee", "==", datosCuentaUsusario.uId);
    }   
    else if (datosCuentaUsusario.Position ==  parseInt(KioxPositions.Recepcion)) {
        var fechaInicio = new Date(new Date().getFullYear(),(new Date().getMonth()),new Date().getDate(),6,0,0);
        consultadb = db.collection(urlCitasGlobal).where("Status", "==",StatusAppointment.Registrado).where('AppointmentDateStart', '>=', fechaInicio);
    }

    await consultadb.onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
            
            if (change.type === "added") {
                var id = change.doc.id;
                var datos = change.doc.data();
                var evento = {[id]:datos};
                Object.assign(parent.lstAppointmentsGlobal,evento);
            }
            if (change.type === "modified") {
                var id = change.doc.id;
                var datos = change.doc.data();
                var evento = {[id]:datos};

                if (datos.IdEmployee == parent.idUsuarioSistema && datos.Status == StatusAppointment.ConfirmacionLlegada ) {
                    var img = "../img/logoKiox.png";
                    var text = 'Tu paciente ' + datos.Title + " ha llegado y se encuentra en recepción";
                    var notification = new Notification("Lista de tareas", {
                        body: text,
                        icon: img,
                    });    
                }
                Object.assign(parent.lstAppointmentsGlobal,evento);
            }
            if (change.type === "removed") {
                delete parent.lstAppointmentsGlobal[change.doc.id];
            }
        });
        generarCalendario();
    });
    var datosCuentaUsusario = JSON.parse(sessionStorage.sesionUsuario);
    if (datosCuentaUsusario.Position ==  parseInt(KioxPositions.Fisioterapeuta)) {
        $(".dvDatosContacto").empty();
        $(".btnNewPatient").hide();
        $(".btnConfirmAppointments").hide();
    }  
    $(".dvLoader").show();
};

const StatusAppointment = {
    Cancelado: -1,
	Registrado: 1,
    Confirmado: 2,
    ConfirmacionLlegada: 3,
	Atendido: 4,
	Pagado: 5,
    Finalizado: 6,
}

function llenarEventos(){
    var appointments = [];
    const lstAppointments = JSON.parse(JSON.stringify(parent.lstAppointmentsGlobal));
    if (Object.keys(lstAppointments).length >0) {
        for (const ap in lstAppointments) {
            var idAppoitment= ap;
            var AppoitmentData = parent.lstAppointmentsGlobal[idAppoitment];
            var Editable = false;
            var ClassAppointment = "";                        
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
            var tituloCita = AppoitmentData.Title + " (" + AppoitmentData.EmployeeName.substr(0, 2) + ")";
            var datosCuentaUsusario = JSON.parse(sessionStorage.sesionUsuario);
            if (datosCuentaUsusario.Position ==  parseInt(KioxPositions.Administrador)) {
                horaCitaFin = AppoitmentData.AppointmentDateEnd.toDate() 
            }
            appointments.push({
            id: idAppoitment,
            title: tituloCita,
            start: AppoitmentData.AppointmentDateStart.toDate(),
            end: AppoitmentData.AppointmentDateEnd.toDate(),
            editable:Editable,
            backgroundColor: AppoitmentData.Category.Color,
            borderColor: AppoitmentData.Category.Color,
            classNames:ClassAppointment,
            });
        }
    }
    return appointments;
}

function generarCalendario() {  
    var eventoEditable = true;
    var datosCuentaUsusario = JSON.parse(sessionStorage.sesionUsuario);
    if (datosCuentaUsusario.Position ==  parseInt(KioxPositions.Fisioterapeuta)) {
        eventoEditable = false;
    }   
    var calendarEl = document.getElementById('calendar');    
    //FullCalendar.Calendar(calendarEl)
    var header = {};
    var vistainicial  = "";
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
  
    var calendar = new FullCalendar.Calendar(calendarEl, {
        height:'90%',
        locale: 'es',
        slotMinTime: slotInicio,
        slotMaxTime: slotFin,
        allDaySlot: false,
        headerToolbar: header,
    views: {
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
        },
    },
    initialView: vistainicial,
    initialDate: new Date(),
    navLinks: editorCalendario, // can click day/week names to navigate views
    editable: editorCalendario,
    selectable: editorCalendario,
    nowIndicator: true,
    dayMaxEvents: editorCalendario, // allow "more" link when too many events
    slotDuration:'01:00:00',
    events: llenarEventos(),
    select: function(info) {               
        clearFields();
        hideButtons();
        if (datosCuentaUsusario.Position ==  parseInt(KioxPositions.Fisioterapeuta)) {
            $(".rwFisioterapeuta").hide();
            $(".ddlEmpleados").val(datosCuentaUsusario.uId);
        }
        $(".btnCancelAppointment").show();
        $(".btnAcceptAppointment").show();
        selIdAppointmen = "";        
        $('.txtFechaCita').val(info.start.getFullYear().toString().padStart(4, "0")  + "-" + (info.start.getMonth() + 1).toString().padStart(2, "0")  + "-" + info.start.getDate().toString().padStart(2, "0"));
        $('.txtHoraInicioCita').val(info.start.getHours().toString().padStart(2, "0") + ":" + info.start.getMinutes().toString().padStart(2, "0"));
        $('.txtHoraFinCita').val(info.end.getHours().toString().padStart(2, "0") + ":" + info.end.getMinutes().toString().padStart(2, "0"));        
        hideShowFields(false);
        $('.modalNewDate').modal('toggle');            
    },
    eventClick: function(info) {
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
                        if (datosCuentaUsusario.Position ==  parseInt(KioxPositions.Fisioterapeuta)) {
                            $(".btnStartAppointment").show();
                        }   
                        else{
                            $(".btnPaidAppointment").show();
                        }
                    break;
                    case StatusAppointment.Finalizado:
                        $(".btnPaidAppointment").show();
                    break;
                    default:
                        break;
                }
                if (datosCuentaUsusario.Position ==  parseInt(KioxPositions.Administrador)) {
                    $(".btnAcceptAppointment").show();
                }
                // $(".btnStartAppointment").show();
                // $(".btnPaidAppointment").show();
                // $(".btnFinishAppointment").show();
                // $(".btnCancelAppointment").show();
                // $(".btnAcceptAppointment").show();
                idPatientSelected = datos.IdPatient;
                if (info.event._def.ui.startEditable && new Date() < DateI || datosCuentaUsusario.Position ==  parseInt(KioxPositions.Administrador)) {
                    if (patient != undefined) {
                        $(".pEmpleadoGeneral").text(patient.NameComplete);
                        $(".pTelefono").text(patient.Phone);
                        $(".pCorreo").text(patient.Email);       
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
            MostrarMensajePrincipal("La cita fue actualizada correctamente","success");
        }, 250);});
    }
    });
    calendar.render();
};

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
    $(".txtNotaCita").val('');  
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
            var datos =  ap.data();
            var evento = {[ap.id]:datos};
            Object.assign(lstDatos,evento);
            var idAppointment = ap.id;   
            var AppointmentData = parent.lstAppointmentsGlobal[idAppointment];
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
                var AppointmentData = parent.lstAppointmentsGlobal[idAppointment];
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

//let lstPatientSeguimientosGlobal = parent.lstPatientsGlobal;
var selIdAppointmentGlobal = "";
var selIdPatientGlobal = "";
var selIdServiceGlobal = "";
$(document).ready(function(){        
    const urlQueryString = new URLSearchParams(window.location.search);
    const idAppointmentQuery = urlQueryString.get('idAppointment');
    const operacionCita = urlQueryString.get('op');
    $(".btnGuardarHistorial").hide();
    $(".btnFinishAppointment").hide();
    if (idAppointmentQuery != "" && idAppointmentQuery != null) {
        selIdAppointmentGlobal = idAppointmentQuery;
        populateAppointmentData(idAppointmentQuery);
        if (operacionCita != "" && operacionCita != null) {
            if (operacionCita == "1") {
                $(".btnGuardarHistorial").show();
            }
        }
        else{
            $(".btnFinishAppointment").show();
        }
    }

    
    $(".rblTratamiento").click(function() {
        $(".dvTratamiento").hide();
        var banTratamiento = $(this).filter(":checked").val();
        if (banTratamiento == "1") {
            $(".dvTratamiento").show();
        }
    }).click();
    
    $(".btnGuardarHistorial").click(async function(){
        $(".dvLoader").show();
        var datos = await selectDb(urlCitasGlobal,selIdAppointmentGlobal);
        if (datos != null) {
            const lstPatients = JSON.parse(JSON.stringify(parent.lstPatientsGlobal));
            const datosPaciente = lstPatients[datos.IdPatient];
            $(".pNombre").text(parent.lstPatientsGlobal[datos.IdPatient].NameComplete)
            var observations = $(".txtObservaciones").val();
            var recommendations = $(".txtRecomendaciones").val();
            await UpdateAppointmentMonitoring(selIdAppointmentGlobal,observations,recommendations,StatusAppointment.Finalizado);
            if (datosPaciente.NewPatient) {
                var datosRegistro = datosPaciente;
                var historial = {
                    BloodType: $(".ddlTipoSangre").val(),
                    Ailments: $(".txtPadecimientos").val(),
                    Allergies: $(".txtAlergias").val(),
                    Surgeries: $(".txtOperaciones").val(),
                    FamilyAilments: $(".txtAntecedentesFamiliares").val(),
                };                   
                datosRegistro.MedicalHistory = historial;
                datosRegistro.NewPatient = false;
                await GuardarDatosPacientes(datosRegistro,1,datos.IdPatient);   
            }
            $(".dvLoader").hide();
            MostrarMensajePrincipal("El historial ha sido guardado, serás enviado a las citas del paciente","success");
            setTimeout(function(){Redireccionar("historialClinico.html?idPatient=" + datos.IdPatient);},3000);
        }
    });

    $(".btnFinishAppointment").click(async function(){
        $(".dvLoader").show();
        parent.lstConceptosPago = {};
        var observations = $(".txtObservaciones").val();
        var recommendations = $(".txtRecomendaciones").val();
        var datos = await selectDb(urlCitasGlobal,selIdAppointmentGlobal);
        var banPago = true;
        if (datos != null) {
            const lstPatients = JSON.parse(JSON.stringify(parent.lstPatientsGlobal));
            let datosPaciente = lstPatients[datos.IdPatient];
            await UpdateAppointmentMonitoring(selIdAppointmentGlobal,observations,recommendations,StatusAppointment.Finalizado);        
            await db.collection(urlPackagesGlobal).where("IdPatient","==",selIdPatientGlobal).where("IdService","==",selIdServiceGlobal).where("IsPack","==",true).where("IsPackCompleted","==",false).get().then(async (obj)=>{
                if (obj.docs.length > 0) {
                    var datosPaquete = obj.docs[0].data();
                    datosPaquete.TakenNumbreSesions += 1;
                    if (datosPaquete.NumbreSesions == datosPaquete.TakenNumbreSesions) {
                        datosPaquete.IsPackCompleted = true;
                    }
                    banPago = false;
                    await GuardarDatosPaquete(datosPaquete,1,obj.docs[0].id);    
                }
                else{
                    agregarConceptosCobro(datos);
                }
            });
            
        }
        $(".dvLoader").hide();
        if (banPago) {            
            MostrarMensajePrincipal("La cíta finalizó, serás enviado a el cobro","success");
            parent.tipoConceptoCobro = 1;
            setTimeout(function(){Redireccionar("/views/IngresosEgresos/validacionPago.html?idPacientePago=" + selIdPatientGlobal + "&idCita=" + selIdAppointmentGlobal);},3000);
        }
        else{
            MostrarMensajePrincipal("La cíta finalizó, serás enviado a el calendario de citas","success");
            setTimeout(function(){Redireccionar("citas.html");},3000);
        }
    });
    
});

function agregarConceptosCobro(conceptoCobro){
    var Servicio = conceptoCobro.Service;
    var dato={
        Price: Servicio.Price,
        IsPack: false,
        isPackCompleted: false,
        IdService: Servicio.IdService,
        Service: Servicio,
        IdCategory: Servicio.idCategory,
        Category: conceptoCobro.Category,
        NumbreSesions: 1,
        datePayOff:new Date()
    }
    //var datos = change.doc.data();
    //var evento = {[id]:datos};
    var idProducto = Date.now();
    var datos = {[idProducto]:dato};
    Object.assign(parent.lstConceptosPago,datos); 
}

async function populateAppointmentData(idAppointment) {
    $(".dvLoader").show();    
    var datos = await selectDb(urlCitasGlobal,idAppointment);
    if (datos != null) {        
        var datosPaciente = parent.lstPatientsGlobal[datos.IdPatient];
        selIdPatientGlobal = datos.IdPatient;
        selIdServiceGlobal = datos.Service.IdService;
        await db.collection(urlPacientesGlobal).doc(datos.IdPatient).get().then(async (obj)=>{
            if (obj.data() != undefined) {
                var datosPacienteAux = obj.data();
                if (datosPacienteAux.NewPatient) {            
                    Redireccionar("/views/HistoriaClinica.html?idPatientHistoria=" + selIdPatientGlobal + "&idCita=" + selIdAppointmentGlobal);
                }              
            }
            else{
                Redireccionar("/views/citas.html");
            }            
        });  
      
        $(".pNombre").text(datosPaciente.NameComplete);
        // var lstText = [$(".txtPadecimientos"),$(".txtAlergias"),$(".txtOperaciones"),$(".txtAntecedentesFamiliares"),$(".txtObservaciones"),$(".txtRecomendaciones")];
        var lstText = [$(".txtObservaciones"),$(".txtRecomendaciones")];
        $(".txtObservaciones").text(datos.Observation);
        $(".txtRecomendaciones").text(datos.Recommendations);
        lstText.forEach(function(txt){
            txt.cleditor({ width: "100%", height: "100%" });
            txt.cleditor()[0].updateTextArea();
        });
        await db.collection(urlPackagesGlobal).where("IdPatient","==",selIdPatientGlobal).where("IdService","==",selIdServiceGlobal).where("IsPack","==",true).where("IsPackCompleted","==",false).get().then(async (obj)=>{
            if (obj.docs.length > 0) {
                var datosPaquete = obj.docs[0].data();
                $(".lblSesionesPaquete").text("Sesión: " + (datosPaquete.TakenNumbreSesions + 1) + "/" + datosPaquete.NumbreSesions);                
            }
        });            
    }
    $(".dvLoader").hide();
}

async function UpdateAppointmentMonitoring(idAppoitment,observations,recommendations,Status) {
    var Appointment = await selectDb(urlCitasGlobal,idAppoitment);
    Appointment.Observation = observations;
    Appointment.Recommendations = recommendations;
    Appointment.Status = Status;
    Appointment.IdEmployeeAttended = parent.idUsuarioSistema;
    await updateDb(urlCitasGlobal,idAppoitment,Appointment);    
}
var selPatientHistory = "";
$(document).ready(function(){  
    
    $(".rblTratamiento").click(function() {
        $(".dvTratamiento").hide();
        var banTratamiento = $(this).filter(":checked").val();
        if (banTratamiento == "1") {
            $(".dvTratamiento").show();
        }
    }).click();

    var genero = $(".rblTratamiento").filter(":checked").val()

    const urlQueryString = new URLSearchParams(window.location.search);
    const idPatientQuery = urlQueryString.get('idPatient');
    if (idPatientQuery != "" && idPatientQuery != null) {
        if (parent.lstPatientsGlobal[idPatientQuery] != undefined) {
            $(".pNomPaciente").text(parent.lstPatientsGlobal[idPatientQuery].NameComplete);
            selPatientHistory = idPatientQuery;
            populatePatientsAppointments(idPatientQuery);    
        }
    }
});

async function populatePatientsAppointments(idPatient){
    await db.collection(urlCitasGlobal).where("IdPatient","==",idPatient).orderBy("AppointmentDateStart", "desc").get().then((obj)=>{
        obj.docs.forEach(function(appointment) {
            var datos =  appointment.data();
            if (datos.Status === StatusAppointment.Pagado || datos.Status === StatusAppointment.Finalizado) {
                Object.assign(parent.lstAppointmentsHistoryGlobal,{[appointment.id]:datos});  
            }
        });
    });

    llenarTablaHistorialCitas(parent.lstAppointmentsHistoryGlobal);
}

function llenarTablaHistorialCitas(datosCitas){
    $(".tblHistorialCitas").empty();
    $(".dvLoader").show();
    var titulos = ["Tratamiento","Fecha",""];    
    var TitulosDatos = ["Service.Name","AppointmentDateStart"];    

    const lstCategories = JSON.parse(JSON.stringify(datosCitas));
    let lstButtons = {};
    if (Object.keys(lstCategories).length >0) {
        for (const ap in lstCategories) {         
            var idAppointment = ap;   
            var Buttons = [];            
            let btnDetalle = $("<a class='btnTablaGlobal material-icons btnIcon' title='Detalle'>search</a>");
            btnDetalle.on('click',()=>{
                location.href = "seguiminetoCita.html?op=1&idAppointment=" + ap;
            });
            Buttons.push(btnDetalle);
            var evento = {[idAppointment]:Buttons};
            Object.assign(lstButtons,evento);
        }
    }
    generarTabla($(".tblHistorialCitas"),titulos,TitulosDatos,datosCitas,lstButtons);
    $(".dvLoader").hide();
}
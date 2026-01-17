var urlPacientesGlobal = "/Patients";
var operationPatient = 0;
//let selPacienteGlobal = "";
let selPacienteHistoricoGlobal = "";
let idCitaHistoria = "";
$(document).ready(function(){ 
    const urlQueryString = new URLSearchParams(window.location.search);
    const idPacienteHistoricoQuery = urlQueryString.get('idPatientHistoria');
    const idCitaQuery = urlQueryString.get('idCita');    
    if (idCitaQuery != "" && idCitaQuery != null) {
        idCitaHistoria = idCitaQuery;        
    }
    if (idPacienteHistoricoQuery != "" && idPacienteHistoricoQuery != null) {
        selPacienteHistoricoGlobal = idPacienteHistoricoQuery;
        populatePatientHistoricoData(idPacienteHistoricoQuery);
    }

    $(".btnGuardarHistoriaClinica").click(async function (){
        var banValidacion = true;        
        if(banValidacion == true){banValidacion = Validador($(".txtCP"),"código postal",$(".txtCP").val(),11,'',false);$(".txtCP").trigger( "focus" );};
        if(banValidacion == true){banValidacion = Validador($(".txtOcupacion"),"ocupación",$(".txtOcupacion").val(),1,'',false);$(".txtOcupacion").trigger( "focus" );};
        if(banValidacion == true){banValidacion = Validador($(".ddlSexo"),"género",$(".ddlSexo").val(),1,'',false);$(".ddlSexo").trigger( "focus" );};
        var fecha = "";
        if ($('.txtFechaNacimiento').val() != "") {
            fecha = $('.txtFechaNacimiento').val().substr(8,2) + "/" + $('.txtFechaNacimiento').val().substr(5,2) + "/" + $('.txtFechaNacimiento').val().substr(0,4);    
        }
        if(banValidacion == true){banValidacion = Validador($(".ddlContacto"),"como se enteró de nosotros",$(".ddlContacto").val(),1,'',false);$(".ddlContacto").trigger( "focus" );};
        if(banValidacion == true){banValidacion = Validador($(".txtFechaNacimiento"),"fecha de nacimiento",fecha,10,'',false);$(".txtFechaNacimiento").trigger( "focus" );};
        if(banValidacion == true){banValidacion = Validador($(".ddlEdoCivil"),"estado civil",$(".ddlEdoCivil").val(),1,'',false);$(".ddlEdoCivil").trigger( "focus" );};
        if(banValidacion == true){banValidacion = Validador($(".ddlEscolaridad"),"escolaridad",$(".ddlEscolaridad").val(),1,'',false);$(".ddlEscolaridad").trigger( "focus" );};
        if(banValidacion == true){banValidacion = Validador($(".txtReligion"),"religión",$(".txtReligion").val(),1,'',false);$(".txtReligion").trigger( "focus" );};

        if(banValidacion == true){banValidacion = Validador($(".txtPeso"),"peso",$(".txtPeso").val(),1,'',false);$(".txtPeso").trigger( "focus" );};
        if(banValidacion == true){banValidacion = Validador($(".txtEstatura"),"altura",$(".txtEstatura").val(),1,'',false);$(".txtEstatura").trigger( "focus" );};
        if(banValidacion == true){banValidacion = Validador($(".ddlTipoSangre"),"tipo de sangre",$(".ddlTipoSangre").val(),1,'',false);$(".ddlTipoSangre").trigger( "focus" );};
        if(banValidacion == true){banValidacion = Validador($(".txtAntecedentesFamiliares"),"antecedentes familiares",$(".txtAntecedentesFamiliares").val(),1,'',false);$(".txtAntecedentesFamiliares").trigger( "focus" );};
        if(banValidacion == true){banValidacion = Validador($(".txtPadecimientos"),"antecedentes personales patologicos",$(".txtPadecimientos").val(),1,'',false);$(".txtPadecimientos").trigger( "focus" );};
        if(banValidacion == true){banValidacion = Validador($(".txtPadecimientosNoPatologicos"),"antecedentes personales patologicos",$(".txtPadecimientosNoPatologicos").val(),1,'',false);$(".txtPadecimientosNoPatologicos").trigger( "focus" );};
        if(banValidacion == true){banValidacion = Validador($(".txtAlergias"),"alergias",$(".txtAlergias").val(),1,'',false);$(".txtAlergias").trigger( "focus" );};
        if(banValidacion == true){banValidacion = Validador($(".txtDiagnostico"),"diagnóstico médico",$(".txtDiagnostico").val(),1,'',false);$(".txtDiagnostico").trigger( "focus" );};

        if(banValidacion == true){
            if($(".rblTratamiento").val() == "true"){
                banValidacion = Validador($(".txtTratamiento"),"tratamiento",$(".txtTratamiento").val(),1,'',false);$(".txtTratamiento").trigger( "focus" );
            }
            else{
                banValidacion = true;
            }
        };
        
        if (banValidacion) {
            $(".dvLoader").show();       
            var patient = await selectDb(urlPacientesGlobal,selPacienteHistoricoGlobal);
            var datosGenerales ={
                ZipCode: $(".txtCP").val(),
                Occupation: $(".txtOcupacion").val(),
                Gender: $(".ddlSexo").val(),
                Birthday: $(".txtFechaNacimiento").val(),
                MaritalStatus: $(".ddlEdoCivil").val(),
                Schooling: $(".ddlEscolaridad").val(),
                Religion: $(".txtReligion").val(),
                Contact: parseInt($(".ddlContacto").val())
            }
            patient.GeneralInformation = datosGenerales;
            
            var historial = {
                Weight: $(".txtPeso").val(),
                Height: $(".txtEstatura").val(),
                BloodType: $(".ddlTipoSangre").val(),
                HereditaryFamilyBackground: $(".txtAntecedentesFamiliares").val(),
                PersonalPathologicalBackground: $(".txtPadecimientos").val(),
                PersonalNonPathologicalBackground: $(".txtPadecimientosNoPatologicos").val(),
                Allergies: $(".txtAlergias").val(),
                Diagnostic: $(".txtDiagnostico").val(),
                Treatment: $(".txtTratamiento").val()
            };                   
            patient.MedicalHistory = historial;
            patient.NewPatient = false;
            await GuardarDatosHistoriaClinicaPacientes(patient,1,selPacienteHistoricoGlobal);   
            Redireccionar("/views/seguiminetoCita.html?idPacientePago=" + selPacienteHistoricoGlobal + "&idAppointment=" + idCitaHistoria);    
            
            $(".dvLoader").hide();
        }
        return false;
    });
});

const GuardarDatosHistoriaClinicaPacientes = async function(objGrupo, operation, idPatient){
    return new Promise(resolve => {setTimeout(async function(){
        QuitarMensaje();
        if (operation == 0){
            resolve(await insertDb(urlPacientesGlobal,objGrupo));
            MostrarMensajePrincipal("El paciente se registró correctamente","success");
        } else {
            resolve(await updateDb(urlPacientesGlobal, idPatient, objGrupo));
            MostrarMensajePrincipal("El paciente se actualizo correctamente","success");
        }
    }, 250);});
};
async function populatePatientHistoricoData(IdPatient){
    operationPatient = 1;
    var patient = await selectDb(urlPacientesGlobal,IdPatient);
    if (patient != null) {
        $(".pNombre").text(patient.Name + " " + patient.LastName + " " + patient.SecondLastName);
        if (patient.GeneralInformation != null) {
            $(".txtCP").val(patient.GeneralInformation.ZipCode);
            $(".txtOcupacion").val(patient.GeneralInformation.Occupation);
            $(".ddlSexo").val(patient.GeneralInformation.Gender);
            $(".txtFechaNacimiento").val(patient.GeneralInformation.Birthday);
            $(".ddlEdoCivil").val(patient.GeneralInformation.MaritalStatus);
            $(".ddlEscolaridad").val(patient.GeneralInformation.Schooling);
            $(".txtReligion").val(patient.GeneralInformation.Religion); 
            $(".ddlContacto").val(patient.GeneralInformation.Contact);
        }

        if (patient.MedicalHistory != null) {
            $(".txtPeso").val(patient.MedicalHistory.Weight);
            $(".txtEstatura").val(patient.MedicalHistory.Height);
            $(".ddlTipoSangre").val(patient.MedicalHistory.BloodType);
            $(".txtAntecedentesFamiliares").val(patient.MedicalHistory.HereditaryFamilyBackground);
            $(".txtPadecimientos").val(patient.MedicalHistory.PersonalPathologicalBackground);
            $(".txtPadecimientosNoPatologicos").val(patient.MedicalHistory.PersonalNonPathologicalBackground);
            $(".txtAlergias").val(patient.MedicalHistory.Allergies);
            $(".txtDiagnostico").val(patient.MedicalHistory.Diagnostic);
            $(".txtTratamiento").val(patient.MedicalHistory.Treatment);
            if (patient.MedicalHistory.Treatment != "") {
                $(".rblTratamiento[value='1']").prop('checked', true);
                $(".dvTratamiento").show();
            }
            else{
                $(".rblTratamiento[value='0']").prop('checked', true);
                $(".dvTratamiento").hide();
            }            
        }
      
    }
}

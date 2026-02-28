
txtFecha.value = new Date().toLocaleString();

const canvas = document.getElementById("canvasFirma");
const signaturePad = new SignaturePad(canvas,{backgroundColor:"white"});

//let lstPatientSeguimientosGlobal = parent.lstPatientsGlobal;
var selIdAppointmentGlobal = "";
var selIdPatientGlobal = "";
var selIdServiceGlobal = "";
let idAppointmentQuery;

$(document).ready(async function(){    
    $(".dvLoader").show();    
    const urlQueryString = new URLSearchParams(window.location.search);
    //"0fCXTpr25fZyIRyaZcvm";
    idAppointmentQuery =  urlQueryString.get('idAppointment');
    const operacionCita = urlQueryString.get('op');
    var datos = await selectDb(urlCitasGlobal,idAppointmentQuery);
    if (datos != null) {  
        txtPaciente.value = datos.Title;
        txtTratamiento.value = datos.Service.Name;
        $(".dvLoader").hide();
    }
    
});

function ajustarCanvas() {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext("2d").scale(ratio, ratio);
    signaturePad.clear();
}

window.addEventListener("resize", ajustarCanvas);
ajustarCanvas();

function limpiarFirma(){
    signaturePad.clear();
}

async function guardarConsentimiento(){

    if(signaturePad.isEmpty()){
        alert("El paciente debe firmar primero");
        return;
    }
    $(".dvLoader").show(); 
    const firma = signaturePad.toDataURL();
    var datosCita = await selectDb(urlCitasGlobal,idAppointmentQuery);
    if (datosCita != null) {  
        txtPaciente.value = datosCita.Title;
        txtTratamiento.value = datosCita.Service.Name;
        const datos = {
            IdPatient: datosCita.IdPatient,
            PatientName: datosCita.Title,
            ConsentText: document.querySelector(".bg-light").innerText,
            Signature: firma,
            IdService: datosCita.Service.IdService,
            Service: datosCita.Service.Name,
            CreatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            IdEmployeeCreatedBy: JSON.parse(sessionStorage.sesionUsuario).UserId
        };

        await db.collection("PatientConsents").add(datos);        
        MostrarMensajePrincipal("Consentimiento guardado correctamente","success");        
        Redireccionar("../seguiminetoCita.html?idAppointment=" + idAppointmentQuery);
        signaturePad.clear();
    }
    else{
        alert("Error");
    }
}
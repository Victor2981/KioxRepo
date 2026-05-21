//let lstPatientSeguimientosGlobal = parent.lstPatientsGlobal;
var selIdAppointmentGlobal = "";
var selIdPatientGlobal = "";
var selIdServiceGlobal = "";
var arregloServiciosTerapia = ["q7ZcmRvq0Hlg1k07zy8U","2kwRyDvUpfTDSeA3n6FW","ufTlPtQbyTo96kom1dlI","bu6SNfhtfBSoR78qh3sH","LWmtdB1oWYb0RfA2JqKX"];
let lstPadecimientos = [];
let lstPadecimientosSeleccionados = [];
const coloresCategoria = {
    "Columna": "#007bff",
    "Miembro inferior": "#28a745",
    "Miembro superior": "#ffc107",
    "Neurológico": "#6f42c1",
    "Deportivo": "#fd7e14",
    "Postquirúrgico": "#dc3545",
    "Estético": "#e83e8c",
    "General": "#6c757d"
};
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
            await UpdateAppointmentMonitoring($(".btnGuardarHistorial"),selIdAppointmentGlobal,observations,recommendations,StatusAppointment.Finalizado);
            if (datosPaciente.NewPatient) {
                var datosRegistro = datosPaciente;
                var lstPadecimientos = [];
                lstPadecimientosSeleccionados.forEach(function(padecimiento){
                   lstPadecimientos.push(padecimiento.id);
                });
                var historial = {
                    BloodType: $(".ddlTipoSangre").val(),
                    Ailments: lstPadecimientos,
                    Allergies: $(".txtAlergias").val(),
                    Surgeries: $(".txtOperaciones").val(),
                    FamilyAilments: $(".txtAntecedentesFamiliares").val(),
                };                   
                datosRegistro.MedicalHistory = historial;
                datosRegistro.NewPatient = false;
                await GuardarDatosPacientes($(".btnGuardarHistorial"),datosRegistro,1,datos.IdPatient);   
            }
            $(".dvLoader").hide();
            MostrarMensajePrincipal("El historial ha sido guardado, serás enviado a las citas del paciente","success");
            Redireccionar("historialClinico.html?idPatient=" + datos.IdPatient);
        }
    });

    $(".btnAceptarAltaDiagnostico").on("click", async function (e) {
            e.preventDefault();

            const $btn = $(this);
            var banValidacion = true;        
            try {
                $(".dvLoader").show();
                $btn.prop("disabled", true);

                parent.lstConceptosPago = {};

                const observations = $(".txtObservaciones").val();
                const recommendations = $(".txtRecomendaciones").val();
                const appointment = await selectDb(urlCitasGlobal, selIdAppointmentGlobal);
                if (arregloServiciosTerapia.includes(appointment.Service.IdService)) {
                    if(banValidacion == true){banValidacion = Validador($(".ddlDiagnostico"),"diagnóstico",lstPadecimientosSeleccionados.length,3,'')};
                }
                if (!appointment) {
                    MostrarMensajePrincipal("No se encontró la cita", "danger");
                    return;
                }
                if(banValidacion){
                    var lstPadecimientos = [];
                    var valoresSeleccionados = $('input[name="diagnostico"]:checked').map(function() {
                        return $(this).val();
                    }).get(); 
                    lstPadecimientosSeleccionados.forEach(function(padecimiento){
                        if (valoresSeleccionados.includes(padecimiento.id)) {
                            lstPadecimientos.push(padecimiento.id);
                        }
                    });
                    const idMedicalCondition = lstPadecimientos;
                    var isMedicalDischarge = true;
                    await finishAppointmentFlow($(".btnFinishAppointmentMedicalDischarge"),appointment,observations,recommendations,idMedicalCondition,isMedicalDischarge);
                    //await updateDb(urlCategoriesGlobal,idCategory,Category);
                }
            } catch (error) {
                console.error(error);
                MostrarMensajePrincipal("Ocurrió un error al finalizar la cita", "danger");
            } finally {
                $(".dvLoader").hide();
                $btn.prop("disabled", false);
            }
    });    

   $(".btnFinishAppointment").on("click", async function (e) {
        e.preventDefault();

        const $btn = $(this);
        var banValidacion = true;        
        try {
            $(".dvLoader").show();
            $btn.prop("disabled", true);

            parent.lstConceptosPago = {};

            const observations = $(".txtObservaciones").val();
            const recommendations = $(".txtRecomendaciones").val();
            const appointment = await selectDb(urlCitasGlobal, selIdAppointmentGlobal);
            if (arregloServiciosTerapia.includes(appointment.Service.IdService)) {
                if(banValidacion == true){banValidacion = Validador($(".ddlDiagnostico"),"diagnóstico",lstPadecimientosSeleccionados.length,3,'')};
            }
            if (!appointment) {
                MostrarMensajePrincipal("No se encontró la cita", "danger");
                return;
            }
            if(banValidacion){
                var lstPadecimientos = [];
                lstPadecimientosSeleccionados.forEach(function(padecimiento){
                   lstPadecimientos.push(padecimiento.id);
                });
                const idMedicalCondition = lstPadecimientos;
                const isMedicalDischarge = false;
                await finishAppointmentFlow($(".btnFinishAppointment"),
                    appointment,
                    observations,
                    recommendations,
                    idMedicalCondition,
                    isMedicalDischarge
                );    
            }
        } catch (error) {
            console.error(error);
            MostrarMensajePrincipal("Ocurrió un error al finalizar la cita", "danger");
        } finally {
            $(".dvLoader").hide();
            $btn.prop("disabled", false);
        }
    });    

    async function finishAppointmentFlow(ctrl,appointment, observations, recommendations,LstIdMedicalCondition, isMedicalDischarge) {
        var idMedicalRecord = "";
        if (arregloServiciosTerapia.includes(selIdServiceGlobal)) {
            LstIdMedicalCondition.forEach(function(IdMedicalCondition){
                obtenerPorPacientePorServicioActivo(selIdPatientGlobal, IdMedicalCondition).then(async function (datos) {
                    if (datos == null) {
                        idMedicalRecord = await insertarMedicalRecord({
                            IdPatient: selIdPatientGlobal,
                            IdService: selIdServiceGlobal,
                            IdMedicalCondition: IdMedicalCondition,
                            dateStart: new Date(),
                            dateFinish: null,
                            MedicalDischarge: false
                        });
                    }
                    else {
                        var datosExp = datos;
                        if (datosExp != null) {
                            var datosExpediente = datosExp.data();
                            datosExpediente.MedicalDischarge = isMedicalDischarge;
                            datosExpediente.dateFinish = new Date();
                            await updateDb(ctrl,"MedicalRecords", datosExp.id, datosExpediente);      
                        }
                    }
                });
            });
        }
        appointment.IdMedicalRecord = idMedicalRecord;
        // 🔹 Actualizar cita a Reagendar
        await UpdateAppointmentMonitoring(
            $(".btnFinishAppointment"),
            selIdAppointmentGlobal,
            observations,
            recommendations,
            StatusAppointment.Reagendar
        );

        // 🔹 Buscar paquete activo del paciente
        const snapshot = await db.collection(urlPackagesGlobal)
            .where("IdPatient", "==", selIdPatientGlobal)
            .where("IdService", "==", selIdServiceGlobal)
            .where("IsPack", "==", true)
            .where("IsPackCompleted", "==", false)
            .limit(1)
            .get();

        if (!snapshot.empty) {

            await processPackSession(snapshot.docs[0], observations, recommendations);

        } else {

            await processNormalCharge(appointment);
        }
    }

    async function processPackSession(packDoc, observations, recommendations) {

    const packData = packDoc.data();

    packData.TakenNumbreSesions += 1;

    if (packData.TakenNumbreSesions >= packData.NumbreSesions) {
        packData.IsPackCompleted = true;
    }

    // 🔥 Transaction para evitar inconsistencias
    await db.runTransaction(async (transaction) => {

            const packRef = db.collection(urlPackagesGlobal).doc(packDoc.id);

            transaction.update(packRef, {
                TakenNumbreSesions: packData.TakenNumbreSesions,
                IsPackCompleted: packData.IsPackCompleted
            });

            const appointmentRef = db.collection(urlCitasGlobal).doc(selIdAppointmentGlobal);

            transaction.update(appointmentRef, {
                Status: StatusAppointment.Pagado
            });
        });

        await UpdateAvailabilityEmployee(
            $(".btnFinishAppointment"),
            selIdAppointmentGlobal,
            parent.idUsuarioSistema,
            true
        );

        MostrarMensajePrincipal(
            "La cita finalizó y se descontó del paquete",
            "success"
        );

        Redireccionar("citas.html");
    }

    async function processNormalCharge(appointment) {

        await agregarConceptosCobroOptimizado(appointment);

        MostrarMensajePrincipal(
            "La cita finalizó, serás enviado al cobro",
            "success"
        );

        parent.tipoConceptoCobro = 1;

        Redireccionar(
            "/views/agendaCita.html?idPacientePago=" +
            selIdPatientGlobal +
            "&idCita=" +
            selIdAppointmentGlobal
        );
    }
});

 // 🔥 AUTOCOMPLETE
//  document.getElementById("txtPadecimiento").addEventListener("keyup", function () {

//     const input = this;
//     const texto = input.value.toLowerCase();

//     // limpiar anteriores
//     closeList();

//     if (!texto) return;

//     const contenedor = document.createElement("DIV");
//     contenedor.setAttribute("class", "autocomplete-items");
//     input.parentNode.appendChild(contenedor);

//     const resultados = lstPadecimientos
//         .filter(x => x.name.toLowerCase().includes(texto))
//         .slice(0, 10); // 🔥 limitamos a 10

//     resultados.forEach(item => {
//         const div = document.createElement("DIV");
//         div.innerHTML = "<strong>" + item.name + "</strong>";

//         div.addEventListener("click", function () {
//             input.value = item.id;
//             document.getElementById("txtPadecimiento").innerText = item.name + " (" + item.id + ")";
//             closeList();
//         });

//         contenedor.appendChild(div);
//     });
// });

// function closeList() {
//     const items = document.querySelectorAll(".autocomplete-items");
//     items.forEach(el => el.remove());
// }

// document.addEventListener("click", function (e) {
//     if (e.target.id !== "txtPadecimiento") {
//         alert(e.target.id);
//         closeList();
//     }
// });

async function cargarPadecimientos() {
    const snapshot = await db.collection("MedicalConditions")
        .where("Status", "==", 2)
        .get();

    snapshot.forEach(doc => {
        // lstPadecimientos.push({[doc.id]:doc.data()});
        var datos = doc.data();
        datos.id = doc.id;
        lstPadecimientos.push(datos);
    });

    console.log("Padecimientos cargados:", lstPadecimientos.length);
}

async function SeleccionarPadecimiento() {
    $(".ddlDiagnostico").empty();
    $(".ddlDiagnostico").append('<option value="">Selecciona un diagnóstico</option>');
    await obtenerPorStatus(2).then(function(datos){ 
        for (let index = 0; index < datos.length; index++) {
            const element = datos[index];
            $(".ddlDiagnostico").append('<option value="' + element.id + '">' + element.data().Name + '</option>');
        }
    });
}

async function agregarConceptosCobroOptimizado(conceptoCobro) {

    parent.lstConceptosPago = {};

    const Servicio = conceptoCobro.Service;

    let precio = parseFloat(Servicio.Price);

    // 🔥 Consulta directa con limit
    const snapshot = await db.collection("SpecialPrice")
        .where("IdPatient", "==", selIdPatientGlobal)
        .where("IdService", "==", Servicio.IdService)
        .limit(1)
        .get();

    if (!snapshot.empty) {
        precio = parseFloat(snapshot.docs[0].data().Price);
    }

    const dato = {
        Price: precio,
        IsPack: false,
        IsPackCompleted: false,
        IdService: Servicio.IdService,
        Service: Servicio,
        IdCategory: Servicio.idCategory,
        Category: conceptoCobro.Category,
        NumbreSesions: 1,
        IdBranch: conceptoCobro.IdBranch,
        datePayOff: new Date()
    };

    const idProducto = crypto.randomUUID(); // 🔥 mejor que Date.now()

    parent.lstConceptosPago[idProducto] = dato;
}

async function agregarConceptosCobro(conceptoCobro){
    parent.lstConceptosPago = {};
    var Servicio = conceptoCobro.Service;
    var precio = parseFloat(Servicio.Price);
    await db.collection("/SpecialPrice").where("IdPatient","==",selIdPatientGlobal).where("IdService","==",Servicio.IdService).get().then(async (obj)=>{
        if (obj.docs.length > 0) {
            var datosPrecio = obj.docs[0].data();
            precio = parseFloat(datosPrecio.Price);
        }
    }); 
    var dato={
        Price: precio,
        IsPack: false,
        isPackCompleted: false,
        IdService: Servicio.IdService,
        Service: Servicio,
        IdCategory: Servicio.idCategory,
        Category: conceptoCobro.Category,
        NumbreSesions: 1,
        IdBranch: conceptoCobro.IdBranch,
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
        var LstMedicalCondition = await obtenerPadecimientoActivoPorPaciente(datos.IdPatient);
        //$(".ddlDiagnostico").val(idMedicalCondition);
        LstMedicalCondition.forEach(function(padecimiento){
            agregarChip(lstPadecimientos.find(u => u.id === padecimiento.data().IdMedicalCondition),true);
        });
        var datosPaciente = parent.lstPatientsGlobal[datos.IdPatient];
        selIdPatientGlobal = datos.IdPatient;
        selIdServiceGlobal = datos.Service.IdService;
        await db.collection(urlPacientesGlobal).doc(datos.IdPatient).get().then(async (obj)=>{
            if (obj.data() != undefined) {
                var datosPacienteAux = obj.data();
                if (datosPacienteAux.NewPatient) {            
                    Redireccionar("/views/HistoriaClinica.html?idPatientHistoria=" + selIdPatientGlobal + "&idCita=" + selIdAppointmentGlobal);
                }              
                await db.collection("/PatientConsents").where("IdPatient","==",datos.IdPatient).where("IdService","==",datos.Service.IdService).get().then(async (objConsentimiento)=>{
                    if (objConsentimiento.docs.length == 0) {                        
                        Redireccionar("/views/Pacientes/ConsentimientoInformado.html?idAppointment=" + idAppointment);
                    }
                });
            }
            else{
                Redireccionar("/views/citas.html");
            }            
        });  
      
        $(".pNombre").text(datosPaciente.NameComplete);
        $(".accordionNote").hide();
        if (datos.Note != undefined) {
            $(".pNotaCita").text(datos.Note);
            $(".accordionNote").show();
        }
        
        // var lstText = [$(".txtPadecimientos"),$(".txtAlergias"),$(".txtOperaciones"),$(".txtAntecedentesFamiliares"),$(".txtObservaciones"),$(".txtRecomendaciones")];
        $(".btnFinishAppointmentMedicalDischarge").hide();
        var lstText = [$(".txtObservaciones"),$(".txtRecomendaciones")];
        $(".txtObservaciones").text(datos.Observation);
        $(".txtRecomendaciones").text(datos.Recommendations);        
        if (arregloServiciosTerapia.includes(datos.Service.IdService)) {
            $(".rowDiagnostico").show();
            if (LstMedicalCondition.length > 0) {
                $(".btnFinishAppointmentMedicalDischarge").show();
            }
        }
        else{
            $(".rowDiagnostico").hide();
        }
        // lstText.forEach(function(txt){
        //     txt.cleditor({ width: "100%", height: "100%" });
        //     txt.cleditor()[0].updateTextArea();
        // });
        await db.collection(urlPackagesGlobal).where("IdPatient","==",selIdPatientGlobal).where("IdService","==",selIdServiceGlobal).where("IsPack","==",true).where("IsPackCompleted","==",false).get().then(async (obj)=>{
            if (obj.docs.length > 0) {
                var datosPaquete = obj.docs[0].data();
                $(".lblSesionesPaquete").text("Sesión: " + (datosPaquete.TakenNumbreSesions + 1) + "/" + datosPaquete.NumbreSesions);                
            }
        });            
    }
    $(".dvLoader").hide();
}

async function UpdateAppointmentMonitoring(ctrl,idAppoitment,observations,recommendations,Status) {
    var Appointment = await selectDb(urlCitasGlobal,idAppoitment);
    Appointment.Observation = observations;
    Appointment.Recommendations = recommendations;
    Appointment.Status = Status;
    Appointment.IdEmployeeAttended = parent.idUsuarioSistema;
    await updateDb(ctrl,urlCitasGlobal,idAppoitment,Appointment);    
}


const input = document.getElementById("inputDiagnostico");
const list = document.getElementById("autocomplete-list");
const chipsContainer = document.getElementById("chipsContainer");


// 🔍 AUTOCOMPLETE
if (input != undefined) {
    input.addEventListener("keyup", function() {
        const val = this.value.toLowerCase();
        list.innerHTML = "";

        if (!val) return;

        const filtrados = lstPadecimientos.filter(d =>
            d.Name.toLowerCase().includes(val)
        );

        filtrados.forEach(d => {
            const div = document.createElement("div");
            div.innerHTML = `
                <strong>${d.Name}</strong>
                <span class="tagCategoria">(${d.Category})</span>
            `;

            div.onclick = () => agregarChip(d);

            list.appendChild(div);
        });
    });
}



// ➕ CHIP CON COLOR
function agregarChip(d,sinEliminar = false) {
    if (d != undefined) {
        if (lstPadecimientosSeleccionados.find(x => x.Name === d.Name)) return;
        lstPadecimientosSeleccionados.push(d);

        const chip = document.createElement("div");
        chip.className = "chip";

        const color = coloresCategoria[d.Category] || "#333";
        chip.style.background = color;

        chip.innerHTML = `
            ${d.Name}
            <span>&times;</span>
        `;

        $(".dvAltaDiagnosticos").append('<label><input type="checkbox" name="diagnostico" value="' + d.id + '"> ' + d.Name + '</label><br>');

        if (!sinEliminar) {
            chip.querySelector("span").onclick = () => {
                lstPadecimientosSeleccionados = lstPadecimientosSeleccionados.filter(x => x.Name !== d.Name);
                chip.remove();
            };
        }
        else{
            chip.querySelector("span").remove();
        }

        chipsContainer.appendChild(chip);

        input.value = "";
        list.innerHTML = "";
    }
    
}

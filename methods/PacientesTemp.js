//let lstPatientsGlobal = {}; parent.lstPatientsGlobal;

var urlPacientesGlobal = "/Patients";
var operationPatient = 0;
let selPacienteGlobal = "";

$(document).ready(function(){        
    $(".btnGuardarPaciente").click(async function (){
        var banValidacion = true;
        
        banValidacion = Validador($(".txtNombre"),"nombre",$(".txtNombre").val(),1,'',false);
        //if(banValidacion == true){banValidacion = Validador($(".txtPrimerApellido"),"primer apellido",$(".txtPrimerApellido").val(),1,'',false)};
        //if(banValidacion == true){banValidacion = Validador($(".txtSegundoApellido"),"segundo apellido",$(".txtSegundoApellido").val(),1,'',false)};
        //if(banValidacion == true){banValidacion = Validador($(".txtFechaNacimiento"),"fecha de nacimiento",fecha,1,'',false)};
        //if(banValidacion == true){banValidacion = Validador($(".txtCelular"),"celular",$(".txtCelular").val(),5,'',false)};
        //if(banValidacion == true){banValidacion = Validador($(".txtCorreo"),"correo",$(".txtCorreo").val(),4,'',false)};
        if (banValidacion) {
            $(".dvLoader").show();
            var nombre = $(".txtNombre").val();
            var primerApellido = $(".txtPrimerApellido").val();
            var segundoApellido = $(".txtSegundoApellido").val();
            var genero = $(".rblGenero").filter(":checked").val()             
            var celular = $(".txtCelular").val();         
            var historial = {
                BloodType: $(".ddlTipoSangre").val(),
                Ailments: $(".txtPadecimientos").val(),
                Allergies: $(".txtAlergias").val(),
                Surgeries: $(".txtOperaciones").val(),
                FamilyAilments: $(".txtAntecedentesFamiliares").val(),
            };     
            var dato={
                Name: nombre,
                Birthday : null,
                Email : '',
                Gender : genero,
                LastName : primerApellido,
                Phone : celular,
                SecondLastName: segundoApellido,
                MedicalHistory: historial,
                NewPatient: false
            }
            // var operacion = 0;
            // if (selPacienteGlobal != "") {
            //     operacion = 1;
            // }
            await GuardarDatosPacientes(dato,operationPatient,selPacienteGlobal);
            $(".dvLoader").hide();
            setTimeout(redireccionar, 3000);
            return false;
        }
    });

    const urlQueryString = new URLSearchParams(window.location.search);
    const idPacienteQuery = urlQueryString.get('idPatient');
    if (idPacienteQuery != "" && idPacienteQuery != null) {
        selPacienteGlobal = idPacienteQuery;
        populatePatientData(idPacienteQuery);
    }

});

function redireccionar() {
    window.location.replace("http://127.0.0.1:5500/views/altaPacientesTemp.html");
}

async function populatePatientData(IdPatient){
    operationPatient = 1;
    var patient = await selectDb(urlPacientesGlobal,IdPatient);
    if (patient != null) {
        $(".txtNombre").val(patient.Name);
        $(".txtPrimerApellido").val(patient.LastName);
        $(".txtSegundoApellido").val(patient.SecondLastName);  
        $('.rblGenero[value=' + patient.Gender + ']').attr('checked',true);
        $(".txtFechaNacimiento").val(patient.Birthday);   
        $(".txtCelular").val(patient.Phone);   
        $(".txtCorreo").val(patient.Email);   
    }
}

const GuardarDatosPacientes = async function(objGrupo, operation, idPatient){
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

function filterPatients(query) {
    return parent.lstPatientsFiltroGlobal.filter(function (el) {
        var dato = el[Object.keys(el)[0]].datos;
        var accent_map = {'á':'a', 'é':'e', 'è':'e', 'í':'i','ó':'o','ú':'u','Á':'a', 'É':'e', 'è':'e', 'Í':'i','Ó':'o','Ú':'u'};
        var cadena = dato.Name.trim().toLowerCase() + " " + dato.LastName.trim().toLowerCase() + " " + dato.SecondLastName.trim().toLowerCase();
         var ret = '';
         for (var i = 0; i < query.length; i++) {
             ret += accent_map[query.charAt(i)] || query.charAt(i);
         }
         query = ret;
        return cadena.indexOf(query.trim().toLowerCase()) > -1;
    });
}

const SeleccionarDatosPacientes = async function(){
    $(".dvLoader").show();
    await db.collection(urlPacientesGlobal).onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
            
            if (change.type === "added") {
                var id = change.doc.id;
                var datos = change.doc.data();
                parent.lstPatientsFiltroGlobal.push({[id]:{datos}});
                var datos = {[id]:datos};
                Object.assign(parent.lstPatientsGlobal,datos);                
            }
            if (change.type === "modified") {
                var id = change.doc.id;
                var datos = change.doc.data();
                parent.lstPatientsFiltroGlobal.push({[id]:{datos}});
                var datos = {[id]:datos};
                Object.assign(parent.lstPatientsGlobal,datos);                
            }
        });
        llenarTablaPacientes(parent.lstPatientsGlobal);
    });
};

function searchPatients(searchText){
    return lstPatientsFiltered = filterPatients(searchText);
}

function llenarTablaPacientes(datosPatients){
    $(".tblPacientes").empty();
    var titulos = ["Nombre","Edad","Telefono","Correo","",""];    
    var TitulosDatos = ["NameComplete","Age","Phone","Email"];    

    const lstPatients = JSON.parse(JSON.stringify(datosPatients));
    let lstButtons = {};
    if (Object.keys(lstPatients).length >0) {
        for (const ap in lstPatients) {
            var idPatient = ap;
            var PatientData = datosPatients[idPatient];
            PatientData.NameComplete = PatientData.Name + " " + PatientData.LastName + " " + PatientData.SecondLastName;
            PatientData.Age = new Date(new Date() - new Date(PatientData.Birthday)).getFullYear() - 1970;
            var Buttons = [];
            let btnHistoriaClinica = $("<a class='btnTablaGlobal material-icons' title='Historial clínico'>manage_search</a>");
            btnHistoriaClinica.on('click',()=>{
                location.href = "historialClinico.html?idPatient=" + ap;
            });
            Buttons.push(btnHistoriaClinica);
            let btnEditar = $("<a class='btnTablaGlobal material-icons' title='Editar'>edit</a>");
            btnEditar.on('click',()=>{
                location.href = "altaPacientes.html?idPatient=" + ap;
            });
            Buttons.push(btnEditar);
            var evento = {[idPatient]:Buttons};
            Object.assign(lstButtons,evento);
        }
    }


    // datosPatients.forEach(elemnt => {
    //     var idPatient = Object.keys(elemnt)[0];
    //     var dato = elemnt[Object.keys(elemnt)[0]].datos;
    //     dato.NameComplete = dato.Name + " " + dato.LastName + " " + dato.SecondLastName;
    //     dato.Age = new Date(new Date() - new Date(dato.Birthday)).getFullYear() - 1970;
    // });
    
    generarTabla($(".tblPacientes"),titulos,TitulosDatos,datosPatients,lstButtons);
    $(".dvLoader").hide();
}



// function generarTitulosTabla(obj,titulos){
//     var tblTitulo = "<thead>";
//     tblTitulo += "<tr>";
//     titulos.forEach(titulo => {
//         tblTitulo += "<th>";
//         tblTitulo += titulo;
//         tblTitulo += "</th>";
//     });
//     tblTitulo += "</tr>";
//     tblTitulo += " </thead> ";
//     obj.append(tblTitulo);
// }

// function generarDatosTabla(obj,TitulosDatos,datos){
//     var tblDato = "<tbody>";
//     const lstPatients = JSON.parse(JSON.stringify(datos));
//     if (Object.keys(lstPatients).length >0) {
//         for (const ap in lstPatients) {
//             var dato = lstPatients[ap];
//             tblDato += "<tr>";
//             TitulosDatos.forEach(titulo => {
//                 tblDato += "<td>";
//                 tblDato += dato[titulo];
//                 tblDato += "</td>";
//             });
//             tblDato += "</tr>";
//         }
//     }
//     // datos.forEach(elemnt => {
//     //     var dato = elemnt[Object.keys(elemnt)[0]].datos;
//     //     tblDato += "<tr>";
//         // TitulosDatos.forEach(titulo => {
//         //     tblDato += "<td>";
//         //     tblDato += dato[titulo];
//         //     tblDato += "</td>";
//         // });
//     //     tblDato += "</tr>";
//     // });
//     tblDato += "</tbody>";
//     obj.append(tblDato);
// }
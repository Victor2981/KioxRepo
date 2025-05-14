//let lstPatientsGlobal = {}; parent.lstPatientsGlobal;

var urlPacientesGlobal = "/Patients";
var operationPatient = 0;
let selPacienteGlobal = "";
let selPacienteHistoricoGlobal = "";

$(document).ready(function(){   
    
    $(".btnGuardarPaciente").click(async function (){
        var banValidacion = true;
        
        banValidacion = Validador($(".txtNombre"),"nombre",$(".txtNombre").val(),1,'',false);
        if(banValidacion == true){banValidacion = Validador($(".txtPrimerApellido"),"primer apellido",$(".txtPrimerApellido").val(),1,'',false)};
        //if(banValidacion == true){banValidacion = Validador($(".txtSegundoApellido"),"segundo apellido",$(".txtSegundoApellido").val(),1,'',false)};
        //if(banValidacion == true){banValidacion = Validador($(".txtFechaNacimiento"),"fecha de nacimiento",fecha,1,'',false)};
        if(banValidacion == true){banValidacion = Validador($(".txtCelular"),"celular",$(".txtCelular").val(),5,'',false)};
        //if(banValidacion == true){banValidacion = Validador($(".txtCorreo"),"correo",$(".txtCorreo").val(),4,'',false)};
        if (banValidacion) {
            $(".dvLoader").show();
            var nombre = $(".txtNombre").val().trim();
            var primerApellido = $(".txtPrimerApellido").val().trim();
            var segundoApellido = $(".txtSegundoApellido").val().trim();
            var genero = $(".rblGenero").filter(":checked").val();      
            var celular = $(".txtCelular").val().trim();

            if (operationPatient != 1) {
                var dato={
                    Name: nombre,
                    Email : '',
                    Gender : genero,
                    LastName : primerApellido,
                    Phone : celular,
                    SecondLastName : segundoApellido,
                    GeneralInformation: {},
                    MedicalHistory: {},
                    NewPatient: true,
                    RegistrationDate: new Date()
                }
                // var operacion = 0;
                // if (selPacienteGlobal != "") {
                //     operacion = 1;
                // }


                await db.collection(urlPacientesGlobal).where("Phone","==",celular).get().then(datoValidacion =>{
                    if (datoValidacion.docs.length == 0) {
                        GuardarDatosPacientes(dato,operationPatient,selPacienteGlobal);        
                    }
                    else{
                        MostrarMensajePrincipal("El paciente ya esta registrado","warning");
                    }
                });
            }
            else{
                operationPatient = 1;
                var patient = await selectDb(urlPacientesGlobal,selPacienteGlobal);
                patient.Name = nombre;
                patient.Gender = genero;
                patient.LastName = primerApellido;
                patient.Phone = celular;
                patient.SecondLastName = segundoApellido;
                GuardarDatosPacientes(patient,operationPatient,selPacienteGlobal);
            }
            $(".dvLoader").hide();
            return false;
        }
    });


    $(".txtPacienteFiltro").keyup(function name() {
        for (let index = 0; index < $(".trDatoGlobal").length; index++) {
            const $tr = $(".trDatoGlobal")[index];
            var texto = quitarAcentos($tr.textContent.toUpperCase());
            var filtro = quitarAcentos($(".txtPacienteFiltro").val().toUpperCase().trim());
            if (texto.indexOf(filtro) > -1) {
                $tr.style.display = "";
              } else {
                $tr.style.display = "none";
              }
        }
    });

    const urlQueryString = new URLSearchParams(window.location.search);
    const idPacienteQuery = urlQueryString.get('idPatient');    
    if (idPacienteQuery != "" && idPacienteQuery != null) {
        selPacienteGlobal = idPacienteQuery;
        populatePatientData(idPacienteQuery);
    }
});

// async function populatePatientHistoricoData(IdPatient){
//     operationPatient = 1;
//     var patient = await selectDb(urlPacientesGlobal,IdPatient);
//     if (patient != null) {
//         $(".pNombre").text(patient.Name + " " + patient.LastName + " " + patient.SecondLastName);
//     }
// }

async function populatePatientData(IdPatient){
    operationPatient = 1;
    var patient = await selectDb(urlPacientesGlobal,IdPatient);
    if (patient != null) {
        $(".pNombre").text(patient.Name + " " + patient.LastName + " " + patient.SecondLastName);
        $(".txtNombre").val(patient.Name);
        $(".txtPrimerApellido").val(patient.LastName);
        $(".txtSegundoApellido").val(patient.SecondLastName);  
        $('.rblGenero[value=' + patient.Gender + ']').attr('checked',true);
        $(".txtFechaNacimiento").val(patient.GeneralInformation.Birthday);   
        $(".txtCelular").val(patient.Phone);   
        $(".txtCorreo").val(patient.Email);   
        if (patient.NewPatient == true) {
            window.location.href ="HistoriaClinica.html?idPatientHistoria="+ IdPatient +"&idAppointment=" + selIdAppointmen;
        }
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
        cadena = quitarAcentos(cadena);
         var ret = '';
         for (var i = 0; i < query.length; i++) {
             ret += accent_map[query.charAt(i)] || query.charAt(i);
         }
         query = ret;
         query = quitarAcentos(query);
        return cadena.indexOf(query.trim().toLowerCase()) > -1;
    });
}

const SeleccionarDatosPacientes = async function(){
    $(".dvLoader").show();
    await db.collection(urlPacientesGlobal).orderBy("Name").orderBy("LastName").onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
            
            if (change.type === "added") {
                var id = change.doc.id;
                if (parent.lstIdPatientsFiltroGlobal.filter((el) => el == id).length == 0) {
                    var datos = change.doc.data();
                    parent.lstPatientsFiltroGlobal.push({[id]:{datos}});
                    var datos = {[id]:datos};
                    Object.assign(parent.lstPatientsGlobal,datos);                    
                    parent.lstIdPatientsFiltroGlobal.push(id);
                }
            }
            if (change.type === "modified") {
                if (parent.lstIdPatientsFiltroGlobal.filter((el) => el == id).length == 0) {
                    var id = change.doc.id;
                    var datos = change.doc.data();
                    parent.lstPatientsFiltroGlobal.push({[id]:{datos}});
                    var datos = {[id]:datos};
                    Object.assign(parent.lstPatientsGlobal,datos);                
                    parent.lstIdPatientsFiltroGlobal.push(id);
                }
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
    var titulos = ["Nombre","Edad","Telefono","","",""];    
    var TitulosDatos = ["NameComplete","Age","Phone"];    

    const lstPatients = JSON.parse(JSON.stringify(datosPatients));
    let lstButtons = {};
    if (Object.keys(lstPatients).length >0) {
        for (const ap in lstPatients) {
            var idPatient = ap;
            var PatientData = datosPatients[idPatient];
            PatientData.NameComplete = PatientData.Name + " " + PatientData.LastName + " " + PatientData.SecondLastName;
            PatientData.Age = new Date(new Date() - new Date(PatientData.GeneralInformation.Birthday)).getFullYear() - 1970;
            var Buttons = [];
            
            let btnHistoriaClinica = $("<a class='btnTablaGlobal material-icons' title='Historia clinica'>pending_actions</a>");
            btnHistoriaClinica.on('click',()=>{
                location.href = "HistoriaClinica.html?idPatientHistoria=" + ap;
            });
            Buttons.push(btnHistoriaClinica);

            let btnHistoricoCitas = $("<a class='btnTablaGlobal material-icons' title='Historial de citas'>manage_search</a>");
            btnHistoricoCitas.on('click',()=>{
                location.href = "historialClinico.html?idPatient=" + ap;
            });
            Buttons.push(btnHistoricoCitas);
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
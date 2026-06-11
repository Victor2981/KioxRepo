//let lstPatientsGlobal = {}; parent.lstPatientsGlobal;

var urlPacientesGlobal = "/Patients";
var operationPatient = 0;
let selPacienteGlobal = "";
let selPacienteHistoricoGlobal = "";
const filasPacientes = [];

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
                        GuardarDatosPacientes($(".btnGuardarPaciente"),dato,operationPatient,selPacienteGlobal);        
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
                GuardarDatosPacientes($(".btnGuardarPaciente"),patient,operationPatient,selPacienteGlobal);
            }
            $(".dvLoader").hide();
            return false;
        }
    });
   

    $(".txtNombre").keyup(function () {
        this.value = capitalizar(this.value);
    });

    $(".txtPrimerApellido").keyup(function () {
        this.value = capitalizar(this.value);
    });

    $(".txtSegundoApellido").keyup(function () {
        this.value = capitalizar(this.value);
    });

    $(".txtPacienteFiltro").on("input", debounce(function () {

        const filtro = quitarAcentos(
            this.value.toUpperCase().trim()
        );

        for (const fila of filasPacientes) {

            fila.style.display =
                fila.dataset.search.includes(filtro)
                    ? ""
                    : "none";
        }

    }, 250));

    const urlQueryString = new URLSearchParams(window.location.search);
    const idPacienteQuery = urlQueryString.get('idPatient');    
    if (idPacienteQuery != "" && idPacienteQuery != null) {
        selPacienteGlobal = idPacienteQuery;
        populatePatientData(idPacienteQuery);
    }
});

 function prepararBusqueda() {

        $(".trDatoGlobal").each(function () {

            const textoBusqueda = quitarAcentos(
                this.textContent.toUpperCase()
            );

            this.dataset.search = textoBusqueda;

            filasPacientes.push(this);
        });
    }

    function debounce(fn, delay) {

        let timeout;

        return function (...args) {

            clearTimeout(timeout);

            timeout = setTimeout(() => {
                fn.apply(this, args);
            }, delay);
        };
    }

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

const GuardarDatosPacientes = async function(ctrl,objGrupo, operation, idPatient){
    return new Promise(resolve => {setTimeout(async function(){
        QuitarMensaje();
        if (operation == 0){
            if (datosCuentaUsusario.Position ==  parseInt(KioxPositions.Administrador)) {
                await insertDb(ctrl,urlPacientesGlobal,objGrupo)
                resolve(await crearContacto(objGrupo.Name + " " + objGrupo.LastName + " " + objGrupo.SecondLastName, objGrupo.Phone, objGrupo.Email));
            }
            else{
                resolve(await insertDb(ctrl,urlPacientesGlobal,objGrupo));
            }
            MostrarMensajePrincipal("El paciente se registró correctamente","success");
        } else {
            resolve(await updateDb(ctrl,urlPacientesGlobal, idPatient, objGrupo));
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
    var datosCuentaUsusario = JSON.parse(sessionStorage.sesionUsuario);
    if (datosCuentaUsusario.Position ==  parseInt(KioxPositions.Fisioterapeuta)) {
        titulos = ["Nombre","Edad","","",""];    
        TitulosDatos = ["NameComplete","Age"];    
    }
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
    prepararBusqueda();
    $(".dvLoader").hide();
}


async function pegarDatos() {

    try {

        let texto = await navigator.clipboard.readText();

        // Limpiar saltos y espacios múltiples
        texto = texto
            .replace(/\r?\n/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        // =========================
        // EXTRAER TELÉFONO
        // =========================

        /*
            Detecta teléfonos aunque tengan:
            - espacios
            - guiones
            - paréntesis
        */

        let telefonoMatch = texto.match(/(\+?\d[\d\s\-()]{7,}\d)/);

        let celular = "";

        if (telefonoMatch) {

            celular = telefonoMatch[0]
                .replace(/\D/g, "");

            // Remover teléfono del texto
            texto = texto.replace(telefonoMatch[0], "").trim();
        }

        // =========================
        // EXTRAER NOMBRES
        // =========================

        let partes = texto.split(" ");

        let nombre = "";
        let apellidoP = "";
        let apellidoM = "";

        if (partes.length == 1) {

            nombre = partes[0];

        } else if (partes.length == 2) {

            nombre = partes[0];
            apellidoP = partes[1];

        } else if (partes.length == 3) {

            nombre = partes[0];
            apellidoP = partes[1];
            apellidoM = partes[2];

        } else if (partes.length >= 4) {

            apellidoP = partes[partes.length - 2];
            apellidoM = partes[partes.length - 1];

            nombre = partes
                .slice(0, partes.length - 2)
                .join(" ");
        }

        // =========================
        // FORMATEAR TEXTO
        // =========================

        nombre = capitalizar(nombre);
        apellidoP = capitalizar(apellidoP);
        apellidoM = capitalizar(apellidoM);

        // =========================
        // LLENAR INPUTS
        // =========================

        $(".txtNombre").val(nombre);
        $(".txtPrimerApellido").val(apellidoP);
        $(".txtSegundoApellido").val(apellidoM);
        $(".txtCelular").val(celular);   

    } catch (error) {

        console.error(error);
        alert("No se pudo leer el portapapeles");

    }
}

function capitalizar(texto) {

    return texto
        .toLowerCase()
        .trim()
        .split(" ")
        .filter(x => x)
        .map(p =>
            p.charAt(0).toUpperCase() +
            p.slice(1)
        )
        .join(" ");
}

const CLIENT_ID = "735779644274-jmj6nc1e16s0jfmdksp3mc7h2463ar59.apps.googleusercontent.com";
let esperandoGoogle = false;

let tokenClient = null; 

// =====================================
// INICIALIZAR GOOGLE
// =====================================

function inicializarGoogle() {

    tokenClient =
        google.accounts.oauth2.initTokenClient({

            client_id: CLIENT_ID,

            scope:
                "https://www.googleapis.com/auth/contacts",

            callback: null
        });
}

// =====================================
// CREAR CONTACTO
// =====================================

async function crearContacto(
    nombre,
    telefono,
    email
) {

    // EVITAR DOBLE CLICK
    if (esperandoGoogle) {
        return;
    }

    esperandoGoogle = true;

    try {

        let accessToken =
            localStorage.getItem(
                "google_access_token"
            );

        // =====================================
        // YA EXISTE TOKEN
        // =====================================

        if (accessToken) {

            await enviarContacto(
                accessToken,
                nombre,
                telefono,
                email
            );

            esperandoGoogle = false;

            return;
        }

        // =====================================
        // PEDIR LOGIN GOOGLE
        // =====================================

        tokenClient.callback =
            async (response) => {

                try {

                    console.log(response);

                    if (response.error) {

                        console.error(response);

                        esperandoGoogle = false;

                        return;
                    }

                    accessToken =
                        response.access_token;

                    // GUARDAR TOKEN
                    localStorage.setItem(
                        "google_access_token",
                        accessToken
                    );

                    // =====================================
                    // ENVIAR CONTACTO
                    // =====================================

                    await enviarContacto(
                        accessToken,
                        nombre,
                        telefono,
                        email
                    );

                } catch (error) {

                    console.error(error);

                } finally {

                    esperandoGoogle = false;
                }
            };

        // IMPORTANTE:
        // SOLO aquí se pide popup

        tokenClient.requestAccessToken({

            prompt: "consent"
        });

    } catch (error) {

        esperandoGoogle = false;

        console.error(error);
    }
}

// =====================================
// ENVIAR A FIREBASE
// =====================================

async function enviarContacto(
    accessToken,
    nombre,
    telefono,
    email
) {

    try {

        const guardarContactoGoogle =
            firebase
                .functions()
                .httpsCallable(
                    "guardarContactoGoogle"
                );

        const resultado =
            await guardarContactoGoogle({

                accessToken,
                nombre,
                telefono,
                email
            });

        console.log(resultado.data);

        // TOKEN EXPIRADO

        if (
            resultado.data &&
            resultado.data.ok === false
        ) {

            localStorage.removeItem(
                "google_access_token"
            );
        }

    } catch (error) {

        console.error(error);

        localStorage.removeItem(
            "google_access_token"
        );
    }
}
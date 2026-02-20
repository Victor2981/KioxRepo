// let lstEmployeesGlobal = parent.lstEmployeesGlobal;
var urlEmployeesGlobal = "/Operatives";
var operacionEmpleado = 0;
let selEmployeeGlobal = "";

$(document).ready(function(){        
    $(".btnGuardarEmpleado").click(async function (){
        $(".dvLoader").show();
        var banValidacion = true;
        banValidacion = Validador($(".txtNombre"),"nombre empleado",$(".txtNombre").val(),1,'',false);
        if(banValidacion == true){banValidacion = Validador($(".txtPrimerApellido"),"primer apellido",$(".txtPrimerApellido").val(),1,'',false)};
        if(banValidacion == true){banValidacion = Validador($(".txtCorreo"),"correo",$(".txtCorreo").val(),4,'',false)};
        if(banValidacion == true){banValidacion = Validador($(".ddlSucursal"),"sucursal",$(".ddlSucursal").val(),1,'',false)};
        if(banValidacion == true){
            if (Object.values(parent.lstEmployeesGlobal).filter(x => x.Email === $(".txtCorreo").val().trim() && x.uId != selEmployeeGlobal).length > 0) {
                QuitarMensaje();
                MostrarMensaje(2,"El correo ya esta registrado",false);    
                banValidacion = false;
            }
        };
        if(banValidacion == true){banValidacion = Validador($(".txtTelefono"),"telefono",$(".txtTelefono").val(),5,'',false)};
        if(banValidacion == true){
            if (Object.values(parent.lstEmployeesGlobal).filter(x => x.Phone === $(".txtTelefono").val().trim() && x.uId != selEmployeeGlobal).length > 0) {
                QuitarMensaje();
                MostrarMensaje(2,"El teléfono ya esta registrado",false);    
                banValidacion = false;
            }
        };
        if(banValidacion == true){banValidacion = Validador($(".ddlPuesto"),"puesto",$(".ddlPuesto").val(),1,'',false)};


        var config = {
            apiKey: apiKeyGlobal,
            authDomain: authDomainGlobal,
            databaseURL: databaseURLGlobal
        };
        var actionCodeSettings = {
            url: actionURLGlobal,
            handleCodeInApp: true
            };
        var nombre = $(".txtNombre").val().trim();
        var primerApellido = $(".txtPrimerApellido").val().trim();
        var segundoApellido = $(".txtSegundoApellido").val().trim();
        var correo = $(".txtCorreo").val().trim();
        var telefono = $(".txtTelefono").val();
        var puesto = parseInt($(".ddlPuesto").val());
        var sucursal = $(".ddlSucursal").val()
        var password ="Kiox" + Date.now();
        if (banValidacion) {
            if (operacionEmpleado == 0) {
                var secondaryApp = firebase.initializeApp(config, correo);
                secondaryApp.auth().createUserWithEmailAndPassword(correo, password).then(usuario =>{
                    secondaryApp.auth().sendPasswordResetEmail(correo, actionCodeSettings).then(function() {
                            secondaryApp.auth().signOut().then(async function() {
                                $(".dvLoader").show();
                                var dato={
                                    Name: nombre,
                                    LastName: primerApellido,
                                    SecondLastName: segundoApellido,
                                    Email: correo,
                                    Phone: telefono,
                                    Position : puesto,
                                    Status: 1,
                                    Available: true,
                                    IdBranch: sucursal,
                                    UserId: usuario.user.uid,
                                    uId: usuario.user.uid
                                }
                                var uId = await GuardarDatosEmpleado($(".btnGuardarEmpleado"),dato,operacionEmpleado,selEmployeeGlobal);
                                dato.uId = uId;
                                await GuardarDatosEmpleado($(".btnGuardarEmpleado"),dato,1,uId);
                                MostrarMensajePrincipal("El empleado se registró correctamente","success");
                                $(".dvLoader").hide();
                                return false;                            
                            }).catch(function(error) {
                                MostrarMensajePrincipal("Error","danger");
                                $(".dvLoader").hide();  
                            });
                        
                    }).catch(function(error) {
                        MostrarMensajePrincipal("Error","danger");
                        $(".dvLoader").hide();  
                    });
                })
                .catch(function(error) {
                    switch (error.code) {
                        case "auth/invalid-email":
                            MostrarMensajePrincipal("El correo no es una dirección valida","danger");
                            break;
                        case "auth/weak-password":
                            MostrarMensajePrincipal("La constraseña es muy debil","danger");
                            break;
                        case "auth/email-already-in-use":
                            MostrarMensajePrincipal("Ya existe un usuario con este correo","danger");
                            break;
                        default:
                            MostrarMensajePrincipal("Error al registrar el usuario","danger");
                            break;
                    }
                    $(".dvLoader").hide();  
                });
            }
            else{
                var dato={
                    Name: nombre,
                    LastName: primerApellido,
                    SecondLastName: segundoApellido,
                    Email: correo,
                    Phone: telefono,
                    Position : puesto,
                    Status: 1,                    
                    Available: true,
                    IdBranch: sucursal,
                    UserId: selEmployeeGlobal,
                    uId: selEmployeeGlobal
                }
                await GuardarDatosEmpleado($(".btnGuardarEmpleado"),dato,operacionEmpleado,selEmployeeGlobal);
                MostrarMensajePrincipal("El empleado se actualizó correctamente","success");
                $(".dvLoader").hide();  
            }
        }
        else{
            $(".dvLoader").hide();
        }
    });

    // $(".ddlEmpleados").change(async function(){
    //     llenarDropDownEmployees($(".ddlEmpleados").val());
    // });
    
    const urlQueryString = new URLSearchParams(window.location.search);
    const idEmployeeQuery = urlQueryString.get('idEmployee');
    if (idEmployeeQuery != "" && idEmployeeQuery != null) {
        selEmployeeGlobal = idEmployeeQuery;
        populateEmployeesData(idEmployeeQuery);
    }
});

async function populateEmployeesData(idEmployee){
    operacionEmpleado = 1;
    var Employee = await selectDb(urlEmployeesGlobal,idEmployee);
    if (Employee != null) {
        $(".txtNombre").val(Employee.Name);
        $(".txtPrimerApellido").val(Employee.LastName);
        $(".txtSegundoApellido").val(Employee.SecondLastName);
        $(".txtTelefono").val(Employee.Phone);
        $(".txtCorreo").val(Employee.Email);
        $(".ddlPuesto").val(Employee.Position);
    }
}

const GuardarDatosEmpleado = async function(ctrl,objEmpleado, operacion, idEmployee){
    return new Promise(resolve => {setTimeout(async function(){
        QuitarMensaje();
        if (operacion == 0){
            resolve(await insertDb(ctrl,urlEmployeesGlobal,objEmpleado));
            MostrarMensajePrincipal("El empleado se registró correctamente","success");
        } else {
            resolve(await updateDb(ctrl,urlEmployeesGlobal,idEmployee,objEmpleado));
            MostrarMensajePrincipal("El empleado se actualizo correctamente","success");
        }
    }, 250);});
};

const SeleccionarDatosEmpleados = async function(tipoControl){
    $(".dvLoader").show();
    await db.collection(urlEmployeesGlobal).where("Status","==",1).onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
            
            if (change.type === "added") {
                var id = change.doc.id;
                var datos = change.doc.data();
                //lstEmployeesGlobal.push({[id]:{datos}});
                var datos = {[id]:datos};
                Object.assign(parent.lstEmployeesGlobal,datos);
            }
            if (change.type === "modified") {
                var id = change.doc.id;
                var datos = change.doc.data();
                //lstEmployeesGlobal.push({[id]:{datos}});
                var datos = {[id]:datos};
                Object.assign(parent.lstEmployeesGlobal,datos);
            }
            if (change.type === "removed") {
                delete parent.lstEmployeesGlobal[change.doc.id];
            }
        });
        switch (tipoControl) {
            case "tabla":
                llenarTablaEmpleados(parent.lstEmployeesGlobal);
                break;
            case "dropdown":
                llenarDropDownEmployee(parent.lstEmployeesGlobal);
            break;
            default:
                break;
        }
        
    });
};

function llenarDropDownEmployee(datosEmployees){
    $(".ddlEmpleados").empty();
    const lstEmployees = JSON.parse(JSON.stringify(datosEmployees));
    let lstButtons = {};
    if (Object.keys(lstEmployees).length > 0) {
        $(".ddlEmpleados").append("<option value=''></option>");
        for (const ap in lstEmployees) {         
            var idEmployee = ap;   
            var datos = lstEmployees[idEmployee];
            var tbl = "<option value='" + idEmployee + "'>" + datos.Name + " " + datos.LastName + " " + datos.SecondLastName + "</option>";
            $(".ddlEmpleados").append(tbl);
        }
    }
    $(".dvLoader").hide();
}

function llenarTablaEmpleados(datosEmployees){
    $(".tblEmployees").empty();
    var titulos = ["Nombre","Puesto","",""];    
    var TitulosDatos = ["NameComplete","PositionName"];    

    const lstEmployees = JSON.parse(JSON.stringify(datosEmployees));
    let lstButtons = {};
    if (Object.keys(lstEmployees).length >0) {
        for (const ap in lstEmployees) {         
            var idEmployee = ap;   
            var datos = datosEmployees[idEmployee];
            datos.NameComplete = datos.Name + " " + datos.LastName + " " + datos.SecondLastName;
            datos.PositionName = GetNamePosition(datos.Position);
            var Buttons = [];            
            let btnEditar = $("<a class='btnTablaGlobal material-icons btnIcon' title='Editar'>edit</a>");
            btnEditar.on('click',()=>{
                location.href = "altaEmpleados.html?idEmployee=" + ap;
            });
            Buttons.push(btnEditar);
            let btnEliminar = $("<a class='btnTablaGlobal material-icons btnIcon' title='Eliminar'>delete</a>");
            btnEliminar.on('click',()=>{
                UpdateStatusEmployee(idEmployee,0);
            });
            Buttons.push(btnEliminar);
            //Object.assign(Buttons,btnEditar);
            var evento = {[idEmployee]:Buttons};
            Object.assign(lstButtons,evento);
        }
    }
    generarTabla($(".tblEmployees"),titulos,TitulosDatos,datosEmployees,lstButtons);
    $(".dvLoader").hide();
}

function GetNamePosition(idPosition) {
    var tituloPuesto = "";
    switch (idPosition) {
        case 0:
            tituloPuesto = "Administrador general";
            break;
        case 1:
            tituloPuesto = "Administrador";
            break;
        case 2:
            tituloPuesto = "Fisioterapeuta";
            break;
        default:
            break;
    }
    return tituloPuesto;
}

async function UpdateStatusEmployee(idEmployee,Status) {
    var Employee = await selectDb(urlEmployeesGlobal,idEmployee);
    Employee.Status = Status;
    await updateDb(urlEmployeesGlobal,idEmployee,Employee);
    MostrarMensajePrincipal("El empleado se eliminó","success");
}

async function UpdateAvailabilityEmployee(ctrl,IdAppointmen,idEmployee,Available) {
    var Employee = await selectDb(urlEmployeesGlobal,idEmployee);
    Employee.Available = Available;
    if (Available) {
        Employee.IdLastAppointment = "";    
    }
    else{
        Employee.IdLastAppointment = IdAppointmen;
    }
    await updateDb(ctrl,urlEmployeesGlobal,idEmployee,Employee);
    //MostrarMensajePrincipal("El empleado se Actualizó","success");
}

let Empleado = "";

if (sessionStorage.getItem("sesionUsuario") != null){
    //sessionStorage.getItem('sesionModulos');
    var datosEmpleado = JSON.parse(sessionStorage.sesionUsuario);
    db.collection("/operatives").where("uId", "==",datosEmpleado.uId).onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
            $(".dvLoader").show();
            if (change.type === "modified") {
                sessionStorage.clear();
				LlenarModulos();
            }
            if (change.type === "removed") {
                sessionStorage.clear();
				LlenarModulos();
            }
            $(".dvLoader").hide(); 
        });
    });
}
else{
    if (window.location.pathname.toString().indexOf("login") == -1) {
        window.location.replace("login.html");    
    }    
}


function llenarInformacion(){
    //$('.bg-login-image').css("background-image", "url(img/noImage.svg)");  
    $(".dvLoaderAjuste").show();
    var imgLogo ="";
    imgLogo = sessionStorage.getItem('sesionImgLogo')
    // if (imgLogo == "" || imgLogo == null) {
    //     var storageRef = firebase.storage().ref("/Restaurant/logo/logo.png");
    //     storageRef.getDownloadURL().then(function(urlPlatillo) {            
    //         $('.bg-login-image').css("background-image", "url(" + urlPlatillo + ")");  
    //         $(".bg-brand-image").css("background-image", "url(" + urlPlatillo + ")");  
    //         $(".bg-password-image").css("background-image", "url(" + urlPlatillo + ")");  
    //         sessionStorage.setItem('sesionImgLogo', urlPlatillo);
    //         $(".dvLoaderAjuste").hide();    
    //     }).catch(function(error) {
    //         $(".dvLoaderAjuste").hide();              
    //     });            
    // }
    // else{
    //     $('.bg-login-image').css("background-image", "url(" + imgLogo + ")");  
    //     $(".bg-brand-image").css("background-image", "url(" + imgLogo + ")"); 
    //     $(".bg-password-image").css("background-image", "url(" + imgLogo + ")");  
    //     $(".dvLoaderAjuste").hide();  
    // }
    // var infoRestaurante = JSON.parse(sessionStorage.sesionRestaurante);
    // if (infoRestaurante != null || infoRestaurante != undefined) {
    //     if (infoRestaurante.ServiceActive == false) {            
    //         MostrarMensajePrincipal("Servicio suspendido por adeudo vencido","danger");
    //     }
    // }
}

function ObtenerDatosEmpresa(){
    db.collection('restaurant').doc(idNombreRestauranteGlobal).get().then(data =>{// .collection(url).get().then(data =>{
        objRestaurant=data.data();
        sessionStorage.setItem('sesionRestaurante', JSON.stringify(objRestaurant));
        if (objRestaurant.ServiceActive == false) {
            window.location.replace("login.html");
            MostrarMensajePrincipal("Servicio suspendido por adeudo vencido","danger");
        }
        //validarAcceso();
    });      
};

$(".btnIngresar").click(function(){
    QuitarMensaje();
    var correo = $(".txtCorreo").val().trim();
    var password = $(".txtContraseña").val().trim();
    if (correo != "" && password != "") {
        var url="/Operatives";

        firebase.auth().signInWithEmailAndPassword(correo, password).then(usuario =>{
            db.collection(url).where("UserId","==",usuario.user.uid).get().then(data =>{
                Empleado = data.docs[0].data();
                if (Empleado != undefined) {
                    parent.DatosCuentaUsusario = Empleado;//data.data();                    
                    sessionStorage.setItem('sesionUsuario', JSON.stringify(Empleado));                          
                    // db.collection('restaurant').doc(idNombreRestauranteGlobal).get().then(data =>{
                    //     objRestaurant=data.data();
                    //     sessionStorage.setItem('sesionRestaurante', JSON.stringify(objRestaurant));
                    //     validarAcceso();
                    // });      
                    validarAcceso();
                    window.location.href ="index.html";    
                }                                                
            }).catch(error=>{
                MostrarMensajePrincipal("Ocurrió un error al iniciar sesión","danger");
            })
            
        }).catch(function(error) {
            switch (error.code) {
                case "auth/invalid-email":
                    MostrarMensajePrincipal("El correo no es una dirección valida","danger");
                    break;
                case "auth/user-disabled":
                    MostrarMensajePrincipal("La cuenta se encuentra deshabilitada","danger");
                    break;
                case "auth/user-not-found":
                    MostrarMensajePrincipal("No existe una cuenta con este correo","danger");
                    break;
                case "auth/wrong-password":
                    MostrarMensajePrincipal("Correo o contraseña incorrectos","danger");
                break;
                default:
                    MostrarMensajePrincipal("Ocurrió un error al iniciar sesión","danger");
                break;
            }
          });
    }
    else{
        MostrarMensajePrincipal("Todos los datos son obligatorios","danger");
    }
    return false;
});

$(".btnCerrarSesionGeneral").click(function(){
    firebase.auth().signOut().then(function() {
        sessionStorage.clear();
        window.location.replace("login.html");
    }).catch(function(error) {
        MostrarMensajePrincipal("Ocurrió un error al finalizar la sesión","danger");
    });
});

$(".btnReestablecer").click(function(){
    QuitarMensaje();
    var correo = $(".txtCorreo").val().trim();
    var actionCodeSettings = {
        url: actionURLGlobal,
        handleCodeInApp: true
    };
    firebase.auth().sendPasswordResetEmail(correo, actionCodeSettings).then(function() {
        window.location.replace("login.html?msj=4");
    }).catch(function(error) {
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
                MostrarMensajePrincipal("Error al reestablecer la contraseña","danger");
                break;
        }
    });
});


var msj = getUrlVars();
switch (msj["msj"]) {
    case "2":
        MostrarMensajePrincipal("La sesión expiró","danger");
        break;
    case "3":
        MostrarMensajePrincipal("No cuentas con acceso","danger");
        break;
    case "4":
        MostrarMensajePrincipal("El correo se envió correctamente","danger");
    break;
}

llenarInformacion();
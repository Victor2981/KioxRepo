var urlPackagesGlobal = "/Packages";

$(document).ready(function () {
    $(".txtPacienteFiltro").keyup(function name() {
        for (let index = 0; index < $(".trDatoGlobal").length; index++) {
            const $tr = $(".trDatoGlobal")[index];
            var texto = $tr.textContent.toUpperCase();
            var filtro = $(".txtPacienteFiltro").val().toUpperCase().trim();
            if (texto.indexOf(filtro) > -1) {
                $tr.style.display = "";
              } else {
                $tr.style.display = "none";
              }
        }
    });

    $(".ddlPagado").change(function() {
        for (let index = 0; index < $(".trDatoGlobal").length; index++) {
            const $tr = $(".trDatoGlobal")[index];
            var texto = $tr.textContent.toUpperCase();
            texto = texto.substr(texto.length-4,2);
            var filtro = $(".ddlPagado").val().toUpperCase().trim();
            if (texto.indexOf(filtro) > -1) {
                $tr.style.display = "";
              } else {
                $tr.style.display = "none";
              }
        }
    });

    $(".ddlTerminado").change(function() {
         for (let index = 0; index < $(".trDatoGlobal").length; index++) {
            const $tr = $(".trDatoGlobal")[index];
            var texto = $tr.textContent.toUpperCase();
            texto = texto.substr(texto.length-2,2);
            var filtro = $(".ddlTerminado").val().toUpperCase().trim();
            if (texto.indexOf(filtro) > -1) {
                $tr.style.display = "";
              } else {
                $tr.style.display = "none";
              }
        }
    });
    
});

const GuardarDatosPaquete = async function(ctrl,objPaquete, operacion, idPack){
    return new Promise(resolve => {setTimeout(async function(){
        QuitarMensaje();
        if (operacion == 0){
            resolve(await insertDb(ctrl,urlPackagesGlobal,objPaquete));
            MostrarMensajePrincipal("El paquete se registró correctamente","success");
        } else {
            resolve(await updateDb(ctrl,urlPackagesGlobal,idPack,objPaquete));
            MostrarMensajePrincipal("El paquete se actualizo correctamente","success");
        }
    }, 250);});
};


async function populateCategoryData(idPaquete){
    operacionCategorias = 1;
    var Pack = await selectDb(urlPackagesGlobal,idPaquete);
    if (Pack != null) {
        $(".txtNombre").val(Category.Name);
        $(".txtColor").val(Category.Color);
    }
}

// const GuardarDatosCategoria = async function(objPaquetes, operacion, idPaquete){
//     return new Promise(resolve => {setTimeout(async function(){
//         QuitarMensaje();
//         if (operacion == 0){
//             resolve(await insertDb(urlPackagesGlobal,objPaquetes));
//             MostrarMensajePrincipal("La categoría se registró correctamente","success");
//         } else {
//             resolve(await updateDb(urlPackagesGlobal,idPaquete,objPaquetes));
//             MostrarMensajePrincipal("La categoría se actualizo correctamente","success");
//         }
//     }, 250);});
// };

const SeleccionarDatosPaquetes = async function(tipoControl,estatusPaquete){
    $(".dvLoader").show();
    await db.collection(urlPackagesGlobal).onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
            
            if (change.type === "added") {
                var id = change.doc.id;
                var datos = change.doc.data();
                //lstCategoriesGlobal.push({[id]:{datos}});
                var datos = {[id]:datos};
                Object.assign(parent.lstPacksGlobal,datos);
            }
            if (change.type === "modified") {
                var id = change.doc.id;
                var datos = change.doc.data();
                //lstCategoriesGlobal.push({[id]:{datos}});
                var datos = {[id]:datos};
                Object.assign(parent.lstPacksGlobal,datos);
            }
            if (change.type === "removed") {
                delete parent.lstPacksGlobal[change.doc.id];
            }
        });
        switch (tipoControl) {
            case "tabla":
                llenarTablaPaquetes(parent.lstPacksGlobal);
                $(".ddlTerminado").change();
                break;
            case "dropdown":
            break;
            default:
                break;
        }
        
    });
};

function llenarTablaPaquetes(datosPaquetes){
    $(".tblPaquetes").empty();
    var titulos = ["Paciente","Tratamiento","Sesiones","Fecha pago","Pagado","Completado"];        
    var TitulosDatos = ["Patient.NameComplete","Service.Name","TakenNumbreSesions","Date","Pagado","Completo"];    
    for (const ap in datosPaquetes) {         
        const idCategory = ap;   
        const datos = datosPaquetes[idCategory];
        const sesiones = datos.TakenNumbreSesions + "/" + datos.NumbreSesions;
        datos.TakenNumbreSesions = sesiones;
        if (datos.IsPayed) {
            datos.Pagado = "Sí"    
        }
        else{
            datos.Pagado = "No"    
        }
        if (datos.IsPackCompleted) {
            datos.Completo = "Sí"    
        }
        else{
            datos.Completo = "No"    
        }     
        datos.Patient.NameComplete = datos.Patient.Name + " " + datos.Patient.LastName + " " + datos.Patient.SecondLastName;
    }
    const lstPackages = JSON.parse(JSON.stringify(datosPaquetes));
    let lstButtons = {};
    if (Object.keys(lstPackages).length >0) {
        for (const ap in lstPackages) {         
            var idPackage = ap;   
            var datos = lstPackages[idPackage];
            var Buttons = [];            
            var lblActivo = $("<label class='switch'>");
            var tgActivo = $("<input type='checkbox' class='chkActivo'><span class='slider round'></span>");
            let btnDetalle = $("<a class='btnTablaGlobal material-icons btnIcon' title='Detalle'>search</a>");
            btnDetalle.on('click',()=>{
                window.location.href ="ingresos.html?idPaquete=" + idPackage + "&arrayIngreso=" + datos.IdEarn;
            });
            //Buttons.push(btnDetalle);
            //Object.assign(Buttons,btnEditar);
            var evento = {[idPackage]:Buttons};
            Object.assign(lstButtons,evento);
        }
    }
    generarTabla($(".tblPaquetes"),titulos,TitulosDatos,datosPaquetes,lstButtons);
    $(".dvLoader").hide();
}


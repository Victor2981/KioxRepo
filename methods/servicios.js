// let lstServicesGlobal = parent.lstServicesGlobal;
//let lstServicesFiltroGlobal = [];
var urlServicesGlobal = "/Services";
var operacionServices = 0;
let selServicesGlobal = "";

$(document).ready(function(){        
    $(".btnGuardarServicio").click(function (){
        var banValidacion = true;
        banValidacion = Validador($(".txtNombre"),"nombre servicio",$(".txtNombre").val(),1,'',false);
        if(banValidacion == true){banValidacion = Validador($(".ddlCategoria"),"categoría",$(".ddlCategoria").val(),1,'',false)};
        if(banValidacion == true){banValidacion = Validador($(".txtPrecio"),"precio",$(".txtPrecio").val(),9,'',false)};
        if(banValidacion == true){banValidacion = Validador($(".txtDescripcion"),"descripción",$(".txtDescripcion").val(),1,'',false)};
        if (banValidacion) {
            $(".dvLoader").show();
            var nombre = $(".txtNombre").val();
            var categoria = $(".ddlCategoria").val();
            var precio = parseFloat($(".txtPrecio").val());
            var descripcion = $(".txtDescripcion").val();
            var dato={
                Name: nombre,
                idCategory : categoria,
                Price: precio,
                Description:descripcion,
                Status: 1,
                Avalible: true
            }
            GuardarDatosServices(dato,operacionServices,selServicesGlobal);
            $(".dvLoader").hide();
            return false;
        }
    });

    $(".ddlCategoria").change(function name() {
        for (let index = 0; index < $(".trDatoGlobal").length; index++) {
            const $tr = $(".trDatoGlobal")[index];
            var texto = $tr.textContent.toUpperCase();
            var filtro = $(".txtServicioFiltro").val().toUpperCase().trim();
            var filtro2 = $(".ddlCategoria option:selected").text().toUpperCase().trim();
            if (texto.indexOf(filtro) > -1 && texto.indexOf(filtro2) > -1) {
                $tr.style.display = "";
              } else {
                $tr.style.display = "none";
              }
        }
    });

    $(".txtServicioFiltro").keyup(function name() {
        for (let index = 0; index < $(".trDatoGlobal").length; index++) {
            const $tr = $(".trDatoGlobal")[index];
            var texto = $tr.textContent.toUpperCase();
            var filtro = $(".txtServicioFiltro").val().toUpperCase().trim();
            var filtro2 = $(".ddlCategoria option:selected").text().toUpperCase().trim();
            if (texto.indexOf(filtro) > -1 && texto.indexOf(filtro2) > -1) {
                $tr.style.display = "";
              } else {
                $tr.style.display = "none";
              }
        }
    });

    const urlQueryString = new URLSearchParams(window.location.search);
    const idServiceQuery = urlQueryString.get('idService');
    if (idServiceQuery != "" && idServiceQuery != null) {
        selServicesGlobal = idServiceQuery;
        populateCategoryData(idServiceQuery);
    }
});

async function populateCategoryData(idService){
    operacionServices = 1;
    var Service = await selectDb(urlServicesGlobal,idService);
    if (Service != null) {
        $(".txtNombre").val(Service.Name);
        $(".ddlCategoria").val(Service.idCategory);
        $(".txtPrecio").val(Service.Price);
        $(".txtDescripcion").val(Service.Description);
    }
}

const GuardarDatosServices = async function(objCategoria, operacion, idService){
    return new Promise(resolve => {setTimeout(async function(){
        QuitarMensaje();
        if (operacion == 0){
            resolve(await insertDb(urlServicesGlobal,objCategoria));
            MostrarMensajePrincipal("La categoría se registró correctamente","success");
        } else {
            resolve(await updateDb(urlServicesGlobal,idService,objCategoria));
            MostrarMensajePrincipal("La categoría se actualizo correctamente","success");
        }
    }, 250);});
};

const SeleccionarDatosServicios = async function(tipoControl,idCategory){
    $(".dvLoader").show();
    await db.collection(urlServicesGlobal).where("Status","==",1).orderBy("Name").onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
            if (change.type === "added") {
                var id = change.doc.id;
                var datos = change.doc.data();
                //lstServicesGlobal.push({[id]:{datos}});
                var datos = {[id]:datos};
                parent.lstServicesFiltroGlobal.push(datos);
                //var datos = {[id]:datos};
                Object.assign(parent.lstServicesGlobal,datos);
            }
            if (change.type === "modified") {
                var id = change.doc.id;
                var datos = change.doc.data();
                //lstServicesGlobal.push({[id]:{datos}});
                parent.lstServicesFiltroGlobal.push({[id]:{datos}});
                var datos = {[id]:datos};
                Object.assign(parent.lstServicesGlobal,datos);
            }
            if (change.type === "removed") {
                delete parent.lstServicesGlobal[change.doc.id];
            }
        });
        
        switch (tipoControl) {
            case "tabla":
                llenarTablaServicios(parent.lstServicesGlobal);
                break;
            case "dropdown":
                llenarDropDownServices(idCategory);
            break;
            default:
                break;
        }
    });
};


function llenarTablaServicios(datosServices){
    $(".tblCategories").empty();
    var titulos = ["Nombre","Categoría","Precio","Descripción","Activo","",""];    
    var TitulosDatos = ["Name","CategoryName","Price","Description"];    
    const lstServices = JSON.parse(JSON.stringify(datosServices));
    let lstButtons = {};
    if (Object.keys(lstServices).length >0) {
        for (const ap in lstServices) {         
            const idService = ap;   
            const datos = datosServices[idService];
            datos.CategoryName = parent.lstCategoriesGlobal[datos.idCategory].Name;
            var Buttons = [];            
            var lblActivo = $("<label class='switch'>");
            var tgActivo = $("<input type='checkbox' class='chkActivo'><span class='slider round'></span>");
            if (datos.Avalible) {
                tgActivo = $("<input type='checkbox' class='chkActivo' checked><span class='slider round'></span>");
            }
            tgActivo.on('change',(chk)=>{
                UpdateAvalibleServices(idService,chk.currentTarget.checked);
            });
            //Object.assign(Buttons,tgActivo);
            lblActivo.append(tgActivo);
            Buttons.push(lblActivo);
            let btnEditar = $("<a class='btnTablaGlobal material-icons btnIcon' title='Editar'>edit</a>");
            btnEditar.on('click',()=>{
                location.href = "altaServicios.html?idService=" + ap;
            });
            Buttons.push(btnEditar);
            let btnEliminar = $("<a class='btnTablaGlobal material-icons btnIcon' title='Eliminar'>delete</a>");
            btnEliminar.on('click',()=>{
                UpdateStatusServices(idService,0);
            });
            Buttons.push(btnEliminar);
            //Object.assign(Buttons,btnEditar);
            var evento = {[idService]:Buttons};
            Object.assign(lstButtons,evento);
        }
    }
    generarTabla($(".tblCategories"),titulos,TitulosDatos,datosServices,lstButtons);
    $(".dvLoader").hide();
}

// function filterPatients(query) {
//     return lstServicesFiltroGlobal.filter(function (el) {
//         var dato = el[Object.keys(el)[0]].datos;
//         var cadena = dato.idCategory;
//         return cadena.indexOf(idCategory) > -1;
//     });
// }

function llenarDropDownServices(idCategory){
    $(".ddlServicio").empty();
    //var lstServices = JSON.parse(JSON.stringify(datosServices));
    var lstServiceFiltered = parent.lstServicesFiltroGlobal.filter(function (el) {
        var dato = el[Object.keys(el)[0]];
        var cadena = dato.idCategory;
        return cadena.indexOf(idCategory) > -1;
    });
    if (Object.keys(lstServiceFiltered).length > 0) {
        // $(".ddlServicio").append("<option value=''></option>");
        // var result = lstServicesFiltroGlobal.filter(function(obj) {
        //     return obj.datos.idCategory = idCategory
        // });
        $(".ddlServicio").append("<option value=''></option>");
        lstServiceFiltered.forEach(function(ser){
            var idService = Object.keys(ser)[0];
            var datos = ser[Object.keys(ser)[0]]
            if (datos.Avalible) {
                var tbl = "<option value='" + idService + "'>" + datos.Name + "</option>";
                $(".ddlServicio").append(tbl);
            }
        });

        // for (let index = 0; index < lstServiceFiltered.length; index++) {
        //     const element = lstServiceFiltered[index];
            
        // }
        // for (const ap in lstServiceFiltered) {         
        //     var idCategory = ap;   
        //     var datos = lstServiceFiltered[idCategory];
        //     var tbl = "<option value='" + idCategory + "'>" + datos.Name + "</option>";
        //     $(".ddlServicio").append(tbl);
        // }
    }
    $(".dvLoader").hide();
}

async function UpdateAvalibleServices(idService,Status) {
    var Service = await selectDb(urlServicesGlobal,idService);
    Service.Avalible = Status;
    await updateDb(urlServicesGlobal,idService,Service);
    MostrarMensajePrincipal("La disponibilidad de la categoría se actualizó","success");
}

async function UpdateStatusServices(idService,Status) {
    var Service = await selectDb(urlServicesGlobal,idService);
    Service.Status = Status;
    await updateDb(urlServicesGlobal,idService,Service);
    MostrarMensajePrincipal("La categoría se eliminó","success");
}

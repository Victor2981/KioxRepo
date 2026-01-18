// let lstCategoriesGlobal = parent.lstCategoriesGlobal;
var urlCategoriesGlobal = "/Categories";
var operacionCategorias = 0;
let selCategoryGlobal = "";

$(document).ready(function(){        
    $(".btnGuardarCategoria").click(function (){
        if (Validador($(".txtNombre"),"nombre categoria",$(".txtNombre").val(),1,'',false)) {
            $(".dvLoader").show();
            var nombre = $(".txtNombre").val();
            var color = $(".txtColor").val();
            var dato={
                Name: nombre,
                Color : color,
                Status: 1,
                Avalible: true
            }
            GuardarDatosCategoria(dato,operacionCategorias,selCategoryGlobal);
            $(".dvLoader").hide();
            return false;
        }
    });

    $(".ddlCategoria").change(async function(){
        //lstServicesFiltroGlobal
        //SeleccionarDatosServicios("dropdown",$(".ddlCategoria").val());
        llenarDropDownServices($(".ddlCategoria").val());
    });
    
    const urlQueryString = new URLSearchParams(window.location.search);
    const idCategoryQuery = urlQueryString.get('idCategory');
    if (idCategoryQuery != "" && idCategoryQuery != null) {
        selCategoryGlobal = idCategoryQuery;
        populateCategoryData(idCategoryQuery);
    }
});

async function populateCategoryData(idCategory){
    operacionCategorias = 1;
    var Category = await selectDb(urlCategoriesGlobal,idCategory);
    if (Category != null) {
        $(".txtNombre").val(Category.Name);
        $(".txtColor").val(Category.Color);
    }
}

const GuardarDatosCategoria = async function(objCategoria, operacion, idCategory){
    return new Promise(resolve => {setTimeout(async function(){
        QuitarMensaje();
        if (operacion == 0){
            resolve(await insertDb(urlCategoriesGlobal,objCategoria));
            MostrarMensajePrincipal("La categoría se registró correctamente","success");
        } else {
            resolve(await updateDb(urlCategoriesGlobal,idCategory,objCategoria));
            MostrarMensajePrincipal("La categoría se actualizo correctamente","success");
        }
    }, 250);});
};

const SeleccionarDatosCategorias = async function(tipoControl){
    $(".dvLoader").show();
    await db.collection(urlCategoriesGlobal).where("Status","==",1).onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
            
            if (change.type === "added") {
                var id = change.doc.id;
                var datos = change.doc.data();
                //lstCategoriesGlobal.push({[id]:{datos}});
                var datos = {[id]:datos};
                Object.assign(parent.lstCategoriesGlobal,datos);
            }
            if (change.type === "modified") {
                var id = change.doc.id;
                var datos = change.doc.data();
                //lstCategoriesGlobal.push({[id]:{datos}});
                var datos = {[id]:datos};
                Object.assign(parent.lstCategoriesGlobal,datos);
            }
            if (change.type === "removed") {
                delete parent.lstCategoriesGlobal[change.doc.id];
            }
        });
        switch (tipoControl) {
            case "tabla":
                llenarTablaCategorias(parent.lstCategoriesGlobal);
                break;
            case "dropdown":
                llenarDropDownCategory(parent.lstCategoriesGlobal);
            break;
            default:
                break;
        }
        
    });
};

function llenarDropDownCategory(datosCategories){
    $(".ddlCategoria").empty();
    const lstCategories = JSON.parse(JSON.stringify(datosCategories));
    let lstButtons = {};
    if (Object.keys(lstCategories).length > 0) {
        $(".ddlCategoria").append("<option value=''></option>");
        for (const ap in lstCategories) {         
            var idCategory = ap;   
            var datos = lstCategories[idCategory];
            if (datos.Avalible) {
                var tbl = "<option value='" + idCategory + "'>" + datos.Name + "</option>";
                $(".ddlCategoria").append(tbl);
            }
        }
    }
    $(".dvLoader").hide();
}

function llenarTablaCategorias(datosCategories){
    $(".tblCategories").empty();
    var titulos = ["Nombre","Color","Activo","",""];    
    var TitulosDatos = ["Name","Color"];    
    var datosCuentaUsusario = JSON.parse(sessionStorage.sesionUsuario);
    if (datosCuentaUsusario.Position ==  parseInt(KioxPositions.Fisioterapeuta)) {
        titulos = ["Nombre","Color"];    
        TitulosDatos = ["Name","Color"];
    }
    const lstCategories = JSON.parse(JSON.stringify(datosCategories));
    let lstButtons = {};
    if (Object.keys(lstCategories).length >0) {
        for (const ap in lstCategories) {         
            var idCategory = ap;   
            var datos = lstCategories[idCategory];
            var Buttons = [];            
            if (datosCuentaUsusario.Position == parseInt(KioxPositions.Administrador)) {
                var lblActivo = $("<label class='switch'>");
                var tgActivo = $("<input type='checkbox' class='chkActivo'><span class='slider round'></span>");
                if (datos.Avalible) {
                    tgActivo = $("<input type='checkbox' class='chkActivo' checked><span class='slider round'></span>");
                }
                tgActivo.on('change',(chk)=>{
                    UpdateAvalibleCategory(idCategory,chk.currentTarget.checked);
                });
                //Object.assign(Buttons,tgActivo);
                lblActivo.append(tgActivo);
                Buttons.push(lblActivo);
                let btnEditar = $("<a class='btnTablaGlobal material-icons btnIcon' title='Editar'>edit</a>");
                btnEditar.on('click',()=>{
                    location.href = "altaCategorias.html?idCategory=" + ap;
                });
                Buttons.push(btnEditar);
                let btnEliminar = $("<a class='btnTablaGlobal material-icons btnIcon' title='Eliminar'>delete</a>");
                btnEliminar.on('click',()=>{
                    UpdateStatusCategory(idCategory,0);
                });
                Buttons.push(btnEliminar);
                //Object.assign(Buttons,btnEditar);
            }
           
            var evento = {[idCategory]:Buttons};
            Object.assign(lstButtons,evento);
        }
    }
    generarTabla($(".tblCategories"),titulos,TitulosDatos,datosCategories,lstButtons);
    $(".dvLoader").hide();
}

async function UpdateAvalibleCategory(idCategory,Status) {
    var Category = await selectDb(urlCategoriesGlobal,idCategory);
    Category.Avalible = Status;
    await updateDb(urlCategoriesGlobal,idCategory,Category);
    MostrarMensajePrincipal("La disponibilidad de la categoría se actualizó","success");
}

async function UpdateStatusCategory(idCategory,Status) {
    var Category = await selectDb(urlCategoriesGlobal,idCategory);
    Category.Status = Status;
    await updateDb(urlCategoriesGlobal,idCategory,Category);
    MostrarMensajePrincipal("La categoría se eliminó","success");
}

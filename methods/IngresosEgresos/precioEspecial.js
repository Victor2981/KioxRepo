var urlPrecioEspecial ="/SpecialPrice";
var operacionPrecios = 0;
const urlQueryString = new URLSearchParams(window.location.search);
const idPrecioQuery = urlQueryString.get('idPrecio');

$(document).ready(function () {
    $(".btnAceptarPrecioEspecial").click(async function name(params) {
        var precio = {
            IdPatient: selIdPatientEarning,
            IdCategory: $(".ddlCategoria").val(),
            IdService: $(".ddlServicio").val(),
            Price: parseFloat($(".txtImporteTotal").val())
        };

        if (operacionPrecios == 0) {
            await db.collection(urlPrecioEspecial).where("IdPatient","==",selIdPatientEarning).where("IdService","==",$(".ddlServicio").val()).get().then(async datoValidacion =>{
                if (datoValidacion.docs.length == 0) {
                    await GuardarPrecioEspecial(precio,operacionPrecios);
                    setTimeout(function(){Redireccionar("/views/IngresosEgresos/precioEspecial.html");},3000);
                }
                else{
                    MostrarMensajePrincipal("El paciente ya esta registrado con este servicio","warning");
                }
            });             
        }
        else{
            await GuardarPrecioEspecial(precio,operacionPrecios,idPrecioQuery);
            setTimeout(function(){Redireccionar("/views/IngresosEgresos/precioEspecial.html");},3000);
        }
       
    });  


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

    
    if (idPrecioQuery != "" && idPrecioQuery != null) {        
        populateSpecialPriceData(idPrecioQuery);
        operacionPrecios = 1;
    }
});

async function populateSpecialPriceData(idPrecioQuery){
    $(".dvLoader").show();
    operacionCategorias = 1;
    var precioEpecial = await selectDb(urlPrecioEspecial,idPrecioQuery);
    if (precioEpecial != null) {
        selIdPatientEarning = precioEpecial.IdPatient;
        var nombre = parent.lstPatientsGlobal[precioEpecial.IdPatient].NameComplete;
        $(".ddlCategoria").val(precioEpecial.IdCategory);
        $(".ddlCategoria").change();
        $(".ddlServicio").val(precioEpecial.IdService);
        $(".txtPacienteIngresos").val(nombre);
        $(".txtImporteTotal").val(precioEpecial.Price);
    }
    $(".dvLoader").hide();
}

const GuardarPrecioEspecial = async function(objPrecio, operacion, idPrice){
    return new Promise(resolve => {setTimeout(async function(){
        QuitarMensaje();
        if (operacion == 0){
            resolve(await insertDb(urlPrecioEspecial,objPrecio));
            MostrarMensajePrincipal("El precio se registró correctamente","success");
        } else {
            resolve(await updateDb(urlPrecioEspecial,idPrice,objPrecio));
            MostrarMensajePrincipal("El precio se actualizó correctamente","success");
        }
    }, 250);});
};

const EliminarPrecioEspecial = async function(url,idPrice){
    return new Promise(resolve => {setTimeout(async function(){
        QuitarMensaje();
        resolve(await deleteDb(url,idPrice));
        MostrarMensajePrincipal("El precio se eliminó correctamente","success");
    }, 250);});
};



const SeleccionarDatosPaquetes = async function(tipoControl,estatusPaquete){
    $(".dvLoader").show();
    await db.collection(urlPrecioEspecial).onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
            
            if (change.type === "added") {
                var id = change.doc.id;
                var datos = change.doc.data();
                //lstCategoriesGlobal.push({[id]:{datos}});
                var datos = {[id]:datos};
                Object.assign(parent.lstSpecialPriceGlobal,datos);
            }
            if (change.type === "modified") {
                var id = change.doc.id;
                var datos = change.doc.data();
                //lstCategoriesGlobal.push({[id]:{datos}});
                var datos = {[id]:datos};
                Object.assign(parent.lstSpecialPriceGlobal,datos);
            }
            if (change.type === "removed") {
                delete parent.lstSpecialPriceGlobal[change.doc.id];
            }
        });
        switch (tipoControl) {
            case "tabla":
                llenarTablaPaquetes(parent.lstSpecialPriceGlobal);
                break;
            case "dropdown":
            break;
            default:
                break;
        }
        
    });
};

function llenarTablaPaquetes(datosPaquetes){
    $(".tblPrecioEspecial").empty();
    var titulos = ["Paciente","Tratamiento","Precio","",""];        
    var TitulosDatos = ["NameComplete","Service","Price"];    
    for (const ap in datosPaquetes) {         
        var idSpecialPrice = ap;   
        var datos = datosPaquetes[idSpecialPrice];
        var sesiones = datos.TakenNumbreSesions + "/" + datos.NumbreSesions;
        datos.TakenNumbreSesions = sesiones;
        if (datosPaquetes.IsPayed) {
            datos.IsPackCompleted = "Sí"    
        }
        else{
            datos.IsPackCompleted = "No"    
        }     
        datos.NameComplete = parent.lstPatientsGlobal[datos.IdPatient].NameComplete;
        datos.Service = parent.lstServicesGlobal[datos.IdService].Name;
    }
    const lstPackages = JSON.parse(JSON.stringify(datosPaquetes));
    let lstButtons = {};
    if (Object.keys(lstPackages).length >0) {
        for (const ap in lstPackages) {         
            const idSpecialPrice = ap;   
            var datos = lstPackages[idSpecialPrice];
            var Buttons = [];            
            var lblActivo = $("<label class='switch'>");
            var tgActivo = $("<input type='checkbox' class='chkActivo'><span class='slider round'></span>");
            let btnEditar = $("<a class='btnTablaGlobal material-icons btnIcon' title='Editar'>edit</a>");
            btnEditar.on('click',()=>{
                window.location.href ="AltaPrecioEspecial.html?idPrecio=" + idSpecialPrice;
            });
            Buttons.push(btnEditar);
            let btnEliminar = $("<a class='btnTablaGlobal material-icons btnIcon' title='Editar'>delete</a>");
            btnEliminar.on('click', async ()=>{
                await EliminarPrecioEspecial(urlPrecioEspecial, idSpecialPrice);
            });
            Buttons.push(btnEliminar);
            //Object.assign(Buttons,btnEditar);
            var evento = {[idSpecialPrice]:Buttons};
            Object.assign(lstButtons,evento);
        }
    }
    generarTabla($(".tblPrecioEspecial"),titulos,TitulosDatos,datosPaquetes,lstButtons);
    $(".dvLoader").hide();
}
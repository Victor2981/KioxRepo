var urlQrGlobal = "/QrViews";
var urlQrCatalogGlobal = "/QrCatalog";
var selEarningGlobal = "";
var selEarningPackGlobal = "";
var selEarningDebtGlobal = "";
var selIdPatientEarning = "";
var selIdPack = "";
var selPriceService = 0;
var operacionEgresos = 0;
var selIdAppointmen = "";
var arrayEgresos = [];
var lstEgresos = {};
var lstQrCatalogo = {};

//var lstPatientsGlobal = {};
const PaymentType = {
    Efectivo: 0,
    Transferencia: 1,
    Tarjeta: 3
}

const ExpenseType = {
    Publicidad: 0,
    Insumos: 1,
    Salarios: 2,
    GastosOperativos:3
}

$(document).ready(function(){        
    $(".rowPaquete").hide();
    $(".btnRegresarEgreso").hide();

    const urlQueryString = new URLSearchParams(window.location.search);
    const idPacientePago = urlQueryString.get('idPacientePago');    
    const idCita = urlQueryString.get('idCita');    
    const arregloEgresoSel = urlQueryString.get('arrayEgreso');    
    const idPaquete = urlQueryString.get('idPaquete');    
    if (idPacientePago != "" && idPacientePago != null) {
        selIdPatientEarning = idPacientePago;        
    }
    if (idCita != "" && idCita != null) {
        selIdAppointmen = idCita;        
    }
    if (arregloEgresoSel != "" && arregloEgresoSel != null) {
        if(arregloEgresoSel.indexOf(",") == -1){
            arrayEgresos.push(arregloEgresoSel);  
        }
        else{
            arregloEgresoSel.split(",").forEach(function(idPago){
                arrayEgresos.push(idPago);  
            });
        }        
    }

    $(".btnBuscarEgresos").click(function (){
        $(".pTotalEgresos").text("$" + formatoMoneda(0));
        $(".pEfectivoEgresos").text("$" + formatoMoneda(0));
        $(".pBancoEgresos").text("$" + formatoMoneda(0));
        var fechaInicio = new Date(parseInt($(".txtFechaIncEgresos").val().substr(0,4)),parseInt($(".txtFechaIncEgresos").val().substr(5,2))-1,parseInt($(".txtFechaIncEgresos").val().substr(8,2)),0,0,0);
        var fechafin = new Date(parseInt($(".txtFechaFinEgresos").val().substr(0,4)),parseInt($(".txtFechaFinEgresos").val().substr(5,2))-1,parseInt($(".txtFechaFinEgresos").val().substr(8,2)),23,59,59);
        $(".tblEgresosDetalle").empty();
        parent.lstQrGlobal = {};
        SeleccionarDatosEgresos("tabla",fechaInicio,fechafin);
    });
    
    $(".btnGuardarEgreso").click(async function (){
        var banValidacion = true;
        
        banValidacion = Validador($(".ddlTipoGasto"),"tipo de gasto",$(".ddlTipoGasto").val(),1,'',false);
        if(banValidacion == true){banValidacion = Validador($(".ddlFormaPagoEgresos"),"forma de pago",$(".ddlFormaPagoEgresos").val(),1,'',false)};
        if(banValidacion == true){banValidacion = Validador($(".txtConcepto"),"concepto",$(".txtConcepto").val(),1,'',false)};
        if(banValidacion == true){banValidacion = Validador($(".txtFechaPago"),"fecha",$(".txtFechaPago").val(),1,'',false)};
        if(banValidacion == true){banValidacion = Validador($(".txtImporteTotal"),"importe",$(".txtImporteTotal").val(),1,'',false)};
        if (banValidacion) {
            var fechaPago;
            if (operacionEgresos == 0) {
                fechaPago = new Date(parseInt($(".txtFechaPago").val().substr(0,4)),parseInt($(".txtFechaPago").val().substr(5,2)),parseInt($(".txtFechaPago").val().substr(8,2)),0,0,0);    
            }
            else{
                fechaPago = new Date(parseInt($(".txtFechaPago").val().substr(0,4)),parseInt($(".txtFechaPago").val().substr(5,2)) - 1,parseInt($(".txtFechaPago").val().substr(8,2)),0,0,0);    
            }
            
            var importeTotal = parseFloat($(".txtImporteTotal").val());
            var concepto = $(".txtConcepto").val();

            var dato={
                Price: importeTotal,
                datePayOff:fechaPago,
                TypeExpenses:parseInt($(".ddlTipoGasto").val()),
                TypePayment:parseInt($(".ddlFormaPagoEgresos").val()),
                Concept:concepto,
                IsDeleted:false
            }
            
             await GuardarDatosEgresos(dato,operacionEgresos,selEarningGlobal);
             MostrarMensajePrincipal("El egreso se guardo correctamente","success");
             setTimeout(function(){Redireccionar("egresos.html");},3000);
        }      
    });

    // $(".btnPago").click(function(){
    //     parent.tipoConceptoCobro = 2;
    //     window.location.href = "validacionPago.html?idPacientePago=" + selIdPatientEarning + "&idCita=" + idCita;
    // });
    
    $(".btnAgregarEgreso").click(function(){
        operacionEgresos = 0;
        window.location.href = "AltaEgresos.html";
    });

    const idEgresoQuery = urlQueryString.get('idEgreso');
    if (idEgresoQuery != "" && idEgresoQuery != null) {
        operacionEgresos = 1;
        selEarningGlobal = idEgresoQuery;
        SeleccionarDatosEgresosPorId(idEgresoQuery);    
    }
    else{
        var fechaHoy =  new Date();
        $(".txtFechaPago").val(fechaHoy.getFullYear() + "-" + fechaHoy.getMonth().toString().padStart(2,"0") + "-" + fechaHoy.getDate().toString().padStart(2,"0"));
    }

});

const GuardarDatosEgresos = async function(objEgresos, operacion, idEarn){
    return new Promise(resolve => {setTimeout(async function(){
        QuitarMensaje();
        if (operacion == 0){
            resolve(await insertDb(urlQrGlobal,objEgresos));
            MostrarMensajePrincipal("El Egreso se registró correctamente","success");
        } else {
            resolve(await updateDb(urlQrGlobal,idEarn,objEgresos));
            MostrarMensajePrincipal("El Egreso se actualizo correctamente","success");
        }
    }, 250);});
};

const SeleccionarDatosEgresosPorId = async function(idEgreso){
    $(".dvLoader").show();
    return new Promise(resolve => {setTimeout(async function(){
        db.collection(urlQrGlobal).doc(idEgreso).get().then((obj)=>{
            resolve(obj.data());
            llenarCampos(obj.data());            
        }).catch(error=>{
            resolve(null);
            alert("error");
        });
    })});
};

function llenarCampos(datos) {    
    var fecha = datos.datePayOff.toDate();
    $(".ddlTipoGasto").val(datos.TypeExpenses);
    $(".ddlFormaPagoEgresos").val(datos.TypePayment);
    $(".txtConcepto").val(datos.Concept);
    $(".txtFechaPago").val(fecha.getFullYear().toString().padStart(4, "0") + "-" + (fecha.getMonth() + 1).toString().padStart(2, "0")  + "-" + fecha.getDate().toString().padStart(2, "0"));
    $(".txtImporteTotal").val(datos.Price);
    $(".dvLoader").hide();
}

function llenarDdlFormaPago() {    
    $(".ddlFormaPagoEgresos").append("<option value=''></option>" );
    $(".ddlFormaPagoEgresos").append("<option value=" + PaymentType.Efectivo +">Efectivo</option>" );
    $(".ddlFormaPagoEgresos").append("<option value=" + PaymentType.Transferencia +">Transferencia</option>" );
    $(".ddlFormaPagoEgresos").append("<option value=" + PaymentType.Tarjeta +">Tarjeta</option>" );
}

var lstQrViewsFiltrado = [];
const SeleccionarDatosEgresos = async function(tipoControl,fechaInicio,fechafin){
    $(".dvLoader").show();    
    //var FechaI = new Date(new Date(fechaInicio).getFullYear(),new Date(fechaInicio).getMonth() - 1 ,new Date(fechaInicio).getDate(),0,0,0);
    //var FechaF = new Date(new Date(fechafin).getFullYear(),new Date(fechafin).getMonth() - 1 ,new Date(fechafin).getDate(),23,59,59);
    //db.collection(url).where("status","in",estatusComandas).where('createdDateTime', '>=', FechaI).where('createdDateTime', '<=', FechaF).orderBy("createdDateTime", "asc").get().then(data =>{
        await db.collection(urlQrGlobal).where('Date', '>=', fechaInicio).where('Date', '<=', fechafin).onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
            
            if (change.type === "added") {
                var id = change.doc.id;
                var datos = change.doc.data();
                var datos = {[id]:datos};
                lstQrViewsFiltrado.push(datos[id]);
                Object.assign(parent.lstQrGlobal,datos);
            }
            if (change.type === "modified") {
                var id = change.doc.id;
                var datos = change.doc.data();
                var datos = {[id]:datos};
                lstQrViewsFiltrado.push(datos[id]);
                Object.assign(parent.lstQrGlobal,datos);
            }
            if (change.type === "removed") {
                delete parent.lstQrGlobal[change.doc.id];
            }
        });
        switch (tipoControl) {
            case "tabla":                
                llenarTablaEgresosDetalle(parent.lstQrGlobal);
                break;
            case "dropdown":
                llenarDropDownCategory(parent.lstQrGlobal);
            break;
            default:
                break;
        }
        
    });
};

var lstQrCatalogoFiltrado = [];
db.collection(urlQrCatalogGlobal).onSnapshot(function(snapshot) {
    snapshot.docChanges().forEach(function(change) {
        
        if (change.type === "added") {
            var id = change.doc.id;
            var datos = change.doc.data();
            var datos = {[id]:datos};
            lstQrCatalogoFiltrado.push(datos[id]);
            Object.assign(lstQrCatalogo,datos);
        }
        if (change.type === "modified") {
            var id = change.doc.id;
            var datos = change.doc.data();
            var datos = {[id]:datos};
            lstQrCatalogoFiltrado.push(datos[id]);
            Object.assign(lstQrCatalogo,datos);
        }
        if (change.type === "removed") {
            delete lstQrCatalogo[change.doc.id];
        }
    });
});

function llenarTablaEgresosDetalle(datosEgresos){
    $(".tblEgresosDetalle").empty();
    $(".dvLoader").show();        
    var titulos = ["Procedencia","Tratamiento","Vistas"];    
    var TitulosDatos = ["Procedencia","Price","Vistas","TipoPago","datePayOff"];    
    var totalEgresos = 0;
    var totalEgresosEfectivo = 0;
    var totalEgresosBanco = 0;
    //var lstEgresosProductos = JSON.parse(JSON.stringify(datosEgresos));
    if (Object.keys(datosEgresos).length >0) {
        var lstQr
        for (const ap in datosEgresos) {     
            const idProducto = ap;   
            var datos = datosEgresos[ap];
            datos.Procedencia = lstQrCatalogoFiltrado[lstQrViewsFiltrado.findIndex(x => x.Id === datos.Id)].PublicName;
            datos.Vistas = lstQrViewsFiltrado.filter(x => x.Id === datos.Id).length;
            //lstQrViewsFiltrado.filter(x => x.Id === datos.Id).remove();
            if (datos.TypePayment == PaymentType.Efectivo) {
                totalEgresosEfectivo += datos.Price;    
            }
            else{
                totalEgresosBanco += datos.Price;        
            }
            totalEgresos += datos.Price;  
            datos.Price = formatoMoneda(datos.Price);
        }
        
        $(".pTotalEgresos").text("$" + formatoMoneda(totalEgresos));
        $(".pEfectivoEgresos").text("$" + formatoMoneda(totalEgresosEfectivo));
        $(".pBancoEgresos").text("$" + formatoMoneda(totalEgresosBanco));
    }

    function TipoPagoTexto(tipoPago) {
        switch (tipoPago) {
            case PaymentType.Efectivo:
                return "Efectivo";
            case PaymentType.Tarjeta:
                return "Tarjeta";
            case PaymentType.Transferencia:
                return "Transferencia";
            default:
                break;
        } 
    }

    function TipoGastoTexto(tipoPago) {
        switch (tipoPago) {
            case ExpenseType.Publicidad:
                return "Publicidad";
            case ExpenseType.Insumos:
                return "Insumos";
            case ExpenseType.Salarios:
                return "Salarios";
            case ExpenseType.GastosOperativos:
                return "Gastos operativos";
            default:
                break;
        } 
    }

    const lstEgresosResumen = JSON.parse(JSON.stringify(datosEgresos));
    
    let lstButtons = {};
    if (Object.keys(lstEgresosResumen).length >0) {
        for (const ap in lstEgresosResumen) {     
            const idProducto = ap;   
            const datos = lstEgresosResumen[ap]          
            var Buttons = [];                                            
            // var ServicioDescripcion = "";
            // datos.Products.forEach(element => {
            //     ServicioDescripcion += element.Service.Name + "/n";
            // });
            // datos.Productos = ServicioDescripcion;

            //Object.assign(Buttons,btnEditar);
            var Buttons = [];            
            let btnEditar = $("<a class='btnTablaGlobal material-icons btnIcon' title='Editar'>edit</a>");
            btnEditar.on('click',()=>{                
                location.href = "AltaEgresos.html?idEgreso=" + ap;
            });
            Buttons.push(btnEditar);
            let btnEliminar = $("<a class='btnTablaGlobal material-icons btnIcon' title='Eliminar'>delete</a>");
            btnEliminar.on('click',()=>{
                DeleteExpenses(ap,true);
            });
            Buttons.push(btnEliminar);
            var evento = {[idProducto]:Buttons};
            Object.assign(lstButtons,evento);
        }
    }
    generarTabla($(".tblEgresosDetalle"),titulos,TitulosDatos,datosEgresos,lstButtons);
    $(".dvLoader").hide();
}

async function DeleteExpenses(idGasto,Status) {
    var gasto = await selectDb(urlQrGlobal,idGasto);
    gasto.IsDeleted = Status;
    await updateDb(urlQrGlobal,idGasto,gasto);
    MostrarMensajePrincipal("El gasto se eliminó","success");
}
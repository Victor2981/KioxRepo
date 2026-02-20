var urlEarningsGlobal = "/Earnings";
var selEarningGlobal = "";
var selEarningPackGlobal = "";
var selEarningDebtGlobal = "";
var selIdPatientEarning = "";
var selIdPack = "";
var selPriceService = 0;
var operacionIngresos = 0;
var selIdAppointmen = "";
var arrayIngresos = [];
var lstIngresos = {};

//var lstPatientsGlobal = {};
const PaymentType = {
    Efectivo: 0,
    Transferencia: 1,
    Tarjeta: 3
}

$(document).ready(function(){        
    $(".rowPaquete").hide();
    $(".btnRegresarIngreso").hide();

    const urlQueryString = new URLSearchParams(window.location.search);
    const idPacientePago = urlQueryString.get('idPacientePago');    
    const idCita = urlQueryString.get('idCita');    
    const arregloIngresoSel = urlQueryString.get('arrayIngreso');    
    const idPaquete = urlQueryString.get('idPaquete');    
    if (idPacientePago != "" && idPacientePago != null) {
        selIdPatientEarning = idPacientePago;        
    }
    if (idCita != "" && idCita != null) {
        selIdAppointmen = idCita;        
    }
    if (arregloIngresoSel != "" && arregloIngresoSel != null) {
        if(arregloIngresoSel.indexOf(",") == -1){
            arrayIngresos.push(arregloIngresoSel);  
        }
        else{
            arregloIngresoSel.split(",").forEach(function(idPago){
                arrayIngresos.push(idPago);  
            });
        }        
    }

    $(".btnAcceptCheckout").hide();
    $(".btnAcceptCheckoutPaquete").hide();
    if (idPaquete != "" && idPaquete != null) {
        selIdPack = idPaquete;                     
        $(".btnAcceptCheckoutPaquete").show();   
    }
    else{
        $(".btnAcceptCheckout").show();
    }

    $(".btnBuscarIngresos").click(function (){
        $(".pTotalingresos").text("$" + formatoMoneda(0));
        $(".pEfectivoIngresos").text("$" + formatoMoneda(0));
        $(".pBancoIngresos").text("$" + formatoMoneda(0));
        var fechaInicio = new Date(parseInt($(".txtFechaIncIngresos").val().substr(0,4)),parseInt($(".txtFechaIncIngresos").val().substr(5,2))-1,parseInt($(".txtFechaIncIngresos").val().substr(8,2)),0,0,0);
        var fechafin = new Date(parseInt($(".txtFechaFinIngresos").val().substr(0,4)),parseInt($(".txtFechaFinIngresos").val().substr(5,2))-1,parseInt($(".txtFechaFinIngresos").val().substr(8,2)),23,59,59);
        $(".tblIngresosDetalle").empty();
        parent.lstIngresosGlobal = {};
        SeleccionarDatosIngresos("tabla",fechaInicio,fechafin);
    });
    
    $(".btnAgregarIngresos").click(async function (){
        const Categoria = await selectDb(urlCategoriesGlobal,$(".ddlCategoria").val());        
        const Servicio = await selectDb(urlServicesGlobal,$(".ddlServicio").val());
        const Paciente = await selectDb(urlPacientesGlobal,selIdPatientEarning);
        if (Categoria != null) {
            if (Servicio != null) {
                if (Paciente != null) {
                    var paquete = false;
                    if ($(".ddlPaquete").val() == "1") {
                        paquete = true;
                    }                
                    var idPaciente = selIdPatientEarning;
                    //var Service = Servicio
                    var NumeroSesiones = 1
                    var fechaPago = $(".txtFechaPago").val();

                    if (paquete) {
                        //idPaciente = $(".txtPaciente").val();
                        //Service = $(".txtServicio").val();
                        NumeroSesiones = parseInt($(".txtNumeroSesiones").val());
                        //fechaPago = $(".txtFechaPago").val();
                    }
                    var importeTotal = parseFloat($(".txtImporteTotal").val());//Servicio.Price * NumeroSesiones;

                    var dato={
                        Price: importeTotal,
                        IsPack: paquete,
                        IsPackCompleted: false,
                        IdPatient: idPaciente,
                        Patient: Paciente,
                        IdService: $(".ddlServicio").val(),
                        Service: Servicio,
                        IdCategory: $(".ddlCategoria").val(),
                        Category: Categoria,
                        NumbreSesions: NumeroSesiones,
                        datePayOff:fechaPago
                    }
                    
                    //var datos = change.doc.data();
                    //var evento = {[id]:datos};
                    var idProducto = Date.now();
                    var datos = {[idProducto]:dato};
                    Object.assign(parent.lstConceptosPago,datos); 
                    llenarTablaIngresos(parent.lstConceptosPago);
                }
            }
        }                
    });

    $(".btnPago").click(function(){
        parent.tipoConceptoCobro = 2;
        window.location.href = "validacionPago.html?idPacientePago=" + selIdPatientEarning + "&idCita=" + idCita;
    });
    
    $(".btnAgregarIngreso").click(function(){
        parent.tipoConceptoCobro = 2;
        window.location.href = "AltaIngresos.html";
    });

    const idCategoryQuery = urlQueryString.get('idCategory');
    if (idCategoryQuery != "" && idCategoryQuery != null) {
        selCategoryGlobal = idCategoryQuery;
        populateCategoryData(idCategoryQuery);
    }
    else{
        var fechaHoy =  new Date();
        $(".txtFechaPago").val(fechaHoy.getFullYear() + "-" + fechaHoy.getMonth().toString().padStart(2,"0") + "-" + fechaHoy.getDate().toString().padStart(2,"0"));
    }

    $(".btnAcceptCheckoutPaquete").click(async function (){
        QuitarMensaje();
        $(".modalCheckOut").modal('toggle');
        $(".dvLoader").show();
        operacionIngresos = 0;
        var formaPago = 0;
        var Mensualidades = 1;
        var deposito = 0;
        var TotalFactura = 0;
        var banPagado = false;

        if (parent.tipoConceptoCobro != 1) {
            deposito = parseFloat($(".txtPago").val());
        }
        

        formaPago = parseInt($(".ddlFormaPago").val());
        if (formaPago == "3") {
            if (parent.tipoConceptoCobro != 1) {
            Mensualidades = parseInt($(".ddlMensualidades").val());    
            }
        }
        

        var idPaciente = selIdPatientEarning;
        var Paciente = await selectDb(urlPacientesGlobal,selIdPatientEarning);
        var folio = Date.now(); //+ parent.nomSucursal + parent.idUsuarioSistema;
                
        var invoice={
            IdEarn: "",
            Invoice: folio,
            PaymentDate: new Date(),
            Products: [],
            IdEmployeRegister: parent.idUsuarioSistema,
            idPatient: idPaciente,
            Patient: Paciente,
            PaymentType: formaPago,
            Total: 0
        }

        for (const datoIngreso in parent.lstConceptosPago) {
            const ingreso = parent.lstConceptosPago[datoIngreso];
            var importeTotal = parseFloat(ingreso.Price);
            const servicios = JSON.parse(JSON.stringify(ingreso.Service));
            var dato={
                Price: importeTotal,
                IsPack: ingreso.IsPack,
                //IsPackCompleted: false,
                IdService: ingreso.IdService,
                Service: servicios,
                NumbreSesions:ingreso.NumbreSesions
            }
            TotalFactura += importeTotal;
            invoice.Products.push(dato);
        };
        invoice.Total = deposito;
        
        if (TotalFactura == deposito) {
            banPagado = true;
        }

        var idIngreso = await GuardarDatosIngresos(invoice,operacionIngresos,selEarningGlobal);
        invoice.IdEarn = idIngreso;
        await GuardarDatosIngresos(invoice,1,idIngreso);
        invoice.Products.forEach(async element => {
            if (element.IsPack) {
                element.IdEarn = [idIngreso];
                element.TakenNumbreSesions = 0;
                element.IdPatient = idPaciente;
                element.Patient = Paciente;
                element.IdService = element.IdService;
                element.Service = element.Service;
                element.Date = new Date();
                element.IsPayed = banPagado;
                element.NumberPayments = Mensualidades;
                element.Total = TotalFactura;
                element.IsPackCompleted = false;
                await GuardarDatosPaquete($(".btnAcceptCheckoutPaquete"),element,operacionIngresos,selEarningPackGlobal);    
                if (banPagado == false) {
                    var objAdeudo ={
                        IdService: element.IdService,
                        Service: element.Service,
                        Due: TotalFactura - deposito,
                        Total: TotalFactura
                    }
                    await GuardarDatosAdeudo(objAdeudo,operacionIngresos,selEarningDebtGlobal)
                }
            }
        });

        if (parent.tipoConceptoCobro != 2) {
            await UpdateStatusAppointment(selIdAppointmen,StatusAppointment.Pagado);        
            MostrarMensajePrincipal("La cíta se pago","success");
            setTimeout(function(){Redireccionar("../citas.html");},3000);
            parent.lstConceptosPago = {};
        }                
        else{
            MostrarMensajePrincipal("Ingreso registrado","success");
            setTimeout(function(){Redireccionar("ingresos.html");},3000);
            parent.lstConceptosPago = {};
        }
        $(".dvLoader").hide();
        return false;
    });

    $(".btnAcceptCheckout").click(async function (){
        QuitarMensaje();        
        $(".dvLoader").show();
        operacionIngresos = 0;
        var formaPago = 0;
        var Mensualidades = 1;
        var deposito = 0;
        var TotalFactura = 0;
        var banPagado = false;

        if (parent.tipoConceptoCobro != 1) {
            deposito = parseFloat($(".txtPago").val());
        }

        formaPago = parseInt($(".ddlFormaPago").val());
        if (formaPago == "3") {
            if (parent.tipoConceptoCobro != 1) {
            Mensualidades = parseInt($(".ddlMensualidades").val());    
            }
        }   
        
        //var datosPaquete = parent.lstPacksGlobal[idPaquete];        
        //var Paciente = datosPaquete.Patient;
        var idPaciente = selIdPatientEarning;
        var Paciente = await selectDb(urlPacientesGlobal,selIdPatientEarning);
        var folio = Date.now(); //+ parent.nomSucursal + parent.idUsuarioSistema;
                
        var invoice={
            IdEarn: "",
            Invoice: folio,
            PaymentDate: new Date(2025,5,31),
            Products: [],
            IdEmployeRegister: parent.idUsuarioSistema,
            idPatient: idPaciente,
            Patient: Paciente,
            PaymentType: formaPago,
            Payment: 0,
            Total: 0
        }

        

        for (const datoIngreso in parent.lstConceptosPago) {
            const ingreso = parent.lstConceptosPago[datoIngreso];
            var importeTotal = parseFloat(ingreso.Price);
            await db.collection("/SpecialPrice").where("IdPatient","==",selIdPatientEarning).where("IdService","==",ingreso.IdService).get().then(async (obj)=>{
                if (obj.docs.length > 0) {
                    var datosPrecio = obj.docs[0].data();
                    importeTotal = parseFloat(datosPrecio.Price);
                }
            }); 
            const servicios = JSON.parse(JSON.stringify(ingreso.Service));
            var dato={
                Price: importeTotal,
                IsPack: ingreso.IsPack,
                //IsPackCompleted: false,
                IdService: ingreso.IdService,
                Service: servicios,
                NumbreSesions:ingreso.NumbreSesions
            }
            TotalFactura += importeTotal;
            invoice.Products.push(dato);
        };
        invoice.Total = TotalFactura;
        
        if (parent.tipoConceptoCobro == 1) {
            deposito = TotalFactura;
        }
        if (TotalFactura == deposito) {
            banPagado = true;
        }
        
        var idIngreso =0;
        if (deposito > 0) {
            invoice.Payment = deposito;
            deposito = deposito/invoice.Products.length;
            var idIngreso = await GuardarDatosIngresos(invoice,operacionIngresos,selEarningGlobal);
            invoice.IdEarn = idIngreso;
            await GuardarDatosIngresos(invoice,1,idIngreso);    
        }
        
        invoice.Products.forEach(async element => {
            if (element.IsPack) {
                element.IdEarn = idIngreso;
                element.TakenNumbreSesions = 1;
                element.IdPatient = idPaciente;
                element.Patient = Paciente;
                element.IdService = element.IdService;
                element.Service = element.Service;
                element.Date = new Date();
                element.IsPayed = banPagado;
                element.NumberPayments = Mensualidades;                
                element.Total = TotalFactura;
                element.IsPackCompleted = false;
                await GuardarDatosPaquete($(".btnAcceptCheckout"),element,operacionIngresos,selEarningPackGlobal);    
            }
            if (banPagado == false) {
                var objAdeudo ={
                    IdService: element.IdService,
                    Service: element.Service,
                    Due: element.Price - deposito,
                    Cost: element.Price
                }
                await GuardarDatosAdeudo(objAdeudo,operacionIngresos,selEarningDebtGlobal)
            }
        });

        if (parent.tipoConceptoCobro != 2) {
            await UpdateStatusAppointment(selIdAppointmen,StatusAppointment.Pagado);        
            MostrarMensajePrincipal("La cíta se pago","success");
            setTimeout(function(){Redireccionar("../citas.html");},3000);
            parent.lstConceptosPago = {};
        }                
        else{
            MostrarMensajePrincipal("Ingreso registrado","success");
            setTimeout(function(){Redireccionar("ingresos.html");},3000);
            parent.lstConceptosPago = {};
        }
        $(".dvLoader").hide();
        return false;
    });

    $(".txtNumeroSesiones").keyup(function(){
        var sesiones = $(".txtNumeroSesiones").val();
        if (sesiones < 2) {
            sesiones = 2
            $(".txtNumeroSesiones").val(sesiones);
        }
        var cost = calcularCostoPorSesion(selPriceService,sesiones);
        $(".txtImporteTotal").val(cost);
    });

    $(".txtPacienteIngresos").keyup(function(){
        var textSearch = $(".txtPacienteIngresos").val().trim();
        var idTxtEmp = $(".txtPacienteIngresos")[0].id;
        $(".autocomplete-items").empty();
        $(".autocomplete-items").remove();
        if (textSearch != "") {
            var lstPatients = searchPatients(textSearch);
            //llenarTablaPacientes(lstPatients);
            var a, b, i;
            currentFocus = -1;
            a = document.createElement("DIV");
            a.setAttribute("id", idTxtEmp + "autocomplete-list");
            a.setAttribute("class", "autocomplete-items");
            this.parentNode.appendChild(a);
            for (i = 0; i < lstPatients.length; i++) {
              b = document.createElement("DIV");
                const idPatient = Object.keys(lstPatients[i])[0];
                const dato = lstPatients[i][Object.keys(lstPatients[i])[0]].datos;
                b.innerHTML = "<strong>" + dato.Name + " " + dato.LastName + " " + dato.SecondLastName + "</strong>";
                b.innerHTML += "<input type='hidden' value='" + idPatient + "'>";
                  b.addEventListener("click", function(e) {
                    $(".autocomplete-items").empty();
                    $(".autocomplete-items").remove();
                    selIdPatientEarning = idPatient;
                  //inp.value = idPatient;
                  //closeAllLists();
                  TitleAppointment = dato.Name + " " + dato.LastName + " " + dato.SecondLastName;
                  $(".txtPacienteIngresos").val(dato.Name + " " + dato.LastName + " " + dato.SecondLastName);
                  //$(".pTelefono").text(dato.Phone);
                  //$(".pCorreo").text(dato.Email);              
                  $(".dvDatosCita").show();
              });
              a.appendChild(b);
            }
            $(".autocomplete-items").append(a);
        }
        
    });
    
    $(".ddlCategoria").change(async function(){
        //lstServicesFiltroGlobal
        //SeleccionarDatosServicios("dropdown",$(".ddlCategoria").val());
        llenarDropDownServices($(".ddlCategoria").val());
        $(".ddlServicio").change();
    });

    $(".ddlServicio").change(async function(){
        var datosServicio = parent.lstServicesGlobal[$(".ddlServicio").val()];
        $(".txtImporteTotal").val(datosServicio.Price);
        selPriceService = datosServicio.Price;
        if ($(".ddlPaquete").val() == 1) {
            var cost = calcularCostoPorSesion(selPriceService,2);   
            $(".txtImporteTotal").val(cost);   
        }
        else{
            var cost = calcularCostoPorSesion(selPriceService,1);   
            $(".txtImporteTotal").val(cost);   
        }
        
    });
    
    
    $(".ddlPaquete").change(function(val) {
        $(".rowPaquete").hide();
        if ($(".ddlPaquete").val()== 1) {
            $(".rowPaquete").show();
            $(".txtNumeroSesiones").val(2);      
            var cost = calcularCostoPorSesion(selPriceService,2);   
            $(".txtImporteTotal").val(cost);   
        }
        else{
            var cost = calcularCostoPorSesion(selPriceService,1);   
            $(".txtImporteTotal").val(cost);   
        }
    });

    $(".ddlFormaPago").change(function(val) { 
        $(".colMensualidades").hide();   
        if ($(".ddlFormaPago").val()== 3) {
            $(".colMensualidades").show();   
        }       
    });

    $(".btnRegresarIngreso").click(function(){
        $(".tblIngresos").empty();                
        $(".tblIngresosDetalle").show();      
        $(".btnRegresarIngreso").hide();  
    });
});

function llenarTablaIngresos(datosIngresos){
    $(".tblIngresos").empty();
    $(".tblIngresosCheckOut").empty();
    $(".dvLoader").show();
    var titulos = ["Servicio/Producto","Costo","Paquete","Fecha",""];    
    var titulosCheckout = ["Servicio/Producto","Costo","Paquete","Fecha"];    
    var TitulosDatos = ["Service.Name","Price","IsPack","datePayOff"];    

    const lstIngresosResumen = JSON.parse(JSON.stringify(datosIngresos));
    let lstButtons = {};
    if (Object.keys(lstIngresosResumen).length >0) {
        for (const ap in lstIngresosResumen) {     
            const idProducto = ap;   
            var datos = lstIngresosResumen[ap]                    
            var Buttons = [];                                            
            let btnEliminar = $("<a class='btnTablaGlobal material-icons btnIcon' title='Eliminar'>delete</a>");
            btnEliminar.on('click',()=>{
                //UpdateStatusCategory(idProducto,0);
                delete parent.lstConceptosPago[idProducto];
                $(".tblCategories").empty();
                llenarTablaIngresos(parent.lstConceptosPago)
            });
            Buttons.push(btnEliminar);
            //Object.assign(Buttons,btnEditar);
            var evento = {[idProducto]:Buttons};
            Object.assign(lstButtons,evento);
        }
    }
    generarTabla($(".tblIngresos"),titulos,TitulosDatos,datosIngresos,lstButtons);
    
    $(".dvLoader").hide();
}

function llenarTablaIngresosPago(datosIngresos){
    $(".tblIngresos").empty();
    $(".tblIngresosCheckOut").empty();
    $(".dvLoader").show();
    var titulos = ["Servicio/Producto","Costo","Paquete","Fecha",""];    
    var titulosCheckout = ["Servicio/Producto","Costo","Paquete","Fecha"];    
    var TitulosDatos = ["Service.Name","Price","IsPack","datePayOff"];  
    var totalCobro = 0;  

    const lstIngresosResumen = JSON.parse(JSON.stringify(datosIngresos));
    let lstButtons = {};
    if (Object.keys(lstIngresosResumen).length >0) {
        for (const ap in lstIngresosResumen) {     
            const idProducto = ap;   
            var datos = lstIngresosResumen[ap]                    
            var Buttons = [];                                            
            let btnEliminar = $("<a class='btnTablaGlobal material-icons btnIcon' title='Eliminar'>delete</a>");
            btnEliminar.on('click',()=>{
                //UpdateStatusCategory(idProducto,0);
                delete parent.lstConceptosPago[idProducto];
                $(".tblCategories").empty();
                llenarTablaIngresos(parent.lstConceptosPago)
            });
            Buttons.push(btnEliminar);
            //Object.assign(Buttons,btnEditar);
            var evento = {[idProducto]:Buttons};
            Object.assign(lstButtons,evento);
            totalCobro += parseFloat(datos.Price);
        }
        
        $(".lblPago").hide();
        $(".txtPago").hide();
        switch (parent.tipoConceptoCobro) {
            case 1:
                    $(".lblPago").show();
                    $(".lblPago").text(totalCobro);
                break;
            case 2:
                    $(".txtPago").val(totalCobro);
                    $(".txtPago").show();                    
            break;                
            default:
                break;
        }
    }
    
    generarTabla($(".tblIngresosCheckOut"),titulosCheckout,TitulosDatos,datosIngresos);
    $(".dvLoader").hide();
}

function llenarControles() {
    $(".ddlFormaPago").empty();
    $(".ddlMensualidades").empty();
    $(".colMensualidades").hide();
    $(".ddlMensualidades").append("<option value=''></option>" );
    for (let mensualidades = 1; mensualidades <= 12; mensualidades++) {
        $(".ddlMensualidades").append("<option value=" + mensualidades +">" + mensualidades +"</option>" );
    }
    
    $(".ddlFormaPago").append("<option value=''></option>" );
    $(".ddlFormaPago").append("<option value=" + PaymentType.Efectivo +">Efectivo</option>" );
    $(".ddlFormaPago").append("<option value=" + PaymentType.Transferencia +">Transferencia</option>" );
    $(".ddlFormaPago").append("<option value=" + PaymentType.Tarjeta +">Tarjeta</option>" );
    
}


function calcularCostoPorSesion(costo,sesiones){
    var cost = costo * sesiones;
    return cost;
}

const GuardarDatosIngresos = async function(objIngresos, operacion, idEarn){
    return new Promise(resolve => {setTimeout(async function(){
        QuitarMensaje();
        if (operacion == 0){
            resolve(await insertDb(urlEarningsGlobal,objIngresos));
            MostrarMensajePrincipal("El ingreso se registró correctamente","success");
        } else {
            resolve(await updateDb(urlEarningsGlobal,idEarn,objIngresos));
            MostrarMensajePrincipal("El ingreso se actualizo correctamente","success");
        }
    }, 250);});
};


const SeleccionarDatosIngresosPorId = async function(arrayIdEarnings){
    $(".dvLoader").show();
    return new Promise(resolve => {setTimeout(async function(){
        db.collection(urlPackagesGlobal).doc(id).where("IdEarn","in",arrayIdEarnings).get().then((obj)=>{
            resolve(obj.data());
        }).catch(error=>{
            resolve(null);
            alert("error");
        });
    })});
};

const SeleccionarDatosIngresos = async function(tipoControl,fechaInicio,fechafin){
    $(".dvLoader").show();    
    parent.lstIngresosGlobal = {};
    //var FechaI = new Date(new Date(fechaInicio).getFullYear(),new Date(fechaInicio).getMonth() - 1 ,new Date(fechaInicio).getDate(),0,0,0);
    //var FechaF = new Date(new Date(fechafin).getFullYear(),new Date(fechafin).getMonth() - 1 ,new Date(fechafin).getDate(),23,59,59);
    //db.collection(url).where("status","in",estatusComandas).where('createdDateTime', '>=', FechaI).where('createdDateTime', '<=', FechaF).orderBy("createdDateTime", "asc").get().then(data =>{
    await db.collection(urlEarningsGlobal).where('PaymentDate', '>=', fechaInicio).where('PaymentDate', '<=', fechafin).onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
            
            if (change.type === "added") {
                var id = change.doc.id;
                var datos = change.doc.data();
                var datos = {[id]:datos};
                Object.assign(parent.lstIngresosGlobal,datos);
            }
            if (change.type === "modified") {
                var id = change.doc.id;
                var datos = change.doc.data();
                var datos = {[id]:datos};
                Object.assign(parent.lstIngresosGlobal,datos);
            }
            if (change.type === "removed") {
                delete parent.lstIngresosGlobal[change.doc.id];
            }
        });
        switch (tipoControl) {
            case "tabla":                
                llenarTablaIngresosDetalle(parent.lstIngresosGlobal);
                break;
            case "dropdown":
                llenarDropDownCategory(parent.lstIngresosGlobal);
            break;
            default:
                break;
        }
        
    });
};

function llenarTablaIngresosDetalle(datosIngresos){
    $(".tblIngresosDetalle").empty();
    $(".dvLoader").show();        
    var titulos = ["Folio","Paciente","Servicio/Producto","Forma de pago","Total","Fecha registro",""];    
    var TitulosDatos = ["Invoice","NameComplete","Productos","PaymentTypeText","Total","PaymentDate"];    
    var totalIngresos = 0;
    var totalIngresosEfectivo = 0;
    var totalIngresosTarjeta = 0;
    var totalIngresosBanco = 0;
    //var lstIngresosProductos = JSON.parse(JSON.stringify(datosIngresos));
    if (Object.keys(datosIngresos).length > 0) {
        for (const ap in datosIngresos) {     
            const idProducto = ap;   
            var datos = datosIngresos[ap];
            if (datos.IsPayed) {
                datos.IsPayed = "Sí"    
            }
            else{
                datos.IsPayed = "No"    
            }   
            datos.NameComplete = datos.Patient.Name + " " + datos.Patient.LastName + " " + datos.Patient.SecondLastName;
            datos.PaymentTypeText = TipoPagoTexto(datos.PaymentType);

            switch (datos.PaymentType) {
                case 0:
                    totalIngresosEfectivo += datos.Total;    
                    break;
                case 1:
                    totalIngresosBanco += datos.Total;    
                    break;

                case 3:
                    totalIngresosTarjeta += datos.Total;    
                break;
                default:
                    break;
            }
          
            totalIngresos += datos.Total;  
            datos.Total = formatoMoneda(datos.Total);
            var ServicioDescripcion = "";
            datos.Products.forEach(element => {
                ServicioDescripcion += element.Service.Name + "<br/>";
            });
            datos.Productos = ServicioDescripcion;
              
        }
        
        $(".pTotalingresos").text("$" + formatoMoneda(totalIngresos));
        $(".pEfectivoIngresos").text("$" + formatoMoneda(totalIngresosEfectivo));
        $(".pBancoIngresos").text("$" + formatoMoneda(totalIngresosBanco));
        $(".pTarjetaIngresos").text("$" + formatoMoneda(totalIngresosTarjeta));
        
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
    const lstIngresosResumen = JSON.parse(JSON.stringify(datosIngresos));
    
    let lstButtons = {};
    if (Object.keys(lstIngresosResumen).length >0) {
        for (const ap in lstIngresosResumen) {     
            const idProducto = ap;   
            const datos = lstIngresosResumen[ap]          
            var Buttons = [];                                            
            let btnDetalle = $("<a class='btnTablaGlobal material-icons btnIcon' title='Detalle'>search</a>");
            btnDetalle.on('click',()=>{
                //UpdateStatusCategory(idProducto,0);
                //delete parent.lstConceptosPago[idProducto];
                $(".tblIngresos").empty();
                llenarTablaIngresos(datos.Products);
                $(".tblIngresosDetalle").hide();      
                $(".btnRegresarIngreso").show();      
                                          
            });
            Buttons.push(btnDetalle);

            // var ServicioDescripcion = "";
            // datos.Products.forEach(element => {
            //     ServicioDescripcion += element.Service.Name + "/n";
            // });
            // datos.Productos = ServicioDescripcion;

            //Object.assign(Buttons,btnEditar);
            var evento = {[idProducto]:Buttons};
            Object.assign(lstButtons,evento);
        }
    }
    generarTabla($(".tblIngresosDetalle"),titulos,TitulosDatos,datosIngresos,lstButtons);
    $(".dvLoader").hide();
}
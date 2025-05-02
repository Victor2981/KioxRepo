var urlEarningsGlobal = "/Earnings";
var selEarningGlobal = "";
var selIdPatientEarning = "";
var selPriceService = 0;
var operacionIngresos = 0;
var lstIngresos = {};
//var lstPatientsGlobal = {};
const PaymentType = {
    Efectivo: 0,
    Transferencia: 1,
    Tarjeta: 3
}

$(document).ready(async function(){        
    $(".rowPaquete").hide();
    await llenarDropDownCategory(parent.lstCategoriesGlobal);

    llenarControles();
    
    $(".btnAgregarIngresos").click(async function (){
        var Categoria = await selectDb(urlCategoriesGlobal,$(".ddlCategoria").val());        
        var Servicio = await selectDb(urlServicesGlobal,$(".ddlServicio").val());
        var Paciente = await selectDb(urlPacientesGlobal,selIdPatientEarning);
        if (Categoria != null) {
            if (Servicio != null) {
                if (Paciente != null) {
                    
                    var paquete = false;
                    if ($(".rblPaquete").filter(":checked").val() == "1") {
                        paquete = true;
                    }
                    var idPaciente = selIdPatientEarning;
                    //var Service = Servicio
                    var NumeroSesiones = 1
                    var fechaPago = $(".txtFechaPago").val();

                    if (paquete) {
                        //idPaciente = $(".txtPaciente").val();
                        //Service = $(".txtServicio").val();
                        NumeroSesiones = $(".txtNumeroSesiones").val();
                        //fechaPago = $(".txtFechaPago").val();
                    }
                    var importeTotal = Servicio.Price * NumeroSesiones;

                    var dato={
                        Price: importeTotal,
                        isPack: paquete,
                        isPackCompleted: false,
                        idPatient: idPaciente,
                        Patient: Paciente,
                        IdService: $(".ddlServicio").val(),
                        Service: Servicio,
                        idCategory: $(".ddlCategoria").val(),
                        Category: Categoria,
                        NumbreSesions:NumeroSesiones,
                        datePayOff:fechaPago
                    }
                    //var datos = change.doc.data();
                    //var evento = {[id]:datos};
                    var idProducto = Date.now();
                    var datos = {[idProducto]:dato};
                    Object.assign(lstIngresos,datos); 
                    llenarTablaIngresos(lstIngresos);
                }
            }
        }                
    });

    function llenarControles() {
        $(".ddlFormaPago").empty();
        $(".ddlMensualidades").empty();
        $(".ddlMensualidades").append("<option value=''></option>" );
        for (let mensualidades = 1; mensualidades <= 12; mensualidades++) {
            $(".ddlMensualidades").append("<option value=" + mensualidades +">" + mensualidades +"</option>" );
        }
        
        $(".ddlFormaPago").append("<option value=''></option>" );
        $(".ddlFormaPago").append("<option value=" + PaymentType.Efectivo +">Efectivo</option>" );
        $(".ddlFormaPago").append("<option value=" + PaymentType.Transferencia +">Transferencia</option>" );
        $(".ddlFormaPago").append("<option value=" + PaymentType.Tarjeta +">Tarjeta</option>" );
    }

    function llenarTablaIngresos(datosIngresos){
        $(".tblCategories").empty();
        $(".tblIngresos").empty();
        $(".tblIngresosCheckOut").empty();
        $(".dvLoader").show();
        var titulos = ["Servicio/Producto","Paciente","Costo","Paquete","Fecha",""];    
        var titulosCheckout = ["Servicio/Producto","Paciente","Costo","Paquete","Fecha"];    
        var TitulosDatos = ["Service.Name","Patient.Name","Price","isPack","datePayOff"];    

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
                    delete lstIngresos[idProducto];
                    $(".tblCategories").empty();
                    llenarTablaIngresos(lstIngresos)
                });
                Buttons.push(btnEliminar);
                //Object.assign(Buttons,btnEditar);
                var evento = {[idProducto]:Buttons};
                Object.assign(lstButtons,evento);
            }
        }
        generarTabla($(".tblIngresos"),titulos,TitulosDatos,datosIngresos,lstButtons);
        generarTabla($(".tblIngresosCheckOut"),titulosCheckout,TitulosDatos,datosIngresos);
        $(".dvLoader").hide();
    }


    
    

    const urlQueryString = new URLSearchParams(window.location.search);
    const idCategoryQuery = urlQueryString.get('idCategory');
    if (idCategoryQuery != "" && idCategoryQuery != null) {
        selCategoryGlobal = idCategoryQuery;
        populateCategoryData(idCategoryQuery);
    }
    else{
        var fechaHoy =  new Date();
        $(".txtFechaPago").val(fechaHoy.getFullYear() + "-" + fechaHoy.getMonth().toString().padStart(2,"0") + "-" + fechaHoy.getDate().toString().padStart(2,"0"));
    }



    $(".btnAcceptCheckout").click(function (){
        $(".dvLoader").show();
        operacionIngresos = 0;
        var formaPago = 0;
        var Mensualidades = 1;
        var deposito = $(".txtPago").val();
        var TotalFactura = 0;

        formaPago = $(".ddlFormaPago").val();
        Mensualidades = $(".ddlMensualidades").val();

        var invoice={
            Invoice: 1,
            Date: new Date(),
            Products: [],
            IdEmployeRegister: 1,
            PaymentType: formaPago,
            PaidDateTime: null,
            NumberPayments: Mensualidades,
            IsPayed: false,
            AdvancePayment: deposito,
            Total: 0
        }

        lstIngresos.forEach(ingreso => {
            var importeTotal = ingreso.Price;
            var isPack = ingreso.isPack;
            var idPaciente = ingreso.idPatient;
            var Service = ingreso.Service;
            var NumeroSesiones = ingreso.NumbreSesions;
            
            var dato={
                Price: importeTotal,
                isPack: isPack,
                isPackCompleted: false,
                idPatient: idPaciente,
                Service: Service,
                NumbreSesions:NumeroSesiones,
            }
            TotalFactura += importeTotal;
            invoice.Products.push(dato);
        });
        invoice.Total = TotalFactura;

        if (TotalFactura == deposito) {
            invoice.IsPayed = true;
            invoice.PaidDateTime = new Date();
        }
        
        GuardarDatosIngresos(invoice,operacionIngresos,selEarningGlobal);
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
                var idPatient = Object.keys(lstPatients[i])[0];
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
});

function calcularCostoPorSesion(costo,sesiones){
    var cost = costo * sesiones;
    return cost;
}

const GuardarDatosIngresos = async function(objIngresos, operacion, idEarn){
    return new Promise(resolve => {setTimeout(async function(){
        QuitarMensaje();
        if (operacion == 0){
            resolve(await insertDb(urlEarningsGlobal,objIngresos));
            MostrarMensajePrincipal("La ganancia se registró correctamente","success");
        } else {
            resolve(await updateDb(urlEarningsGlobal,idEarn,objIngresos));
            MostrarMensajePrincipal("La ganancia se actualizo correctamente","success");
        }
    }, 250);});
};
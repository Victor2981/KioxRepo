$(document).ready(function(){
    var idPacienteSeleccionado = "";
    $(".txtMensaje").cleditor({ width: "100%", height: "100%" });

    $(".formulario").on('submit', async function(e) {
        e.preventDefault();
        var banValidacion = true;
         const $form = $(this);
        if(banValidacion == true){banValidacion = Validador($(".txtEmpleadoGeneral"),"nombre",$(".txtEmpleadoGeneral").val(),1,'',false)};
        if(banValidacion == true){banValidacion = Validador($(".txtCorreo"),"correo",$(".txtCorreo").val(),4,'',false)};
        if(banValidacion == true){banValidacion = Validador($(".ddlTipoDocumento"),"tipo documento",$(".ddlTipoDocumento").val(),1,'',false)};
        if(banValidacion == true){banValidacion = Validador($(".txtMensaje"),"mensaje",$(".txtMensaje").val(),1,'',false)};

        if (banValidacion) {
            return new Promise(resolve => {setTimeout(async function(){
                var correo = $(".txtCorreo").val().trim();
                var patient = await selectDb(urlPacientesGlobal,idPacienteSeleccionado);
                patient.Email = correo;
                resolve(await updateDb("/Patients",idPacienteSeleccionado,patient));
                
                var datosEmpleados;
                var datosCuentaUsusario = JSON.parse(sessionStorage.sesionUsuario);
                datosEmpleados = Object.values(parent.lstEmployeesGlobal).filter(x => x.uId == datosCuentaUsusario.uId)[0];
                $(".txtFisio").val(datosEmpleados.Name + ' ' + datosEmpleados.LastName + ' ' + datosEmpleados.SecondLastName);
                $(".txtFisioCedula").val(datosEmpleados.professionalID);
                switch ($(".ddlTipoDocumento").val()) {
                    case "1":
                        $(".txtTipoDocumento").val("Receta");
                        break;
                    case "2":
                        $(".txtTipoDocumento").val("Informe médico");
                        break;
                    default:
                        break;
                }
                

                const formData = $form.serialize(); 
                $.ajax({
                    url: "../methods/procesar.php?kvs=3.9",
                    type: "POST",
                    data: formData,
                    success: function (respuesta) {
                    MostrarMensajePrincipal("El mensaje se registró correctamente", "success");
                    console.log("Respuesta PHP:", respuesta);
                    },
                    error: function (msj) {
                    MostrarMensajePrincipal("Ocurrió un error al enviar el formulario", "error");
                    }
                });                                
                MostrarMensajePrincipal("El mensaje se registró correctamente","success");    
            }, 250);});
        }
    });


    $(".txtEmpleadoGeneral").keyup(function(){
        var textSearch = $(".txtEmpleadoGeneral").val().trim();
        var idTxtEmp = $(".txtEmpleadoGeneral")[0].id;
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
                    idPacienteSeleccionado = idPatient;
                  //inp.value = idPatient;
                  //closeAllLists();                  
                  TitleAppointment = dato.Name + " " + dato.LastName + " " + dato.SecondLastName;
                  $(".txtEmpleadoGeneral").val(dato.Name + " " + dato.LastName + " " + dato.SecondLastName);
                  $(".txtCorreo").val(dato.Email);
                  $(".pTelefono").text(dato.Phone);
                  $(".pCorreo").text(dato.Email);              
                  $(".dvDatosCita").show();
              });
              a.appendChild(b);
            }
            $(".autocomplete-items").append(a);
        }
     
    });
});



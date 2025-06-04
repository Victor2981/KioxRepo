$(document).ready(function(){
    var idPacienteSeleccionado = "";
    var datosPaciente;
    $(".txtMensaje").cleditor({ width: "100%", height: "100%" });

    $(".formulario").on('submit', async function(e) {
        e.preventDefault();
        var banValidacion = true;
        if(banValidacion == true){banValidacion = Validador($(".txtEmpleadoGeneral"),"nombre",$(".txtEmpleadoGeneral").val(),1,'',false)};
        if(banValidacion == true){banValidacion = Validador($(".txtCorreo"),"correo",$(".txtCorreo").val(),4,'',false)};
        if(banValidacion == true){banValidacion = Validador($(".ddlTipoDocumento"),"tipo documento",$(".ddlTipoDocumento").val(),1,'',false)};
        if(banValidacion == true){banValidacion = Validador($(".txtMensaje"),"mensaje",$(".txtMensaje").val(),1,'',false)};

        if (banValidacion) {
            return new Promise(resolve => {setTimeout(async function(){
                var correo = $(".txtCorreo").val().trim();
                datosPaciente.Email = correo;
                resolve(await updateDb("/Patients",idPacienteSeleccionado,datosPaciente));
                this.submit();
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
                datosPaciente = dato;
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



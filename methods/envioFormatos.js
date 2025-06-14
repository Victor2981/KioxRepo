$(document).ready(function(){
    var idPacienteSeleccionado = "";
    // $(".txtMensaje").cleditor({ width: "100%", height: "100%" });

    $(".formulario").on('submit', async function(e) {
        e.preventDefault();
        var banValidacion = true;
         const $form = $(this);
        if(banValidacion == true){banValidacion = Validador($(".txtEmpleadoGeneral"),"nombre",$(".txtEmpleadoGeneral").val(),1,'',false)};
        if(banValidacion == true){banValidacion = Validador($(".txtCorreo"),"correo",$(".txtCorreo").val(),4,'',false)};
        if(banValidacion == true){banValidacion = Validador($(".ddlTipoDocumento"),"tipo documento",$(".ddlTipoDocumento").val(),1,'',false)};
        if(banValidacion == true){banValidacion = Validador($(".txtMensaje"),"mensaje",$(".txtMensaje").val(),1,'',false)};

        if (banValidacion) {
            setTimeout(async () => {
                var correo = $(".txtCorreo").val().trim();
                var patient = await selectDb(urlPacientesGlobal, idPacienteSeleccionado);
                patient.Email = correo;
                await updateDb("/Patients", idPacienteSeleccionado, patient);

                var datosCuentaUsusario = JSON.parse(sessionStorage.sesionUsuario);
                var datosEmpleados = Object.values(parent.lstEmployeesGlobal).find(x => x.uId == datosCuentaUsusario.uId);

                $(".txtFisio").val(`${datosEmpleados.Name} ${datosEmpleados.LastName} ${datosEmpleados.SecondLastName}`);
                $(".txtFisioCedula").val(datosEmpleados.professionalID);

                const tipo = $(".ddlTipoDocumento").val();
                $(".txtTipoDocumento").val(tipo == "1" ? "Receta" : tipo == "2" ? "Informe médico" : "");

                const formData = $form.serialize();
                fetch('https://us-central1-fior-a4273.cloudfunctions.net/sendPdfEmail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
                })
                .then(res => res.text())
                .then(msg => alert("Respuesta: " + msg))
                .catch(err => console.error(err));

                MostrarMensajePrincipal("El mensaje se registró correctamente", "success");
            }, 250);

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



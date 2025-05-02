
function Validador(control,nomCampo,valor,tipoValidacion,msjOpcional,popup){
	QuitarMensaje();
	$(".campoIncorrecto").removeClass("campoIncorrecto");
	var banValidacion = false;
	var mensajePopup =true;
	if (popup != undefined) {
		mensajePopup = popup;
	}
	switch (tipoValidacion) {
		case 1:
			//Cadena vacia
			if (valor.trim() != '') {
				banValidacion = true;
			}
			else{
				MostarMensaje(2,"El campo " + nomCampo + " no puede estar vacío",mensajePopup);
			}
			break;
		case 2:
			//Mayor a cero
			if (valor != '' && parseInt(valor) > 0) {
				banValidacion = true;
			}
			else{
				MostarMensaje(2,"El campo " + nomCampo + " debe ser mayor a cero",mensajePopup);
			}
		break;
		case 3:
			//Lista con elementos
			if (valor != '' && parseInt(valor) > 0) {
				banValidacion = true;
			}
			else{
				MostarMensaje(2,"El " + nomCampo + " debe contener al menos un elemento",mensajePopup);
			}
		break;
		case 4:
			//Correo
			let correo = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			if (valor != '' && correo.test(valor)) {
				banValidacion = true;
			}
			else{
				MostarMensaje(2,"El " + nomCampo + " no es un correo válido",mensajePopup);
			}
		break;
		case 5:
			//Telefono
			let telelfono = /^\d{10}$/;
			if (valor != '' && telelfono.test(valor)) {
				banValidacion = true;
			}
			else{
				MostarMensaje(2,"El teléfono debe tener 10 dígitos",mensajePopup);
			}
		break;
		case 6:
			//Imagen
			var allowedExtension = ['jpeg', 'jpg','png','gif'];
			var fileExtension = valor.split('.').pop().toLowerCase();
			var isValidFile = false;
			for(var index in allowedExtension) {
				if(fileExtension === allowedExtension[index]) {
					isValidFile = true; 
					break;
				}
			}
			if (isValidFile == false) {
				MostarMensaje(2,"El campo imagen no es válido",mensajePopup);
			}
			banValidacion = isValidFile;
		break;
		case 7:
			//check
			if (valor != '' && parseInt(valor) > 0) {
				banValidacion = true;
			}
			else{
				MostarMensaje(2,"El campo " + nomCampo + " debe ser seleccionado",mensajePopup);
			}
		break;
		case 8:
			//Fecha/hora
			let hora = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
			if (valor !='' && hora.test(valor)) {
				banValidacion = true;
			} else {
				MostarMensaje(2,nomCampo + " no es un valor válido",mensajePopup);
			}
		break;
		case 9:
			//importe
			let importe = /^[0-9]{1,5}$|^[0-9]{1,5}\.[0-9]{1,2}$/;
			if (importe.test(valor)) {
				banValidacion = true;
			} else {
				MostarMensaje(2,nomCampo + " no es un valor válido",mensajePopup);
			}
		break;
		case 10:
			//Fecha
			let fecha = /^([0-2][0-9]|3[0-1])(\/|-)(0[1-9]|1[0-2])\2(\d{4})$/;
			if (valor !='' && fecha.test(valor)) {
				banValidacion = true;
			} else {
				MostarMensaje(2,"El campo " + nomCampo + " no es un valor válido",mensajePopup);
			}
		break;
		case 11:
			//cp
			let cp = /^([0-9][0-9][0-9][0-9][0-9])$/;
			if (valor !='' && cp.test(valor)) {
				banValidacion = true;
			} else {
				MostarMensaje(2,"El campo " + nomCampo + " no es un valor válido",mensajePopup);
			}
		break;
		default:
			break;
	}
	
	if (banValidacion == false) {
		control.addClass("campoIncorrecto");	
		if (msjOpcional != undefined && msjOpcional != "") {
			MostarMensaje(2,msjOpcional,mensajePopup);
		}
	}

return banValidacion;
}


function MostarMensaje(tipo, mensaje,popUp){
	if (popUp) {
		$(".dvMensajePopUp").empty();
	} else {
		$(".dvMensaje").empty();	
	}
	
	let dv ="";
	let estilo = "";
	let txtEstilo ="";
	switch (tipo) {
		case 1:
			estilo="alert-success";
			txtEstilo ="Correcto";
		break;
		case 2:
			estilo="alert-warning";
			txtEstilo ="Alerta";
		break;
		case 3:
			estilo="alert-danger";
			txtEstilo ="Error";
		break;
		default:
			break;
	}
	
	if (mensaje != "") {
		
	}
	dv+="<div class='alert "+ estilo +" alert-dismissible fade show'>";
	dv+="<a href='#' class='close' data-dismiss='alert' aria-label='close'>&times;</a>";
	dv+="<strong>" + txtEstilo + "</strong> " + mensaje;
	dv+="</div>";
	
	if (popUp) {
		$(".dvMensajePopUp").append(dv);
	} else {
		$(".dvMensaje").append(dv);
	}
}
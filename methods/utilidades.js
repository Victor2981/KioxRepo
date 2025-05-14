let EmpleadoGobal ="";

$(".bMenu").click(function(){
	  validarAcceso();
      $(".bMenu").removeClass("active");
      var loc = "views/" + $(this).attr("pag") + "?" + new Date().getTime();
      $(this).addClass("active");
      ChangeView(loc);
  });

  function ChangeView(url){
      $(".frameVista").attr('src', url); 
  }

const MostrarMensajePrincipal = (message, type) => {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = [
      `<div class="alert alert-${type} alert-dismissible msjError" role="alert">`,
      `   <div>${message}</div>`,
      '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
      '</div>'
    ].join('')
  
    $("body").append(wrapper)
}

function QuitarMensaje(){
    $(".msjError").hide();
	$(".campoIncorrecto").removeClass("campoIncorrecto");
}


function generarTabla(obj,titulos,TitulosDatos,datos,lstButtons){
  generarTitulosTabla(obj,titulos);
  generarDatosTabla(obj,TitulosDatos,datos,lstButtons);
}

function quitarAcentos(cadena) {
	return cadena.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

function generarTitulosTabla(obj,titulos){
  var tblTitulo = "<thead>";
  tblTitulo += "<tr>";
  titulos.forEach(titulo => {
      tblTitulo += "<th>";
      tblTitulo += titulo;
      tblTitulo += "</th>";
  });
  tblTitulo += "</tr>";
  tblTitulo += " </thead> ";
  obj.append(tblTitulo);
}

function generarDatosTabla(obj,TitulosDatos,datos,Buttons){
  var tblBody = $("<tbody>");
  const lstDatos = JSON.parse(JSON.stringify(datos));
  if (Object.keys(lstDatos).length >0) {
      for (const ap in lstDatos) {
          const dato = lstDatos[ap];
          const datosBase = datos[ap];
          //tblDato += "<tr>";
          let fila = $("<tr class='trDatoGlobal'>");
          TitulosDatos.forEach(titulo => {
            let columna = "";
            var valorColumnaOrigen;
            if (titulo.indexOf(".")) {
              //valorColumnaOrigen = dato[titulo.split(".")[0]];
              titulo.split(".").forEach(function(prop){
                if (valorColumnaOrigen == undefined) {
                  valorColumnaOrigen = datosBase[prop];
                }
                else{
                  valorColumnaOrigen = valorColumnaOrigen[prop];
                }
              });  
            }
            else{
              valorColumnaOrigen = datosBase[titulo];
            }
            
            switch (typeof valorColumnaOrigen) {
              case "string":
                if (valorColumnaOrigen.includes("#")) {
                  columna = $("<td><div style='height: 30px;width: 80px;background-color: " + valorColumnaOrigen +";'></div></td>"); 
                 }
                 else{
                  columna = $("<td><label>" + valorColumnaOrigen +"</label></td>"); 
                 }
                break;
              case "object":
                if (datosBase[titulo] != null) {
					if (Object.prototype.toString.call(datosBase[titulo]) === "[object Date]") {
						var fecha = datosBase[titulo];
						columna = $("<td><label>" + fecha.getDate() + "/" + (fecha.getMonth() + 1).toString() + "/" + fecha.getFullYear() +"</label></td>");   		
					}
					else{
						var fecha = datosBase[titulo].toDate();
						columna = $("<td><label>" + fecha.getDate() + "/" + (fecha.getMonth() + 1).toString() + "/" + fecha.getFullYear() +"</label></td>");   		
					}
                  
                }
                else{
                  columna = $("<td></td>"); 
                }
              break;
              default:
                columna = $("<td><label>" + valorColumnaOrigen +"</label></td>"); 
                break;
            }
            fila.append(columna);
          });
          if (Buttons != undefined) {
            for (let index = 0; index < Buttons[ap].length; index++) {
              const element = Buttons[ap][index];
              let columna = "";
              columna = $('<td style="width: 5%;text-align: center;">');
              columna.append(element);
              fila.append(columna);            
            }      
          }
          
          tblBody.append(fila);
      }
  }
  obj.append(tblBody);
}

function Redireccionar(url) {
  window.location.href = url;
}

function EnviarWhatsApp(tipoMensaje,parametros) {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", "Bearer EAAc8ZBCT1yQsBOx2EfRnR3R3EQPb4u2uqIG6ZAhRYxAesJibXWZBCcQJd0N40BgR8aGa6pbb9zJPEOZCyUX5Td0lzobmnBnXKNmMCM3lYDeIseDnvoT96c9gVxZCV7HZC6kx7vAZBC60exjKh40nf9An6BnwUUBZC0thXuAiJZCU7C4LdBz2dZAUInzZCFXn1ocbQRxVK9hDZAOb873dTQ3leRkZD");
  fetch("https://graph.facebook.com/v17.0/117857114740889/messages", {
      method: 'POST',
      headers: myHeaders,
      body: SeleccionarTipoMensaje(tipoMensaje,parametros),
      redirect: 'follow'
      })
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
}

const keys = x => Object.getOwnPropertyNames(x).concat(Object.getOwnPropertyNames(x?.__proto__))
const isObject = v => Object.prototype.toString.call(v) === '[object Object]'
const classToObject = clss => keys(clss ?? {}).reduce((object, key) => {
  const [val, arr, obj] = [clss[key], Array.isArray(clss[key]), isObject(clss[key])]
  object[key] = arr ? val.map(classToObject) : obj ? classToObject(val) : val
  return object
}, {})

// let columna = $("<td style='width: 70%;'>" + datos.name +"</label></td>");
// let btnEditar = $("<a class='btnEditarGrupo material-icons' title='Editar'>edit</a>");
// btnEditar.on('click',()=>{
//   ChangeView(url)
// });
// columna = $('<td style="width: 10%;text-align: center;">');
// columna.append(btnEditar);
// fila.append(columna);

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
				MostrarMensaje(2,"El campo " + nomCampo + " no puede estar vacío",mensajePopup);
			}
			break;
		case 2:
			//Mayor a cero
			if (valor != '' && parseInt(valor) > 0) {
				banValidacion = true;
			}
			else{
				MostrarMensaje(2,"El campo " + nomCampo + " debe ser mayor a cero",mensajePopup);
			}
		break;
		case 3:
			//Lista con elementos
			if (valor != '' && parseInt(valor) > 0) {
				banValidacion = true;
			}
			else{
				MostrarMensaje(2,"El " + nomCampo + " debe contener al menos un elemento",mensajePopup);
			}
		break;
		case 4:
			//Correo
			let correo = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			if (valor != '' && correo.test(valor)) {
				banValidacion = true;
			}
			else{
				MostrarMensaje(2,"El " + nomCampo + " no es un correo válido",mensajePopup);
			}
		break;
		case 5:
			//Telefono
			let telelfono = /^\d{10}$/;
			if (valor != '' && telelfono.test(valor)) {
				banValidacion = true;
			}
			else{
				MostrarMensaje(2,"El teléfono debe tener 10 dígitos",mensajePopup);
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
				MostrarMensaje(2,"El campo imagen no es válido",mensajePopup);
			}
			banValidacion = isValidFile;
		break;
		case 7:
			//check
			if (valor != '' && parseInt(valor) > 0) {
				banValidacion = true;
			}
			else{
				MostrarMensaje(2,"El campo " + nomCampo + " debe ser seleccionado",mensajePopup);
			}
		break;
		case 8:
			//Fecha/hora
			let hora = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
			if (valor !='' && hora.test(valor)) {
				banValidacion = true;
			} else {
				MostrarMensaje(2,nomCampo + " no es un valor válido",mensajePopup);
			}
		break;
		case 9:
			//importe
			let importe = /^[0-9]{1,5}$|^[0-9]{1,5}\.[0-9]{1,2}$/;
			if (importe.test(valor)) {
				banValidacion = true;
			} else {
				MostrarMensaje(2,nomCampo + " no es un valor válido",mensajePopup);
			}
		break;
		case 10:
			//Fecha
			let fecha = /^([0-2][0-9]|3[0-1])(\/|-)(0[1-9]|1[0-2])\2(\d{4})$/;
			if (valor !='' && fecha.test(valor)) {
				banValidacion = true;
			} else {
				MostrarMensaje(2,"El campo " + nomCampo + " no es un valor válido",mensajePopup);
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
			MostrarMensaje(2,msjOpcional,mensajePopup);
		}
	}

return banValidacion;
}


function MostrarMensaje(tipo, mensaje,popUp){
	if (popUp) {
		$(".dvMensajePopUp").empty();
	} else {
		var estiloMsg = "";
		switch (tipo) {
			case 1:
				estiloMsg="success";
			break;
			case 2:
				estiloMsg="warning";
			break;
			case 3:
				estiloMsg="danger";
			break;
			default:
				break;
		}
		//$(".dvMensaje").empty();	
		MostrarMensajePrincipal(mensaje,estiloMsg);
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

function formatoMoneda(amount, decimalCount = 2, decimal = ".", thousands = ",") {
	try {
	  decimalCount = Math.abs(decimalCount);
	  decimalCount = isNaN(decimalCount) ? 2 : decimalCount;
  
	  const negativeSign = amount < 0 ? "-" : "";
  
	  let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
	  let j = (i.length > 3) ? i.length % 3 : 0;
  
	  return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
	} catch (e) {
	  console.log(e)
	}
  };

  function getUrlVars(){
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}


function validarAcceso(){
	// db.collection(url).doc(usuario.user.uid).get().then(data =>{
	// 	Empleado = data.data();
	// 	validarAcceso();
	// }).catch(error=>{
	// 	MostarMensaje(3,"Ocurrió un error al iniciar sesión",false);
	// })


	// if (Empleado == "") {
	// 	Empleado = EmpleadoGobal;
	// }
	var url="/Operatives";
	firebase.auth().onAuthStateChanged(function(user) {
	if (firebase.auth().currentUser != null) {
		db.collection(url).where("UserId","==",user.uid).get().then(data =>{
			Empleado = data.docs[0].data();
			if (Empleado != undefined) {
				parent.DatosCuentaUsusario = Empleado;//data.data();          
				// validarAcceso();
				// if (Empleado.IdOccupation != 4) {
				// 	switch (Empleado.position) {
				// 		case 0:
				// 			window.location.replace("index.html");
				// 		break;
				// 		case 1:
				// 			window.location.replace("index.html");
				// 		break;
				// 		case 2:
				// 			window.location.replace("index.html");
				// 		break;
				// 		case 3:
				// 			window.location.replace("index.html");
				// 		break;
				// 		default:
				// 			window.location.replace("index.html");
				// 		break;
				// 	}
				// } else {
				// 	window.location.replace("login.html?msj=3");
				// }
			}
			else{
				window.location.replace("login.html");
				return false;
			}
			
		}).catch(error=>{
			MostarMensaje(3,"Ocurrió un error al iniciar sesión",false);
		})

		} else {
			window.location.replace("login.html");
			return false;
		}
	});
}

function ObtenerDatosEmpresa(){
    // db.collection('restaurant').doc(idNombreRestauranteGlobal).get().then(data =>{// .collection(url).get().then(data =>{
    //     objRestaurant=data.data();
    //     sessionStorage.setItem('sesionRestaurante', JSON.stringify(objRestaurant));
    //     if (objRestaurant.ServiceActive == false) {
    //         window.location.replace("login.html");
    //         MostarMensaje(2,"Servicio suspendido por adeudo vencido",false);   
    //     }
    // });      
};

const LlenarModulos = function(){
	return new Promise(resolve => {
        setTimeout(() => {
        //$(".dvLoader").show();
	$(".dvModulos").empty();
	firebase.auth().onAuthStateChanged(function(user) {
	if(sessionStorage.getItem("sesionRestaurante") == null){
		ObtenerDatosEmpresa();
	}
		
	if (sessionStorage.getItem("sesionUsuario") && sessionStorage.getItem('sesionModulos')){
		//sessionStorage.getItem('sesionModulos');
		EmpleadoGobal = JSON.parse(sessionStorage.sesionUsuario);
		var objModulos = JSON.parse(sessionStorage.sesionModulos);
		$(".dvModulos").empty();
		for (let index = 0; index < objModulos.length; index++) {
			const dato = objModulos[index];
			
		
		//objModulos.forEach(element => {
				//var dato=element.data();   
				
				var path = $(location).attr("href");
				var btn ="";
				if (validarPagina(path,dato)) {
					if (path.indexOf(dato.Path) >= 0) {
						btn = $("<li class='nav-item active'><a class='nav-link' href='#'><i class='material-icons " + formatoUid(dato.Name) +"'>" + dato.Icon + "</i><span>" + dato.Name + "</span></a></li>");
					}
					else{
						btn = $("<li class='nav-item'><a class='nav-link' href='" + dato.Path + "'><i class='material-icons " + formatoUid(dato.Name) +"'>" + dato.Icon + "</i><span>" + dato.Name + "</span></a></li>");
					}
					//let btnModulo = $("<a class='dropdown-item ddlCocina' href='#' value='" + dato.uId +  "' text='" + dato.name +  "'>" + dato.name + "</a>");
					let btnModulo = btn;
						btnModulo.on('click',()=>{
							CambioCocina(dato);
						})					
					if($(".dvModulos").find("i").filter("." + formatoUid(dato.Name)).length == 0)
					{
						$(".dvModulos").append(btnModulo);	
					}
					
				}
			//});
		}
		resolve(true);
	}
	else{
		if (firebase.auth().currentUser != null) {
			var url= "/Operatives";
			db.collection(url).doc(firebase.auth().currentUser.uid).get().then(data =>{
				EmpleadoGobal = data.data();
				//sessionStorage.setItem('sesionUsuario', EmpleadoGobal);
				sessionStorage.setItem('sesionUsuario', JSON.stringify(EmpleadoGobal));
				var url= "/Modules";
				db.collection(url).where("Status","==",true).orderBy("DisplayOrder").get().then(data =>{        
				
				// sessionStorage.setItem('sesionModulos', data);
				var lstModulos = [];
				var lstModulosDir = [];
				data.docs.forEach(element => {
					var dato=element.data();   
					var menuCategoria = "";
					menuCategoria += "<div class='sidebar-heading'>";
                    menuCategoria += "Administración";
					menuCategoria += "</div>";
					if (lstModulosDir.indexOf(dato.Path) == -1) {
						var path = $(location).attr("href");
						var btn ="";
						if (validarPagina(path,dato)) {
							if (path.indexOf(dato.Path) >= 0) {
								btn = $("<li class='nav-item active'><a class='nav-link' href='#'><i class='material-icons " + formatoUid(dato.Name) +"'>" + dato.Icon + "</i><span>" + dato.Name + "</span></a></li>");
							}
							else{
								btn = $("<li class='nav-item'><a class='nav-link' href='" + dato.Path + "'><i class='material-icons " + formatoUid(dato.Name) +"'>" + dato.Icon + "</i><span>" + dato.Name + "</span></a></li>");
							}
							//let btnModulo = $("<a class='dropdown-item ddlCocina' href='#' value='" + dato.uId +  "' text='" + dato.name +  "'>" + dato.name + "</a>");
							let btnModulo = btn;
								btnModulo.on('click',()=>{
									CambioCocina(dato);
								})
							if($(".dvModulos").find("i").filter("." + formatoUid(dato.Name)).length == 0){
								//$(".dvModulos").append(btnModulo);	
								menuCategoria.append(btnModulo);	
							}
							lstModulos.push(dato);
							lstModulosDir.push(dato.Path)
						}
					}
				});
				$(".dvModulos").append(menuCategoria);	
				sessionStorage.setItem('sesionModulos', JSON.stringify(lstModulos));
				resolve(true);
			//$(".dvLoader").hide();  
		});
				//validarAcceso();
			}).catch(error=>{
				window.location.replace("login.html?msj=3");
			})
		}
		else{
			window.location.replace("login.html?msj=3");
		}
	}
// 	<li class="nav-item active"><a class="nav-link" href="cocinas.html"><i class="material-icons">food_bank</i><span>Cocinas</span></a></li>
		
	});
        
    }, 0);
    });
}
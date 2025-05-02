const TipoMensajeWhatsApp = {
    Confirmacion: 1,
}

function SeleccionarTipoMensaje(tipoMensaje,parametros) {
    var cuerpoMensaje = "";
    switch (tipoMensaje) {
        case TipoMensajeWhatsApp.Confirmacion:
            cuerpoMensaje = CrearMensajeConfirmacion(parametros);
            break;
    
        default:
            break;
    }
    return cuerpoMensaje;
}

function CrearMensajeConfirmacion(parametros){
    var lstParametros = [];
    parametros.forEach(parametro => {
        //Object.assign(lstParametros,{"type": "text","text": parametro});
        lstParametros.push({"type": "text","text": parametro});
    });

    return JSON.stringify({
        "messaging_product": "whatsapp",
        "to": "525528563562",
        "type": "template",
        "template": {
            "name": "confirmacion",
            "language": {
            "code": "es",
            },
            "components": [
                {
                    "type": "BODY",
                    "parameters": JSON.stringify(lstParametros)
                }
            ]
        }
    });

    // "parameters": [
    //     {
    //         "type": "text",
    //         "text": saludo
    //     },
    //     {
    //         "type": "text",
    //         "text": cita
    //     },

    // ]
}
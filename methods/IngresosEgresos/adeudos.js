var urlDebtsGlobal = "/Debts";
const GuardarDatosAdeudo = async function(objAdeudo, operacion, idDebt){
    return new Promise(resolve => {setTimeout(async function(){
        QuitarMensaje();
        if (operacion == 0){
            resolve(await insertDb(urlDebtsGlobal,objAdeudo));
        } else {
            resolve(await updateDb(urlDebtsGlobal,idDebt,objAdeudo));
        }
    }, 250);});
};
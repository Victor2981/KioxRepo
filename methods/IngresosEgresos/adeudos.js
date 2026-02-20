var urlDebtsGlobal = "/Debts";
const GuardarDatosAdeudo = async function(ctrl,objAdeudo, operacion, idDebt){
    return new Promise(resolve => {setTimeout(async function(){
        QuitarMensaje();
        if (operacion == 0){
            resolve(await insertDb(ctrl,urlDebtsGlobal,objAdeudo));
        } else {
            resolve(await updateDb(ctrl,urlDebtsGlobal,idDebt,objAdeudo));
        }
    }, 250);});
};
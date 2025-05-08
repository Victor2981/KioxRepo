
const PaymentTypeFilter = {
    Efectivo: 0,
    Transferencia: 1,
    Tarjeta: 3
}

$(document).ready(async function(){       

    await SeleccionarTotalIngresos(PaymentTypeFilter.Efectivo);

});

const SeleccionarTotalIngresos = async function(FormaPago){
    $(".dvLoader").show();
    return new Promise(resolve => {setTimeout(async function(){
        db.collection(urlEarningsGlobal).where("PaymentType","==",FormaPago).aggregate(sum("population")).get().then((obj)=>{
            resolve(obj.data());
        }).catch(error=>{
            resolve(null);
            alert("error");
        });
    })});
};
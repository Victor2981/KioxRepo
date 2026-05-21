var urlBranchesGlobal = "/Branches"

const SeleccionarDatosSucursales = async function(){
    $(".dvLoader").show();
    parent.lstSucursalesGlobal = {};
    let consultadb = db.collection(urlBranchesGlobal).where("Status", "==", 1);

    await consultadb.onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
            if (change.type === "added") {
                var id = change.doc.id;
                var datos = change.doc.data();
                var sucursal = {[id]:datos};
                Object.assign(parent.lstSucursalesGlobal,sucursal);
            }
            if (change.type === "modified") {
                var id = change.doc.id;
                var datos = change.doc.data();
                var sucursal = {[id]:datos};
                Object.assign(parent.lstSucursalesGlobal,sucursal);
            }
            if (change.type === "removed") {
                delete parent.lstSucursalesGlobal[change.doc.id];
            }
        });
    });
    $(".dvLoader").hide();
};
var lstPatientsGlobal = {};
var lstIdPatientsFiltroGlobal = [];
var lstPatientsFiltroGlobal = [];
var lstCategoriesGlobal = {};
var lstEmployeesGlobal = {};
var lstServicesGlobal = {};
var lstServicesFiltroGlobal = [];
var lstPacksGlobal = {};
var lstSpecialPriceGlobal = {};
var lstAppointmentsGlobal = {};
var lstEgresosGlobal = {};
var lstQrGlobal = {};
var lstAppointmentsHistoryGlobal = {};
var lstIngresosGlobal = {};
var idSucursal = "DelValle";
var urlGlobal = "/Kiox/"+ parent.idSucursal
var idUsuarioSistema = "";
var lstConceptosPago = {};
var tipoConceptoCobro = 0;
var DatosCuentaUsusario = {};
var version = "1";

const KioxPositions = {
    Administrador: 1,
	Fisioterapeuta: 2,
    Recepcion: 3,
	Practicantes: 4,
}

function addScript(src) {
    var s = document.createElement( 'script' );
    s.setAttribute( 'src', src );
    document.body.appendChild( s );
}

// db.collection("/Patients").onSnapshot(function(snapshot) {
//     snapshot.docChanges().forEach(function(change) {
        
//         if (change.type === "added") {
//             var id = change.doc.id;
//             var datos = change.doc.data();
//             lstPatientsFiltroGlobal.push({[id]:{datos}});
//             var datos = {[id]:datos};
//             Object.assign(lstPatientsGlobal,datos);                
//         }
//         if (change.type === "modified") {
//             var id = change.doc.id;
//             var datos = change.doc.data();
//             lstPatientsFiltroGlobal.push({[id]:{datos}});
//             var datos = {[id]:datos};
//             Object.assign(lstPatientsGlobal,datos);                
//         }
//     });
   
// });
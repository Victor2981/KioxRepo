// function selectDb(url,id){
//     return new Promise(resolve => {setTimeout(async function(){
//         db.collection(url).doc(id).get().then((obj)=>{
//             resolve(obj.data());
//         }).catch(error=>{
//             resolve(null);
//             alert("error");
//         });
//     })});
// }

async function selectDb(url,id){
    try{
        const doc = await db.collection(url).doc(id).get();
        const data = doc.exists ? doc.data() : null;

        await saveLog({
            user: getCurrentUser(),
            action: "SELECT",
            collection: url,
            docId: id,
            before: null,
            after: null,
            success: true,
            error: null,
            date: firebase.firestore.FieldValue.serverTimestamp()
        });

        return data;
    }catch(error){

        await saveLog({
            user: getCurrentUser(),
            action: "SELECT",
            collection: url,
            docId: id,
            success: false,
            error: error.toString(),
            date: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert("error");
        return null;
    }
}


// function insertDb(url,obj){
//     return new Promise(resolve => {setTimeout(async function(){
//         db.collection(url).add(obj).then((e)=>{
//             resolve(e.id);
//         }).catch(error=>{
//             resolve(false);
//             alert("error");
//         });
//     })});
// }

async function insertDb(url,obj){
    try{
        const ref = await db.collection(url).add(obj);

        await saveLog({
            user: getCurrentUser(),
            action: "INSERT",
            collection: url,
            docId: ref.id,
            before: null,
            after: obj,
            success: true,
            error: null,
            date: firebase.firestore.FieldValue.serverTimestamp()
        });

        return ref.id;
    }catch(error){

        await saveLog({
            user: getCurrentUser(),
            action: "INSERT",
            collection: url,
            docId: null,
            after: obj,
            success: false,
            error: error.toString(),
            date: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert("error");
        return false;
    }
}


// function updateDb(url,id,obj){
//     return new Promise(resolve => {setTimeout(async function(){
//         db.collection(url).doc(id).set(obj).then(()=>{
//             resolve(true);
//         }).catch(error=>{
//             resolve(false);
//             alert("error");
//         });
//     })});
// }

async function updateDb(url,id,obj){
    try{
        const beforeDoc = await db.collection(url).doc(id).get();
        const beforeData = beforeDoc.exists ? beforeDoc.data() : null;

        await db.collection(url).doc(id).set(obj);

        await saveLog({
            user: getCurrentUser(),
            action: "UPDATE",
            collection: url,
            docId: id,
            before: beforeData,
            after: obj,
            success: true,
            error: null,
            date: firebase.firestore.FieldValue.serverTimestamp()
        });

        return true;
    }catch(error){

        await saveLog({
            user: getCurrentUser(),
            action: "UPDATE",
            collection: url,
            docId: id,
            after: obj,
            success: false,
            error: error.toString(),
            date: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert("error");
        return false;
    }
}


// function deleteDb(url,id){
//     return new Promise(resolve => {setTimeout(async function(){
//         db.collection(url).doc(id).delete().then(()=>{
//             resolve(true);
//         }).catch(error=>{
//             resolve(false);
//             alert("error");
//         });
//     })});
// }

async function deleteDb(url,id){
    try{
        const beforeDoc = await db.collection(url).doc(id).get();
        const beforeData = beforeDoc.exists ? beforeDoc.data() : null;

        await db.collection(url).doc(id).delete();

        await saveLog({
            user: getCurrentUser(),
            action: "DELETE",
            collection: url,
            docId: id,
            before: beforeData,
            after: null,
            success: true,
            error: null,
            date: firebase.firestore.FieldValue.serverTimestamp()
        });

        return true;
    }catch(error){

        await saveLog({
            user: getCurrentUser(),
            action: "DELETE",
            collection: url,
            docId: id,
            success: false,
            error: error.toString(),
            date: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert("error");
        return false;
    }
}


async function saveLog(data){
    try{
        await db.collection("DbLogs").add(data);
    }catch(e){
        console.error("Error guardando log:", e);
    }
}

function getCurrentUser(){
    try{
        return JSON.parse(sessionStorage.sesionUsuario).Name || "Desconocido";
    }catch(e){
        return "Desconocido";
    }
}


function selectDb(url,id){
    return new Promise(resolve => {setTimeout(async function(){
        db.collection(url).doc(id).get().then((obj)=>{
            resolve(obj.data());
        }).catch(error=>{
            resolve(null);
            alert("error");
        });
    })});
}


function insertDb(url,obj){
    return new Promise(resolve => {setTimeout(async function(){
        db.collection(url).add(obj).then((e)=>{
            resolve(e.id);
        }).catch(error=>{
            resolve(false);
            alert("error");
        });
    })});
}

function updateDb(url,id,obj){
    return new Promise(resolve => {setTimeout(async function(){
        db.collection(url).doc(id).set(obj).then(()=>{
            resolve(true);
        }).catch(error=>{
            resolve(false);
            alert("error");
        });
    })});
}

function deleteDb(url,obj){
    return new Promise(resolve => {setTimeout(async function(){
        db.collection(url).doc(uidGrupo).delete(objGrupo).then(()=>{
            resolve(true);
        }).catch(error=>{
            resolve(false);
            alert("error");
        });
    })});
}
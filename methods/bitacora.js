
async function buscarBitacora(){

    const inicio = $("#fechaInicio").val();
    const fin = $("#fechaFin").val();
    const texto = filtroTexto.value.toLowerCase();

    let ref = db.collection("DbLogs");

    if(inicio){
        let i = new Date(inicio);
        i.setHours(0,0,0);
        ref = ref.where("date", ">=", fechaLocal(inicio));
    }
    
    if(fin){
        let f = new Date(fin);
        f.setHours(23,59,59);
        ref = ref.where("date", "<=", fechaLocal(fin, true));
    }
    
    let html="";
    let total=0;
    const snap = await ref.orderBy("date","desc").limit(300).get();
    snap.forEach(doc=>{
        const d = doc.data();
        if(!texto ||
            (d.user && d.user.toLowerCase().includes(texto)) ||
            (d.collection && d.collection.toLowerCase().includes(texto))
         ){
             total++;
 
             html += `
             <tr>
                 <td>${d.date?.toDate().toLocaleString()}</td>
                 <td>${d.user}</td>
                 <td>${d.action}</td>
                 <td>${d.collection}</td>
                 <td>${d.docId || "-"}</td>
                 <td>${d.success ? "✔️" : "❌"}</td>
                 <td>
                     <button class="detalle-btn" onclick='verDetalle(${JSON.stringify(d)})'>Ver</button>
                 </td>
             </tr>`;
         }
    });

    tablaBitacora.querySelector("tbody").innerHTML=html;
    totalRegistros.innerText=total;
}

function verDetalle(data){
    detalleJson.textContent = JSON.stringify(data,null,2);
    modalDetalle.style.display="block";
}

function cerrarModal(){
    modalDetalle.style.display="none";
}
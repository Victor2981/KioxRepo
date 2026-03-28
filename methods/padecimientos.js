function insertarMedicalCondition(name, status  ) {
  db.collection("MedicalConditions").add({
    Name: name,
    Status: status
  })
  .then(function(docRef) {
    console.log("Documento creado con ID:", docRef.id);
  })
  .catch(function(error) {
    console.error("Error al insertar:", error);
    return null;
  });
}

function obtenerMedicalConditions() {
  db.collection("MedicalConditions").get()
    .then(function(querySnapshot) {
      return querySnapshot;
    })
    .catch(function(error) {
      console.log("Error al leer:", error);
      return null;
    });
}

function obtenerMedicalConditionPorId(id) {
  db.collection("MedicalConditions").doc(id).get()
    .then(function(doc) {
      if (doc.exists) {
        return doc.data();
      } else {
        console.log("No existe el documento");
        return null;
      }
    })
    .catch(function(error) {
      console.log("Error:", error);
      return null;
    });
}

async function obtenerPorStatus(status) {
  return db.collection("MedicalConditions").where("Status", "==", status).orderBy("Name", "asc").get().then(function(querySnapshot) {
      return querySnapshot.docs;
    }).catch(function(error) {
      console.log("Error:", error);
      return null;
    });
}

function insertarMedicalRecord(data) {
  return db.collection("MedicalRecords").add(data)
  .then(function(docRef) {
    return docRef.id;
  })
  .catch(function(error) {
    return null;
  });
}

function insertarMedicalRecordConId(id, data) {
  return db.collection("MedicalRecords").doc(id).set(data)
  .then(function() {
    return { ok: true, id: id };
  })
  .catch(function(error) {
    return { ok: false, error: error };
  });
}

function obtenerMedicalRecords() {
  return db.collection("MedicalRecords").get()
    .then(function(querySnapshot) {
      var records = [];

      querySnapshot.forEach(function(doc) {
        records.push({
          id: doc.id,
          IdPatient: doc.data().IdPatient,
          IdService: doc.data().IdService,
          IdMedicalCondition: doc.data().IdMedicalCondition,
          MedicalDischarge: doc.data().MedicalDischarge
        });
      });

      return {
        ok: true,
        total: records.length,
        data: records
      };
    })
    .catch(function(error) {
      return {
        ok: false,
        error: error
      };
    });
}

function obtenerMedicalRecordPorId(id) {
  return db.collection("MedicalRecords").doc(id).get()
    .then(function(doc) {
      if (!doc.exists) {
        return { ok: false, message: "No existe" };
      }

      return {
        ok: true,
        data: {
          id: doc.id,
          IdPatient: doc.data().IdPatient,
          IdService: doc.data().IdService,
          IdMedicalCondition: doc.data().IdMedicalCondition,
          MedicalDischarge: doc.data().MedicalDischarge
        }
      };
    })
    .catch(function(error) {
      return {
        ok: false,
        error: error
      };
    });
}

function obtenerPorPaciente(idPatient) {
  return db.collection("MedicalRecords")
    .where("IdPatient", "==", idPatient)
    .get()
    .then(function(querySnapshot) {
      var records = [];

      querySnapshot.forEach(function(doc) {
        records.push({
          id: doc.id,
          IdPatient: doc.data().IdPatient,
          IdService: doc.data().IdService,
          IdMedicalCondition: doc.data().IdMedicalCondition,
          MedicalDischarge: doc.data().MedicalDischarge
        });
      });

      return {
        ok: true,
        total: records.length,
        data: records
      };
    })
    .catch(function(error) {
      return {
        ok: false,
        error: error
      };
    });
}

function obtenerPorPacienteYServicio(idPatient, idService) {
  return db.collection("MedicalRecords")
    .where("IdPatient", "==", idPatient)
    .where("IdService", "==", idService)
    .get()
    .then(function(querySnapshot) {
      var records = [];

      querySnapshot.forEach(function(doc) {
        records.push({
          id: doc.id,
          IdPatient: doc.data().IdPatient,
          IdService: doc.data().IdService,
          IdMedicalCondition: doc.data().IdMedicalCondition,
          MedicalDischarge: doc.data().MedicalDischarge
        });
      });

      return {
        ok: true,
        total: records.length,
        data: records
      };
    })
    .catch(function(error) {
      return {
        ok: false,
        error: error
      };
    });
}

function obtenerPorPacientePorServicioActivo(idPatient, idMedicalCondition) {
  return db.collection("MedicalRecords")
    .where("IdPatient", "==", idPatient)
    .where("IdMedicalCondition", "==", idMedicalCondition)
    .where("MedicalDischarge", "==", false)
    .get()
    .then(function(querySnapshot) {
      if (querySnapshot.docs.length > 0) {
        const datos = querySnapshot.docs[0].data()
        if (datos.MedicalDischarge === false) {
            banExpedienteActivo = true;
            return querySnapshot.docs[0];
        }     
      }
      else{
        return null;
      }
    })
    .catch(function(error) {
      return null
    });
}

function obtenerPadecimientoActivoPorPaciente(idPatient) {
  return db.collection("MedicalRecords")
    .where("IdPatient", "==", idPatient)
    .where("MedicalDischarge", "==", false)
    .get()
    .then(function(querySnapshot) {
      if (querySnapshot.docs.length > 0) {
       return querySnapshot.docs[0].data().IdMedicalCondition;
      }
      return null;
    })
    .catch(function(error) {
      return null
    });
}
// const admin = require("firebase-admin");

// admin.initializeApp({
//     credential: admin.credential.cert(require("./serviceAccountKey.json"))
// });

// const db = admin.firestore();


async function actualizarUltimoTerapeuta() {
    try {

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const sixMonthsAgoTimestamp =
        dbCompleto.firestore.Timestamp.fromDate(sixMonthsAgo);

        console.log(
            `Buscando citas desde ${sixMonthsAgo.toISOString()}`
        );

        const snapshot = await db
            .collection("Appointment")
            .where(
                "AppointmentDateStart",
                ">=",
                sixMonthsAgoTimestamp
            )
            .where("Status", "in", [
                StatusAppointment.Finalizado,
                StatusAppointment.Pagado
            ])
            .orderBy("AppointmentDateStart", "desc")
            .get();

        console.log(`Citas encontradas: ${snapshot.size}`);

        // Mapa: PatientId -> Último EmployeeId
        const pacientes = new Map();

        snapshot.forEach(doc => {
            const cita = doc.data();

            if (
                cita.IdPatient &&
                cita.IdEmployee &&
                !pacientes.has(cita.IdPatient)
            ) {
                pacientes.set(
                    cita.IdPatient,
                    cita.IdEmployee
                );
            }
        });

        console.log(
            `Pacientes únicos encontrados: ${pacientes.size}`
        );

        let batch = db.batch();
        let operaciones = 0;
        let actualizados = 0;

        for (const [idPatient, idEmployee] of pacientes.entries()) {


            if (parent.lstPatientsGlobal[idPatient] != undefined)
            {
                const patientRef = db
                .collection("Patients")
                .doc(idPatient);
                batch.update(patientRef, {
                    IdLastEmployeeAtendent: idEmployee
                });
    
                operaciones++;
                actualizados++;
            }
            

            if (operaciones === 500) {
                await batch.commit();

                console.log(
                    `Actualizados hasta ahora: ${actualizados}`
                );

                batch = db.batch();
                operaciones = 0;
            }

            // console.log(
            //     `Paciente: ${idPatient} -> Empleado: ${idEmployee}`
            // );
        }

        if (operaciones > 0) {
            await batch.commit();
        }

        console.log(
            `Proceso terminado. Total actualizados: ${actualizados}`
        );

    } catch (error) {
        console.error("Error:", error);
    }
}

actualizarUltimoTerapeuta();
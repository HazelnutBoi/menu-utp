const admin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    if (req.method !== 'POST') {
        return res.status(405).send({ success: false, message: "Método no permitido." });
    }

    if (req.query.secret !== process.env.CRON_SECRET) {
        return res.status(403).send({ success: false, message: "Acceso denegado. Clave secreta incorrecta." });
    }

    try {
        const today = new Date();
        const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const docRef = db.collection("views").doc(dateString);
        
        await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(docRef);
            if (!doc.exists) {
                transaction.set(docRef, { count: 1 });
            } else {
                const newCount = doc.data().count + 1;
                transaction.update(docRef, { count: newCount });
            }
        });

        console.log(`Visita registrada para el día: ${dateString}`);
        return res.status(200).send({ success: true, message: "Visita registrada." });
    } catch (error) {
        console.error("Error al registrar la visita:", error);
        return res.status(500).send({ success: false, message: "Error al registrar la visita." });
    }
};


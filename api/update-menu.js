const admin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

module.exports = async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    if (req.query.secret !== process.env.CRON_SECRET) {
        return res.status(403).send({ success: false, message: "Acceso denegado. Clave secreta incorrecta." });
    }

    try {
        const menuRef = db.collection("menus").doc("menuHoy");
        const doc = await menuRef.get();
        
        if (!doc.exists) {
            return res.status(200).send({ success: true, message: "Menú no encontrado." });
        }

        const items = doc.data().items || [];
        let updated = false;
        
        const updatedItems = items.map(item => {
            if (item.esProximo && item.readyAt <= Date.now()) {
                updated = true;
                delete item.esProximo;
                delete item.readyAt;
                return item;
            } else {
                return item;
            }
        });
        
        if (updated) {
            await menuRef.update({ items: updatedItems });
            console.log("Menú actualizado: plato(s) movido(s) a la sección principal.");
        } else {
            console.log("No se encontraron platos para actualizar.");
        }

        return res.status(200).send({ success: true, message: "Lógica de actualización de menú ejecutada." });

    } catch (error) {
        console.error("Error en la API de actualización:", error);
        return res.status(500).send({ success: false, message: "Error en la API de actualización." });
    }
};

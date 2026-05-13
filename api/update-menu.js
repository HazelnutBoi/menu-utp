const admin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();

module.exports = async (req, res) => {
    if (req.query.secret !== process.env.CRON_SECRET) return res.status(403).send({ success: false });

    try {
        const menuRef = db.collection("menus").doc("menuHoy");
        const doc = await menuRef.get();
        if (!doc.exists) return res.status(200).send({ success: true });

        const items = doc.data().items || [];
        let updated = false;
        
        const updatedItems = items.map(item => {
            if (item.esProximo && item.readyAt <= Date.now()) {
                updated = true;
                const { esProximo, readyAt, ...resto } = item;
                return resto;
            }
            return item;
        });
        
        if (updated) await menuRef.update({ items: updatedItems });
        return res.status(200).send({ success: true });
    } catch (error) {
        return res.status(500).send({ success: false, error: error.message });
    }
};

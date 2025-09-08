// api/track-view.js

const admin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://menu-cafeteria-crpo-default-rtdb.firebaseio.com"
  });
}

const db = admin.database();

module.exports = async (req, res) => {
  try {
    const date = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
    const viewsRef = db.ref(`analytics/views/${date}`);
    await viewsRef.transaction((currentValue) => {
      return (currentValue || 0) + 1;
    });

    return res.status(200).send({ message: "Vista registrada" });
  } catch (error) {
    console.error("Error al registrar la vista:", error);
    return res.status(500).send({ message: "Error al registrar la vista" });
  }
};

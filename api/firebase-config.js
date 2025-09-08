// api/firebase-config.js
    
module.exports = (req, res) => {
  // Obtener la clave secreta de la URL
  const secret = req.query.secret;

  // Comparar con la clave secreta de Vercel
  if (secret !== process.env.FIREBASE_CONFIG_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const config = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
  };
  res.status(200).json(config);
};

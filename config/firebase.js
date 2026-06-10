const admin = require('firebase-admin');
const serviceAccount = require('./nexora-6988-firebase-adminsdk-fbsvc-1116c56090.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

module.exports = admin;
const admin = require('firebase-admin');
const serviceAccount = require('./../utils/initFirebase/safaridew-app-firebase-adminsdk-qpuu8-5dd405f8b6.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'gs://safaridew-app.appspot.com',
    });
}

const bucket = admin.storage().bucket();

module.exports = { bucket };

// pushNotificationController.js

const webpush = require('web-push');
const dotenv = require('dotenv');

dotenv.config();

// Générer les clés VAPID
const vapidKeys = webpush.generateVAPIDKeys();
const publicKey = vapidKeys.publicKey;
const privateKey = vapidKeys.privateKey;

// Afficher les clés VAPID dans la console
// console.log('Public VAPID key:', publicKey);
// console.log('Private VAPID key:', privateKey);

// Configurer les clés VAPID pour web-push
webpush.setVapidDetails(
    'mailto:your-email@example.com', // Votre adresse email
    publicKey,
    privateKey,
);

// Exporter les clés VAPID et la méthode d'abonnement
module.exports = {
    publicKey,
    privateKey,
    getVapidPublicKey: () => publicKey,
};

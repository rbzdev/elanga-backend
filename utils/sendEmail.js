const nodemailer = require('nodemailer');

// Fonction pour envoyer des emails
async function sendEmail(mailOptions) {
    // Créer un transporteur pour envoyer des e-mails en utilisant un serveur SMTP
    const transporter = nodemailer.createTransport({
        host: 'smtp.office365.com', // Adresse IP ou nom d'hôte du serveur SMTP
        port: 587, // Port du serveur SMTP
        secure: false, // true pour utiliser TLS, false pour utiliser SMTP
        auth: {
            user: process.env.MICROSOFT_AUTH,
            pass: process.env.MICROSOFT_PASS,
        },
    });

    try {
        // Envoyer l'e-mail
        const info = transporter.sendMail(mailOptions);
        console.log('E-mail envoyé: ' + info.response);
        return {
            message: 'Email sent!',
            messageId: info.messageId,
        };
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Error sending email: ' + error.message);
    }
}

module.exports = sendEmail;

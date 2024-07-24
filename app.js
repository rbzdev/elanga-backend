require('dotenv').config();

const express = require('express'); 
const app = express();
const mongoose = require('mongoose');
app.use(express.json());
const PORT = process.env.PORT || 3500;
const path = require('path');
const axios = require('axios');
const User = require('./models/User')

const fileUpload = require('express-fileupload');
app.use(fileUpload()); // Middleware express-fileupload

const sendEmail = require('./utils/sendEmail');
const userRoutes = require('./routes/user');
const objetRoutes = require('./routes/things');
const shopRoutes = require('./routes/shop');
const articlesRoutes = require('./routes/articles');
const pushNotificationController = require('./controllers/pushNotificationController');
const { uploadPhotos } = require('./controllers/uploadPhotosController')
const Article = require('./models/Articles')


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization',
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

const mongo_connect = process.env.MONGODB_CONNECT;

// const admin = require('firebase-admin');
// const serviceAccount = require('./utils/initFirebase/safaridew-app-firebase-adminsdk-qpuu8-5dd405f8b6.json');

// const bucket = admin.storage().bucket();

mongoose
    .connect(`${mongo_connect}`, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use('/api/user', userRoutes);
app.use('/api/objet', objetRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/articles', articlesRoutes);

app.get('/', (req, res, next) => {
    res.json({ message: 'Hello wordl!' });
});

// Route pour exposer la clé publique VAPID
app.get('/api/vapidPublicKey', (req, res) => {
    const publicKey = pushNotificationController.getVapidPublicKey();
    res.json({ publicKey });
});

// app.post('/sendmail', async (req, res, next) => {
//     const email = req.body.email;
//     const content = req.body.content;

//     const mailOptions = {
//         from: 'ELANGA TEST <rubuzolivier2@gmail.com>',
//         to: email,
//         subject: 'Inscription reussie ✔', 
//         text: content,
//     };

//     try {
//         const result = await sendEmail(mailOptions); // utilisation de await
//         res.status(200).json(result);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }  
// });


app.get('/api/user/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ message: 'Server error' });
    }
});




app.listen(PORT, () => console.log(`Serveur est démarré sur le port ${PORT}`));

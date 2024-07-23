const Shop = require('../models/Shop');
const jwt = require('jsonwebtoken');

const admin = require('firebase-admin');

const { uploadPhotos } = require('./uploadPhotosController');
const serviceAccount = require('./../utils/initFirebase/safaridew-app-firebase-adminsdk-qpuu8-5dd405f8b6.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'safaridew-app.appspot.com',
    });
}

const bucket = admin.storage().bucket();

exports.createShop = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.userId;

        const shopObject = new Shop({
            ...req.body,
            owner: userId,
        });

        shopObject
            .save()
            .then(() => res.status(201).json({ message: 'Boutique créée avec succès!' }))
            .catch((error) => res.status(400).json({ error }));
    } catch (error) {
        res.status(401).json({ error: 'Requête non authentifiée!' });
    }
};

exports.deleteShop = (req, res, next) => {
    Shop.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Boutique supprimée!' }))
        .catch((error) => res.status(400).json({ error }));
};

exports.getAllShops = (req, res, next) => {
    Shop.find()
        .then((shopList) => res.status(200).json({ shopList }))
        .catch((error) => res.status(400).json({ error }));
};

exports.updateShop = (req, res, next) => {
    const updatedFields = { ...req.body };
    delete updatedFields.creationDate; // Assurer que creationDate ne soit pas modifié

    Shop.findOneAndUpdate(
        { _id: req.params.id },
        updatedFields,
        { new: true, runValidators: true }
    )
    .then((updatedShop) => {
        if (!updatedShop) {
            return res.status(404).json({ error: 'Shop not found' });
        }
        res.status(200).json(updatedShop);
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.getOne = (req, res, next) => {
    try {
        const shopId = req.params.id; // Récupère l'ID du shop depuis les paramètres de l'URL

        Shop.findOne({ _id: shopId }) // Correction ici
            .then((shop) => {
                if (!shop) {
                    return res.status(404).json({ error: 'Shop not found' });
                }
                res.status(200).json({ shop });
            })
            .catch((error) => res.status(400).json({ error }));
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getUserShops = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.userId;

        Shop.find({ owner: userId })
            .then((shops) => res.status(200).json({ shops }))
            .catch((error) => res.status(400).json({ error }));
    } catch (error) {
        res.status(401).json({ error: 'Requête non authentifiée!' });
    }
};




// exports.uploadShopLogo = async (req, res) => {
//     try {
//         console.log('Request body:', req.body); 
//         console.log('Request files:', req.files);

//         const shopId = req.body.shopId; // Assurez-vous que l'ID du shop est bien reçu
//         const photo = req.files.photo; // Assurez-vous que le fichier est bien reçu

//         if (!shopId || !photo) {
//             return res.status(400).json({ error: 'Shop ID or photo missing' });
//         }

//         res.status(200).json({
//             message: 'Data received successfully',
//             shopId,
//             fileName: photo.name,
//             fileType: photo.mimetype,
//             fileSize: photo.size
//         });
//     } catch (error) {
//         console.error('Error in uploadShopLogo:', error);
//         res.status(500).json({ error: 'Server error' });
//     }
// };






exports.uploadShopLogo = async (req, res) => {
    const prefix = 'shop-logos';
    try {
        // Vérification du token JWT
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.userId;
        const shopId = req.body.shopId; // Assurez-vous que l'ID du shop est fourni dans les paramètres de la route

        // Upload de la photo
        const photoUrls = await uploadPhotos(req, res, bucket, prefix);

        if (photoUrls.length > 0) {
            const logoUrl = photoUrls[0]; 

            // Mise à jour du logo du shop dans la base de données
            await Shop.findByIdAndUpdate(shopId, { logo: logoUrl });

            res.status(200).json({ message: 'Logo uploaded successfully', logo: logoUrl });
        } else {
            res.status(500).json({ message: 'Failed to upload logo' });
        }
    } catch (error) {
        console.error('Error uploading shop logo:', error);
        res.status(200).json({ error: 'Failed to upload shop logo' });
    }
};
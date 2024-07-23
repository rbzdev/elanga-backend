// uploadPhotosController.js

const sharp = require('sharp');
const pathModule = require('path');

// Fonction pour gérer l'upload de photos
const uploadPhotos = async (req, res, bucket, prefix = '') => {
    try {
        if (!req.files || !req.files.photo) {
            return res.status(400).send('No photo uploaded.');
        }

        const photos = Array.isArray(req.files.photo) ? req.files.photo : [req.files.photo];
        const photoUrls = [];

        for (const photo of photos) {
            // Utilisez sharp pour convertir l'image en PNG
            const pngBuffer = await sharp(photo.data)
                .resize({ fit: 'inside', width: 800 }) // Redimensionnez si nécessaire
                .toFormat('png')
                .toBuffer();

            // Générez un nom de fichier unique avec l'extension .png
            const fileName = `${prefix}${prefix && '/'}${Date.now()}-${pathModule.parse(photo.name).name}.png`; // Utilisation de `prefix` pour le chemin
            const file = bucket.file(fileName);

            // Téléchargez le fichier PNG vers Firebase Storage
            await file.save(pngBuffer, {
                contentType: 'image/png',
                public: true, // Rendre le fichier accessible publiquement
                metadata: {
                    metadata: {
                        // Ajoutez ici toutes les métadonnées supplémentaires que vous souhaitez
                    }
                }
            });

            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
            photoUrls.push(publicUrl); // Ajouter l'URL publique à photoUrls
        }

        // Retourner photoUrls pour pouvoir l'utiliser dans le contrôleur appelant
        return photoUrls;
    } catch (error) {
        console.error('Error uploading photo to Firebase Storage:', error);
        res.status(500).json({ error: 'Failed to upload photos.' });
        throw error; // Renvoyer l'erreur pour une gestion ultérieure si nécessaire
    }
};

module.exports = { uploadPhotos };

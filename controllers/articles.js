const Articles = require('./../models/Articles');
const jwt = require('jsonwebtoken');
const { uploadPhotos } = require('./uploadPhotosController');
const admin = require('firebase-admin');
const serviceAccount = require('./../utils/initFirebase/safaridew-app-firebase-adminsdk-qpuu8-5dd405f8b6.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'safaridew-app.appspot.com',
    });
}

const bucket = admin.storage().bucket();

exports.addArticles = async (req, res, next) => {
    const prefix = 'articlesImg'; // Préfixe spécifié manuellement

    try {
        // Upload des photos et récupération des URLs
        const photoUrls = await uploadPhotos(req, res, bucket, prefix);
        
        // Vérification du token JWT
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.userId;

        // Création de l'objet Articles avec les URLs des images
        const artObject = new Articles({
            ...req.body,
            image: photoUrls, // Utilisation des URLs des images
            owner: userId,
        });

        // Sauvegarde dans MongoDB
        await artObject.save();

        // Réponse HTTP
        res.status(201).json({ message: 'Articles ajoutés avec succès!' });
    } catch (error) {
        console.error('Error adding articles:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Requête non authentifiée!' });
        }
        res.status(400).json({ error: 'Failed to add articles.' });
    }
};

// Récupérer tous les articles d'un shop avec recherche
exports.getAllArticles = async (req, res, next) => {
    const shopId = req.params.id;
    const search = req.query.search;

    try {
        // Construire le filtre de recherche
        const searchFilter = search ? { title: { $regex: search, $options: 'i' } } : {};

        // Trouver tous les articles ayant le shopId spécifié et correspondant au filtre de recherche
        const articles = await Articles.find({ shopId: shopId, ...searchFilter });

        // Répondre avec les articles trouvés
        res.status(200).json(articles);
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des articles.' });
    }
};

// Fonction pour supprimer un article par son ID
exports.deleteArticle = async (req, res, next) => {
    const articleId = req.params.id;

    try {
        // Logique pour supprimer l'article dans MongoDB
        await Articles.findByIdAndDelete(articleId);

        // Répondre avec succès
        res.status(200).json({ message: 'Article supprimé avec succès.' });
    } catch (error) {
        console.error('Error deleting article:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression de l\'article.' });
    }
};

exports.updateArticles = async (req, res, next) => {
    const articleId = req.params.id;

    try {
        // Vérification du token JWT
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.userId;

        // Recherche de l'article par son ID
        const article = await Articles.findById(articleId);

        if (!article) {
            return res.status(404).json({ error: 'Article non trouvé' });
        }

        // Vérification de l'utilisateur propriétaire de l'article
        if (article.owner.toString() !== userId) {
            return res.status(403).json({ error: 'Accès refusé' });
        }

        // Mise à jour des champs de l'article (sans les photos)
        const { title, price, description } = req.body;
        if (title) article.title = title;
        if (price) article.price = price;
        if (description) article.description = description;

        // Sauvegarde de l'article mis à jour dans MongoDB
        await article.save();

        // Réponse HTTP
        res.status(200).json({ message: 'Article mis à jour avec succès' });
    } catch (error) {
        console.error('Error updating article:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Requête non authentifiée!' });
        }
        res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'article' });
    }
};

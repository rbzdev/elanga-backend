const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');

// Route pour enregistrer un nouvel utilisateur
router.post('/signup', userCtrl.signup);

// Route pour vérifier l'utilisateur
router.post('/login', userCtrl.login);

router.get('/userinfo', userCtrl.getUserInfo);

module.exports = router;

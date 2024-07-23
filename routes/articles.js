const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();

const articlesCtrl = require('./../controllers/articles');

router.post('/add', auth, articlesCtrl.addArticles);
router.get('/:id', articlesCtrl.getAllArticles)
router.delete('/:id', auth, articlesCtrl.deleteArticle);
router.put('/:id', auth, articlesCtrl.updateArticles);

module.exports = router;
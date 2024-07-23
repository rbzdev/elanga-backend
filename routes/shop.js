const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();

const ShopCtrl = require('../controllers/shop');

router.post('/', auth, ShopCtrl.createShop);
router.get('/', ShopCtrl.getAllShops);
router.get('/user', auth, ShopCtrl.getUserShops);
router.get('/:id', ShopCtrl.getOne);
router.delete('/:id', auth, ShopCtrl.deleteShop);
router.put('/:id', auth, ShopCtrl.updateShop);
router.post('/logo-upload', ShopCtrl.uploadShopLogo);

module.exports = router;

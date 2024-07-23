const express = require('express')
const router = express.Router()

const objectCtrl = require('../controllers/things')

router.get('/', objectCtrl.getObjet)

module.exports = router;
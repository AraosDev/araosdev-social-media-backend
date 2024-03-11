const express = require('express');
const { establishUserSession } = require('../controllers/userSession');
const router = express.Router();

router.ws('', establishUserSession);

module.exports = router;
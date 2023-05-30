const express = require('express');
const loginController = require('../controllers/loginController');

const router = express.Router();

router.route('/').get(loginController.checkLogin);

router.route('/checksession').get(loginController.checkSession);

router.route('/logout').get(loginController.logout);

module.exports = router;
var express = require('express');
var router = express.Router();
var auth = require('./auth.js');

router.post('/login', auth.login);
router.post('/register', auth.createUser);

module.exports = router;

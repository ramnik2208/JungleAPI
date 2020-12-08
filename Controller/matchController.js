var express = require('express');
var router = express.Router();
const checkAuth = require('../Middleware/check-auth');

//Get home page 
router.get('/', checkAuth, function(req, res, next) {
    res.render('index', { title: 'Cool, huh!', condition: true, anyArray: [1,2,3] });
});

module.exports = router; 
var express = require('express');
var router = express.Router();
const checkAuth = require('../Middleware/check-auth');
const Notification = require('../Model/notification');

router.get('/notifications', checkAuth, (req, res, next) => {
    Notification
    .find({"owner": req.UserData.UserId, "read": {$ne: true}})
    .then( function(doc) {
        res.render('notifications', {notifications: doc});
    });
});

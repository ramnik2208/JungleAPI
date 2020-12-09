var express = require('express');
var router = express.Router();
const checkAuth = require('../Middleware/check-auth');
const User = require('../Model/user');
const mongoose = require("mongoose");

// Get all matches
router.get('/matches', checkAuth, function(req, res, next) {
    console.log(req.userData.userId);
    User.findById(req.userData.userId)
    .exec()
    .then( user => {
        // Convert string array to mongooseObjectArray
        let objectIdArray = user.matches.map(s => mongoose.Types.ObjectId(s));
        console.log(objectIdArray);
        User.find({
            // Find user matches
            _id: { $in: objectIdArray },
        })
        .lean()
        .then(function(doc) {
            console.log(doc);
            return res.render('matches', {users: doc});
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
              error: err 
            });    
          });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err 
        });
        
      });
});

// Like user
router.post('/like/:userID', checkAuth, function(req, res, next) {

    User.findById(req.userData.userId)
    .exec()
    .then( user => {
        // Create match by writing Match id on users
        console.log(user.likes);
        if (user.likes.includes(req.params.userID)) {
            console.log('create match');
        /*    user.updateOne()
            user.update({
                $push: { matches: req.params.userID}
            }); */

            // add match to logged in user
            User.findByIdAndUpdate({_id: req.userData.userId},
                {
                $push: { matches: req.params.userID }
              }, function(err, result){
                if(err){
                    res.send(err);
                } else { 
                   /* res.render('success', {name: req.body.name, action: 'updated!'}); */
                   console.log('added match!');
                   // add match to other user
                   User.findByIdAndUpdate({_id: req.params.userID},
                    {
                    $push: { matches: req.userData.userId }
                  }, function(err, result){
                    if(err){
                        res.send(err);
                    } else { 
                       /* res.render('success', {name: req.body.name, action: 'updated!'}); */
                       console.log('liked!');
                       return res.redirect('/');
                    }
                 });
                }
             });
        } else {
            // Add userID to liked array on loggedin profile
    User.findByIdAndUpdate({_id: req.params.userID},
        {
        $push: { likes: req.userData.userId }
      }, function(err, result){
        if(err){
            res.send(err);
        } else { 
           /* res.render('success', {name: req.body.name, action: 'updated!'}); */
           console.log('liked!');
           return res.redirect('/');
        }
     });
        }
    });
    
})

// Dislike User
router.post('/dislike/:userID', checkAuth,function(req, res, next) {

    // Add userID to liked array on loggedin profile
    User.findByIdAndUpdate({_id: req.params.userID},
        {
        $push: { dislikes: req.userData.userId }
      }, function(err, result){
        if(err){
            res.send(err);
        } else { 
           /* res.render('success', {name: req.body.name, action: 'updated!'}); */
           console.log('disliked!');
           res.redirect('/');
        }
     });
})

//Get home page 
router.get('/', checkAuth, function(req, res, next) {
    User.findById(req.userData.userId)
  .exec()
  .then(user => {
    console.log(user.gender);
    if (user.gender === 'male') {
        User.find({
            gender: 'female',
            // where user has not been shown before
            likes: { $nin: [req.userData.userId] },
            dislikes: { $nin: [req.userData.userId] },
            matches: { $nin: [req.userData.userId] }
        })
        .lean()
        .then(function(doc) {
            res.render('index', {users: doc});
        });
    };

    if (user.gender === 'female') {
        User.find({
            gender: 'male',
            // where user has not been shown before
            likes: { $nin: [req.userData.userId] },
            dislikes: { $nin: [req.userData.userId] },
            dislikes: { $nin: [req.userData.userId] }
        })
        .lean()
        .then(function(doc) {
            res.render('index', {users: doc});
        });
    };
  })
  .catch(err => {
    console.log(err);
  })
       /* if (user.gender === 'male') {
            console.log("true!!")
            User.find({gender: 'female'}).lean()
            .then(function(doc) {
            console.log(doc)
            res.render('index', {users: doc});
        }); 
    } */    
});

module.exports = router; 
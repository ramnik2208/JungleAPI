const express = require("express");
const controller = express.Router();
const mongoose = require("mongoose");
const bcrypt = require('bcrypt'); 
const jwt = require ("jsonwebtoken");
const checkAuth = require('../Middleware/check-auth');
const User = require('../Model/user');

//Oprettet af bruger, som bliver gemt i MongoDB
//Bcrypt sørger for at encodet brugerens password med 10 ekstra koder. 
//Hvis brugren er oprettet, giver serveren en succes. (SAVE/THEN) 
//Hvis brugren ikke er oprettet bliver der send en error ud (CATCH). 
//Der kan sagtens oprettes flere bruger under samme email, men det skal ikke ses. 

controller.get('/all', (req, res, next) => {
  User.find().lean()
  .then(function(doc) {
    console.log(doc)
    res.render('index', {users: doc});
  });
});

controller.get('/signup', (request, response) => {
  response.render('signup');
});

controller.post('/signup', (req, res, next) => {
  User.find( {email: req.body.email})
  .exec()
  .then(user => {
    if (user.length >= 1) {
      return res.status(409).json({
        message:"Mail exists"
      });
    } else {
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
          return res.status(500).json({
            error: err
          }); 
        } else {
          const user = new User({
            _id: mongoose.Types.ObjectId(),
            name: req.body.name,
            email: req.body.email,
            age: req.body.age,
            country: req.body.country,
            bio: req.body.bio,
            gender: req.body.gender,
            password: hash
          });
          user
          .save()
          .then(result => {
            console.log(result);
            res.render('success', {name: req.body.name, action: 'created!'})
          })
          .catch(err => {
            console.log(err);
            res.status(500).json({
              error: err 
            });
            
          }); 
        }
      });
    }
    
  });
});


controller.post("/login", (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "Auth failed"
        });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Auth failed"
          });
        }
        if (result) {
          const token = jwt.sign(
            {
              email: user[0].email,
              userId: user[0]._id
            },
            "secret",
            {
                expiresIn: "1h"
            }
          );
          res.cookie('authcookie',token,{maxAge:900000,httpOnly:true});
          res.render('index');
        }
        res.status(401).json({
          message: "Auth failed"
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
controller.get("/account", checkAuth, (req, res, next) => {
  User.findById(req.userData.userId)
  .exec()
  .then(user => {
    res.render('edit', {bio: user.bio, name: user.name, age: user.age, country: user.country, userId: req.userData.userId});
  })
  .catch(err => {
    console.log(err);
  })
});

controller.get("/:userID", checkAuth, (req, res, next) => {
  User.findById(req.params.userID)
  .exec()
  .then(user => {
    console.log(user.email)
    res.status(200).json({
      message: "User found"
    })
  })
  .catch(err => {
    console.log(err)
  })
});

controller.post("/u/:userID", checkAuth, (req, res, next) => {
  User.findByIdAndUpdate({_id: req.params.userID},
    {
    "name": req.body.name, 
    "age": req.body.age,
    "country": req.body.country,
    "bio": req.body.bio,
    "gender": req.body.gender
  }, function(err, result){
    if(err){
        res.send(err);
    }
    else{
        res.render('success', {name: req.body.name, action: 'updated!'});
    }
 });
});

controller.post("/d/:userID", checkAuth, (req, res, next) => {
  User.findByIdAndRemove({_id: req.params.userID})
  .exec()
  .then(user => {
    res.render('success', {name: user.name, action: 'deleted!'})
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({
      error: err 
    });
  });
});

module.exports = controller;
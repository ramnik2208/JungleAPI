const express = require("express");
const controller = express.Router();
const mongoose = require("mongoose");
const bcrypt = require('bcrypt'); 

const User = require('../Model/user');


//Oprettet af bruger, som bliver gemt i MongoDB
//Bcrypt sørger for at krypterer brugerens password med 10 ekstra koder. 
//Hvis brugren er oprettet, giver serveren en succes. (SAVE/THEN) 
//Hvis brugren ikke er oprettet bliver der send en error ud (CATCH). 
//Der kan sagtens oprettes flere bruger under samme email, men det skal ikke ses. 

controller.post('/signup', (req, res, next) => {
  User.find( {email: req.body.email})
  .exec()
  .then(user => {
    if (user.length >= 1){
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
            email: req.body.email,
            password: hash
          });
          user
          .save()
          .then(result => {
            console.log(result);
            res.status(201).json({
              message: 'User created'
            });
          })
          .catch(err => {
            console.log(err);
            res.status(500).json({
              error: err 
            });
            
          }); 
        }
      }) 
    }
    
  });
});

controller.delete("/:userID", (req, res, next) => {
  User.remove({_id: req.params.userID})
  .exec()
  .then(result => {
    res.status(200).json({
      message: "User deleted"
    });
  })
  .catch(err => {
    console.log(err);
    res.status(500).json({
      error: err 
      
    });
  });
});

module.exports = controller;

var jwt = require('jwt-simple');
var db = require('../models/db');
var User = require('../models/User');
var hash = require('./pass').hash;
var errorHandler = require('../../lib/errorHandler').handler;

var auth = {

    login: function(req, res) {
        var username = req.body.username || '';
        var password = req.body.password || '';
        if (username == '' || password == '') {
            res.status(401);
            res.json({
                "status": 401,
                "message": "Invalid credentials"
            });
            return;
        }

        // Query to check if credentials are valid or Not
        auth.authenticate(username, password, function(err,user){
            if (err) {
              errorHandler(err,res);

            }

            if (user) {
                res.status(200).json(genToken(user));
            }
        });


    },

    authenticate: function(username, password, fn)
    {
        console.log("Authenticating user %s", username)
        // Recherche d'un utilisateur avec ce nom
        db.userExists(username, function(err,res){
            if (err) {
              return fn(err);
            }
            // User exists here.
            if (res){
              // Retrieving infos from Db
              db.getUserFromDb(username, function(err,user){
                // Passwords correspond
                if (err){
                  return fn(err);
                }else{
                  passwordCorrespond(password,user.getPassword(),user.getSalt(), function(err,res){
                    if (err) {
                      fn(err);
                    }

                    if (res){
                      return fn(null,user);
                    }
                    else {
                      var err = new Error("Invalid credentials");
                      err.http_code = 401;
                      return fn(err);
                    }
                  });
                }
          });
        }else{
          var err = new Error("User not found");
          err.http_code = 404;
          return fn(err);
        }
      });
    },

    createUser: function(req, res)
    {
      var username = req.body.username;
      var password = req.body.password;
      hash(password, function(err, salt, hash){
        if (err)
          errorHandler(err,res);
        else{
          db.insertUser(new User(null,username,hash,salt), function(err,result){
            if (err){
              errorHandler(err,res);
            }else{
              res.status(201).send({
                "status": 201,
                "message": "User created !",
                "rel": [{"login": "GET /login"}]
              });
              return;
            }

          });
        }

        });

    }

}

// Private methods

function passwordCorrespond(passwordGiven, passwordHashed, salt, fn){
   // Hash function
   hash(passwordGiven, salt, function(err, hash){
     // If error
     if (err) {
       console.error(new Error("Error while hashing."));
       return fn(err);
     }

     // No errors during hash, comparing
     return fn(null,(hash.toString('base64') == passwordHashed));

   });
}
function genToken(User) {
    var expires = expiresIn(1); // 7 DAYS
    var token = jwt.encode({
        exp: expires,
        id: User.getId(),
        username: User.getUsername(),
        role: User.getRole()
    }, require('../config/secret')());

    return {
        token: token,
        expires: expires,
        username: User.getUsername(),

    };
}

function expiresIn(numDays) {
    var dateObj = new Date();
    return dateObj.setDate(dateObj.getDate() + numDays);
}

module.exports = auth;

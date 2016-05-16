var jwt = require('jsonwebtoken');
var validateUser = require('../routes/auth').validateUser;
var db = require('../models/db');
var User = require('../models/User');
var errorHandler = require('../../lib/errorHandler').handler;

module.exports = function(req, res, next) {
    // When performing a cross domain request, you will recieve
    // a preflighted request first. This is to check if our the app
    // is safe.

    // We skip the token outh for [OPTIONS] requests.
    //if(req.method == 'OPTIONS') next();

    var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
    var time = new Date().getTime();
    if (token) {
        try {
            // Decoding the passed token
            var decoded = jwt.decode(token, require('../config/secret.js')());

            // Check wether date is valid or not
            if (decoded.exp <= Date.now()) {
                // Send back the result
                res.status(400);
                res.json({
                    "status": 400,
                    "message": "Token expired"
                });
                return;
            }

            // If it gets there, the user IS AUTHENTICATED
            // Authorize the user to see if he can access our ressources

            // Test if the token's owner is a valid user in DB
            db.getUserFromDb(decoded.username, function(err,dbUser){
            if (err){
                errorHandler(err,res);
                return;
            }
            if (dbUser) {

                console.log((time - (new Date().getTime())+" ms for middleware."));
                if ( (req.url.indexOf('admin') > 0 && (decoded.role == 'admin' && dbUser.role == 'admin')) || (req.url.indexOf('admin') < 0 && (req.url.indexOf('/api/v1/') >= 0 || req.url.indexOf('/api/v2/') >= 0) )) {
                        next(); // To move to next middleware
                } else {
                    res.status(403);
                    res.json({
                        "status": 403,
                        "message": "Not Authorized"
                    });
                    return;
                }
                //next();
            } else {
                // No user with this name exists, send back a 401
                res.status(401);
                res.json({
                    "status": 401,
                    "message": "Invalid User"
                });
                return;
            }

        });
      } catch (error) {
            res.status(500);
            res.json({
                "status": 500,
                "message": "Unknown error",
                "error": error
            });
        }
    } else {
        res.status(400);
        res.json({
            "status": 400,
            "message": "Missing token"
        });
        return;
    }

};

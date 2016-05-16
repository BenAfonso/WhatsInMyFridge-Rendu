var db = require('../models/db');
var errorHandler = require('../lib/errorHandler').handler;
var tokenAnalyzer = require('../lib/TokenAnalyzer');

var users = {

  getUsers: function(req, res){
    query = "SELECT USERNAME, ROLE FROM USERS";
    db.query(query, function(err,users){
      if (err)
        errorHandler(err, res);
      else{
        res.status(200).send(users);
      }
    });
  },
  me: function(req, res){
    var user_id = tokenAnalyzer.getUserId(tokenAnalyzer.grabToken(req));
    query = "SELECT USERNAME, ROLE \
             FROM USERS WHERE IDUSER = "+user_id;
    // Query for result, store in item
    db.query(query, function(err,user){
      if (err)
        errorHandler(err, res);
      else{
          if (user[0] == undefined){
            var err = new Error("Not found");
            err.http_code = 404;
            return errorHandler(err, res);
          }else
              return res.status(200).send(user[0]);
      }
      });
  },
  updateUser: function(req, res){
    if (req.body.role){
        query = "UPDATE USERS SET ROLE = '"+req.body.role+"' WHERE iduser = '"+req.params.id+"' \
        RETURNING username, role";
        db.query(query, function(err,user){
          if (err)
            errorHandler(err, res);
          else{
            res.status(200).send(user[0]);
          }
        });
    }else{
      var err = new Error("Bad query");
      err.http_code = 400;
      errorHandler(err, res);
    }

  }

}

module.exports = users;

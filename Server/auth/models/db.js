var User = require('./User');
database = require('../../models/db');

var db = {
  /**
  * Returns an object with associated methods
  *
  */
  getUserFromDb: function(username, fn) {
      // Query to get user's password (hashed) and salt
        database.query("SELECT iduser, username, password, salt, role FROM USERS WHERE USERNAME = '"+username+"'", function(err, result) {
          if(err) {
            console.error('Error running query', err);
            var err = new Error("Error running query");
            err.http_code = 400;
            return fn(err,null);
          }
          if (result[0] !== undefined)
            return fn(null,new User(result[0].iduser,result[0].username,result[0].password,result[0].salt,result[0].role));
          else{
            var err = new Error("User doesn't exist !");
            err.http_code = 401;
            return fn(err,null);
          }
        });
  },

  userExists: function(username, fn) {
    // Query to know if a user exists, returns BOOLEAN
    var time = new Date().getTime();
      database.query("SELECT iduser FROM USERS WHERE USERNAME = '"+username+"'", function(err, result) {
        if(err) {
          return fn(err,null);
        }
        console.log((time - new Date().getTime())+" ms running userExists");
        return fn(null,result[0] !== undefined);

      });
  },

  insertUser: function(User, fn) {
    db.userExists(User.getUsername(), function(err,res){
      // Query to get user's password (hashed) and salt
      if (err)
        return fn(err,null);
      if (res) {
        var err = new Error("Username already taken");
        err.http_code = 400;
        return fn(err,null);
      }else{
          database.query("INSERT INTO USERS (USERNAME,PASSWORD,SALT) VALUES ('"+User.getUsername()+"','"+User.getPassword()+"','"+User.getSalt()+"')", function(err, result) {
            if(err) {
              return fn(err,null);
            }
            return fn(null, res);
          });
      }
    });
  }

}

module.exports = db;

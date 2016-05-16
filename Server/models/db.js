var pg = require('pg');
var database = require('../config/database');
pg.defaults.ssl = true;
var conString = database.url;

/*
* query(req, callback)
* Database query abstraction for covoiturage
* Author: Benjamin AFONSO
* Parameters: Query(String), callback function
* Result: Array of JSON objects
* Error cases: Connection failed (500) / Query failed (400)

--> Usage example:
------------------------------------------------
query('SELECT * FROM VILLE', function(err,res){
    if (err)
      // ERROR HANDLING
    else
      console.log(res);
});
------------------------------------------------
*/


var query = function(req,fn){
  // Testing
  var time = new Date().getTime();
  pg.connect(conString, function(err, client, done) {
    if(err) {
      console.error('Could not connect to postgres', err);
      var err = new Error("Could not connect to postgres");
      err.http_code = 500;
      return fn(err,null);
    }
    client.query(req, function(err, result) {
      //call `done()` to release the client back to the pool
      done();
      if(err) {
        console.error('Error running query', err);
        var err = new Error("Bad query");
        err.http_code = 400;
        return fn(err,null);
      }
      // Testing
      console.log(Math.abs(time - (new Date().getTime()))+" ms Running Query");
      fn(null,result.rows);
    });
  });
};


var query2 = function(req, fn) {
  pg.connect(conString,function(err, client, done) {
    // Connexion error -> Callback with 500 code
    if(err) {
      console.error('Could not connect to postgres', err);
      var err = new Error("Could not connect to postgres");
      err.http_code = 500;
      return fn(err,null);
    }
    client.query(req, function(err, result) {
      // Fermeture de la connexion client
      client.end();

      // Query error -> callback with 400 code
      if(err) {
        console.error('Error running query', err);
        var err = new Error("Bad query");
        err.http_code = 400;
        return fn(err,null);

      }
      // Success -> callback 'null' error + result
      fn(null,result.rows);

    });
  });
};

exports.query = query;

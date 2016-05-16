// server.js

    // set up ========================
    var express  = require('express');
    var app      = express();
    var port = process.env.PORT || 8080;


    // configuration =====================================

    app.use('/node_modules', express.static(__dirname + '/node_modules/'));
     // set the static files location
    app.use(express.static(__dirname + '/public'));
    app.use('/libs', express.static(__dirname + '/libs'));


    // listen  ======================================
    app.listen(port,"0.0.0.0");
    console.log("App listening on port "+port);

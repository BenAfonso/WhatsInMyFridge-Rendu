var jwt = require('jwt-simple');

/**
 * tokenAnalyzer
 *
 * Used for easy access to token informations
 *
 * Usage:
 * __________________________________
 * var tokenAnalyzer = require(path_to_TokenAnalyser);
 * tokenAnalyzer.getUsername(token);
 * __________________________________
 *
 */
var tokenAnalyzer = {

  getUserId: function(token){
    return jwt.decode(token, require('../auth/config/secret')()).id;
  },

  getUsername: function(token){
    return jwt.decode(token, require('../auth/config/secret')()).username;
  },

  getRole: function(token){
    return jwt.decode(token, require('../auth/config/secret')()).role;
  },

  grabToken: function(req){
    return (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
  }
};

module.exports = tokenAnalyzer;

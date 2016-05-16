function User(id, username, password, salt, role){
  this.id = id;
  this.username = username;
  this.passwordHashed = password;
  this.salt = salt;
  this.role = role;
};

User.prototype.getId = function getId(){
  return this.id;
};

User.prototype.getUsername = function getUsername(){
  return this.username;
};

User.prototype.getPassword = function getPassword(){
  return this.passwordHashed;
};

User.prototype.getSalt = function getSalt(){
  return this.salt;
};

User.prototype.getRole = function getRole(){
  return this.role;
}

module.exports = User;

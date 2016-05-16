var db = require('../models/db');
function Recipe(idRecipe, recipeName, idUser){
  this.idRecipe = idRecipe,
  this.recipeName = recipeName,
  this.idUser = idUser,
  this.links = [ {
        "rel": "self",
        "href": "/api/v2/recipes/"+this.idRecipe
  },
  {
    "rel": "ingredients",
    "href": "/api/v2/recipes/"+this.idRecipe+"/ingredients"
  }];

}

Recipe.prototype.insert = function(){
    var query = "INSERT INTO Recipes (recipeName,idUser) VALUES ('"+this.recipeName+"', '"+this.idUser+"') RETURNING idrecipe, recipeName";
    // Query database
    db.query(query, function(err,recipe){
      if (err) // Error during query (raising)
        fn(err);
      else{
          var recipe = new Recipe(recipe[0].idrecipe, recipe[0].recipename);
          var res = {
              "status": 201,
              "message": "Recipe added",
              "recipe": recipe
          };
          fn(null, res);
      }
    });
}

Recipe.prototype.update = function(){
    var query = "UPDATE Recipes SET recipeName = '"+this.recipeName+"' WHERE idRecipe = '"+this.idRecipe+" AND idUser = '"+this.idUser+"' \
    RETURNING idRecipe, recipeName";
    // Query database
    db.query(query, function(err,recipe){
      if (err) // Error during query (raising)
        fn(err);
      else{
          var recipe = new Recipe(recipe[0].idrecipe, recipe[0].recipename);
          var res = {
              "status": 200,
              "message": "Recipe updated",
              "recipe": recipe
          };
          fn(null, res);
      }
    });
}

Recipe.prototype.delete = function(){
    var query = "INSERT INTO Recipes (recipeName) VALUES '"+this.recipeName+"'";
    // Query database
    db.query(query, function(err,recipe){
      if (err) // Error during query (raising)
        fn(err);
      else{
          var recipe = new Recipe(recipe[0].idrecipe, recipe[0].recipename);
          var res = {
              "status": 201,
              "message": "Recipe added",
              "recipe": recipe
          };
          fn(null, res);
      }
    });
}

Recipe.prototype.addItem = function(Product, quantity){
    var query = "INSERT INTO Ingredients (idRecipe, idProduct, quantity) VALUES \
    ('"+this.idRecipe+"', '"+this.Product.idProduct+"', '"+this.quantity+"')";
    // Query database
    db.query(query, function(err,recipe){
      if (err) // Error during query (raising)
        fn(err);
      else{
          var res = {
              "status": 201,
              "message": "Ingredient added"
          };
          fn(null, res);
      }
    });
}


// Missing routes :
// removeIngredient
// modifyIngredient
module.exports = Recipe;

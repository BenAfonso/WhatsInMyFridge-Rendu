var db = require('../models/db');
var errorHandler = require('../lib/errorHandler').handler;
var tokenAnalyzer = require('../lib/TokenAnalyzer');
var Recipe = require('../models/Recipe');
var Product = require('../models/Product');



var recipes = {
  getRecipes: function(req,res) {
    var user_id = tokenAnalyzer.getUserId(tokenAnalyzer.grabToken(req));
    var query = "SELECT * FROM RECIPES WHERE RECIPES.IDUSER = "+user_id;
    // Query for result, store in recipes
    db.query(query, function(err,recipes){

      if (err)
        errorHandler(err, res);
      else{
        // Transform to json objects (see Models);
        for (i=0;i<recipes.length;i++){
          recipes[i] = new Recipe(recipes[i].idrecipe,recipes[i].recipename);
        }
        res.status(200).send(recipes);
      }
    });
  },

  addRecipe: function(req,res) {
    // Parse args
    var recipeName = req.body.recipeName;
    var user_id = tokenAnalyzer.getUserId(tokenAnalyzer.grabToken(req));

    if (recipeName){
    // Query to add a recipe
      var query = "INSERT INTO RECIPES (recipeName,idUser) VALUES ('"+recipeName+"','"+user_id+"') \
      RETURNING idRecipe, recipeName";
      db.query(query, function(err,recipe){

        if (err)
          errorHandler(err, res);
        else{
          // Transform to json objects (see Models);
          recipe = new Recipe(recipe[0].idrecipe,recipe[0].recipename);
          // Send result 201 (created)
          res.status(201).send(recipe);
        }
      });
    }else{
      var err = new Error("Bad query ! (Missing 'recipeName' in body)");
      err.http_code = 400;
      errorHandler(err,res);
    }

  },

  deleteRecipe: function(req, res){
    // Parse request
    var recipeId = req.params.id;
    var user_id = tokenAnalyzer.getUserId(tokenAnalyzer.grabToken(req));

    // Query to delete recipe

    var query = "DELETE FROM RECIPES WHERE IDRECIPE = '"+recipeId+"' AND IDUSER = '"+user_id+"' RETURNING IDRECIPE, RECIPENAME";
    db.query(query, function(err,recipe){

      if (err)
        errorHandler(err, res);
      else{
        // The item got deleted
        if (recipe[0])
        {
          var recipe = new Recipe(recipe[0].idrecipe, recipe[0].recipename);
          // Send result 200
          res.status(200).send({
            "status": 200,
            "message": "Recipe successfully deleted",
            "oldRecipe": recipe
          });
        }else{ // The item didn't exist or wasn't the token owner's
          var err = new Error("Recipe not found !");
          err.http_code = 404;
          errorHandler(err,res);
        }

      }
    });
  },

  modifyRecipe: function(req, res){
    // Parse args
    var recipeid = req.params.id;
    var newName = req.body.recipeName;
    var user_id = tokenAnalyzer.getUserId(tokenAnalyzer.grabToken(req));
    if (newName){
      var query = "UPDATE RECIPES SET recipeName = '"+newName+"' \
      WHERE idRecipe = '"+recipeid+"' AND idUser = '"+user_id+"' RETURNING idRecipe, recipeName";
      db.query(query, function(err,recipe){

        if (err)
          errorHandler(err, res);
        else{
          // The item got deleted
          if (recipe[0])
          {
            var recipe = new Recipe(recipe[0].idrecipe, recipe[0].recipename);
            // Send result 200
            res.status(200).send(recipe);
          }else{ // The item didn't exist or wasn't the token owner's
            var err = new Error("Recipe not found !");
            err.http_code = 404;
            errorHandler(err,res);
          }

        }
      });

    }else{
      var err = new Error("Bad query ! (Missing 'recipeName')");
      err.http_code = 400;
      errorHandler(err,res);
    }

  },

  // Change HERE
  getRecipe: function(req, res){
    var recipeId = req.params.id;
    var user_id = tokenAnalyzer.getUserId(tokenAnalyzer.grabToken(req));
    query = "SELECT * \
             FROM RECIPES RIGHT JOIN ingredients ON RECIPES.IDRECIPE = ingredients.IDRECIPE \
             LEFT JOIN PRODUCTS ON ingredients.IDPRODUCT = Products.IDPRODUCT \
             WHERE RECIPES.IDRECIPE = '"+recipeId+"' AND RECIPES.IDUSER = "+user_id;
    // Query for result, store in item
    db.query(query, function(err,ingredients){
      if (err)
        errorHandler(err, res);
      else{
        db.query("SELECT * FROM RECIPES WHERE IDRECIPE = '"+recipeId+"' AND IDUSER = '"+user_id+"'", function(err,recipe){
          if (err)
            errorHandler(err, res);
          else{
            // If a recipe if found for this user
            if (recipe[0]){
              // Transform recipe to Json object (see model)
              var recipeObj = new Recipe(recipe[0].idrecipe, recipe[0].recipename);
              // If there's items in recipe
              if (ingredients[0]){
                for (i = 0;i<recipe.length;i++){
                  var quantity = ingredients[i].quantity
                  ingredients[i] = new Product(ingredients[i].idproduct,ingredients[i].productname);
                  ingredients[i].quantity = quantity;
                }//For
              } // ingredients

              res.status(200).send(recipeObj);
            }else{
              var err = new Error("Recipe not found !");
              err.http_code = 404;
              errorHandler(err,res);
            }

          }// Second query passed

        }); // 2nd Query
      } // First query passed
    }); // 1st Query
  }
}

module.exports = recipes;

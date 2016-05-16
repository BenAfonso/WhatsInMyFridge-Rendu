var db = require('../../models/db');
var errorHandler = require('../../lib/errorHandler').handler;
var tokenAnalyzer = require('../../lib/TokenAnalyzer');
var Recipe = require('../../models/Recipe');
var Product = require('../../models/Product');



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
        res.status(200).send({
          "status": 200,
          "message": "Retrieved recipes successfully",
          "recipes": recipes
        });
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
          res.status(201).send({
            "status": 201,
            "message": "Recipe successfully added",
            "recipe": recipe
          });
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
            res.status(200).send({
              "status": 200,
              "message": "Recipe successfully modified",
              "recipe": recipe
            });
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

              res.status(200).send({
                "status": 200,
                "message": "Recipe successfully retrieved",
                "recipe": recipeObj,
                "Ingredients": ingredients
              });
            }else{
              var err = new Error("Recipe not found !");
              err.http_code = 404;
              errorHandler(err,res);
            }

          }// Second query passed

        }); // 2nd Query
      } // First query passed
    }); // 1st Query
  },

  // Change HERE
  addIngredient: function(req,res){
    // Parse request
    var recipeId = req.params.id;
    // Query to add given item in recipe
    var user_id = tokenAnalyzer.getUserId(tokenAnalyzer.grabToken(req));
    var idProduct = req.body.idProduct;
    var quantity = req.body.quantity;

    if (idProduct == undefined){
      var err = new Error("Bad query");
      err.http_code = 400;
      errorHandler(err,res);
      return;
    }

    if (quantity == undefined)
      quantity = 0;


    isOwnerOf(user_id,recipeId,idProduct,function(err,isOwner){
      if (err){
        errorHandler(err,res);
      }else{

      var query = "INSERT INTO ingredients (idRecipe,idProduct,quantity) \
                    VALUES ('"+recipeId+"','"+idProduct+"','"+quantity+"') \
                    RETURNING idRecipe, (SELECT recipeName FROM RECIPES WHERE idUser = '"+user_id+"' AND idRecipe = '"+recipeId+"')";


        // Query to add an item
        db.query(query, function(err,recipe){

          if (err)
            errorHandler(err, res);
          else{
              // Send a 201 (created)
              var recipe = new Recipe(recipe[0].idrecipe, recipe[0].recipename);

              res.status(201).send({
                "status": 201,
                "message": "Ingredient added to recipe",
                "recipe": recipe
              });
          }
        });
      }
    });
  },

  deleteIngredient: function(req,res){
    // Parse request
    var recipeId = req.params.recipe_id;
    var idProduct = req.params.product_id;
    var user_id = tokenAnalyzer.getUserId(tokenAnalyzer.grabToken(req));
    // Query to remove item from recipe

    if (idProduct == undefined){
      var err = new Error("Bad query (Missing parameter)");
      err.http_code = 400;
      errorHandler(err,res);
    }

    isOwnerOf(user_id,recipeId,idProduct,function(err,isOwner){
      if (err){
        errorHandler(err,res);
      }else{

      var query = "DELETE FROM ingredients WHERE idProduct = '"+idProduct+"' AND idRecipe = '"+recipeId+"'\
                    RETURNING idRecipe, (SELECT recipeName FROM RECIPES WHERE idUser = '"+user_id+"' AND idRecipe = '"+recipeId+"')";


    // Query to add an item
    db.query(query, function(err,recipe){

      if (err)
        errorHandler(err, res);
      else{
          // Send a 200
          var recipe = new Recipe(recipe[0].idrecipe, recipe[0].recipename);

          res.status(200).send({
            "status": 200,
            "message": "Ingredient deleted",
            "recipe": recipe
          });
        } // Query passed
      }); // Query
    } // ifIsOwnerOf
  }); // isOwnerOf
},

// Change HERE
  modifyIngredient: function(req,res){
    // Parse request
    var recipeId = req.params.recipe_id;
    var idProduct = req.params.product_id;
    var newQuantity = req.body.quantity;
    var user_id = tokenAnalyzer.getUserId(tokenAnalyzer.grabToken(req));
    if (newQuantity == undefined){
      var err = new Error("Bad query (Missing 'quantity' in body)");
      err.http_code = 400;
      errorHandler(err,res);
    }

    isOwnerOf(user_id,recipeId,idProduct,function(err,isOwner){
      if (err){
        errorHandler(err,res);
      }else{
        // The user is the owner of the item and the recipe
        // Query to modify the item in recipe
        var query = "UPDATE ingredients SET quantity = '"+newQuantity+"' \
        WHERE idProduct = '"+idProduct+"' AND idRecipe = '"+recipeId+"' \
        RETURNING idRecipe, quantity";
        db.query(query, function(err,recipe){

          if (err)
            errorHandler(err, res);
          else{
              // Send a 200
              var recipe = new Recipe(recipe[0].idrecipe);

              res.status(200).send({
                "status": 200,
                "message": "Ingredient modified",
                "recipe": recipe
              });
            } // Query passed
          }); // Query
      } // user authorized
    }); // isOwnerOf

  }




};
// Change HERE
function isOwnerOf(idUser, idRecipe, idProduct, fn) {
  db.query("SELECT * FROM RECIPES WHERE idUser = '"+idUser+"' AND idRecipe = '"+idRecipe+"'", function(err,recipe){

    if (err)
      fn(err,false);
    else{
      if (recipe[0]){
        db.query("SELECT * FROM Products WHERE idUser = '"+idUser+"' AND idProduct = '"+idProduct+"'", function(err,product){

          if (err)
            fn(err,false);
          else{
              // Send a 201 (created)
              if (product[0])
                return fn(null,true);
              else {
                var err = new Error("Product not found");
                err.http_code = 404;
                return fn(err,false);
              }

            }
        });
      }else{
        var err = new Error("Recipe not found !");
        err.http_code = 404;
        return fn(err,false);
      }

    }
  });
}

module.exports = recipes;

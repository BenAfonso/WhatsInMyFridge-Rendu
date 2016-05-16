var db = require('../models/db');
var errorHandler = require('../lib/errorHandler').handler;
var tokenAnalyzer = require('../lib/TokenAnalyzer');
var Recipe = require('../models/Recipe');
var Product = require('../models/Product');
var Ingredient = require('../models/Ingredient');


var ingredients = {
  getIngredients: function(req,res) {
    var user_id = tokenAnalyzer.getUserId(tokenAnalyzer.grabToken(req));
    var query = "SELECT * FROM INGREDIENTS \
    RIGHT JOIN RECIPES ON RECIPES.IDRECIPE = INGREDIENTS.IDRECIPE \
    LEFT JOIN PRODUCTS ON PRODUCTS.IDPRODUCT = INGREDIENTS.IDPRODUCT \
    WHERE RECIPES.IDUSER = '"+user_id+"' AND INGREDIENTS.IDRECIPE = "+req.params.id;
    // Query for result, store in recipes
    db.query(query, function(err,ingredients){

      if (err)
        errorHandler(err, res);
      else{

        for (i = 0; i < ingredients.length; i++){
          var recipe = new Recipe(ingredients[i].idrecipe, ingredients[i].recipename);
          var product = new Product(ingredients[i].idproduct, ingredients[i].productname, ingredients[i].img);
          var ingredient = new Ingredient(recipe, product, ingredients[i].quantity);
          ingredients[i] = ingredient;
        }

        res.status(200).send(ingredients);
      }
    });
  },

  addIngredient: function(req,res){
    // Parse request
    var recipeId = req.params.id;
    // Query to add given item in recipe
    var user_id = tokenAnalyzer.getUserId(tokenAnalyzer.grabToken(req));
    var idProduct = req.body.idProduct;
    var quantity = req.body.quantity;

    if (idProduct == undefined){
      var err = new Error("Bad query (Missing parameter)");
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
                    RETURNING idRecipe, quantity, (SELECT recipeName FROM RECIPES WHERE idUser = '"+user_id+"' AND idRecipe = '"+recipeId+"'), \
                    (SELECT productName FROM PRODUCTS WHERE idProduct = "+idProduct+"), \
                    (SELECT img FROM PRODUCTS WHERE idProduct = '"+idProduct+"')";

        console.log(query);
        // Query to add an item
        db.query(query, function(err,ingredient){

          if (err)
            errorHandler(err, res);
          else{
              // Send a 201 (created)
              var recipe = new Recipe(ingredient[0].idrecipe, ingredient[0].recipename);
              var product = new Product(idProduct, ingredient[0].productname, ingredient[0].img);
              var ingredient = new Ingredient(recipe, product, ingredient[0].quantity);
              res.status(201).send(ingredient);
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
        RETURNING idRecipe, quantity, (SELECT recipeName FROM RECIPES WHERE idUser = '"+user_id+"' AND idRecipe = '"+recipeId+"'), \
        (SELECT productName FROM PRODUCTS WHERE idProduct = "+idProduct+"), \
        (SELECT img FROM PRODUCTS WHERE idProduct = '"+idProduct+"')";
        db.query(query, function(err,ingredient){

          if (err)
            errorHandler(err, res);
          else{
              // Send a 200
              var recipe = new Recipe(ingredient[0].idrecipe, ingredient[0].recipename);
              var product = new Product(idProduct, ingredient[0].productname, ingredient[0].img);
              var ingredient = new Ingredient(recipe, product, ingredient[0].quantity);
              res.status(200).send(ingredient);
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
};


module.exports = ingredients;

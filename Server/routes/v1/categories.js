var db = require('../../models/db');
var errorHandler = require('../../lib/errorHandler').handler;
var tokenAnalyzer = require('../../lib/TokenAnalyzer');

var Category = require('../../models/Category');

var categories = {
  getCategories: function(req,res) {
    // ADD FILTERS HERE
    var user_id = tokenAnalyzer.getUserId(tokenAnalyzer.grabToken(req));
    var query = "SELECT * FROM CATEGORIES WHERE IDUSER = '"+user_id+"'";
    // Query for result, store in categories
    db.query(query, function(err,categories){

      if (err)
        errorHandler(err, res);
      else{
        // Transform to json objects (see Models);
        for (i=0;i<categories.length;i++){
          categories[i] = new Category(categories[i].idcategory,categories[i].categoryname);
        }
        res.status(200).send({
          "status": 200,
          "message": "Retrieved categories successfully",
          "categories": categories
        });
      }
    });

  },

  addCategory: function(req,res) {
    // ADD FILTERS HERE
    var user_id = tokenAnalyzer.getUserId(tokenAnalyzer.grabToken(req));
    var categoryName = req.body.categoryName;
    if (user_id !== undefined && categoryName !== undefined){
        var query = "INSERT INTO CATEGORIES (categoryName, idUser) \
        VALUES ('"+categoryName+"', '"+user_id+"') RETURNING \
        idCategory, categoryName";
    }// idUser
    else{
        var err = new Error("Bad query");
        err.http_code = 400;
        return errorHandler(err,res);
    }
    // Query database
    db.query(query, function(err,product){
      if (err) // Error during query (raising)
        return errorHandler(err,res);
      else{
          var category = new Category(product[0].idcategory, product[0].categoryname);
          res.status(201).send({
              "status": 201,
              "message": "Category added",
              "category": category
          });
          return;
      }
    });

  },


  modifyCategory: function(req,res) {
    // Parse request
    var id = req.params.id;
    var newCategoryName = req.body.categoryName;
    var user_id = tokenAnalyzer.getUserId(tokenAnalyzer.grabToken(req));
    if (id !== undefined && user_id !== undefined && newCategoryName !== undefined){
        var query = "UPDATE CATEGORIES SET categoryName = '"+newCategoryName+"' \
        WHERE idUser = '"+user_id+"' AND idCategory = '"+id+"' RETURNING \
        idCategory, categoryName";
        // Query database
        db.query(query, function(err,category){
          if (err) // Error during query (raising)
            return errorHandler(err,res);
          else{
              if (category[0]){ // A category has been modified
                  var category = new Category(category[0].idcategory, category[0].categoryname);
                  res.status(200).send({
                      "status": 200,
                      "message": "Category modified",
                      "category": category
                  });
                  return;
              }else{
                  var err = new Error("Category not found");
                  err.http_code = 404;
                  return errorHandler(err,res);
              }

          }
        });
    }else{
        // Bad query (raising 400)
        var err = new Error("Bad query");
        err.http_code = 400;
        return errorHandler(err,res);
    }

  },

  deleteCategory: function(req,res){
    // Parse request
    var id = req.params.id;
    var user_id = tokenAnalyzer.getUserId(tokenAnalyzer.grabToken(req));
    // Query here
    if (id !== undefined && user_id !== undefined){
        var query = "DELETE FROM Categories WHERE idCategory = '"+id+"' AND idUser = '"+user_id+"' RETURNING idcategory";
        // Query database
        db.query(query, function(err,category){
          if (err) // Error during query (raising)
            return errorHandler(err,res);
          else{
              // Something has been deleted
              if (category[0]){
                  res.status(200).send({
                      "status": 200,
                      "message": "Category deleted",
                      "category": category
                  });
                  return;
              }
              else {
                  // Category not found
                  var err = new Error("Category not found");
                  err.http_code = 404;
                  return errorHandler(err,res);
              }// Category deleted ?
              }//Query passed
          });// Query
      }// idCategory (if)
  }





};


module.exports = categories;

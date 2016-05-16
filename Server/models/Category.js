var db = require('../models/db');
function Category(idCategory, categoryName, user_id){
  if (idCategory == null)
    idCategory = undefined;
  if (categoryName == null)
    categoryName = undefined;
  this.idCategory = idCategory,
  this.categoryName = categoryName,
  this.idUser = user_id
}

// Methodes

Category.prototype.update = function(fn){
    // Update
    var params = [];
    var values = [];
    if (this.idCategory !== undefined || this.idUser !== undefined){
        var query = "UPDATE PRODUCTS SET categoryName = '"+this.categoryName+"' \
        WHERE idUser = '"+this.idUser+"' AND idCategory = '"+this.idCategory+"' RETURNING \
        idCategory, categoryName";
    }else{
        // Bad query (raising 400)
        var err = new Error("Bad query");
        err.http_code(400)
        return fn(err);
    }
    // Query database
    db.query(query, function(err,category){
      if (err) // Error during query (raising)
        fn(err);
      else{
          var category = new Category(category[0].idcategory, category[0].categoryname);
          var res = {
              "status": 200,
              "message": "Category modified",
              "category": category
          };
          fn(null, res);
      }
    });
};

/**
*   Insert the Category into database
*
*/

Category.prototype.insert = function(fn){
    // Update
    if (this.idUser !== undefined && this.categoryName !== undefined){
        var query = "INSERT INTO CATEGORIES (categoryName, idUser) \
        VALUES ('"+this.categoryName+"', '"+this.idUser+"') RETURNING \
        idCategory, categoryName";
    }// idUser
    else{
        var err = new Error("Bad query");
        err.http_code = 400;
        return fn(err);
    }
    // Query database
    db.query(query, function(err,product){
      if (err) // Error during query (raising)
        fn(err);
      else{
          var category = new Category(product[0].idcategory, product[0].categoryname);
          var res = {
              "status": 201,
              "message": "Category added",
              "category": category
          };
          fn(null, res);
      }
    });
};
Category.prototype.delete = function(){
    // Delete
    if (this.idCategory !== undefined){
        var query = "DELETE FROM Categories WHERE idCategory = '"+this.idCategory+"' AND idUser = '"+this.idUser+"' RETURNING idcategory";
        // Query database
        db.query(query, function(err,category){
          if (err) // Error during query (raising)
            fn(err);
          else{
              // Something has been deleted
              if (category[0].idcategory){
                  var res = {
                      "status": 200,
                      "message": "Category deleted",
                      "category": category
                  };
                  fn(null, res);
              }
              else {
                  // Category not found
                  var err = new Error("Category not found");
                  err.http_code = 404;
                  return fn(err);
              }// Category deleted ?
          }//Query passed
      });// Query
  }// idCategory (if)
};// Delete


module.exports = Category;

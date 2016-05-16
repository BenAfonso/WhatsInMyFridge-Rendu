var db = require('../models/db');
var Category = require('../models/Category');
function Product(idProduct, productName, img, Category, idUser, quantity, max){
    // Constructeur

      if (img == null){
        img = undefined;
      }

      if (idProduct == null){
          idProduct = undefined;
      }
      if (quantity == null){
        quantity = 0;
      }
      if (max == null){
        max = 0;
      }
      if (productName == null){
          productName = undefined;
      }
      this.idProduct = idProduct,
      this.productName = productName,
      this.img = img,
      this.category = Category,
      this.idUser = idUser,
      this.quantity = quantity,
      this.max = max,
      this.links = [ {
            "rel": "self",
            "href": "/api/v2/products/"+this.idProduct
      }];
}
// Methodes

Product.prototype.update = function(fn){
    // Update
    var params = [];
    var values = [];
    if (this.idProduct !== undefined || this.idUser !== undefined){
        if (this.productName){
            params.push("'productName'");
            values.push("'"+this.productName+"'");
        }
        if (this.idCategory){
            params.push("'idCategory'");
            values.push("'"+this.idCategory+"'");
        }
        if (this.img){
            params.push("'img'");
            values.push("'"+this.img+"'");
        }
        var query = "UPDATE PRODUCTS SET ("+params.toString()+") VALUES ("+values.toString()+") \
        WHERE idUser = '"+this.idUser+"' AND idProduct = '"+this.idProduct+"' RETURNING \
        idProduct, productName, img, idCategory, (SELECT categoryName FROM Categories WHERE idCategory = '"+idCategory+"')";
    }else{
        // Error missing idProduct or Owner (raising 400)
        var err = new Error("Missing product and/or owner");
        err.http_code(400)
        return fn(err);
    }
    // Query database
    db.query(query, function(err,product){
      if (err) // Error during query (raising)
        fn(err);
      else{
          var category = new Category(product[0].idcategory, product[0].categoryname);
          var product = new Product(product[0].idproduct, product[0].productname, product[0].img, category);
          var res = {
              "status": 200,
              "message": "Product modified",
              "product": product
          };
          fn(null, res);
      }
    });
};

/**
*   Insert the Product into database
*
*/

Product.prototype.insert = function(fn){
    // Update
    var params = [];
    var values = [];
    if (this.idUser !== undefined){
        if (this.productName){
            params.push("'productName'");
            values.push("'"+this.productName+"'");
        }
        if (this.idCategory){
            params.push("'idCategory'");
            values.push("'"+this.idCategory+"'");
        }
        if (this.img){
            params.push("'img'");
            values.push("'"+this.img+"'");
        }
        params.push("'idUser'");
        values.push("'"+this.idUser+"'");
        var query = "INSERT INTO PRODUCTS ('"+params.toString()+"') \
        VALUES ('"+values.toString()+"') RETURNING \
        idProduct, productName, img, idCategory, (SELECT categoryName FROM Categories WHERE idCategory = '"+idCategory+"')";
    }// idUser
    else{
        var err = new Error("Missing user");
        err.http_code = 400;
        return fn(err);
    }
    // Query database
    db.query(query, function(err,product){
      if (err) // Error during query (raising)
        fn(err);
      else{
          var category = new Category(product[0].idcategory, product[0].categoryname);
          var product = new Product(product[0].idproduct, product[0].productname, product[0].img, category);
          var res = {
              "status": 201,
              "message": "Product added",
              "product": product
          };
          fn(null, res);
      }
    });
};
Product.prototype.delete = function(){
    // Delete
    if (this.idProduct !== undefined){
        var query = "DELETE FROM Products WHERE idProduct = '"+this.idProduct+"' AND idUser = '"+this.idUser+"' RETURNING idProduct";
        // Query database
        db.query(query, function(err,product){
          if (err) // Error during query (raising)
            fn(err);
          else{
              if (product[0].idProduct){
                  var res = {
                      "status": 200,
                      "message": "Product deleted",
                      "product": product
                  };
                  fn(null, res);
              }
              else {
                  // Product not found
                  var err = new Error("Product not found");
                  err.http_code = 404;
                  return fn(err);
              }// product deleted ?
          }//Query passed
      });// Query
  }// idProduct (if)
};// Delete


module.exports = Product;

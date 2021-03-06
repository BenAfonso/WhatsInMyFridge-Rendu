// Change HERE
var db = require('../../models/db');
var errorHandler = require('../../lib/errorHandler').handler;
var queryBuilder = require('../../lib/queryBuilder').queryBuilder;
var tokenAnalyzer = require('../../lib/TokenAnalyzer');
var Item = require('../../models/Item');
var Category = require('../../models/Category');
var Product = require('../../models/Product');

var products = {

      getProducts: function(req,res) {
        // Filters List, Category,
        var user_id = tokenAnalyzer.getUserId(tokenAnalyzer.grabToken(req));
        var id = req.query.id;
        var category_id = req.query.category;
        var max_result = req.query.max_result;
        if (user_id !== undefined){
            var query = "SELECT PRODUCTS.IDPRODUCT, PRODUCTNAME, IMG, QUANTITY, MAX, PRODUCTS.IDCATEGORY, CATEGORYNAME, ITEMS.IDITEM FROM PRODUCTS \
            LEFT JOIN ITEMS ON PRODUCTS.IDPRODUCT = ITEMS.IDPRODUCT \
            LEFT JOIN CATEGORIES ON CATEGORIES.idCategory = PRODUCTS.IDCATEGORY \
            WHERE PRODUCTS.IDUSER = '"+user_id+"'";

            if (category_id !== undefined)
                var query = query + " AND PRODUCTS.IDCATEGORY = '"+category_id+"'";
            if (id !== undefined)
                var query = query + " AND PRODUCTS.IDPRODUCT = '"+id+"'";
            if (max_result !== undefined)
                var query = query + " LIMIT "+max_result;
            db.query(query, function(err,products){
              if (err) // Error during query (raising)
                 errorHandler(err,res)
              else{
                  if (products !== undefined){
                      var result = [];
                      for (i = 0;i<products.length;i++){
                          var category = new Category(products[i].idcategory, products[i].categoryname);
                          var item = new Item(products[i].iditem, undefined, undefined, products[i].quantity, products[i].max);
                          var product = new Product(products[i].idproduct, products[i].productname, products[i].img, category, item);

                          result.push(product);
                      }

                      res.status(200).send({
                          "status": 200,
                          "message": "Retrieved products successfully",
                          "products": result
                      });
                  }else { // Not found
                      var err = new Error("Product not found");
                      err.http_code = 404;
                      errorHandler(err,res);
                  }

              }
            });
        }else{
            // Missing user_id
            var err = new Error("Bad query !");
            err.http_code = 400;
            errorHandler(err,res);
        }

      },

      addProduct: function(req,res) {
        // Parse args
        var productName = req.body.productName;
        var user_id = tokenAnalyzer.getUserId(tokenAnalyzer.grabToken(req));
        // user_id and productName obligatoires
        if (user_id !== undefined && productName !== undefined){
            var params = ['productName', 'idUser'];
            var values = ["'"+productName+"'","'"+user_id+"'"];
            if (req.body.idCategory !== undefined){
                params.push('idCategory');
                values.push("'"+req.body.idCategory+"'");
            }
            if (req.body.img !== undefined){
                params.push('img');
                values.push("'"+req.body.img+"'");
            }
            var query = "INSERT INTO PRODUCTS ("+params.toString()+") VALUES ("+values.toString()+") RETURNING idProduct, productName, img, idCategory, \
            (SELECT categoryName FROM CATEGORIES WHERE CATEGORIES.IDCATEGORY = PRODUCTS.IDCATEGORY)";
            db.query(query, function(err,product){
              if (err) // Error during query (raising)
                 errorHandler(err,res)
              else{
                  if (product[0] !== undefined){
                          var category = new Category(product[0].idcategory, product[0].categoryname);
                          var product = new Product(product[0].idproduct, product[0].productname, product[0].img, category);
                          res.status(201).send({
                              "status": 201,
                              "message": "Product added successfully",
                              "Product": product
                          });
                  }else { // Not found
                      var err = new Error("Product not found");
                      err.http_code = 404;
                      errorHandler(err,res);
                  }

              }
            });
        }else{ // Missing parameters
            var err = new Error("Bad query");
            err.http_code = 400;
            errorHandler(err,res);
        }

      },

      getProduct: function(req,res) {
        // ADD FILTERS HERE
        var idProduct = req.params.id
        var user_id = tokenAnalyzer.getUserId(tokenAnalyzer.grabToken(req));

        if (user_id !== undefined){
            var query = "SELECT Products.idproduct, productName, img, Products.idCategory, \
            Categories.categoryName, Items.idItem, Items.quantity, Items.max FROM PRODUCTS \
            LEFT JOIN ITEMS ON PRODUCTS.IDPRODUCT = ITEMS.IDPRODUCT \
            LEFT JOIN CATEGORIES ON CATEGORIES.idCategory = PRODUCTS.IDCATEGORY \
            WHERE PRODUCTS.IDUSER = '"+user_id+"' AND PRODUCTS.IDPRODUCT = '"+idProduct+"'";

            db.query(query, function(err,product){
              if (err) // Error during query (raising)
                 errorHandler(err,res)
              else{
                  if (product[0] !== undefined){
                          var category = new Category(product[0].idcategory, product[0].categoryname);
                          var item = new Item(product[0].iditem, undefined, undefined, product[0].quantity, product[0].max);
                          var product = new Product(product[0].idproduct, product[0].productname, product[0].img, category);

                          res.status(200).send({
                              "status": 200,
                              "message": "Retrieved product successfully",
                              "product": product,
                              "item": item
                          });
                  }else { // Not found
                      var err = new Error("Product not found");
                      err.http_code = 404;
                      errorHandler(err,res);
                  }

              }
            });
        }else{
            // Missing user_id
            var err = new Error("Bad query !");
            err.http_code = 400;
            errorHandler(err,res);
        }
      },

      modifyProduct: function(req,res) {
            var user_id = tokenAnalyzer.getUserId(tokenAnalyzer.grabToken(req));

              if ((req.body.img !== undefined || req.body.productName !== undefined || req.body.idCategory !== undefined) && req.params.id !== undefined){
                  var values = [];
                  var params = [];
                  if (req.body.img){
                      params.push('img');
                      values.push("'"+req.body.img+"'");
                  }
                  if (req.body.idCategory !== undefined){
                      console.log(req.body.idCategory);
                      params.push('idCategory');
                      values.push("'"+req.body.idCategory+"'");
                  }
                  if (req.body.productName){
                      params.push('productName');
                      values.push("'"+req.body.productName+"'");
                  }
                  var query = "UPDATE PRODUCTS AS P SET ("+params.toString()+") = ("+values.toString()+") \
                  WHERE idProduct = '"+req.params.id+"' AND idUser = '"+user_id+"' RETURNING \
                  idProduct, idcategory, productName, img, (SELECT categoryName FROM Categories WHERE idCategory = P.idcategory)";
              }else{
                  // Error missing idProduct or Owner (raising 400)
                  var err = new Error("Bad query !");
                  err.http_code = 400;
                  return errorHandler(err,res);
              }
              // Query database
              db.query(query, function(err,product){
                if (err) // Error during query (raising)
                  return errorHandler(err,res);
                else{
                    if (product[0]){
                        var category = new Category(product[0].idcategory, product[0].categoryname);
                        var product = new Product(product[0].idproduct, product[0].productname, product[0].img, category);
                        res.status(200).send({
                            "status": 200,
                            "message": "Product modified",
                            "product": product
                        });
                    }else { // Not found
                        var err = new Error("Product not found");
                        err.http_code = 404;
                        return errorHandler(err,res);
                    }

                }
              });

      },

      deleteProduct: function(req,res){
        // Parse request
        var id = req.params.id;
        var user_id = tokenAnalyzer.getUserId(tokenAnalyzer.grabToken(req));
        // Delete
            var query = "DELETE FROM Products WHERE idProduct = '"+id+"' AND idUser = '"+user_id+"' RETURNING idProduct";
            // Query database
            db.query(query, function(err,product){
              if (err) // Error during query (raising)
                return errorHandler(err,res);
              else{
                  if (product[0]){
                      res.status(200).send({
                          "status": 200,
                          "message": "Product deleted",
                          "product": product[0].idproduct
                      });
                  }
                  else {
                      // Item not found
                      var err = new Error("Product not found");
                      err.http_code = 404;
                      return errorHandler(err,res);
                  }// Item deleted ?
              }//Query passed
          });// Query
      }

};


module.exports = products;

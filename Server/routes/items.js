var db = require('../models/db');
var errorHandler = require('../lib/errorHandler').handler;
var queryBuilder = require('../lib/queryBuilder').queryBuilder;
var tokenAnalyzer = require('../lib/TokenAnalyzer');
var Item = require('../models/Item');
var Category = require('../models/Category');
var Product = require('../models/Product');

var items = {
  getItems: function(req,res) {
    // Filters List, Category,
    var user_id = tokenAnalyzer.getUserId(tokenAnalyzer.grabToken(req));
    var product_id = req.params.product_id;
    var max_result = req.query.max_result;
    if (user_id !== undefined){
        var query = "SELECT * FROM ITEMS \
        LEFT JOIN PRODUCTS ON PRODUCTS.IDPRODUCT = ITEMS.IDPRODUCT \
        WHERE PRODUCTS.IDPRODUCT = '"+product_id+"' AND ITEMS.IDUSER = '"+user_id+"'";

        if (max_result !== undefined)
            var query = query + " LIMIT "+max_result;
        db.query(query, function(err,items){
          if (err) // Error during query (raising)
             errorHandler(err,res)
          else{
              if (items !== undefined){
                  var result = [];
                  for (i = 0;i<items.length;i++){
                      var product = new Product(items[i].idproduct, items[i].productname, items[i].img);
                      var item = new Item(items[i].iditem, product, items[i].iduser, items[i].quantity, items[i].unit,items[i].max, items[i].created_at);
                      result.push(item);
                  }

                  res.status(200).send(result);
              }else { // Not found
                  var err = new Error("Item not found");
                  err.http_code = 404;
                  return errorHandler(err,res);
              }

          }
        });
    }else{
        // Missing user_id
        var err = new Error("Bad query !");
        err.http_code = 400;
        return errorHandler(err,res);
    }

  },

  addItem: function(req,res) {
    // Parse args
    var idProduct = req.params.product_id;
    var qty = req.body.quantity;
    var max = req.body.max;
    var unit = req.body.unit;
    var user_id = tokenAnalyzer.getUserId(tokenAnalyzer.grabToken(req));
    console.log(req.body);
    if (user_id === undefined || unit === undefined || idProduct == undefined ){
      var err = new Error("Bad query");
      err.http_code = 400;
      return errorHandler(err,res);
    }
    if (qty === undefined){
        qty = 0;
    }
    if (max === undefined){
        max = qty;
    }
    var query = "INSERT INTO ITEMS (idProduct, quantity, unit, max, idUser) \
      VALUES ('"+idProduct+"','"+qty+"','"+unit+"','"+max+"','"+user_id+"') RETURNING \
      idItem, idProduct, idUser, quantity, unit, max, created_at, (SELECT productName FROM Products WHERE idProduct = '"+idProduct+"')";
    // Query database
    db.query(query, function(err,item){
      if (err) // Error during query (raising)
        return errorHandler(err,res);
      else{
          var product = new Product(item[0].idproduct, item[0].productname);
          var item = new Item(item[0].iditem, product, item[0].iduser, item[0].quantity, item[0].unit, item[0].max, item[0].created_at);
          res.status(201).send(item);
      }

    });
  },

  getItem: function(req,res) {
    // ADD FILTERS HERE
    var idItem = req.params.id
    var user_id = tokenAnalyzer.getUserId(tokenAnalyzer.grabToken(req));
    var idProduct = req.params.product_id;

    if (user_id !== undefined){
        var query = "SELECT * FROM ITEMS \
        LEFT JOIN PRODUCTS ON PRODUCTS.IDPRODUCT = ITEMS.IDPRODUCT \
        LEFT JOIN CATEGORIES ON CATEGORIES.idCategory = PRODUCTS.IDCATEGORY \
        WHERE PRODUCTS.IDPRODUCT = '"+idProduct+"' AND ITEMS.IDUSER = '"+user_id+"' AND ITEMS.IDITEM = '"+idItem+"'";

        db.query(query, function(err,item){
          if (err) // Error during query (raising)
             errorHandler(err,res)
          else{
              if (item[0] !== undefined){
                      var category = new Category(item[0].idcategory, item[0].categoryname);
                      var product = new Product(item[0].idproduct, item[0].productname, item[0].img, category);
                      var item = new Item(item[0].iditem, product, item[0].iduser, item[0].quantity, item[0].unit, item[0].max, item[0].created_at);
                      res.status(200).send(item);
              }else { // Not found
                  var err = new Error("Item not found");
                  err.http_code = 404;
                  return errorHandler(err,res);
              }

          }
        });
    }else{
        // Missing user_id
        var err = new Error("Bad query !");
        err.http_code = 400;
        return errorHandler(err,res);
    }
  },

  modifyItem: function(req,res) {
        var user_id = tokenAnalyzer.getUserId(tokenAnalyzer.grabToken(req));
        var idProduct = req.params.product_id;
          if (req.params.id !== undefined){
              var params = [];
              var values = [];
              if (req.body.quantity !== undefined){
                params.push('quantity');
                values.push("'"+req.body.quantity+"'");
              }
              if (req.body.max !== undefined){
                params.push('max');
                values.push("'"+req.body.max+"'");
              }
              var query = "UPDATE ITEMS SET ("+params.toString()+") = ("+values.toString()+") \
              WHERE idUser = '"+user_id+"' AND idItem = '"+req.params.id+"' AND idProduct = '"+idProduct+"' RETURNING \
              idItem, idUser, idProduct, quantity, unit, max, created_at";
          }else{
              // Error missing idProduct or Owner (raising 400)
              var err = new Error("Bad query !");
              err.http_code = 400;
              return errorHandler(err,res);
          }
          // Query database
          db.query(query, function(err,item){
            if (err) // Error during query (raising)
              return errorHandler(err,res);
            else{
                if (item[0]){
                    var product = new Product(item[0].idproduct, item[0].productname);
                    var item = new Item(item[0].iditem, product, item[0].iduser, item[0].quantity, item[0].unit, item[0].max, item[0].created_at);
                    res.status(200).send(item);
                    return;
                }else { // Not found
                    var err = new Error("Item not found");
                    err.http_code = 404;
                    return errorHandler(err,res);
                }

            }
          });

  },

  deleteItem: function(req,res){
    // Parse request
    var id = req.params.id;
    var idProduct = req.params.product_id;
    var user_id = tokenAnalyzer.getUserId(tokenAnalyzer.grabToken(req));
    // Delete
        var query = "DELETE FROM Items WHERE idItem = '"+id+"' AND idProduct = '"+idProduct+"' AND idUser = '"+user_id+"' RETURNING idItem";
        // Query database
        db.query(query, function(err,item){
          if (err) // Error during query (raising)
            return errorHandler(err,res);
          else{
              console.log(item[0].iditem);
              if (item[0]){
                  res.status(200).send({
                      "status": 200,
                      "message": "Item deleted",
                      "item": item[0].iditem
                  });
              }
              else {
                  // Item not found
                  var err = new Error("Item not found");
                  err.http_code = 404;
                  return errorHandler(err,res);
              }// Item deleted ?
          }//Query passed
      });// Query
  }





};


module.exports = items;

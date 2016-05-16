var db = require('../../models/db');
var errorHandler = require('../../lib/errorHandler').handler;
var queryBuilder = require('../../lib/queryBuilder').queryBuilder;
var tokenAnalyzer = require('../../lib/TokenAnalyzer');
var Item = require('../../models/Item');
var Category = require('../../models/Category');
var Product = require('../../models/Product');

var items = {
  getItems: function(req,res) {
    // Filters List, Category,
    var user_id = tokenAnalyzer.getUserId(tokenAnalyzer.grabToken(req));
    var id = req.query.id;
    var product_id = req.query.product_id;
    var max_result = req.query.max_result;
    if (user_id !== undefined){
        var query = "SELECT * FROM ITEMS \
        LEFT JOIN PRODUCTS ON PRODUCTS.IDPRODUCT = ITEMS.IDPRODUCT \
        WHERE ITEMS.IDUSER = '"+user_id+"'";

        if (product_id !== undefined)
            var query = query + " AND PRODUCTS.IDPRODUCT = '"+product_id+"'";
        if (id !== undefined)
            var query = query + " AND ITEMS.IDITEM = '"+id+"'";
        if (max_result !== undefined)
            var query = query + " LIMIT "+max_result;
        db.query(query, function(err,items){
          if (err) // Error during query (raising)
             errorHandler(err,res)
          else{
              if (items !== undefined){
                  var result = [];
                  for (i = 0;i<items.length;i++){
                      var product = new Product(items[i].idproduct, items[i].productname, items[i].img, category);
                      var item = new Item(items[i].iditem, product, undefined, items[i].quantity, items[i].max);
                      result.push(item);
                  }


                  res.status(200).send({
                      "status": 200,
                      "message": "Retrieved items successfully",
                      "items": result
                  });
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
    var idProduct = req.body.idProduct;
    var qty = req.body.quantity;
    var user_id = tokenAnalyzer.getUserId(tokenAnalyzer.grabToken(req));
    var item = new Item(undefined,idProduct, user_id, qty);

    if (qty == undefined){
        qty = 0;
    }
    else{
        var err = new Error("Bad query (Missing product)");
        err.http_code = 400;
        return errorHandler(err,res);
    }
    var query = "INSERT INTO ITEMS (idProduct, quantity, idUser) \
      VALUES ('"+idProduct+"','"+qty+"','"+user_id+"') RETURNING \
      idItem, idProduct, quantity, max, (SELECT productName FROM Products WHERE idProduct = '"+idProduct+"')";

    // Query database
    db.query(query, function(err,item){
      if (err) // Error during query (raising)
        fn(err);
      else{
          var product = new Product(item[0].idproduct, item[0].productname);
          var item = new Item(item[0].iditem, product, undefined, item[0].quantity);
          res.status(201).send({
              "status": 201,
              "message": "Item added",
              "item": item
          });
        }
    });

  },

  getItem: function(req,res) {
    // ADD FILTERS HERE
    var idItem = req.params.id
    var user_id = tokenAnalyzer.getUserId(tokenAnalyzer.grabToken(req));

    if (user_id !== undefined){
        var query = "SELECT * FROM ITEMS \
        LEFT JOIN PRODUCTS ON PRODUCTS.IDPRODUCT = ITEMS.IDPRODUCT \
        LEFT JOIN CATEGORIES ON CATEGORIES.idCategory = PRODUCTS.IDCATEGORY \
        WHERE ITEMS.IDUSER = '"+user_id+"' AND ITEMS.IDITEM = '"+idItem+"'";

        db.query(query, function(err,item){
          if (err) // Error during query (raising)
             errorHandler(err,res)
          else{
              if (item[0] !== undefined){
                      var category = new Category(item[0].idcategory, item[0].categoryname);
                      var product = new Product(item[0].idproduct, item[0].productname, item[0].img, category);
                      var item = new Item(item[0].iditem, product, undefined, item[0].quantity, item[0].max);
                      res.status(200).send({
                          "status": 200,
                          "message": "Retrieved item successfully",
                          "item": item
                      });
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
          if (req.params.id !== undefined && req.body.quantity !== undefined){
              var query = "UPDATE ITEMS SET quantity = '"+req.body.quantity+"' \
              WHERE idUser = '"+user_id+"' AND idItem = '"+req.params.id+"' RETURNING \
              idItem, idProduct, quantity, max";
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
                    var item = new Item(item[0].iditem, product, undefined, item[0].quantity, item[0].max);
                    res.status(200).send({
                        "status": 200,
                        "message": "Item modified",
                        "item": item
                    });
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
    var user_id = tokenAnalyzer.getUserId(tokenAnalyzer.grabToken(req));
    // Delete
        var query = "DELETE FROM Items WHERE idItem = '"+id+"' AND idUser = '"+user_id+"' RETURNING idItem";
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

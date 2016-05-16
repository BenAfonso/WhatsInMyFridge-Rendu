var Product = require('./Product');
var Category = require('./Category');
var db = require('../models/db');

function Item(idItem, idProduct, user_id, quantity, unit, max, created_at){
  if (quantity == null){
    quantity = undefined;
  }
  if (idItem == null){
      idItem = undefined;
  }
  if (idProduct == null){
      idProduct = undefined;
  }
  if (user_id == null){
      user_id = undefined;
  }
  if (max == null){
      max = undefined;
  }
  this.idItem = idItem,
  this.Product = idProduct,
  this.idUser = user_id,
  this.quantity = quantity,
  this.unit = unit,
  this.created_at = created_at
  if (max !== undefined && max !== undefined){
      this.max = max,
      this.ratio = quantity / max
  }
  if (idItem !== undefined)
      this.links = [ {
            "rel": "self",
            "href": "/api/v2/items/"+this.idItem
      }];

}

// Methodes
Item.prototype.get = function(id, user_id, category_id, max_result, callback){

    if (user_id !== undefined){
        if (id == undefined){
            var query = "SELECT * FROM ITEMS \
            LEFT JOIN PRODUCTS ON PRODUCTS.IDPRODUCT = ITEMS.IDPRODUCT \
            LEFT JOIN CATEGORIES ON CATEGORIES.idCategory = PRODUCTS.IDCATEGORY \
            WHERE PRODUCTS.IDUSER = '"+user_id+"'";
        }

        if (category_id !== undefined)
            var query = query + " AND PRODUCTS.IDCATEGORY = '"+category_id+"'";
        if (id !== undefined)
            var query = query + " AND ITEMS.IDITEM = '"+id+"'";
        if (max_result !== undefined)
            var query = query + " LIMIT "+max_result;
        db.query(query, function(err,items){
          if (err) // Error during query (raising)
             return;
          else{
              if (items !== undefined){
                  var result = [];
                  for (i = 0;i<items.length;i++){
                      var category = new Category(items[i].idcategory, items[i].categoryname);
                      var product = new Product(items[i].idproduct, items[i].productname, items[i].img, category);
                      var item = new Item(items[i].idItem, product, undefined, items[i].quantity, items[i].max);
                      result.push(item);
                  }

                  var res = {
                      "status": 200,
                      "message": "Retrieved items successfully",
                      "items": result
                  };
                  return fn(null, res);
              }else { // Not found
                  var err = new Error("Item not found");
                  err.http_code = 404;
                  return fn(err);
              }

          }
        });
    }else{
        // Missing user_id
        var err = new Error("Bad query !");
        err.http_code = 400;
        return fn(err);
    }

}
Item.prototype.update = function(fn){
    // Update

    if ((this.idItem !== undefined || this.Product !== undefined) && this.quantity !== undefined){
        var query = "UPDATE ITEMS SET quantity = '"+this.quantity+"' \
        WHERE idUser = '"+this.idUser+"' idProduct = '"+this.Product+"' AND idItem = '"+this.idItem+"' RETURNING \
        idItem, idProduct, quantity, max, (SELECT productName FROM Products WHERE idProduct = '"+idProduct+"')";
    }else{
        // Error missing idProduct or Owner (raising 400)
        var err = new Error("Bad query !");
        err.http_code = 400;
        return fn(err);
    }
    // Query database
    db.query(query, function(err,item){
      if (err) // Error during query (raising)
        fn(err);
      else{
          if (item[0]){
              var product = new Product(item[0].idproduct, item[0].productname);
              var item = new Item(item[0].iditem, product, undefined, item[0].quantity, item[0].max);
              var res = {
                  "status": 200,
                  "message": "Item modified",
                  "item": item
              };
              return fn(null, res);
          }else { // Not found
              var err = new Error("Item not found");
              err.http_code = 404;
              return fn(err);
          }

      }
    });
};

/**
*   Insert the Item into database
*
*/

Item.prototype.insert = function(fn){
    // Update
    if (this.Product !== undefined){
        if (this.quantity == undefined){
            this.quantity = 0;
        }
        var query = "INSERT INTO ITEMS (idProduct, quantity, idUser) \
        VALUES ('"+this.Product+"','"+this.quantity+"','"+this.idUser+"') RETURNING \
        idItem, idProduct, quantity, max, (SELECT productName FROM Products WHERE idProduct = '"+this.Product+"')";
    }// idUser
    else{
        var err = new Error("Bad query (Missing product)");
        err.http_code = 400;
        return fn(err);
    }
    // Query database
    db.query(query, function(err,item){
      if (err) // Error during query (raising)
        fn(err);
      else{
          var product = new Product(item[0].idproduct, item[0].productname);
          var item = new Item(item[0].iditem, product, undefined, item[0].quantity);
          var res = {
              "status": 201,
              "message": "Item added",
              "item": item
          };
          fn(null, res);
      }
    });
};
// TODO Secure
Item.prototype.delete = function(){
    // Delete
    if (this.Product !== undefined){
        var query = "DELETE FROM Items WHERE idItem = '"+this.idItem+"' AND idUser = '"+this.idUser+"' RETURNING idItem";
        // Query database
        db.query(query, function(err,item){
          if (err) // Error during query (raising)
            fn(err);
          else{
              if (item[0].iditem){
                  var res = {
                      "status": 200,
                      "message": "Item deleted",
                      "item": item[0].iditem
                  };
                  fn(null, res);
              }
              else {
                  // Item not found
                  var err = new Error("Item not found");
                  err.http_code = 404;
                  return fn(err);
              }// Item deleted ?
          }//Query passed
      });// Query
  }// idItem (if)
};// Delete


module.exports = Item;

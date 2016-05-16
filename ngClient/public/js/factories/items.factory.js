myApp.factory("Items", function($resource,APILINK) {
  var Items = $resource(APILINK+"/api/v2/products/:product_id/items/:id", {product_id: '@product_id', id: '@id'}, {
      query: {method: 'GET', isArray: true},
      update: { method: 'PUT' }
  });

  // Gets the product associated with the Item
  Items.prototype.getProduct = function(){
    Products.get({id: this.product.idProduct}, function(product){
      return product;
    });
  };

  // Sets the ratio of an Item (Percentage of qty left)
  Items.prototype.setRatio = function(){
    this.ratio = parseInt((this.quantity / this.max)*100);
  };


  return Items;
});

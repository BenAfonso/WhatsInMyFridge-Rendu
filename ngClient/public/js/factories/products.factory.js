myApp.factory("Products", function($resource,$q, APILINK, Items) {
  var Products = $resource(APILINK+"/api/v2/products/:id", {id: '@id'}, {
      query: { method: 'GET', isArray: true },
      update: { method: 'PUT' }
  });


  Products.prototype.getItems = function(){
    var deferred = $q.defer();
    Items.query({product_id: this.idProduct}, function(items){
      deferred.resolve(items);
    });
    return deferred.promise;
  };

  // Sets the quantity & max of a product depending on all the items associated
  Products.prototype.getQuantityMaxRatio = function(){
      var result = {};
      var deferred = $q.defer();
      Items.query({product_id: this.idProduct},function(items){
        var sum = 0;
        var max = 0;
        for (i = 0; i < items.length; i++){
            sum = sum + parseInt(items[i].quantity);
            max = max + parseInt(items[i].max);
            items[i].ratio = parseInt((items[i].quantity / items[i].max)*100);
        }
        result.quantity = sum;
        result.max = max;
        deferred.resolve(result);
      });
      return deferred.promise;
    };

  return Products;
});

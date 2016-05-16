myApp.factory("Ingredients", function($resource,APILINK, Products, Recipes, $q) {
  var Ingredients = $resource(APILINK+"/api/v2/recipes/:recipe_id/ingredients/:product_id", {recipe_id: '@recipe_id', product_id: '@product_id'}, {
      query: {method: 'GET', isArray: true},
      get: {method: 'GET', isArray: true},
      update: { method: 'PUT' }
  });

  // Get the producted associated with the ingredient
  Ingredients.prototype.getProduct = function(){
    var deferred = $q.defer();
    Products.get({id: this.product.idProduct}, function(product){
      deferred.resolve(product);
    });
    return deferred.promise;
  };

  // Returns true if the ingredient is 'available'
  Ingredients.prototype.isAvailable = function(fn){
    var deferred = $q.defer();
    if (this.product.quantity > this.quantity){
        deferred.resolve(true);
    }
    return deferred.promise;
  };

  // Returns ingredient's product informations such as real quantity 
  Ingredients.prototype.getProductQuantity = function(){
      var deferred = $q.defer();
      Products.get({id: this.product.idProduct}, function(product){
        deferred.resolve(product);
      });
      return deferred.promise;
  };
  return Ingredients;
});

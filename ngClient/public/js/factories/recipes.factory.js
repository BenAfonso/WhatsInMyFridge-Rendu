myApp.factory("Recipes", function($resource,APILINK, $q) {
  var Recipes = $resource(APILINK+"/api/v2/recipes/:id", {id: '@id'}, {
      query: {method: 'GET', isArray: true}
  });

  // Get ingredients associated with the Recipe
  Recipes.prototype.getIngredients = function(){
    var deferred = $q.defer();
    Ingredients.query({recipe_id: this.id}, function(ingredients){
        deferred.resolve(ingredients);
    });
    return deferred.promise;
  };

/*
  Recipes.prototype.canBeDone = function(){
    var res = true;
    this.ingredients.forEach(function(ingredient){
      if (!ingredient.isAvailable()){
        res = false;
      }
    })
  }
*/

  return Recipes;
});

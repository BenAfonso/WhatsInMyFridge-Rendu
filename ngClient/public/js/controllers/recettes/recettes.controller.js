myApp.controller("RecettesCtrl", ['$scope','Recipes','Ingredients',
    function($scope, Recipes, Ingredients){
      $scope.recipes = [];
      $scope.addFormDisplayed = false;

      // Sets the product quantity of an ingredient
      function setQuantity(ingredient){
          ingredient.getProductQuantity().then(function(data){
            ingredient.product.quantity = data.quantity;
          });
      }

      // Add the ingredients to the given Recipe
      var addIngredients = function(recipe){
        Ingredients.get({recipe_id: recipe.idRecipe}, function(ingredients){
            recipe.ingredients = ingredients;
            recipe.ingredients.forEach(setQuantity);
        });

      };


      // Populate the scope with ingredients
      $scope.populateIngredients = function(){
        for (i=0;i<$scope.recipes.length;i++){
          addIngredients($scope.recipes[i]);
        }
      };

      // Calls the factory to get all recipes and populate $scope with it
      Recipes.query(function(recipes){
        $scope.recipes = recipes;
        $scope.populateIngredients();
      });

      // display or not the 'new recipe' Form
      $scope.toggleAddForm = function(){
        $scope.addFormDisplayed = !$scope.addFormDisplayed;
      };



      // Calls the factory to add a recipe and add it to $scope (Ajax call)
      $scope.addRecipe = function(recipe){
        Recipes.save(recipe,function(result){
          // Add the recipe to the recipes
          $scope.recipes.unshift(result);
          // Clear and hide the form
          $scope.newRecipe = {};
          $scope.addFormDisplayed = false;
        });
      };

      // Calls the facyory to delete a recipe and removes it from the $scope
      $scope.deleteRecipe = function(recipe){
        Recipes.delete({id: recipe.idRecipe},function(result){
          // Remove the recipe from the recipes (Ajax call)
          $scope.recipes.splice($scope.recipes.indexOf(recipe), 1);
        });
      };


    }
]);

myApp.controller("RecetteCtrl", ['$scope','$routeParams','Recipes','Ingredients','Products',
    function($scope, $routeParams, Recipes, Ingredients, Products){
      //Init
      $scope.recipe = {};
      $scope.products = [];
      $scope.ingredients = [];


      // Ajax call to get the requested Recipe
      Recipes.get({id: $routeParams.id}, function(recipe){
        $scope.recipe = recipe;
      });

      // Call a service to set the quantity of an ingredient's product
      function setQuantity(ingredient){
          ingredient.getProductQuantity().then(function(data){
            ingredient.product.quantity = data.quantity;
          });
      }

      // Ajax call to populates ingredients array
      Ingredients.query({recipe_id: $routeParams.id}, function(ingredients){
        $scope.ingredients = ingredients;
        $scope.ingredients.forEach(setQuantity);
        Products.query(function(products){
          $scope.products = products;
        });
      });


      // Display or not the edit menu
      $scope.editQuantity = function(ingredient){
        if (ingredient.editing !== undefined){
          ingredient.editing = !ingredient.editing;
        }else{
          ingredient.editing = true;
        }
      };

      // Call the factory for update an ingredient
      $scope.edit = function(ingredient){
        if (parseInt(ingredient).quantity === 0){
          $scope.deleteIngredient(ingredient);
        }else {
          ingredient.$update({recipe_id: ingredient.recipe.idRecipe,product_id: ingredient.product.idProduct}, function(result){
            setQuantity(ingredient);
            $scope.ingredients[$scope.ingredients.indexOf(ingredient)] = ingredient;
          });
        }
      };


      // Returns true if the owned quantity is greater than the requested quantity
      $scope.isEnough = function(ingredient){
        return (parseInt(ingredient.quantity) < parseInt(ingredient.product.quantity));
      };


      // Toggle a product as selected and display the add Form
      $scope.selectProduct = function(product){
        $scope.selectedProduct = product;
        $scope.selectedProduct.quantity = undefined;
      };

      // Call the factory to insert an ingredient
      $scope.addIngredient = function(ingredient){
        ingredient.idRecipe = $routeParams.id;
        Ingredients.save({recipe_id: ingredient.idRecipe}, ingredient, function(newingredient){
          $scope.ingredients.unshift(newingredient);
          $scope.selectedProduct = undefined;
        });
        // Refresh the scope without querying
        $scope.products.splice($scope.products.indexOf(ingredient.product), 1);
      };

      // Call the factory to delete an ingredient
      $scope.deleteIngredient = function(ingredient){
        Ingredients.delete({recipe_id: $routeParams.id, product_id: ingredient.product.idProduct}, function(){
          $scope.ingredients.splice($scope.ingredients.indexOf(ingredient), 1);
        });
      };



    }
]);

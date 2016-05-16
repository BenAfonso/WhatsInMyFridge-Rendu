myApp.controller("FrigoCtrl", ['$scope','Products','Categories',
    function($scope, Products, Categories){
      // Initialisation des covoiturages
      $scope.products = [];
      $scope.categories = [];

      // Populating $scope with DB
      Products.query(function(result){
        $scope.products = result;
      });

      Categories.query(function(categories){
        $scope.categories = categories;
        console.log(categories);
      });

      $scope.addProductMenu = false;
      $scope.leftMenu = false;
      $scope.showFiltersMenu = false;
      $scope.showSortingMenu = false;
      $scope.addFormDisplayed = false;
      $scope.selectedCategory = false;
      $scope.displayNewCategory = false;

      $scope.selectCategory = function(category){
        // Unselect the category (Toggle)
        if ($scope.selectedCategory == category || category === undefined)
          $scope.selectedCategory = false;
        else
          $scope.selectedCategory = category;
      };

      // Returns true if it's the selected category
      $scope.isSelectedCategory = function(category){
        return ($scope.selectedCategory.idCategory == category.idCategory || !$scope.selectedCategory);
      };

      // Toggle the new Product form
      $scope.toggleAddForm = function(){
          $scope.addFormDisplayed = !$scope.addFormDisplayed;
      };

      // Toggle the state of a product to 'selected' or not
      $scope.selectProduct = function(product){
          if (product.modifying)
            return;
          if (product.selected !== undefined)
            product.selected = !product.selected;
          else
            product.selected = true;
      };

      // Returns true if a product has 'selected' state
      $scope.isSelected = function(product){
          return product.selected;
      };

      // Toggle the state of a product 'modifying' or not
      $scope.toggleModifyProduct = function(product){
          if (product.modifying !== undefined)
            product.modifying = !product.modifying;
          else
            product.modifying = true;
      };

      // Returns true if a product is being modified
      $scope.isModifying = function(product){
          return product.modifying;
      };


      // Display or not the filters menu
      $scope.toggleFiltersMenu = function(){
        $scope.showFiltersMenu = !$scope.showFiltersMenu;
    };

      // Display or not the sorting menu
      $scope.toggleSortingMenu = function(){
        $scope.showSortingMenu = !$scope.showSortingMenu;
    };

      // Display or not the left menu
      $scope.toggleLeftMenu = function(){
        $scope.leftMenu = !$scope.leftMenu;
    };



      // Call the factory to add a product
      $scope.addProduct = function(product){
        if ($scope.selectedCategory.idCategory){
          product.idCategory = $scope.selectedCategory.idCategory;
        }
        Products.save(product, function(result){
          // Add the just-posted product at first position of products with AJAX call
          $scope.products.unshift(result);
          $scope.newProduct = {};
          $scope.toggleAddForm();
        });

      };

      // Calls the factory to modify a product
      $scope.modifyProduct = function(product){
          product.$update({id:product.idProduct}, function(product){
              // Refresh only the product entry with AJAX call
              $scope.products[$scope.products.indexOf(product)] = product;
          });

      };

      // Calls the factory to delete a product
      $scope.deleteProduct = function(product){
          Products.delete({id:product.idProduct},function(result){
            // Remove the deleted item from the products list with Ajax call
            $scope.products.splice($scope.products.indexOf(product), 1);
          });

      };

      $scope.addCategory = function(category){
        Categories.save(category, function(result){
          $scope.categories.unshift(result);
          $scope.newCategory = {};
          $scope.displayNewCategory = false;
        });
      };

      $scope.toggleNewCategory = function(){
        $scope.displayNewCategory = !$scope.displayNewCategory;
      };

      $scope.deleteCategory = function(category){
        Categories.delete({id: category.idCategory}, function(result){
          $scope.categories.splice($scope.categories.indexOf(category), 1);
        });
      };



    }
]);

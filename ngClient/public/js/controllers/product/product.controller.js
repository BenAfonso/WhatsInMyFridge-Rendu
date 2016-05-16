myApp.controller("ProductCtrl", ['$scope','$routeParams','Products','Items',
    function($scope,$routeParams,Products,Items){

      $scope.currentDate = new Date();
      $scope.addItem = false;
      var id = $routeParams.id;

      // Call the factory to get the requested Product
      Products.get({ id : id }, function(product){
        $scope.product = product;
        $scope.product.getQuantityMaxRatio().then(function(result){
          $scope.product.quantity = result.quantity;
          $scope.product.max = result.max;
        });
      });



      $scope.saveItem = function(newItem){
        newItem.idProduct = id;
        newItem.max = newItem.quantity;
        Items.save({product_id: id},newItem, function(result){
          // Reset the form and hide it
          $scope.newItem = {};
          $scope.addItem = false;
          // Initialize ratio to 100%
          result.ratio = 100;
          // Add the result to items (Ajax call)
          $scope.items.unshift(result);
          // Refresh the product infos

          $scope.product.quantity = parseInt($scope.product.quantity) + parseInt(newItem.quantity);
          $scope.product.max = parseInt($scope.product.max) + parseInt(newItem.max);
        });
      };


      // Toggle the item Form display
      $scope.showAddItem = function(){
        $scope.addItem = !$scope.addItem;
      };

      // Returns true if the item form is shown
      $scope.addItemShown = function(){
        return ($scope.addItem === true);
      };

      // Calls the Factory to get all product's Items
      // This makes a GET /api/v2/products/:id/items
      Items.query({product_id: id},function(items){
        $scope.items = items;
        $scope.items.forEach(function(item){
          item.setRatio();
        });
      });

      // Returns true if a given item is being 'edited'
      $scope.editingItem = function(item){
        return item.editing;
      };

      // Toggle the 'editing' state of an item
      $scope.toggleEditItem = function(item){
        if (item.editing !== undefined)
          item.editing = !item.editing;
        else
          item.editing = true;
      };

      // Calls the Factory to update an item
      // If an item is updated to quantity 0, it's deleted
      $scope.updateItem = function(item){
        if (parseInt(item.quantity) === 0){ // If the stack is over (quantity == 0)
          Items.delete({product_id: id, id:item.idItem}, function(result){
            $scope.items.splice($scope.items.indexOf(item), 1);
          });
        }else{
          item.$update({product_id: id, id:item.idItem}, function(result){
            // Refresh only the item entry with AJAX call
            item.ratio = parseInt((result.quantity / result.max)*100);
            $scope.items[$scope.items.indexOf(item)] = item;
            $scope.product.setQuantityMaxRatio();
          });
        }

      };



    }
]);

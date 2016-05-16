myApp.controller("CoursesCtrl", ['$scope','Products',
    function($scope, Products){

      $scope.products = [];
      $scope.lowstocks = [];
      $scope.nostocks = [];

      $scope.settingsDisplayed = false;
      // Alert stock levels
      $scope.alertLevel3 = 0.1;
      $scope.alertLevel2 = 0.3;
      $scope.alertLevel1 = 0.5;
      $scope.filterAlertLevel0 = true;
      $scope.filterAlertLevel1 = true;
      $scope.filterAlertLevel2 = true;
      $scope.filterAlertLevel3 = true;

      // Calls the Factory to get all products
      Products.query(function(result){
        $scope.products = result;
        $scope.getLowStocks();
      });

      // Toggle the settings menu (displayed or not)
      $scope.toggleSettings = function(){
        $scope.settingsDisplayed = !$scope.settingsDisplayed;
      };


      // Depending on slider's inputs, it sets a product alertLevel to later display differently theses
      // depending on the stocks
      
      $scope.alertLevel = function(product){
        if ((product.quantity / product.max) < $scope.alertLevel3 || product.max === 0){
          product.alertLevel = 3;
          return 'critical';
        }else if ((product.quantity / product.max) < $scope.alertLevel2 ){
          product.alertLevel = 2;
          return 'alert';
        }else if ((product.quantity / product.max) < $scope.alertLevel1){
          product.alertLevel = 1;
          return 'warning';
        }else {
          product.alertLevel = 0;
          return 'cool';
        }
      };


      // Just compare the product alert level with a given level
      $scope.isAlertLevel = function(product, level){
        return (product.alertLevel == level);
      };

      // Returns true if an item is shown (depending on the alertLevel and which checkboxes are checked)
      $scope.isShown = function(product){
        return ((product.alertLevel === 0 && $scope.filterAlertLevel0) || (product.alertLevel == 1 && $scope.filterAlertLevel1) || (product.alertLevel == 2 && $scope.filterAlertLevel2) || (product.alertLevel == 3 && $scope.filterAlertLevel3));

      };

      // Sorts products array in 2 differents array
      $scope.getLowStocks = function(){
        for (i=0; i<$scope.products.length; i++){
          if (($scope.products[i].quantity / $scope.products[i].max) < 0.2 && ($scope.products[i].max !== 0) ){
            $scope.lowstocks.push($scope.products[i]);
          } else if ($scope.products[i].max === 0) {
            $scope.nostocks.push($scope.products[i]);
          }
        }
      };

    }
]);

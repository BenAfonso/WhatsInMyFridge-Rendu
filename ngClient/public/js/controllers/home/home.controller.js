myApp.controller("HomeCtrl", ['$scope','$http','APILINK',
    function($scope, $http, APILINK){
      $http.get(APILINK+'/api/v2/users/me').then(function(response){
        $scope.username = response.data.username;
      });

    }
]);

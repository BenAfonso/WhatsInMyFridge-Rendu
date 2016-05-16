myApp.controller('LoginCtrl', ['$scope', '$window', '$location', 'UserAuthFactory', 'AuthenticationFactory',
  function($scope, $window, $location, UserAuthFactory, AuthenticationFactory) {

    $scope.login = function() {

      var username = $scope.username,
        password = $scope.password;

      if (username !== undefined && password !== undefined) {
        UserAuthFactory.login(username, password).success(function(data) {

          AuthenticationFactory.isLogged = true;

          $window.sessionStorage.token = data.token;


          $location.path("/home");


        }).error(function(response) {
          if (response.status == 401)
            alert("Mot de passe incorrect.");
          else if (response.status == 404)
            alert("Nom d'utilisateur incorrect.");
          else
            alert("Une erreur est survenue.");
        });
      } else {
        alert('Merci de renseignez les champs.');
      }

    };

  }
]);

myApp.controller("RegisterCtrl", ['$scope','$window','$location','UserAuthFactory','AuthenticationFactory',
    function($scope,$window,$location,UserAuthFactory,AuthenticationFactory){
        $scope.register = function(){
            if ($scope.password==$scope.password2){
                UserAuthFactory.register($scope.username, $scope.password).success(function(){
                  alert("Votre compte a bien été créé, vous allez être redirigé !");

                });


                // Errors handling TODO

            }
            else{
                alert("Les deux mots de passes ne sont pas identiques !");
            }
        };

    }
]);

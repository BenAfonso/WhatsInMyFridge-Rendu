var myApp = angular.module('WIMF', ['ngRoute','ngResource']);

//myApp.constant('APILINK','http://localhost:3000');
myApp.constant('APILINK','http://31.32.127.70:3000');

//myApp.constant('APILINK','https://stark-basin-30783.herokuapp.com');

myApp.config(function($routeProvider, $httpProvider) {

  $httpProvider.interceptors.push('TokenInterceptor');

  $routeProvider
    .when('/login',{
      templateUrl: 'partials/login.html',
      controller: 'LoginCtrl',
      access: {
        requiredLogin: false
      }
    }).when('/register', {
      templateUrl: 'partials/register.html',
      controller: 'RegisterCtrl',
      access: {
        requiredLogin: false
      }
    }).when('/panel', {
      templateUrl: 'partials/panel/panel.html',
      controller: 'FrigoCtrl',
      access: {
        requiredLogin: true
      }
    }).when('/product/:id', {
      templateUrl: 'partials/product/product.html',
      controller: 'ProductCtrl',
      access: {
        requiredLogin: true
      }
    }).when('/mescourses', {
      templateUrl: 'partials/courses/courses.html',
      controller: 'CoursesCtrl',
      access: {
        requiredLogin: true
      }
    }).when('/mesrecettes', {
      templateUrl: 'partials/recettes/recettes.html',
      controller: 'RecettesCtrl',
      access: {
        requiredLogin: true
      }
    }).when('/recette/:id', {
      templateUrl: 'partials/recettes/recette.html',
      controller: 'RecetteCtrl',
      access: {
        requiredLogin: true
      }
    }).when('/', {
      templateUrl: 'partials/home/home.html',
      controller: 'HomeCtrl',
      access: {
        requiredLogin: true
      }

  }).otherwise({
      redirectTo: '/login'
    });
});

myApp.run(function($rootScope, $window, $location, AuthenticationFactory) {
  // when the page refreshes, check if the user is already logged in
  AuthenticationFactory.check();

  $rootScope.$on("$routeChangeStart", function(event, nextRoute, currentRoute) {
    if ((nextRoute.access && nextRoute.access.requiredLogin) && !AuthenticationFactory.isLogged) {
      $location.path("/login");
    } else {
      // check if user object exists else fetch it. This is incase of a page refresh
      if (!AuthenticationFactory.user) AuthenticationFactory.user = $window.sessionStorage.user;
      if (!AuthenticationFactory.userRole) AuthenticationFactory.userRole = $window.sessionStorage.userRole;
    }
  });

  $rootScope.$on('$routeChangeSuccess', function(event, nextRoute, currentRoute) {
    $rootScope.showMenu = AuthenticationFactory.isLogged;
    $rootScope.role = AuthenticationFactory.userRole;
    // if the user is already logged in, take him to the home page
    if (AuthenticationFactory.isLogged === true && $location.path() == '/login') {
      $location.path('/');
    }
  });
});


myApp.controller("MainCtrl", ['$scope','$http','$location','UserAuthFactory',
    function($scope,$http,$location,UserAuthFactory){

        $scope.navstate = false;
        $scope.logout=function(){
          UserAuthFactory.logout();
        };
        $scope.go = function(path){
          componentHandler.upgradeDom();

          $location.path(path);
      };

        $scope.toggleNav = function(){
          $scope.navstate = !$scope.navstate;
      };

        $scope.closeNav = function(){
          $scope.navstate = false;
      };
        $scope.isOpenedNav = function(){
          return $scope.navstate;
      };

    }
]);

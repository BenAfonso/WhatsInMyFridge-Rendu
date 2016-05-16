myApp.factory('AuthenticationFactory', function($window) {
  var auth = {
    isLogged: false,
    check: function() {
      if ($window.sessionStorage.token) {
        this.isLogged = true;
      } else {
        this.isLogged = false;
        delete this.user;
      }
    }
};

  return auth;
});

myApp.factory('UserAuthFactory', function($window, APILINK, $location, $http, AuthenticationFactory) {
  return {
    login: function(username, password) {
      return $http.post(APILINK+'/login', {
        username: username,
        password: password
      });
    },
    logout: function() {

      if (AuthenticationFactory.isLogged) {

        AuthenticationFactory.isLogged = false;
        delete AuthenticationFactory.user;
        delete AuthenticationFactory.userid;
        delete AuthenticationFactory.userRole;

        delete $window.sessionStorage.token;
        delete $window.sessionStorage.user;
        delete $window.sessionStorage.userid;
        delete $window.sessionStorage.userRole;

        $location.path("/login");
      }

    },
    register: function(username, password) {
      return $http.post(APILINK+'/register', {
        username: username,
        password: password
      });
    }
};
});

myApp.factory('TokenInterceptor', function($q, $window) {
  return {
    request: function(config) {
      config.headers = config.headers || {};
      if ($window.sessionStorage.token) {
        config.headers['X-Access-Token'] = $window.sessionStorage.token;
        config.headers['Content-Type'] = "application/json";
      }
      return config || $q.when(config);
    },

    response: function(response) {
      return response || $q.when(response);
    }
  };
});

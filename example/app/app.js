'use strict';

/** Application code **/
angular.module('myApp', [
  'ngRoute',
  'github'
])
.config(function($routeProvider) {
  $routeProvider
  .when('/gists', {
    templateUrl: 'views/gists.html',
    controller: 'GistsCtrl',
    controllerAs: 'gists',
    resolve: {
      gists: function(Gist) {
        return Gist.query();
      }
    }
  })
  .when('/gists/:id', {
    templateUrl: 'views/gist.html',
    controller: 'GistCtrl',
    controllerAs: 'gist',
    resolve: {
      gist: function(Gist, $route) {
        return Gist.get($route.current.params.id);
      }
    }
  })
  .when('/users/:login', {
    templateUrl: 'views/user.html',
    controller: 'UserCtrl',
    controllerAs: 'user',
    resolve: {
      user: function(User, $route) {
        return User.get($route.current.params.login);
      }
    }
  })
  .otherwise({
    redirectTo: '/gists'
  });
});

(function (global) {
  angular.module('asteroid.editor', ['ui.bootstrap', 'asteroid.services'])
    .config(function ($routeProvider, $locationProvider) {
      $routeProvider
        .when('/', {});

      $locationProvider.html5Mode(false);
    })
    .controller('ProjectList', function ($scope, $exceptionHandler, Workspace) {
      $scope.names = [];

      Workspace.getProjects()
        .then(function (data) {
          $scope.names = data.names;
        })
        .then(null, $exceptionHandler);
    });
}(this));

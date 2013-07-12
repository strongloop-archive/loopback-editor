(function (global) {
  var Modals = {
    OPEN_PROJECT: '/partial/modal/open-project.html',
    CREATE_PROJECT: '/partial/modal/create-project.html'
  };

  angular.module('asteroid.editor', ['ui.bootstrap', 'asteroid.services'])
    .config(function ($routeProvider, $locationProvider) {
      $routeProvider
        .when('/', {});

      $locationProvider.html5Mode(false);
    })
    .controller('Editor', function ($scope, $exceptionHandler, Workspace) {
      $scope.project = null;
      $scope.modal = '';

      $scope.safeApply = function () {
        if (!$scope.$$phase && !$scope.$root.$$phase) {
          $scope.$apply();
        }
      };

      $scope.setProject = function (project) {
        $scope.project = project;
        $scope.safeApply();
      };

      $scope.showModal = function (modal) {
        $scope.modal = modal;
        $scope.safeApply();
      };

      $scope.hideModal = function (modal) {
        if (modal && $scope.modal != modal) {
          return;
        }

        $scope.modal = '';
        $scope.safeApply();
      };

      $scope.openProject = function (name) {
        if (!name) {
          console.log('-> Open Project');
          $scope.showModal(Modals.OPEN_PROJECT);
          return;
        }

        console.log('-> Open Project: ' + name);
        Workspace.getProject(name)
          .then(function (data) {
            console.log('<- Opened: ', data);
            $scope.setProject(data);
          })
          .then(null, $exceptionHandler);
      };

      $scope.createProject = function (name, options) {
        if (!name) {
          console.log('-> Create Project');
          $scope.showModal(Modals.CREATE_PROJECT);
          return;
        }

        console.log('-> Create Project: ' + name + ' with ', options);
        Workspace.createProject(name, options)
          .then(function (data) {
            console.log('<- Created:', data);
            $scope.setProject(data);
          })
          .then(null, $exceptionHandler);
      };
    })
    .controller('Project', function ($scope, $exceptionHandler, Workspace) {
      $scope.name = '';
      $scope.templates = [
        {
          label: 'Mobile Backend'
        }
      ];
      $scope.template = $scope.templates[0];

      $scope.addModule = function () {
        console.log('-> Add Module');
      };
    })
    .controller('ProjectList', function ($scope, $exceptionHandler, Workspace) {
      $scope.names = [];

      Workspace.getProjects()
        .then(function (data) {
          $scope.names = data.names;
        })
        .then(null, $exceptionHandler);
    })
    .controller('Modal', function ($scope) {
      $scope.dismiss = function () {
        $scope.hideModal();
      };
    });
}(this));

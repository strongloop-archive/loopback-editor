(function (global) {
  angular.module('asteroid.editor', ['asteroid.services', 'asteroid.editor.tools'])
    .controller('Editor', function ($scope, $exceptionHandler, $q, Session) {
      $scope.getActiveModule = function () {
        return Session.getActiveModule();
      };
    })
    .controller('Project', function ($scope, Session, Modal) {
      $scope.getActiveProject = function () {
        return Session.getActiveProject();
      };

      $scope.getProjectModules = function () {
        return Session.getProjectModules();
      };

      $scope.showOpenProject = function () {
        return Modal.showOpenProject();
      };

      $scope.openModuleEditor = function (name) {
        return Session.loadModule(name);
      };

      $scope.openToolbox = function () {
        Modal.showToolbox();
      };
    })
    .controller('ProjectWizard', function ($scope, Session, Modal) {
      $scope.templates = [
        {
          label: 'Mobile Backend'
        }
      ];
      $scope.template = $scope.templates[0];

      function init() {
        $scope.project = {
          name: '',
          description: ''
        };
      }

      $scope.createProject = function(name, options) {
        init();
        return Session.createNewProject(name, options).then($scope.dismiss);
      };

      init();
    })
    .controller('ProjectList', function ($scope, $exceptionHandler, Session, Modal) {
      $scope.names = [];

      $scope.getAllProjects = function () {
        return Session.getAllProjects();
      };

      $scope.removeProject = function (name) {
        return Session.removeProject(name);
      };

      $scope.openProject = function (name) {
        return Session.loadProject(name)
          .then($scope.dismiss);
      };
    })
    .controller('Modal', function ($scope, Modal) {
      $scope.dismiss = function () {
        return Modal.hideActiveModal();
      };

      $scope.showOpenProject = function () {
        return Modal.showOpenProject();
      };

      $scope.showCreateProject = function () {
        return Modal.showCreateProject();
      };
    });
}(this));

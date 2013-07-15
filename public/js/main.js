(function (global) {
  var Modals = {
    OPEN_PROJECT: '/partial/modal/open-project.html',
    CREATE_PROJECT: '/partial/modal/create-project.html'
  };

  if (CodeMirror) {
    CodeMirror.defaults.theme = 'monokai';
    CodeMirror.defaults.mode = 'application/json';
  }

  angular.module('asteroid.editor', ['ui.bootstrap', 'ui.codemirror', 'asteroid.services', 'asteroid.editor.tools'])
    .controller('Editor', function ($scope, $exceptionHandler, Workspace, $q) {
      $scope.project = null;
      $scope.modal = '';
      $scope.editor = '';
      $scope.module = null;

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
        return Workspace.getProject(name)
          .then(function (data) {
            console.log('<- Opened: ', data);
            $scope.setProject(data);
          })
          .then(null, $exceptionHandler);
      };

      $scope.closeProject = function () {
        $scope.project = null;
      };

      $scope.newProject = function () {
        $scope.project = {
          name: '',
          description: ''
        };
      };

      $scope.createProject = function (name, options) {
        if (!name) {
          console.log('-> Create Project');
          $scope.showModal(Modals.CREATE_PROJECT);
          return;
        }

        console.log('-> Create Project: ' + name + ' with ', options);
        return Workspace.createProject(name, options)
          .then(function (data) {
            console.log('<- Created:', data);
            $scope.setProject(data);
          })
          .then(null, $exceptionHandler);
      };

      $scope.removeProject = function (name) {
        console.log('-> Remove Project: ' + name);
        return Workspace.removeProject(name)
          .then(function (data) {
            console.log('<- Removed:', data);
          })
          .then(null, $exceptionHandler);
      };

      $scope.openModuleEditor = function (name) {
        if (!$scope.project || !$scope.project.name) {
          return $q.reject('No project loaded.');
        }

        console.log('-> Open Module: ' + name);
        return Workspace.getModuleForProject($scope.project.name, name)
          .then(function (data) {
            console.log('<- Opened: ', data);
            $scope.editor = data.editor;

            // TODO - Should this move?
            $scope.module = data.data;
            $scope.module.name = name;
          })
          .then(null, $exceptionHandler);
      };

      $scope.updateModule = function () {
        console.log('-> Updating Module');
        return Workspace.addModuleToProject($scope.project.name, $scope.module.name, $scope.module)
          .then(function (data) {
            console.log('<- Updated:', data);
          })
          .then(null, $exceptionHandler);
      };
    })
    .controller('Project', function ($scope) {
      $scope.addModule = function () {
        console.log('-> Add Module');
      };
    })
    .controller('ProjectWizard', function ($scope) {
      $scope.templates = [
        {
          label: 'Mobile Backend'
        }
      ];
      $scope.template = $scope.templates[0];

      $scope.project = {
        name: '',
        description: ''
      };

      $scope.createProject = function(name, options) {
        $scope.$parent.createProject(name, options)
          .then(function () {
            $scope.dismiss();
          });
      };
    })
    .controller('ProjectList', function ($scope, $exceptionHandler, Workspace) {
      $scope.names = [];

      Workspace.getProjects()
        .then(function (data) {
          $scope.names = data.names;
        })
        .then(null, $exceptionHandler);

      $scope.removeProject = function (name) {
        $scope.$parent.removeProject(name)
          .then(function () {
            $scope.names.splice($scope.names.indexOf(name), 1);
          });
      };

      $scope.openProject = function (name) {
        $scope.$parent.openProject(name)
          .then(function () {
            $scope.dismiss();
          });
      };
    })
    .controller('Modal', function ($scope) {
      $scope.dismiss = function () {
        $scope.hideModal();
      };
    });
}(this));

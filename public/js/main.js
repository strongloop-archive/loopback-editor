(function (global) {
  angular.module('asteroid.editor', ['asteroid.services', 'asteroid.editor.tools'])
    .controller('Editor', function ($scope, $exceptionHandler, Workspace, $q, Session) {
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
            $scope.openModuleEditor($scope.module.name);
          })
          .then(null, $exceptionHandler);
      };

      $scope.removeModule = function () {
        console.log('-> Removing Module');
        return Workspace.removeModuleFromProject($scope.project.name, $scope.module.name)
          .then(function (data) {
            console.log('<- Removed:', data);
            $scope.module = null;
            $scope.editor = null;
          })
          .then(null, $exceptionHandler);
      };

      $scope.openTool = function (html) {
        $scope.editor = html;
        $scope.ui.addModule = false;
      };

      $scope.addModule = function () {
        console.log('-> Add Module');
        $scope.ui.addModule = true;
        $scope.module = {};
      };
    })
    .controller('Project', function ($scope) {
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

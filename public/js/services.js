(function (global) {
  angular.module('asteroid.services', ['$strap'])
    .service('Workspace', function ($http, $q) {
      var Workspace = {};

      function pickData(response) {
        return response.data;
      }

      Workspace.getProjects = getProjects;
      function getProjects() {
        return $http.get('/projects').then(pickData);
      }

      Workspace.getProject = getProject;
      function getProject(name) {
        return $http.get('/projects/' + name).then(pickData);
      }

      Workspace.createProject = createProject;
      function createProject(name, options) {
        return $http.put('/projects/' + name, options || {}).then(pickData);
      }

      Workspace.removeProject = removeProject;
      function removeProject(name) {
        return $http['delete']('/projects/' + name).then(pickData);
      }

      Workspace.getModulesForProject = getModulesForProject;
      function getModulesForProject(name) {
        return $http.get('/projects/' + name + '/modules').then(pickData);
      }

      Workspace.getModuleForProject = getModuleForProject;
      function getModuleForProject(name, subname) {
        return $http.get('/projects/' + name + '/modules/' + subname).then(pickData);
      }

      Workspace.addModuleToProject = addModuleToProject;
      function addModuleToProject(name, subname, options) {
        if (!options.type) {
          return $q.reject(new TypeError('Expected options to include a type, but none specified.'));
        }

        return $http.put('/projects/' + name + '/modules/' + subname, options).then(pickData);
      }

      Workspace.removeModuleFromProject = removeModuleFromProject;
      function removeModuleFromProject(name, subname) {
        return $http['delete']('/projects/' + name + '/modules/' + subname).then(pickData);
      }

      return Workspace;
    })
    .service('LocalStorage', function () {
      var store = localStorage || {};

      function get(key) {
        try {
          return JSON.parse(store[key] || 'null');
        } catch (e) {
          // This is only triggered if the value is bad, so we should reset it.
          set(key, null);
          return null;
        }
      }

      function set(key, value) {
        store[key] = JSON.stringify(value);
        return value;
      }

      return {
        get: get,
        set: set
      };
    })
    .service('Session', function ($q, Workspace, LocalStorage) {
      var activeProject = null;
      var activeModule = null;
      var allProjects = [];
      var projectModules = [];
      var Session = {};

      function init() {
        var projectName = LocalStorage.get('lastProjectName');
        var moduleName = LocalStorage.get('lastModuleName');

        if (projectName) {
          loadProject(projectName).then(function () {
            if (moduleName) {
              return loadModule(moduleName);
            }
          });
        }

        loadAllProjects();
      }

      /**
       * Returns the full list of available Projects.
       */
      Session.getAllProjects = getAllProjects;
      function getAllProjects() {
        return allProjects;
      }
      function loadAllProjects() {
        return Workspace.getProjects()
          .then(function (data) {
            // TODO: More data?
            allProjects = data.names;
          });
      }

      /**
       * Returns the currently-active Project.
       */
      Session.getActiveProject = getActiveProject;
      function getActiveProject() {
        return activeProject;
      }
      function setActiveProject(project) {
        activeProject = project;
        LocalStorage.set('lastProjectName', project && project.name || null);

        // Since we've changed projects, all current Module information is
        // invalid.
        setActiveModule(null);
        projectModules = null;
        loadProjectModules();

        return project;
      }

      /**
       * Closes the currently-active Project.
       */
      Session.closeProject = closeProject;
      function closeProject() {
        return setActiveProject(null);
      }

      /**
       * Creates a brand-new Project on the server, replacing the currently-
       * active Project with the new one.
       *
       * Returns a Promise for the new Project.
       */
      Session.createNewProject = createNewProject;
      function createNewProject(name, options) {
        return Workspace.createProject(name, options)
          .then(function (data) {
            loadAllProjects();
            return setActiveProject(data);
          });
      }

      /**
       * Updates the currently-active Project with `name`, downloaded from the
       * server.
       *
       * Returns a Promise for the loaded Project.
       */
      Session.loadProject = loadProject;
      function loadProject(name) {
        return Workspace.getProject(name)
          .then(function (data) {
            return setActiveProject(data);
          });
      }

      /**
       * Deletes the `name` Project from the server. If it is the currently-
       * active Project, it will be closed.
       *
       * Returns a Promise for the deleted Project.
       */
      Session.removeProject = removeProject;
      function removeProject(name) {
        if (activeProject && (activeProject.name === name)) {
          setActiveProject(null);
        }

        return Workspace.removeProject(name)
          .then(function (data) {
            loadAllProjects();
            return data;
          });
      }

      /**
       * Returns the full list of Modules within the active Project.
       */
      Session.getProjectModules = getProjectModules;
      function getProjectModules() {
        return projectModules;
      }
      function loadProjectModules() {
        if (!activeProject) {
          return $q.when(null);
        }

        var name = activeProject.name;

        return Workspace.getModulesForProject(name)
          .then(function (data) {
            if (name === activeProject.name) {
              projectModules = data;
            }
          });
      }

      /**
       * Returns the currently-active Module.
       */
      Session.getActiveModule = getActiveModule;
      function getActiveModule() {
        return activeModule;
      }
      function setActiveModule(module) {
        activeModule = module;
        LocalStorage.set('lastModuleName', module && module.name || null);
        return module;
      }

      /**
       * Closes the currently-active Module.
       */
      Session.closeModule = closeModule;
      function closeModule() {
        setActiveModule(null);
      }

      /**
       * Creates a brand-new Module on the server, replacing the currently-
       * active Module with the new one. The new Module will be created within
       * the currently-active Project.
       *
       * Returns a Promise for the new Module.
       */
      Session.createNewModule = createNewModule;
      Session.updateModule = createNewModule;
      function createNewModule(name, options) {
        if (!activeProject) {
          return $q.when(null);
        }

        return Workspace.addModuleToProject(activeProject.name, name, options)
          .then(function (data) {
            // Guarantee that `name` exists.
            data.name = name;

            return loadProjectModules()
              .then(function () {
                return setActiveModule(data);
              });
          });
      }

      /**
       * Updates the currently-active Module with `name`, downloaded from the
       * server and expected to be within the currently-active Project.
       *
       * Returns a Promise for the loaded Module.
       */
      Session.loadModule = loadModule;
      function loadModule(name) {
        if (!activeProject) {
          return $q.when(null);
        }

        return Workspace.getModuleForProject(activeProject.name, name)
          .then(function (data) {
            // Guarantee that `name` exists.
            data.name = name;

            return setActiveModule(data);
          });
      }

      /**
       * Deletes the `name` Module from within the currently-active Project. If
       * it is the currently-active Module, it will be closed.
       *
       * Returns a Module for the deleted Module.
       */
      Session.removeModule = removeModule;
      function removeModule(name) {
        if (!activeProject) {
          return $q.when(null);
        }

        if (activeModule.name === name) {
          setActiveModule(null);
        }

        return Workspace.removeModuleFromProject(activeProject.name, name)
          .then(function (data) {
            loadProjectModules();
            return data;
          });
      }

      init();
      return Session;
    })
    .service('Modal', function ($modal) {
      var Modal = {};
      var Modals = {
        OPEN_PROJECT: prefetchModal('/partial/modal/open-project.html'),
        CREATE_PROJECT: prefetchModal('/partial/modal/create-project.html'),
        TOOLBOX: prefetchModal('/partial/modal/toolbox.html')
      };
      var activeModal = null;

      function prefetchModal(template) {
        return $modal({
          template: template,
          persist: true,
          show: false,
          backdrop: 'static'
        });
      }

      function showModal($el) {
        $el.modal('show');
        activeModal = $el;
        return $el;
      }

      Modal.hideActiveModal = hideActiveModal;
      function hideActiveModal() {
        if (!activeModal) {
          return;
        }

        activeModal.modal('hide');
        activeModal = null;
      }

      Modal.showOpenProject = showOpenProject;
      function showOpenProject() {
        hideActiveModal();

        return Modals.OPEN_PROJECT.then(showModal);
      }

      Modal.showCreateProject = showCreateProject;
      function showCreateProject() {
        hideActiveModal();

        return Modals.CREATE_PROJECT.then(showModal);
      }

      Modal.showToolbox = showToolbox;
      function showToolbox() {
        hideActiveModal();

        return Modals.TOOLBOX.then(showModal);
      }

      Modal.showTemplate = showTemplate;
      function showTemplate(template) {
        hideActiveModal();

        return $modal({
          template: template,
          persist: false,
          show: false,
          backdrop: 'static'
        })
          .then(showModal);
      }

      return Modal;
    });
}(this));

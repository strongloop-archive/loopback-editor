(function (global) {
  angular.module('asteroid.services', [])
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

        // Since we've changed projects, the current Module is invalid.
        setActiveModule(null);

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
        if (name === activeProject.name) {
          setActiveProject(null);
        }

        return Workspace.removeProject(name);
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
            // HACK
            data.name = name;
            return setActiveModule(data);
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
            // HACK
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

        return Workspace.removeModuleFromProject(activeProject.name, name);
      }

      init();
      return Session;
    });
}(this));

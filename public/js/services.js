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

      if (LocalStorage.get('lastProjectName')) {
        loadProject(LocalStorage.get('lastProjectName'));
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

      return Session;
    });
}(this));

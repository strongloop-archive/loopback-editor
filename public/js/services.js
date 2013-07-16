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
    .service('Session', function ($q, Workspace) {
      var activeProject = null;
      var activeModule = null;
      var Session = {};

      /**
       * Returns the currently-active Project.
       */
      Session.getActiveProject = getActiveProject;
      function getActiveProject() {
        return activeProject;
      }

      /**
       * Closes the currently-active Project.
       */
      Session.closeProject = closeProject;
      function closeProject() {
        activeProject = null;
        return getActiveProject();
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
            activeProject = data;
            return data;
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
            activeProject = data;
            return data;
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
        activeProject = null;
        return Workspace.removeProject(name);
      }

      return Session;
    });
}(this));

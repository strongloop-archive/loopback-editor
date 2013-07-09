(function (global) {
  angular.module('asteroid.services', [])
    .service('Workspace', function ($http, $q) {
      var Workspace = {};

      Workspace.getProjects = getProjects;
      function getProjects() {
        return $http.get('/projects');
      }

      Workspace.getProject = getProject;
      function getProject(name) {
        return $http.get('/projects/' + name);
      }

      Workspace.createProject = createProject;
      function createProject(name, options) {
        return $http.put('/projects/' + name, options || {});
      }

      Workspace.removeProject = removeProject;
      function removeProject(name) {
        return $http['delete']('/projects/' + name);
      }

      Workspace.addModuleToProject = addModuleToProject;
      function addModuleToProject(name, subname, options) {
        if (!options.type) {
          return $q.reject(new TypeError('Expected options to include a type, but none specified.'));
        }

        return $http.put('/projects/' + name + '/modules/' + subname, options);
      }

      Workspace.removeModuleFromProject = removeModuleFromProject;
      function removeModuleFromProject(name, subname) {
        return $http['delete']('/projects/' + name + '/modules/' + subname);
      }

      return Workspace;
    });
}(this));

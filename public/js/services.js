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
    });
}(this));

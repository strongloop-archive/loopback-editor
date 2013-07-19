// TODO: Make a less global-invasive, sacred way to create editor Controllers
// like this.
function CreateAppCtrl($scope, $q, Session) {
  $scope.module = {
    name: '',
    description: ''
  };

  $scope.createModule = function () {
    if (!Session.getActiveProject()) {
      return $q.reject('No active project');
    }

    return Session.createNewModule($scope.module.name, $scope.module)
      // TODO: Open the new module's editor.
      .then($scope.dismiss);
  };
}

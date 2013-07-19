function CreateMemoryDataSourceCtrl($scope, $q, Session) {
  $scope.module = {
    name: '',
    type: 'data-source-memory',
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

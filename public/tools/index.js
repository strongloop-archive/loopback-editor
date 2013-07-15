(function (global) {
  angular.module('asteroid.editor.tools', [])
    .controller('ToolList', function ($scope) {
      $scope.tools = [
        // TODO - Add these automatically. Currently, adding a new module
        // requires making four changes. We should work to get that down to two.
        {
          name: 'Create Application',
          editor: '/tools/app-create/editor.html'
        }
      ];
    });
}(this));

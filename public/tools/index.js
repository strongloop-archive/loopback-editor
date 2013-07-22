(function (global) {
  angular.module('asteroid.editor.tools', [])
    .controller('ToolList', function ($scope, Modal) {
      $scope.tools = [
        // TODO - Add these automatically. Currently, adding a new module
        // requires making four changes. We should work to get that down to two.
        {
          name: 'Create Application',
          editor: '/tools/app-create/editor.html'
        },
        {
          name: 'Create In-Memory Data Source',
          editor: '/tools/data-source-memory-create/editor.html'
        },
        {
          name: 'Create Model',
          editor: '/tools/model-create/editor.html'
        }
      ];

      $scope.openTool = function (tool) {
        Modal.showTemplate(tool.editor);
      };
    });
}(this));

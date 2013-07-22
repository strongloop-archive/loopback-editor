function EditModelCtrl($scope, Session) {
  var _properties = [];

  $scope.allTypes = ['String', 'Number'];

  $scope.allModules = function () {
    return Session.getProjectModules();
  };

  $scope.getAllProperties = function () {
    // TODO(schoon) - Only load on module change.
    loadAllProperties();

    return _properties;
  };

  function loadAllProperties() {
    var properties = Session.getActiveModule().source.properties || {};

    Object.keys(properties).forEach(function (key) {
      // TODO(schoon) - Only load on module change.
      if (_properties.some(function (item) {
        return item.key === key;
      })) {
        return;
      }

      _properties.push({
        key: key,
        value: properties[key]
      });
    });
  }

  function bakeProperties() {
    var properties = {};

    _properties.forEach(function (item) {
      properties[item.key] = item.value;
    });

    console.log('Baked:', _properties);

    return properties;
  }

  $scope.addProperty = function () {
    _properties.push({
      key: '',
      value: $scope.allTypes[0]
    });
  };

  $scope.removeProperty = function (index) {
    var item = _properties.splice(index, 1);

    if (!item.length) {
      return;
    }

    item = item[0];

    // TODO(schoon) - Only load on module change.
    delete Session.getActiveModule().source.properties[item.key];
  };

  $scope.updateModule = function (name, options) {
    options.properties = bakeProperties();

    $scope.$parent.updateModule(name, options);
  };
}

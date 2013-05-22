module.exports = function initBasicExtensions(app, moduleLoader, type, pathname, middleware) {
  var apps = {};

  middleware = middleware || function(req, res, next) {
    next();
  };

  moduleLoader.instanceOf(type).forEach(function(extension) {
    apps[extension.name] = extension.handle.bind(extension);
  });

  function handleExtension(req, res, next) {
    middleware(req, res, function() {
      if (apps[req.params.extname]) {
        apps[req.params.extname](req.params[0] ? '/' + req.params[0] : '/',
          '/project/' + req.params.project + '/' + pathname + '/' + req.params.extname, req, res, next);
      } else {
        next();
      }
    });
  }

  app.all('/project/:project/' + pathname + '/:extname', handleExtension);
  app.all('/project/:project/' + pathname + '/:extname/*', handleExtension);
}
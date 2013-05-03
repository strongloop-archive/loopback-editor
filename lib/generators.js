var generatorApps = {};

module.exports = function initGenerators(app, moduleLoader) {
  generatorApps = {};
  moduleLoader.instanceOf('AsteroidEditorGenerator').forEach(function(generator) {
    generatorApps[generator.name] = generator.handle.bind(generator);
  });

  function handleGenerator(req, res, next) {
    if (generatorApps[req.params.generator]) {
      generatorApps[req.params.generator](req.params[0] ? '/' + req.params[0] : '/', req, res, next);
    } else {
      next();
    }
  }

  app.all('/project/:project/generator/:generator', handleGenerator);
  app.all('/project/:project/generator/:generator/*', handleGenerator);
}
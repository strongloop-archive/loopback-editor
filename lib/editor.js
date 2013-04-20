var path = require('path'),
    moduleLoader = require('asteroid-module-loader').create(path.join(__dirname, '../editor-core'));

module.exports = function initEditor(app) {

  var generatorApps = {};

  function getProject(req, res, next) {
    req.project = {name: req.params.project};
    next();
  }

  app.get('/project/:project', getProject, function(req, res) {

    var generators = moduleLoader.instanceOf('AsteroidEditorGenerator').map(function(g) {
      return {
        path: '/project/' + req.params.project + '/generator/' + g.name,
        label: g.options.label,
        description: g.options.description
      };
    });

    res.render('editor-home.ejs', {
      project: req.project,
      generators: generators
    });
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

  moduleLoader.load(function(err, modules) {
    if (err) throw err;

    generatorApps = {};

    moduleLoader.instanceOf('AsteroidEditorGenerator').forEach(function(generator) {
      generatorApps[generator.name] = generator.handle.bind(generator);
    });
  });

};
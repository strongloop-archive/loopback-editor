var path = require('path'),
    moduleLoader = require('asteroid-module-loader').create(path.join(__dirname, '../editor-core')),
    Project = require('asteroid-project-manager').Project,
    _ = require('underscore'),
    TaskEmittter = require('task-emitter');

module.exports = function initEditor(app) {

  var generatorApps = {};

  function getProject(req, res, next) {
    var project = new Project({name: req.params.project}),
        files, objectTypes, dependencyTree;

    var te = new TaskEmittter();

    te
      .task(project, 'filesTree')
      .on('filesTree', function(_files) {
        files = _files;
      })
      .task(project, 'dependencyTree')
      .on('dependencyTree', function(_dependencyTree) {
        dependencyTree = _dependencyTree;
      })
      .task(project, 'getConfigByType')
      .on('getConfigByType', function(_configByType) {
        configByType = _configByType;
      })
      .on('error', function(err) {
        throw err;
      })
      .on('done', function() {
        app.set('project', {
          name: req.params.project,
          files: files,
          objectTypes: objectTypes,
          dependencyTree: dependencyTree,
          configByType: configByType
        });
        next();
      });
    
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
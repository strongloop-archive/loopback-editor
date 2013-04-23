var path = require('path'),
    moduleLoader = require('asteroid-module-loader').create(path.join(__dirname, '../editor-core')),
    Project = require('asteroid-project-manager').Project,
    _ = require('underscore'),
    TaskEmittter = require('task-emitter');

module.exports = function initEditor(app) {

  var generatorApps = {};

  // TODO: Refactor this logic into asteroid-project-manager.
  function loadObjects(project, callback) {
    var te = new TaskEmittter();

    var objectTypes = {};

    te
      .task(project, 'getConfig')
      .on('getConfig', function(config) {
        
      })
      .on('error', function(err) {
        callback(err);
      })
      .on('done', function() {
        callback(null, objectTypes);
      });
  }

  function loadDependencyTree(project, callback) {
    /*var topLevelObjects = [],
        notTopLevelKeys = {};

    project.getConfig(function(err, config) {
      if (err) return callback(err);

      config = config.toJSON(); // We only care about the objects

      function scanDependencies(o) {
        if (!o) return;
        _(o.dependencies).each(function(dep, key) {
          notTopLevelKeys[dep.name] = true;
          scanDependencies(dep.dependencies);
        });
      }
      _(config).each(function(o, path) {
        scanDependencies(o);
      });

      topLevelObjects = _(config).filter(function(o, path) {
        return o && o.module && !notTopLevelKeys[o.name];
      });

      topLevelObjects = treeHashToArray(topLevelObjects, { childrenProperty: 'dependencies', considerEmptyFolders: false});

      callback(null, topLevelObjects);

    });*/
    setImmediate(function() {
      callback(null, []);  
    });
    
  }

  function getProject(req, res, next) {
    var project = new Project({name: req.params.project}),
        files, objectTypes, dependencyTree;

    var te = new TaskEmittter();

    te
      .task(project, 'filesTree')
      .on('filesTree', function(_files) {
        files = _files;
      })
      .on('error', function(err) {
        throw err;
      })
      .on('done', function() {
        app.set('project', {
          name: req.params.project,
          files: files,
          objectTypes: objectTypes,
          dependencyTree: dependencyTree
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
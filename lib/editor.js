var path = require('path'),
    moduleLoader = require('asteroid-module-loader').create(path.join(__dirname, '../editor-core')),
    Project = require('asteroid-project-manager').Project,
    _ = require('underscore'),
    TaskEmittter = require('task-emitter');

module.exports = function initEditor(app) {

  var generatorApps = {};

  function loadFiles(project, callback) {
    project.files(function(err, files) {
      if (err) return callback(err);

      // TODO: Refactor this tree-parsing logic into asteroid-project-manager
      var treeHash = {};

      _(files).each(function(stat, filePath) {
        var parts = filePath.split(path.sep),
            currentNode = treeHash,
            currentPart;
        while (currentPart = parts.shift()) {
          if (!currentNode[currentPart]) {
            currentNode[currentPart] = {
              name: currentPart
            };
          }

          if (parts.length) {
            if (!currentNode[currentPart].children) {
              currentNode[currentPart].children = {};  
            }

            currentNode = currentNode[currentPart].children;
          }
        }
      });

      var fileTree = treeHashToArray(treeHash);
      callback(null, fileTree);
    });
  }

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
    var topLevelObjects = [],
        notTopLevelKeys = {};

    project.getConfig(function(err, config) {
      if (err) return callback(err);

      config = config.toJSON(); // We only care about the objects

      console.log('config', config);

      function scanDependencies(o) {
        if (!o) return;
        _(o.dependencies).each(function(dep, key) {
          notTopLevelKeys[key] = true;
          scanDependencies(dep.dependencies);
        });
      }
      _(config).each(function(o, path) {
        scanDependencies(o);
      });

      topLevelObjects = _(config).filter(function(o, path) {
        return o && o.module && !notTopLevelKeys[o.name];
      });

      console.log("before transform", topLevelObjects);

      topLevelObjects = treeHashToArray(topLevelObjects, { childrenProperty: 'dependencies', considerEmptyFolders: false});

      console.log(topLevelObjects);

      callback(null, topLevelObjects);

    });
  }

  function getProject(req, res, next) {
    var project = new Project({name: req.params.project}),
        files, objectTypes, dependencyTree;

    var te = new TaskEmittter();

    te
      .task('loadFiles', loadFiles, project)
      .on('loadFiles', function(project, _files) {
        files = _files;
      })
      .task('loadObjects', loadObjects, project)
      .on('loadObjects', function(project, _objectTypes) {
        objectTypes = _objectTypes;
      })
      .task('loadDependencyTree', loadDependencyTree, project)
      .on('loadDependencyTree', function(project, _dependencyTree) {
        dependencyTree = _dependencyTree;
      })
      .on('error', function(err) {
        throw err;
      })
      .on('done', function() {
        app.set('project', {
          name: req.params.project,
          files: files,
          objectTypes: objectTypes
        });
        next();
      });
    
  }

  function treeHashToArray(treeHash, options) {
    options = _.defaults(options || {}, {
      childrenProperty: 'children',
      considerEmptyFolders: true
    });
    childrenProperty = options.childrenProperty;
    return _(treeHash).chain().map(function(value, key) {
      if (value[childrenProperty]) {
        value[childrenProperty] = treeHashToArray(value[childrenProperty]);
      }

      if (!options.considerEmptyFolders && value[childrenProperty] && value[childrenProperty].length === 0) {
        delete value[childrenProperty];
      }
      return value;
    }).sortBy(function(file) { return file.name }) // Sort alphabetically...
      .sortBy(function(file) { return file[childrenProperty] ? false : true }) // But folders go first
      .value();    
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
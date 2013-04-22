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

  function getProject(req, res, next) {
    var project = new Project({name: req.params.project}),
        files;

    var te = new TaskEmittter();

    te
      .task('loadFiles', loadFiles, project)
      .on('loadFiles', function(project, _files) {
        files = _files;
      })
      .on('error', function(err) {
        throw err;
      })
      .on('done', function() {
        app.set('project', {
          name: req.params.project,
          files: files
        });
        next();
      });
    
  }

  function treeHashToArray(treeHash) {
    return _(treeHash).chain().map(function(value, key) {
      if (value.children) {
        value.children = treeHashToArray(value.children);
      }
      return value;
    }).sortBy(function(file) { return file.name }) // Sort alphabetically...
      .sortBy(function(file) { return file.children ? false : true }) // But folders go first
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
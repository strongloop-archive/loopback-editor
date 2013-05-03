var path = require('path'),
    moduleLoader = require('asteroid-module-loader').create(path.join(__dirname, '../editor-core')),
    Project = require('asteroid-project-manager').Project,
    _ = require('underscore'),
    TaskEmittter = require('task-emitter');

module.exports = function initEditor(app) {

  var generatorApps = {};
  var subEditors = {};

  function subEditorForObject(o) {
    var inheritanceChain = o.inheritanceChain();
    var subEditor;
    // It's important to loop through the chain backwards
    // So that we get the most specific subeditor available
    for (var i = inheritanceChain.length - 1; i >= 0; i--) {
      if (subEditors[inheritanceChain[i]]) {
        subEditor = subEditors[inheritanceChain[i]];
      } 
    }
    return subEditor;
  }

  function getProject(req, res, next) {
    var project = new Project({name: req.params.project}),
        files, objectTypes, dependencyTree;

    req.project = project;

    res.viewLocals.iconForObject = function(o) {
      var editor = subEditorForObject(o);
      return editor ? editor.name : "null";
    };

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

  app.get('/_icon/:module', function(req, res, next) {
    var subEditor = subEditors[req.params.module];
    if (subEditor) {
      var icon = subEditor.getIconPath();
      if (icon) {
        res.sendfile(icon);
      } else {
        next();
      } 
    } else {
      next();
    }
  });
  
  app.all('/project/:project/*', getProject);

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

  // Generators
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

    subEditors = {};
    moduleLoader.instanceOf('AsteroidSubEditor').forEach(function(subEditor) {
      subEditors[subEditor.name] = subEditor;
    });

    console.log('generatorApps');
    console.log(generatorApps)
    console.log('subEditors');
    console.log(subEditors)
  });

  // Object Sub-Editor
  function handleSubEditor(req, res, next) {
    var objPath = req.params[0];

    req.project.getConfig(function(err, config) {
      if (err) return res.end(err);

      var obj = config.get(objPath);

      res.render('sub-editor.ejs', {
        obj: obj
      });
    });
    
  }
  app.all('/project/:project/object/*/edit', handleSubEditor);
  app.all('/project/:project/object/*/edit/*', handleSubEditor);

};
var path = require('path'),
    moduleLoader = require('asteroid-module-loader').create(path.join(__dirname, '../editor-core')),
    Project = require('asteroid-project-manager').Project,
    _ = require('underscore'),
    TaskEmittter = require('task-emitter');

module.exports = function initEditor(app) {

  var subEditors;

  function getProject(req, res, next) {
    var project = new Project({name: req.params.project}),
        files, objectTypes, dependencyTree;

    req.project = project;

    res.viewLocals.projectName = req.params.project;

    res.viewLocals.iconForObject = function(o) {
      var editor = subEditors.subEditorForObject(o);
      return editor ? ("'" + editor.name + "'") : "null";
    };

    res.viewLocals.urlForObject = function(o) {
      return "/project/" + res.viewLocals.projectName + "/object/" + o.normalDir() + "/edit";
    };

    var generators = moduleLoader.instanceOf('AsteroidEditorGenerator').map(function(g) {
      return {
        path: '/project/' + req.params.project + '/generator/' + g.name,
        label: g.options.label,
        description: g.options.description
      };
    });
    res.viewLocals.generators = generators;

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
        res.viewLocals.project = {
          name: req.params.project,
          files: files,
          objectTypes: objectTypes,
          dependencyTree: dependencyTree,
          configByType: configByType
        }
        next();
      });
  }

  app.all('/project/:project/*', getProject);

  app.get('/project/:project', getProject, function(req, res) {

    res.render('editor-home.ejs');
  });

  moduleLoader.load(function(err, modules) {
    if (err) throw err;

    require('./generators')(app, moduleLoader);
    subEditors = require('./sub-editors')(app, moduleLoader);
  });

};
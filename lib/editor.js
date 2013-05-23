var path = require('path'),
    moduleLoader = require('asteroid-module-loader').create(path.join(__dirname, '../editor-core')),
    Project = require('asteroid-project-manager').Project,
    initBasicExtensions = require('./basic-extensions'),
    _ = require('underscore'),
    getNavigationMenus = require('./navigation'),
    TaskEmittter = require('sl-task-emitter');

module.exports = function initEditor(app) {

  var subEditors;

  function getProject(req, res, next) {
    var project = new Project({name: req.params.project});

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

    var editorUtils = moduleLoader.instanceOf('AsteroidEditorUtility').map(function(u) {
      return u;
    });
    res.viewLocals.editorUtils = editorUtils;

    res.viewLocals.subEditors = _(subEditors.allSubEditors).map(function(e) {
      return e;
    });

    getNavigationMenus(project, {
      projectName: res.viewLocals.projectName,
      subEditors: subEditors,
    }, function(err, menus) {
      if (err) return next(err);
      res.viewLocals.project = {
        name: req.params.project,
        subEditors: subEditors,
        navigationMenus: menus
      };
      next();
    });
  }

  app.all('/project/:project/*', getProject);

  app.get('/project/:project', getProject, function(req, res) {

    res.render('editor-home.ejs');
  });

  app.get('/project/:project/navigation', function(req, res, next) {
    res.json(res.viewLocals.project.navigationMenus);
  });

  app.post('/project/:project/object/:object', function(req, res, next) {
    var name = req.params.object;
    var moduleType = req.body.module;

    if (name.match(/^[a-z_][a-z_0-9]*$/i)) {
      req.project.createObject(name, {module: moduleType}, function(err) {
        if (err) return next(err);
        res.end("Created");
      });
    } else {
      next(new Error("Invalid JSON name for object"));
    }


  });

  moduleLoader.load(function(err, modules) {
    if (err) throw err;

    initBasicExtensions(app, moduleLoader, 'AsteroidEditorGenerator', 'generator');
    initBasicExtensions(app, moduleLoader, 'AsteroidEditorUtility', 'utility', function(req, res, next) {
      res.viewLocals.currentUtility = req.params.extname;
      next();
    });
    subEditors = require('./sub-editors')(app, moduleLoader);
  });

};
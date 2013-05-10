var _ = require('underscore');

var subEditors = {};


module.exports = function initSubEditors(app, moduleLoader) {

  subEditors = {};

  moduleLoader.instanceOf('AsteroidSubEditor').forEach(function(subEditor) {
    subEditors[subEditor.name] = subEditor;
  });

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

  function handleSubEditor(req, res, next) {
    var objPath = req.params[0];

    req.project.getConfig(function(err, config) {
      if (err) return res.end(err);

      var obj = req.obj = res.viewLocals.obj = config.get(objPath);

      var objMeta = res.viewLocals.objMeta = {};
      objMeta.dependencies = _(obj.dependencies()).map(function(v, k) {return {type: k, obj: v}});
      objMeta.dependents = obj.dependents();

      var subEditor = subEditorForObject(obj);

      if (obj) {
        
        if (subEditor && subEditor.options.app) {
          subEditor.handle(req.params[1] ? '/' + req.params[1] : '/', req, res, next);
        } else {
          // Default editor
          var moduleOptions = _(obj.module.options || {}).map(function(v, k) {
            v.name = k;
            return v;
          });
          res.render('sub-editor.ejs', {
            obj: obj,
            moduleOptions: moduleOptions,
            options: obj.options || {}
          });  
        }
      } else {
        res.redirect('/project/' + req.params.project);
      }
      
    });
    
  }
  app.all('/project/:project/object/*/edit', handleSubEditor);
  app.all('/project/:project/object/*/edit/*', handleSubEditor);

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

  return {
    allSubEditors: subEditors,
    subEditorForObject: subEditorForObject
  };
  
}
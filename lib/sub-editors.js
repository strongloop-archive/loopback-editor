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

      var obj = config.get(objPath);

      if (obj) {
        res.render('sub-editor.ejs', {
          obj: obj
        });  
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
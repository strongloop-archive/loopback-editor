var editor = require('.');

editor.app.get('/', function(req, res) {
  res.render('index.ejs', {
    obj: req.obj,
    properties: (req.obj.options && req.obj.options.properties) || []
  });
});
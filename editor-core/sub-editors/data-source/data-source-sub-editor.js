var editor = require('.');

editor.app.get('/', function(req, res) {
  res.render('index.ejs');
});
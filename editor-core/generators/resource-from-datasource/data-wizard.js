var wizard = require('.');

wizard.app.get('/', function(req, res) {
  res.render('data-wizard.ejs');
});

wizard.app.get('/data', function(req, res) {
  res.end("Test route");
});
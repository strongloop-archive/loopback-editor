var wizard = require('.');

wizard.app.get('/', function(req, res) {
  console.log('rendering');
  console.log('wizard project', wizard.app.get('project'));
  res.render('data-wizard.ejs');
});

wizard.app.get('/data', function(req, res) {
  res.end("Test route");
});
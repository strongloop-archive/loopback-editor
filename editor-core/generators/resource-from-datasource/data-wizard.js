var wizard = require('.'),
		asteroid = require('asteroid'),
		path = require('path');

wizard.app.use(asteroid.static(path.join(__dirname, './public')));

wizard.app.get('/', function(req, res) {
  res.render('data-wizard.ejs');
});

wizard.app.get('/data', function(req, res) {
  res.end("Test route");
});
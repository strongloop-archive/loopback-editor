var wizard = require('.');

wizard.app.get('/', function(req, res) {
  res.end("Hello, wizard!");
});

wizard.app.get('/data', function(req, res) {
  res.end("Test route");
});
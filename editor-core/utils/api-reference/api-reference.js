var utility = require('.');

utility.app.get('/', function(req, res) {
  res.render('index.ejs');
});
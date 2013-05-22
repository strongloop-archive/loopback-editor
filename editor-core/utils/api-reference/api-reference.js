var utility = require('.');

utility.app.get('/rest', function(req, res) {
  res.render('index.ejs', {api: "REST API"});
});

utility.app.get('/ios', function(req, res) {
  res.render('index.ejs', {api: "iOS SDK"});
});

utility.app.get('/android', function(req, res) {
  res.render('index.ejs', {api: "Android SDK"});
});
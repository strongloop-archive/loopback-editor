var asteroid = require('express'),
    ejs = require('ejs-locals'),
    path = require('path');

var app = asteroid();
module.exports = app;

app.engine('ejs', ejs);

app.use(asteroid.static(path.join(__dirname, '../public')));

app.get('/', function(req, res) {
  res.render('projects.ejs');
});
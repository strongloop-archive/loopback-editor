var asteroid = require('express');

var app = asteroid();
module.exports = app;

app.get('/', function(req, res) {
  res.end("Hello world!");
});
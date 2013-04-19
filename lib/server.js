var asteroid = require('asteroid'),
    ejs = require('ejs-locals'),
    path = require('path');

var app = asteroid();
module.exports = app;

app.engine('ejs', ejs);

app.use(asteroid.static(path.join(__dirname, '../public')));

require('./projects')(app);
require('./editor')(app);
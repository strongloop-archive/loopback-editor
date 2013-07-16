var loopback = require('loopback'),
    ejs = require('ejs-locals'),
    path = require('path');

var app = loopback();
module.exports = app;

app.engine('ejs', ejs);

// Enable viewLocals hash on the res object
app.use(function (req, res, next) {
	res.viewLocals = {};
	
	var oldRender = res.render;
	res.render = function render(view, options, callback) {
		if (typeof options === 'function') {
			callback = options;
			options = {};
		}

		if (!options) options = {};

		options.viewLocals = res.viewLocals;
		oldRender.call(res, view, options, callback);
	};
	next();
});


app.use(loopback.bodyParser());
app.use(loopback.static(path.join(__dirname, '../public')));

require('./projects')(app);
require('./editor')(app);
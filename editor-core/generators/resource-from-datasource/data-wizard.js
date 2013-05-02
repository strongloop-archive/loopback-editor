var wizard = require('.'),
		asteroid = require('asteroid'),
		path = require('path');

wizard.app.use(asteroid.static(path.join(__dirname, './public')));

wizard.app.get('/', function(req, res) {
  res.render('data-wizard.ejs');
});

wizard.app.post('/', function(req, res) {

  res.json({
    actions: [{
      verb: "Created",
      obj: "todos",
      module: "model",
      dir: "todos"
    }]
  })
});


wizard.app.get('/data-sources', function(req, res) {
  req.project.getObjectsOfType('data-source', function(err, dataSources) {
    if (err) res.end(err);

    res.json(dataSources);
  });
});
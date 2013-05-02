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
      obj: req.body.schema,
      module: "model",
      dir: req.body.schema
    }]
  })
});


wizard.app.get('/data-sources', function(req, res) {
  req.project.getObjectsOfType('data-source', function(err, dataSources) {
    if (err) res.end(err);

    res.json(dataSources);
  });
});

wizard.app.get('/schemas/:dataSource', function(req, res) {
  res.json({
    tables: [{
      name: 'WEAPONS'
    }, {
      name: 'USERS'
    }, {
      name: 'LOCATIONS'
    }],
    views: [{
      name: 'INVENTORY'
    }]
  });
});
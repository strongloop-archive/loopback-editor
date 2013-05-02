var wizard = require('.'),
		asteroid = require('asteroid'),
		path = require('path');

wizard.app.use(asteroid.static(path.join(__dirname, './public')));

wizard.app.get('/', function(req, res) {
  res.render('data-wizard.ejs');
});

wizard.app.post('/', function(req, res) {

  var actions = [{
    verb: "Created",
    obj: req.body.modelName,
    module: "model",
    dir: req.body.modelName
  }];

  if (req.body.newDataSource) {
    actions.unshift({
      verb: "Created",
      obj: req.body.newDataSource.name,
      module: req.body.newDataSource.module,
      dir: req.body.newDataSource.name
    });
  }

  res.json({
    actions: actions
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

wizard.app.get('/mapping-info/:dataSource/:schema', function(req, res) {

  res.json({

    defaultModelName: "weapons",
    columns: [{
      originalName: "WEAPON_ID",
      defaultName: "id"
    }, {
      originalName: "WEAPON_NAME",
      defaultName: "name"
    }, {
      originalName: "WEAPON_COST",
      defaultName: "cost"
    }]

  });
});
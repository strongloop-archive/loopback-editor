var wizard = require('.'),
		asteroid = require('asteroid'),
		path = require('path'),
    TaskEmitter = require('task-emitter');

wizard.app.use(asteroid.static(path.join(__dirname, './public')));

wizard.app.get('/', function(req, res) {
  res.render('data-wizard.ejs');
});

wizard.app.post('/', function(req, res) {

  var te = new TaskEmitter();
  var actions = [];

  if (req.body.newDataSource) {
    te.task('createDataSource', function(next) {
      actions.unshift({
        verb: "Created",
        obj: req.body.newDataSource.name,
        module: req.body.newDataSource.module,
        dir: req.body.newDataSource.name
      });
      req.project.createObject(req.body.newDataSource.name, req.body.newDataSource, function(err) {
        next(err);
      });
    });
  }

  te.task('createModel', function(next) {
    actions.push({
      verb: "Created",
      obj: req.body.modelName,
      module: "model",
      dir: req.body.modelName
    });

    var configJson = {
      module: 'model',
      options: {
        mapping: req.body.mapping
      },
      dependencies: {
        'data-source': req.body.dataSource
      }
    };
    console.log(req.body, configJson);
    req.project.createObject(req.body.modelName, configJson, function(err) {
      next(err);
    });
  })

  te.on('done', function(next) {
      res.json({
        actions: actions
      })
    })
    .on('error', function(err) {
      res.end(err);
    });

  
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
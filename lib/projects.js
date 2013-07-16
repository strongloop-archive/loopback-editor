var projectManager = require('loopback-project-manager').create();

module.exports = function initProjects(app) {
  app.get('/', function(req, res) {

    projectManager.listProjects(function(err, projects) {
      if (err) {
        if (err.code === 'ENOENT') {
          projects = [];
        } else {
          throw err;
        }
      }

      projects.sort();

      res.render('projects.ejs', { projects: projects });  
    });
  });
};
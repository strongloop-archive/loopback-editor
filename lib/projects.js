module.exports = function initProjects(app) {
  app.get('/', function(req, res) {
    res.render('projects.ejs');
  });
};
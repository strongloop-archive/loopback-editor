module.exports = function initEditor(app) {

  function getProject(req, res, next) {
    req.project = {name: req.params.project};
    next();
  }

  app.get('/project/:project', getProject, function(req, res) {
    res.render('editor-home.ejs', {project: req.project});
  });

};
var utility = require('.'),
    _ = require('underscore');

var apis = {
  rest: "REST API",
  ios: "iOS SDK",
  android: "Android SDK"
};

_(apis).each(function(v, k) {
  utility.app.get('/' + k, function(req, res) {
    res.render('index.ejs', {api: v});
  });
});

utility.views = function() {
  return _(apis).map(function(v, k) {
    return {
      title: v,
      path: '/' + k
    };
  });
};
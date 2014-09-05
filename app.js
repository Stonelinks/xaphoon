var finalhandler = require('finalhandler');
var http = require('http');
var static = require('serve-static');
var backboneio = require('backbone.io');

// serve up public folder
var serve = static('public', {
  'index': ['index.html']
});

// create server
var app = http.createServer(function(req, res) {
  var done = finalhandler(req, res);
  serve(req, res, done);
});

var port = process.env.PORT || 3000;
app.listen(port);

var backends = {};
var collections = ['feed', 'drawables'];
collections.forEach(function(collection) {
  var backend = backboneio.createBackend();
  backend.use(backboneio.middleware.memoryStore());
  backends[collection] = backend;
});

backboneio.listen(app, backends);
console.log('listening on port ' + port);

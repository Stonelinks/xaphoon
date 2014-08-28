var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');

var app = express();

var http = require('http');
var server = http.createServer(app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(path.join(__dirname, 'public')));

var router = express.Router();

// supremely ghetto
var os = require('os');
app.set('env', os.hostname() == 'void71892' ? 'development' : 'production');

router.get('/', function(req, res) {
  res.render('index', {
    env: app.get('env')
  });
});
app.use('/', router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}
else {

  // production error handler
  // no stacktraces leaked to user
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {}
    });
  });
}

app.set('port', process.env.PORT || 3000);

server.listen(app.get('port'), function() {
  console.log('Express server listening on ' + server.address().port);
});

// socket.io stuff

var io = require('socket.io').listen(server);

var feed = require('./realtime/feed');
var user = require('./realtime/user');
var drawables = require('./realtime/drawables');
io.on('connection', function(socket) {
  user.attachSocketEvents(socket);
  // feed.attachSocketEvents(socket);
  // drawables.attachSocketEvents(socket);
});

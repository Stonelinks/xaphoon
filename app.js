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
app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));

var router = express.Router();
router.get('/', function(req, res) {
  res.render('index');
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

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.set('port', process.env.PORT || 1228);

server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});

var Seed = require('seed');

// Our psuedo database, on Seed.
// https://github.com/logicalparadox/seed

var xaphoon = {};

xaphoon.Todo = Seed.Model.extend('drawable', {
  schema: new Seed.Schema({
    title: String,
    completed: Boolean
  })
});

xaphoon.Todos = Seed.Graph.extend({
  initialize: function() {
    this.define(xaphoon.Todo);
  }
});

var db = new xaphoon.Todos();
var guid = new Seed.ObjectId();

// Socket.io

var io = require('socket.io').listen(server);

/**
 * our socket transport events
 *
 * You will notice that when we emit the changes
 * in `create`, `update`, and `delete` we both
 * socket.emit and socket.broadcast.emit
 *
 * socket.emit sends the changes to the browser session
 * that made the request. not required in some scenarios
 * where you are only using ioSync for Socket.io
 *
 * socket.broadcast.emit sends the changes to
 * all other browser sessions. this keeps all
 * of the pages in mirror. our client-side model
 * and collection ioBinds will pick up these events
 */

io.sockets.on('connection', function(socket) {

  /**
   * drawable:create
   *
   * called when we .save() our new drawable
   *
   * we listen on model namespace, but emit
   * on the collection namespace
   */

  socket.on('drawable:create', function(data, callback) {
    var id = guid.gen();
    var drawable = db.set('/drawable/' + id, data);
    var json = drawable._attributes;

    socket.emit('drawable:create', json);
    socket.broadcast.emit('drawable:create', json);
    callback(null, json);
  });

  /**
   * drawable:read
   *
   * called when we .fetch() our collection
   * in the client-side router
   */

  socket.on('drawable:read', function(data, callback) {
    var list = [];

    db.each('drawable', function(drawable) {
      list.push(drawable._attributes);
    });

    callback(null, list);
  });

  /**
   * drawable:update
   *
   * called when we .save() our model
   * after toggling its completed status
   */

  socket.on('drawable:update', function(data, callback) {
    var drawable = db.get('/drawable/' + data.id);
    drawable.set(data);

    var json = drawable._attributes;

    socket.emit('drawable/' + data.id + ':update', json);
    socket.broadcast.emit('drawable/' + data.id + ':update', json);
    callback(null, json);
  });

  /**
   * drawable:delete
   *
   * called when we .destroy() our model
   */

  socket.on('drawable:delete', function(data, callback) {
    console.log(db.get('/drawable/' + data.id));
    var json = db.get('/drawable/' + data.id)._attributes;

    db.del('/drawable/' + data.id);

    socket.emit('drawable/' + data.id + ':delete', json);
    socket.broadcast.emit('drawable/' + data.id + ':delete', json);
    callback(null, json);
  });

});

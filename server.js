var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');

var routes = require('./routes/index');

var app = express();


var app = express()
var http = require('http')
var server = http.createServer(app)


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

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

var Minimal = {};

Minimal.Todo = Seed.Model.extend('todo', {
  schema: new Seed.Schema({
    title: String,
    completed: Boolean
  })
});

Minimal.Todos = Seed.Graph.extend({
  initialize: function () {
    this.define(Minimal.Todo);
  }
});

var db = new Minimal.Todos()
  , guid = new Seed.ObjectId();

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

io.sockets.on('connection', function (socket) {

  /**
   * todo:create
   *
   * called when we .save() our new todo
   *
   * we listen on model namespace, but emit
   * on the collection namespace
   */

  socket.on('todo:create', function (data, callback) {
    var id = guid.gen()
      , todo = db.set('/todo/' + id, data)
      , json = todo._attributes;

    socket.emit('todos:create', json);
    socket.broadcast.emit('todos:create', json);
    callback(null, json);
  });

  /**
   * todos:read
   *
   * called when we .fetch() our collection
   * in the client-side router
   */

  socket.on('todos:read', function (data, callback) {
    var list = [];

    db.each('todo', function (todo) {
      list.push(todo._attributes);
    });

    callback(null, list);
  });

  /**
   * todo:update
   *
   * called when we .save() our model
   * after toggling its completed status
   */

  socket.on('todo:update', function (data, callback) {
    var todo = db.get('/todo/' + data.id);
    todo.set(data);

    var json = todo._attributes;

    socket.emit('todo/' + data.id + ':update', json);
    socket.broadcast.emit('todo/' + data.id + ':update', json);
    callback(null, json);
  });

  /**
   * todo:delete
   *
   * called when we .destroy() our model
   */

  socket.on('todo:delete', function (data, callback) {
    console.log(db.get('/todo/' + data.id))
    var json = db.get('/todo/' + data.id)._attributes;

    db.del('/todo/' + data.id);

    socket.emit('todo/' + data.id + ':delete', json);
    socket.broadcast.emit('todo/' + data.id + ':delete', json);
    callback(null, json);
  });

});

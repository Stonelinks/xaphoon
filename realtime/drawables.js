var Seed = require('seed');

// Our psuedo database, on Seed.
// https://github.com/logicalparadox/seed

var xaphoon = {};

xaphoon.Drawable = Seed.Model.extend('drawable', {
  schema: new Seed.Schema({
    title: String,
    completed: Boolean
  })
});

xaphoon.Drawables = Seed.Graph.extend({
  initialize: function() {
    this.define(xaphoon.Drawable);
  }
});

var db = new xaphoon.Drawables();
var guid = new Seed.ObjectId();

// this function will attach things that make the feed / users work to socket events
var attachSocketEvents = function(socket) {

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
};

module.exports.attachSocketEvents = attachSocketEvents;

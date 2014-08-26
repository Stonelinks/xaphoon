// Drawable definition and functions
var Backbone = require('backbone');
var _ = require('lodash');

var Drawable = Backbone.Model.extend({});
var Drawables = Backbone.Collection.extend({
  model: Drawable
});
var drawables = new Drawables();

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
    var drawable = new Drawable(data);
    drawable.set('id', _.uniqueId());
    drawables.add(drawable);

    var json = drawable.toJSON();

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
    callback(null, drawables.toJSON());
  });

  /**
   * drawable:update
   *
   * called when we .save() our model
   * after toggling its completed status
   */

  socket.on('drawable:update', function(data, callback) {

    var drawable = drawables.get(data.id);
    if (drawable !== undefined) {
      drawable.set(data);

      var json = drawable.toJSON();

      socket.emit('drawable/' + data.id + ':update', json);
      socket.broadcast.emit('drawable/' + data.id + ':update', json);
      callback(null, json);
    }
  });

  /**
   * drawable:delete
   *
   * called when we .destroy() our model
   */

  socket.on('drawable:delete', function(data, callback) {

    var drawable = drawables.get(data.id);
    if (drawable !== undefined) {
      var json = drawable.toJSON();

      drawables.remove(drawable);

      socket.emit('drawable/' + data.id + ':delete', json);
      socket.broadcast.emit('drawable/' + data.id + ':delete', json);
      callback(null, json);
    }
  });
};

module.exports.attachSocketEvents = attachSocketEvents;

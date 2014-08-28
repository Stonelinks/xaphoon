// namespace definition and functions
var Backbone = require('backbone');
var _ = require('lodash');

// this function will attach things that make the feed / users work to socket events
var attachSocketEvents = function(namespace, collection, socket) {

  /**
   * namespace:create
   *
   * called when we .save() our new namespace
   *
   * we listen on model namespace, but emit
   * on the collection namespace
   */

  socket.on(namespace + ':create', function(data, callback) {
    var newModel = new collection.model(data);
    newModel.set('id', _.uniqueId());
    collection.add(newModel);

    var json = newModel.toJSON();

    socket.emit(namespace + ':create', json);
    socket.broadcast.emit(namespace + ':create', json);

    callback(null, json);
  });

  /**
   * namespace:read
   *
   * called when we .fetch() our collection
   * in the client-side router
   */

  socket.on(namespace + ':read', function(data, callback) {
    callback(null, collection.toJSON());
  });

  /**
   * namespace:update
   *
   * called when we .save() our model
   * after toggling its completed status
   */

  socket.on(namespace + ':update', function(data, callback) {

    var namespace = collection.get(data.id);
    if (namespace !== undefined) {
      namespace.set(data);

      var json = namespace.toJSON();

      socket.emit(namespace + '/' + data.id + ':update', json);
      socket.broadcast.emit(namespace + '/' + data.id + ':update', json);

      callback(null, json);
    }
  });

  /**
   * namespace:delete
   *
   * called when we .destroy() our model
   */

  socket.on(namespace + ':delete', function(data, callback) {

    var namespace = collection.get(data.id);
    if (namespace !== undefined) {
      var json = namespace.toJSON();

      collection.remove(namespace);

      socket.emit(namespace + '/' + data.id + ':delete', json);
      socket.broadcast.emit(namespace + '/' + data.id + ':delete', json);

      callback(null, json);
    }
  });
};

module.exports.attachSocketEvents = attachSocketEvents;

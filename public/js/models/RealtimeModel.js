var RealtimeModel = Backbone.Model.extend({
  urlRoot: 'drawable',

  noIoBind: false,

  socket: window.socket,

  initialize: function() {
    _.bindAll(this, 'serverChange', 'serverDelete', 'modelCleanup');

    /*!
     * if we are creating a new model to push to the server we don't want
     * to iobind as we only bind new models from the server. This is because
     * the server assigns the id.
     */
    if (!this.noIoBind) {
      this.ioBind('update', this.serverChange, this);
      this.ioBind('delete', this.serverDelete, this);
    }
  },

  serverChange: function(data) {
    // Useful to prevent loops when dealing with client-side updates (ie: forms).
    data.fromServer = true;
    this.set(data);
  },

  serverDelete: function(data) {
    if (this.collection) {
      this.collection.remove(this);
    }
    else {
      this.trigger('remove', this);
    }
    this.modelCleanup();
  },

  modelCleanup: function() {
    this.ioUnbindAll();
    return this;
  }
});

/**
 * Todos#Collection
 *
 * The collection responds to `create` events from the
 * server. When a new Todo is created, the todo is broadcasted
 * using socket.io upon creation.
 */

var RealtimeCollection = Backbone.Collection.extend({
  model: RealtimeModel,

  url: 'drawable',

  socket: window.socket,

  initialize: function() {
    _.bindAll(this, 'serverCreate', 'collectionCleanup');
    this.ioBind('create', this.serverCreate, this);
  },

  serverCreate: function(data) {
    // make sure no duplicates, just in case
    var exists = this.get(data.id);
    if (!exists) {
      this.add(data);
    }
    else {
      data.fromServer = true;
      exists.set(data);
    }
  },

  collectionCleanup: function(callback) {
    this.ioUnbindAll();
    this.each(function(model) {
      model.modelCleanup();
    });
    return this;
  }
});

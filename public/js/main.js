window.socket = io.connect('http://localhost');

// We are going to put our app in the minimal namespace.
var xaphoon = {};

/**
 * App#Router
 *
 * There is only one route in this app. It creates the new
 * Todos Collection then passes it to the form and list views.
 *
 * Then append the views to our page.
 */

xaphoon.App = Backbone.Router.extend({
  routes: {
    '': 'index',
    '/': 'index'
  },

  index: function() {
    var sceneObjects = new xaphoon.DrawableCollection();

    window.sceneObjects = sceneObjects;

    sceneObjects.on('add', function(model) {
      console.log('add ' + model.id);
    });

    sceneObjects.on('remove', function(model) {
      console.log('remove ' + model.id);
    });

    sceneObjects.on('change', function(model) {
      console.log('change ' + model.id + ':');
      _.forEach(model.previousAttributes(), function(val, key) {
        console.log('  ' + key + ': ' + val + ' --> ' + model.get(key));
      });
    });

    sceneObjects.fetch();
  }
});

/**
 * Todo#Model
 *
 * The todo model will bind to the servers `update` and
 * `delete` events. We broadcast these events on the completion
 * and removing of an event.
 *
 * The `noIoBind` default value of false so that models that
 * are created via the collection are bound.
 *
 */

xaphoon.DrawableModel = Backbone.Model.extend({
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

xaphoon.DrawableCollection = Backbone.Collection.extend({
  model: xaphoon.DrawableModel,

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


xaphoon.Renderer = Backbone.View.extend({
  id: 'renderer',

  initialize: function(todos) {

    this.DrawableCollection = DrawableCollection;

    // this is called upon fetch
    this.todos.bind('reset', this.render);

    // this is called when the collection adds a new todo from the server
    this.todos.bind('add', this.addDrawable);
    this.todos.bind('add', this.removeDrawable);

    this.render();
  },

  render: function() {
    var self = this;

    this.DrawableCollection.each(function(todo) {
      self.addDrawable(todo);
    });

    return this;
  },

  addDrawable: function(drawable) {

  }
});

var add = function(attrs) {

  // We don't want ioBind events to occur as there is no id.
  // We extend Todo#Model pattern, toggling our flag, then create
  // a new todo from that.
  var d = xaphoon.DrawableModel.extend({ noIoBind: true });

  var _object = new d(attrs);
  _object.save();
};

var remove = function(o) {
  // Silent is true so that we react to the server
  // broadcasting the remove event.
  o.destroy({ silent: true });
};

// When the page is ready, create a new app and trigger the router.
$(document).ready(function() {
  window.app = new xaphoon.App();
  Backbone.history.start();
});

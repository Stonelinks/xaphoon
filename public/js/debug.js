window.socket = io.connect();

var xaphoon = new Backbone.Marionette.Application();

xaphoon.addInitializer(function(options) {
  xaphoon.addRegions({
    feed: '#feed',
    renderer: '#renderer'
  });
});

var broadCast = function(data) {
  socket.emit('feed:new', data);
};

var feedView = Marionette.ItemView.extend({
  template: '#feed-template',

  events: {
    'keydown': 'keyAction'
  },

  keyAction: function(e) {
    var code = e.keyCode || e.which;
    var message = this.$el.find('#chat-input').val();
    if (code == 13 && message != '') {
      this.$el.find('#chat-input').val('');
      socket.emit('feed:new', message);
      this.logEvent(message, 'tx');
    }
  },

  logEvent: function(message, mode) {
    mode = mode || 'rx'; // or tx
    var t = _.template($('#feed-item-template').text());
    this.$el.find('.feed').prepend(t({
      mode: mode,
      message: message
    }));
    console.log((mode == 'tx' ? '<< ' : '>> ') + message);
  },

  initialize: function(options) {
    this.once('render', function() {
      var _this = this;
      socket.on('feed:update', function(data) {
        if (_.isArray(data.message)) {
          data.message.forEach(function(m) {
            _this.logEvent(m);
          });
        }
        else {
          _this.logEvent(data.message);
        }
      });
      socket.emit('feed:init');
    });
  }
});

var router = Backbone.Router.extend({
  routes: {
    '*catchall': 'index'
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

    var feed = new feedView();
    xaphoon.feed.show(feed);
  }
});

xaphoon.addInitializer(function(options) {
  new router();
  Backbone.history.start();
});

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
  // socket.on('user joined', function(data) {
    // $('#numusers').text(data.numUsers);
  // });

  window.xaphoon = xaphoon;
  xaphoon.start();
});

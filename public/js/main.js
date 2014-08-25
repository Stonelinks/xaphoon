var broadCast = function(data) {
  socket.emit('feed:new', data);
};


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

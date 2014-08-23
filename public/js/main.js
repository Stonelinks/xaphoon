
window.socket = io.connect('http://localhost');

console.log(window.socket);

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
    var todos = new xaphoon.Todos();

    window.todos = todos;

    todos.on('add', function(model) {
      console.log('add ' + model.id);
    });

    todos.on('remove', function(model) {
      console.log('remove ' + model.id);
    });

    todos.on('change', function(model) {
      console.log('change ' + model.id + ':');
      _.forEach(model.previousAttributes(), function(val, key) {
        console.log('  ' + key + ': ' + val + ' --> ' + model.get(key));
      });
    });

    // var form = new xaphoon.TodoListForm(todos);
    // $('.container').append(form.el);
    //
    // var list = new xaphoon.TodoList(todos);
    // $('.container').append(list.el);

    todos.fetch();
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

xaphoon.Todo = Backbone.Model.extend({
  urlRoot: 'todo',
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
    } else {
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

xaphoon.Todos = Backbone.Collection.extend({
  model: xaphoon.Todo,
  url: 'todos',
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
    } else {
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

/**
 * TodoList#View
 *
 * This is the primary list of todos. It recieves the collection
 * upon construction and will respond to events broadcasted from
 * socket.io.
 */

xaphoon.TodoList = Backbone.View.extend({
  id: 'TodoList',
  initialize: function(todos) {
    _.bindAll(this, 'render', 'addTodo');

    this.todos = todos;

    // this is called upon fetch
    this.todos.bind('reset', this.render);

    // this is called when the collection adds a new todo from the server
    this.todos.bind('add', this.addTodo);

    this.render();
  },
  render: function() {
    var self = this;

    this.todos.each(function(todo) {
      self.addTodo(todo);
    });

    return this;
  },
  addTodo: function(todo) {
    var tdv = new xaphoon.TodoListItem(todo);
    $(this.el).append(tdv.el);
  }
});

/**
 * TodoListItem#View
 *
 * This view is created for each Todo in the list. It responds
 * to client interaction and handles displaying changes to todo model
 * received from the server.
 *
 * In our case, it recieves a specific model on construction and
 * binds to change events for whether the todo is completed or not.
 */

xaphoon.TodoListItem = Backbone.View.extend({
  className: 'todo',
  events: {
    'click .complete': 'completeTodo',
    'click .delete': 'deleteTodo'
  },
  initialize: function(model) {
    _.bindAll(this, 'setStatus', 'completeTodo', 'deleteTodo', 'removeTodo');
    this.model = model;
    this.model.bind('change:completed', this.setStatus);
    // this is called when the model is told to remove a todo
    this.model.bind('remove', this.removeTodo);
    this.render();
  },
  render: function() {
    $(this.el).html(template.item(this.model.toJSON()));
    $(this.el).attr('id', this.model.id);
    this.setStatus();
    return this;
  },
  setStatus: function() {
    var status = this.model.get('completed');
    if (status) {
      $(this.el).addClass('complete');
    } else {
      $(this.el).removeClass('complete');
    }
  },
  completeTodo: function() {
    // here we toggle the completed flag. we do NOT
    // set status (update UI) as we are waiting for
    // the server to instruct us to do so.
    var status = this.model.get('completed');
    this.model.save({ completed: !!!status });
  },
  deleteTodo: function() {
    // Silent is true so that we react to the server
    // broadcasting the remove event.
    this.model.destroy({ silent: true });
  },
  removeTodo: function(todo) {
    var self = this
, width = this.$el.outerWidth();

    // ooh, shiny animation!
    this.$el.css('width', width + 'px');
    this.$el.animate({
      'margin-left': width,
      'opacity': 0
    }, 200, function() {
        self.$el.animate({
          'height': 0
        }, 200, function() {
            self.$el.remove();
          });
      });
  }
});

/**
 * TodoListForm#View
 *
 * This form handles adding new Todos to the server. The server
 * then broadcasts the new Todo to all clients. We don't want our
 * new Model instance to ioBind as no ID has been defined so we
 * extend our original model and toggle our flag.
 */

xaphoon.TodoListForm = Backbone.View.extend({
  id: 'TodoForm',
  events: {
    'click .button#add': 'addTodo'
  },
  initialize: function(todos) {
    _.bindAll(this, 'addTodo');
    this.todos = todos;
    this.render();
  },
  render: function() {
    $(this.el).html(template.form());
    return this;
  },
  addTodo: function() {
    // We don't want ioBind events to occur as there is no id.
    // We extend Todo#Model pattern, toggling our flag, then create
    // a new todo from that.
    var Todo = xaphoon.Todo.extend({ noIoBind: true });

    var attrs = {
      title: this.$('#TodoInput input[name="TodoInput"]').val(),
      completed: false
    };

    // reset the text box value
    this.$('#TodoInput input[name="TodoInput"]').val('');

    var _todo = new Todo(attrs);
    _todo.save();
  }
});


var add = function(attrs) {

  // We don't want ioBind events to occur as there is no id.
  // We extend Todo#Model pattern, toggling our flag, then create
  // a new todo from that.
  var Todo = xaphoon.Todo.extend({ noIoBind: true });

  var _todo = new Todo(attrs);
  _todo.save();
};

var remove = function(todo) {
  // Silent is true so that we react to the server
  // broadcasting the remove event.
  todo.destroy({ silent: true });
};

// When the page is ready, create a new app and trigger the router.
$(document).ready(function() {
  window.app = new xaphoon.App();
  Backbone.history.start();
});

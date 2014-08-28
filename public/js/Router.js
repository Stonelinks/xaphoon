var Router = Backbone.Router.extend({
  routes: {
    '*catchall': 'index'
  },

  index: function() {

    var feedCollection = new FeedCollection();
    var users = new Users();

    users.fetch();

    var user;
    var _createUser = function() {

      // We don't want ioBind events to occur as there is no id
      var _User = User.extend({
        noIoBind: true
      });

      var _user = new _User();
      // users.once('add', function(newUser) {
        // user = newUser;
        // localStorage.__xaphoonUserID = user.id;
        // debugger;
      // });
      _user.save();
      // users.fetch();
    };

    console.log(users.length);

    // if (users.get(localStorage.__xaphoonUserID) === undefined) {
      // _createUser();
    // }
    // else {
      // user = users.get(localStorage.__xaphoonUserID);
    // }
    _createUser();

    var feed = new FeedView({
      collection: feedCollection
    });
    xaphoon.feed.show(feed);

    // var drawables = new Drawables();
    // window.drawables = drawables;
    // render = new ThreeJSRenderer({
      // collection: drawables
    // });
    // xaphoon.renderer.show(render);
  }
});

xaphoon.addInitializer(function(options) {
  new Router();
  Backbone.history.start();
});

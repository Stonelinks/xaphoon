var Router = Backbone.Router.extend({
  routes: {
    '*catchall': 'index'
  },

  index: function() {

    var users = Omni.Collections.users;

    var login = new LoginView({
      collection: users
    });
    window.xaphoon.login.show(login);

    window.xaphoon.once('login', function(user) {
      // var feed = Omni.Collections.feed;
      var feedView = new FeedView({
        // collection: feed,
        user: user
      });
      window.xaphoon.feed.show(feedView);
    });

    // var drawables = new Drawables();
    // window.drawables = drawables;
    // render = new ThreeJSRenderer({
      // collection: drawables
    // });
    // window.xaphoon.renderer.show(render);
  }
});

window.xaphoon.addInitializer(function(options) {
  new Router();
  Backbone.history.start();
});

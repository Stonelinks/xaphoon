var Router = Backbone.Router.extend({
  routes: {
    '*catchall': 'index'
  },

  index: function() {

    var login = new LoginView();
    window.xaphoon.login.show(login);

    window.xaphoon.once('login', function() {
      var feedView = new FeedView({
        _collection: Omni.Collections.feed
      });
      window.xaphoon.feed.show(feedView);

      var _renderer = new ThreeJSRenderer({
        _collection: Omni.Collections.drawables
      });
      window.xaphoon.renderer.show(_renderer);
      // window._renderer = _renderer;
    });
  }
});

window.xaphoon.addInitializer(function(options) {
  new Router();
  Backbone.history.start();
});

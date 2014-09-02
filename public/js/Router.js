var Router = Backbone.Router.extend({
  routes: {
    '*catchall': 'index'
  },

  index: function() {

    window.feed = new Feed();

    var feedView = new FeedView({
      collection: feed
    });
    window.xaphoon.feed.show(feedView);

    window.drawables = new Drawables();
    var xaphoonRenderer = new ThreeJSRenderer({
      collection: drawables
    });
    window.xaphoon.renderer.show(xaphoonRenderer);
    window._renderer = xaphoonRenderer;
  }
});

window.xaphoon.addInitializer(function(options) {
  new Router();
  Backbone.history.start();
});

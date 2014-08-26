var Router = Backbone.Router.extend({
  routes: {
    '*catchall': 'index'
  },

  index: function() {

    var drawables = new Drawables();
    window.drawables = drawables;

    var feed = new FeedView();
    xaphoon.feed.show(feed);

    var render = new ThreeJSRenderer({
      collection: drawables
    });
    xaphoon.renderer.show(render);
  }
});

xaphoon.addInitializer(function(options) {
  new Router();
  Backbone.history.start();
});

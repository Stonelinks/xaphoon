var router = Backbone.Router.extend({
  routes: {
    '*catchall': 'index'
  },

  index: function() {

    var sceneObjects = new xaphoon.DrawableCollection();
    window.sceneObjects = sceneObjects;
    sceneObjects.fetch();

    var feed = new feedView();
    xaphoon.feed.show(feed);

    var render = new ThreeJSRenderer();
    xaphoon.renderer.show(render);
  }
});

xaphoon.addInitializer(function(options) {
  new router();
  Backbone.history.start();
});

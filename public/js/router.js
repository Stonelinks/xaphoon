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


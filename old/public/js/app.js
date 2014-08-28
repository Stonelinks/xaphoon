window.socket = io.connect();

var xaphoon = new Backbone.Marionette.Application();

xaphoon.addInitializer(function(options) {
  xaphoon.addRegions({
    feed: '#feed',
    renderer: '#renderer-anchor'
  });
});

var xaphoon = window.xaphoon = new Backbone.Marionette.Application();

window.xaphoon.addInitializer(function(options) {
  window.xaphoon.addRegions({
    feed: '#feed-anchor',
    renderer: '#renderer-anchor'
  });
});

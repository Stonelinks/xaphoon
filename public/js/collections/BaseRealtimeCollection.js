var BaseRealtimeCollection = Backbone.Collection.extend({
  backend: 'collectionName',

  initialize: function() {
    this.bindBackend();
  }
});

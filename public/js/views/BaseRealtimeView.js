var BaseRealtimeView = Marionette.ItemView.extend({
  initialize: function() {
    if (this.collection) {
      this.once('render', function() {
        this.collection.fetch();
      });
    }
  }
});

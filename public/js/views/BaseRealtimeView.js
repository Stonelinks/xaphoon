var BaseRealtimeView = Marionette.ItemView.extend({

  _collectionEvents: {},

  initialize: function(options) {
    var _this = this;
    _.forEach(this._collectionEvents, function(callback, eventName) {
      options._collection.listenTo(options._collection, eventName, callback.bind(_this));
    });

    this.once('render', function() {
      if (_this._collectionEvents.add !== undefined) {
        options._collection.forEach(function(model) {
          _this._collectionEvents.add.call(_this, model, options._collection);
        });
      }
    });
  }
});

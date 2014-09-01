window.sendFeedUpdate = function(message) {
    Omni.trigger('feed', {
    message: message
  }, function(data) {

    if (data.error != undefined) {
      alert(data.error);
    }
  });
};

var FeedView = BaseRealtimeView.extend({
  template: '#feed-template',

  logEvent: function(message, user) {
    var user = user || {};
    var name = user.name || undefined;
    var color = user.color || 'black';
    var t = _.template($('#feed-item-template').text());
    this.$el.find('.feed').prepend(t({
      name: name,
      color: color,
      message: message
    }));

    console.log((name === undefined ? '>> ' : name + ': ') + message);
  },

  events: {
    'submit #feed-input': function(e) {

      var $input = this.$el.find('input');

      if ($input.val()) {
        window.sendFeedUpdate($input.val());
        $input.val('');
      }

      e.stopPropagation();
      e.preventDefault();
      return false;
    }
  },

  updateOnline: function() {
    this.logEvent(Omni.Collections.userCount.at(0).get('count') + ' people online');
  },

  _collectionEvents: {
    'add': function(feedItem) {
      this.logEvent(feedItem.get('message'), feedItem.get('user'));
    }
  },

  initialize: function(options) {
    BaseRealtimeView.prototype.initialize.apply(this, arguments);
    this.once('render', function() {
      Omni.Collections.userCount.at(0).on('change:count', this.updateOnline.bind(this));
      this.updateOnline();
    });
  }
});

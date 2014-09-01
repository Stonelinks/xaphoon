var FeedView = Marionette.ItemView.extend({
  template: '#feed-template',

  logEvent: function(message, user) {
    var user = user || {};
    var t = _.template($('#feed-item-template').text());
    this.$el.find('.feed').prepend(t({
      name: user.name || undefined,
      color: user.color || 'black',
      message: message
    }));

    console.log(user.name + ': ' + message);
  },

  events: {
    'submit #feed-input': function(e) {

      var $input = this.$el.find('input');

      if ($input.val()) {

        Omni.trigger('feed', {
          message: $input.val()
        }, function(data) {

          if (data.error != undefined) {
            alert(data.error);
          }
          console.log('hello');
          console.log(data);

          if (data.success != undefined && data.id != undefined) {
            console.log('marcos lopez');
          }
        });
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

  initialize: function(options) {
    this.once('render', function() {
      Omni.Collections.userCount.at(0).on('change:count', this.updateOnline.bind(this));
      this.updateOnline();

      var _this = this;
      Omni.Collections.feed.listenTo(Omni.Collections.feed, 'add', function(feedItem) {
        _this.logEvent(feedItem.get('message'), feedItem.get('user'));
      });
    });
  }
});

var getRandomColor = function() {
  var letters = '0123456789ABC'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.round(Math.random() * (letters.length - 1))];
  }
  return color;
};

var myColor = getRandomColor();

window.sendFeedUpdate = function(message) {
  var newFeedItem = new FeedItem({
    message: message,
    color: myColor
  });
  window.feed.add(newFeedItem);
  newFeedItem.save();
};

var FeedView = BaseRealtimeView.extend({
  template: '#feed-template',

  logEvent: function(message, color) {
    if (message) {
      var color = color || myColor;
      var t = _.template($('#feed-item-template').text());
      this.$el.find('.feed').prepend(t({
        color: color,
        message: message
      }));

      console.log(color + ' >> ' + message);
    }
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

  collectionEvents: {
    'add': function(feedItem) {
      this.logEvent(feedItem.get('message'), feedItem.get('color'));
    }
  },

  sayHello: function() {
    window.sendFeedUpdate('hello');
  },

  initialize: function(options) {
    BaseRealtimeView.prototype.initialize.apply(this, arguments);
    this.once('render', function() {
      this.sayHello();
    });
  }
});

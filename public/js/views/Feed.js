var FeedView = Marionette.ItemView.extend({
  template: '#feed-template',

  getCursorForMode: function(mode) {
    var dict = {
      tx: '<<',
      rx: '>>'
    };
    return dict[mode];
  },

  logEvent: function(message, mode) {
    mode = mode || 'rx'; // or tx

    var re = new RegExp(socket.io.engine.id, 'g');
    message = message.replace(re, 'you');

    var t = _.template($('#feed-item-template').text());
    this.$el.find('.feed').prepend(t({
      mode: mode,
      message: message
    }));

    console.log(this.getCursorForMode(mode) + ' ' + message);
  },

  events: {
    'keydown': function(e) {
      var code = e.keyCode || e.which;
      var message = this.$el.find('#chat-input').val();
      if (code == 13 && message != '') {
        this.$el.find('#chat-input').val('');
        socket.emit('feed:new', message);
      }
    }
  },

  collectionEvents: {
    'add': function(feedItem) {

      var mode;
      if (data.socketID == socket.io.engine.id) {
        mode = 'tx';
      }
      else {
        mode = 'rx';
      }

      if (_.isArray(data.message)) {
        data.message.forEach(function(m) {
          _this.logEvent(m, mode);
        });
      }
      else {
        _this.logEvent(data.message, mode);
      }
    }
  },

  initialize: function(options) {
    this.once('render', function() {
      this.collection.fetch();
    });
  }
});

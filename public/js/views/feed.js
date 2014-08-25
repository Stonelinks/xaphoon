var feedView = Marionette.ItemView.extend({
  template: '#feed-template',

  logEvent: function(message, mode) {
    mode = mode || 'rx'; // or tx
    var t = _.template($('#feed-item-template').text());
    this.$el.find('.feed').prepend(t({
      mode: mode,
      message: message
    }));
    console.log((mode == 'tx' ? '<< ' : '>> ') + message);
  },

  events: {
    'keydown': 'keyAction'
  },

  keyAction: function(e) {
    var code = e.keyCode || e.which;
    var message = this.$el.find('#chat-input').val();
    if (code == 13 && message != '') {
      this.$el.find('#chat-input').val('');
      socket.emit('feed:new', message);
      this.logEvent(message, 'tx');
    }
  },

  initialize: function(options) {
    this.once('render', function() {
      var _this = this;
      socket.on('feed:update', function(data) {
        if (_.isArray(data.message)) {
          data.message.forEach(function(m) {
            _this.logEvent(m);
          });
        }
        else {
          _this.logEvent(data.message);
        }
      });
      socket.emit('feed:init');
    });
  }
});

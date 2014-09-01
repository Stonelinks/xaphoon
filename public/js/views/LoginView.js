var LoginView = Marionette.ItemView.extend({
  template: '#login-template',

  events: {
    'submit #login': function(e) {
      var _this = this;
      var $input = _this.$el.find('input');

      if ($input.val()) {
        Omni.trigger('login', {
          name: $input.val()
        }, function(data) {
          if (data.error != undefined) {
            alert(data.error);
          }

          if (data.success != undefined && data.id != undefined) {
            window.xaphoon.user = Omni.Collections.users.findWhere({
              id: data.id
            });
            _this.$el.hide();
            $('#wrapper').removeClass('fade-out');
            window.xaphoon.trigger('login');
          }
        });
        $input.val('');
      }

      e.stopPropagation();
      e.preventDefault();
      return false;
    }
  },

  initialize: function() {
    var _this = this;
    Omni.on('recheckPermissions', function() {
      if (window.xaphoon.user != null) {
        window.xaphoon.user = Omni.Collections.users.findWhere({
          id: window.xaphoon.user.id
        });
      }
    });

    this.on('render', function() {
      $('#wrapper').addClass('fade-out');
    });
  }
});


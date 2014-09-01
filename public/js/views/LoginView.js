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

            window.xaphoon.trigger('update:user');
            window.xaphoon.trigger('login', window.xaphoon.user);
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
    window.xaphoon.on('update:user', function() {

      // bind changes to user properties here
      // window.xaphoon.user.on('change:alive', _this.checkIfDead.bind(_this));
    });
    Omni.on('recheckPermissions', function() {
      if (window.xaphoon.user != null) {
        window.xaphoon.user = Omni.Collections.users.findWhere({
          id: window.xaphoon.user.id
        });
        window.xaphoon.trigger('update:user');
      }
    });

    this.on('render', function() {
      $('#wrapper').addClass('fade-out');
    });
  }
});


var BaseModel = require('./BaseModel');

module.exports = BaseModel.extend({
  defaults: {
    x: 0,
    y: 0,
    user: null,
    color: '#fff'
  },

  // TODO This method is super messy, could be nicer
  projectTowards: function(x, y, speed, collections, callback) {
    var deltaX = x - this.get('x');
    var deltaY = y - this.get('y');

    var magnitude = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));

    deltaX = (deltaX / magnitude) * speed;
    deltaY = (deltaY / magnitude) * speed;

    var _this = this;
    var lastProjectTime = Date.now();
    (function(x, y, callback, collections) {
      var moveLoop = function() {
        // Check if colliding with any users
        var usersInRoom = collections.users.where({
          room: _this.get('user').get('room')
        });
        for (var p in usersInRoom) {
          var user = usersInRoom[p];
          if (_this.get('user') != user && _this.approximatelyAt(user.get('x'), user.get('y'))) {
            user.set('health', user.get('health') - 1);
            if (user.get('health') <= 0 && user.get('alive')) {
              user.set('alive', false);
              _this.get('user').set('kills', _this.get('user').get('kills') + 1);
              user.set('deaths', user.get('deaths') + 1);
              // collections.users.remove(user);
            }
            if (callback != undefined) {
              callback(_this);
            }
            clearInterval(_this.projectionInterval);
            return;
          }
        }

        if (_this.isOffscreen()) {
          if (callback != undefined) {
            callback(_this);
          }
          clearInterval(_this.projectionInterval);
          return;
        }
        var deltaTime = Date.now() - lastProjectTime;
        _this.move(deltaX * deltaTime, deltaY * deltaTime);
        lastProjectTime = Date.now();
        setTimeout(moveLoop, 20);
      };
      moveLoop();
    })(x, y, callback, collections);
  },

  move: function(deltaX, deltaY) {
    this.set('x', Math.round(this.get('x') + deltaX));
    this.set('y', Math.round(this.get('y') + deltaY));
  },

  approximatelyAt: function(x, y) {
    return this.get('x') > x - 30 && this.get('x') < x + 30
      && this.get('y') > y - 30 && this.get('y') < y + 30;
  },

  isOffscreen: function() {
    return this.get('x') <= 0 || this.get('x') >= 800
      || this.get('y') <= 0 || this.get('y') >= 600;
  },

  readPermission: function(connection, property) {
    if (property == 'user') {
      return false;
    }
    if (connection.room == this.get('user').get('room')) {
      return true;
    }
    return false;
  }
});

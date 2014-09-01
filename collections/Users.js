var BaseCollection = require('./BaseCollection');
var User = require('../models/User');

module.exports = BaseCollection.extend({
  model: User,

  findRoom: function() {
    var room = 1;
    while (true) {
      if (this.where({room: room, alive: true}).length < 3) {
        return room;
      }
      room++;
    }
  }
});

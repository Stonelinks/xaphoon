// feed and user definitions and functions
var Backbone = require('backbone');
var realtimeModel = require('./realtimeModel');

// users
var User = Backbone.Model.extend({});
var Users = Backbone.Collection.extend({
  model: User,

  status: function() {
    return this.length + ' people are here';
  }
});
var users = new Users();

module.exports.attachSocketEvents = function(socket) {
  realtimeModel.attachSocketEvents('user', users, socket);
};

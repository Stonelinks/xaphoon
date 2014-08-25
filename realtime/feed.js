// feed and user definitions and functions
var Backbone = require('backbone');

// the feed -- basically a log of events in the application
var FeedItem = Backbone.Model.extend({});
var Feed = Backbone.Collection.extend({
  comparator: 'time',
  model: FeedItem
});
var feed = new Feed();

// users
var User = Backbone.Model.extend({});
var Users = Backbone.Collection.extend({
  model: User,

  status: function() {
    return this.length + ' people are here';
  }
});
var users = new Users();

// this function will attach things that make the feed / users work to socket events
var attachSocketEvents = function(socket) {

  // start out by creating a new user for the socket
  var user = new User({
    socketID: socket.id
  });
  users.add(user);

  // handy function for broadcasting feed:update events to all clients
  var _broadcastFeedUpdate = function(data) {
    socket.broadcast.emit('feed:update', {
      socketID: socket.id,
      message: data
    });
  };
  _broadcastFeedUpdate(socket.id + ' joined');
  _broadcastFeedUpdate(users.status());

  // client feed initialization
  socket.on('feed:init', function() {
    socket.emit('feed:update', {
      socketID: -1,
      message: feed.pluck('message').concat([users.status()])
    });
  });

  // create a new feed item and broadcast it
  socket.on('feed:new', function(data) {
    var feedItem = new FeedItem({
      time: (new Date()).getTime(),
      from: socket.id,
      message: data
    });
    feed.add(feedItem);
    _broadcastFeedUpdate(data);
  });

  // remove the user when they disconnect and let everyone know about
  socket.on('disconnect', function() {
    var user = users.findWhere({
      socketID: socket.id
    });
    if (user !== undefined) {
      users.remove(user);
      _broadcastFeedUpdate(socket.id + ' left');
      _broadcastFeedUpdate(users.status());
    }
  });
};

module.exports.attachSocketEvents = attachSocketEvents;

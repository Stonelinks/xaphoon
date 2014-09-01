var Omni = require('omni');
var Users = require('./collections/Users');
var Drawables = require('./collections/Drawables');
var Feed = require('./collections/Feed');

var users = new Users();
var drawables = new Drawables();
var feed = new Feed();

var collections = {
  users: users,
  feed: feed,
  drawables: drawables,
  userCount: new Omni.Collection([{id: 1, count: 0}])
};

var events = {
  login: require('./events/login'),
  feed: require('./events/feed'),
  drawable: require('./events/drawable'),
  disconnect: require('./events/disconnect'),
  connect: require('./events/connect')
};

var port = process.env.PORT || 3000;

var server = Omni.listen(port, collections, events, {
  development: true
});

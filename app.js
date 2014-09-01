var Omni = require('omni');
var Users = require('./collections/Users');
// var Spells = require('./collections/Spells');
var Feed = require('./collections/Feed');

var users = new Users();
// var spells = new Spells();
var feed = new Feed();

var collections = {
  users: users,
  feed: feed,
  // spells: spells,
  userCount: new Omni.Collection([{id: 1, count: 0}])
};

var events = {
  login: require('./events/login'),
  feed: require('./events/feed'),
  // spell: require('./events/spell'),
  disconnect: require('./events/disconnect'),
  connect: require('./events/connect')
};

var port = process.env.PORT || 3000;

var server = Omni.listen(port, collections, events);

var Omni = require('omni');
var Users = require('./collections/users');
var Spells = require('./collections/spells');

var users = new Users();
var spells = new Spells();

var collections = {
  users: users,
  spells: spells,
  userCount: new Omni.Collection([{id: 1, count: 0}])
};

var events = {
  login: require('./events/login'),
  spell: require('./events/spell'),
  disconnect: require('./events/disconnect'),
  connect: require('./events/connect'),
  respawn: require('./events/respawn')
};

var port = process.env.PORT || 3000;

var server = Omni.listen(port, collections, events);

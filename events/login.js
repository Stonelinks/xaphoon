var User = require('../models/User');

function getRandomColor() {
  var letters = '0123456789ABC'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.round(Math.random() * (letters.length - 1))];
  }
  return color;
}

module.exports = {
  run: function(connection, collections, data) {
    if (connection.user) {
      return {
        error: 'Already logged in.'
      };
    }

    if (data.name) {
      if (collections.users.where({name: data.name}).length > 0) {
        return {
          error: 'Someone already has that name.'
        };
      }

      var newID = collections.users.nextID();
      var room = collections.users.findRoom();
      var newUser = new User({
        id: newID,
        name: data.name,
        color: getRandomColor(),
        room: room
      });

      connection.room = newUser.get('room');
      collections.users.add(newUser);
      connection.user = newUser;
      connection.recheckAllPermissions();

      // Increment user count
      var userCount = collections.userCount.at(0);
      userCount.set('count', userCount.get('count') + 1);

      return {
        success: 'Successfully logged in.',
        id: newID
      };
    }
  }
};

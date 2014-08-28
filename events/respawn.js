module.exports = {
  run: function(connection, collections, data) {
    if (!connection.user) {
      return {
        error: 'Not logged in.'
      };
    }

    if (connection.user.get('alive')) {
      return {
        error: 'Still alive.'
      };
    }

    var room = collections.users.findRoom();

    connection.room = room;
    connection.user.set({
      room: room,
      health: 10,
      alive: true,
      x: Math.round(Math.random() * 700 + 50),
      y: Math.round(Math.random() * 500 + 50)
    });

    connection.recheckAllPermissions();
    for (var x in connection.connections) {
      var con = connection.connections[x];
      if (con.user && con.user.get('room') == room) {
        con.recheckAllPermissions();
      }
    }

    return {
      success: 'Respawned',
      id: connection.user.id
    };
  }
};

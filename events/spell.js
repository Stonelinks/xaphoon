var Spell = require('../models/spell');

module.exports = {
  run: function(connection, collections, data) {
    if (data.x == null || data.y == null) {
      return {error: 'Invalid spell event.'};
    }
    if (connection.user == null) {
      return {error: "Can't cast if not logged in"};
    }
    if (!connection.user.get('alive')) {
      return {error: "Can't cast while dead."};
    }
    if (collections.users.where({room: connection.room, alive: true}).length < 2) {
      return {error: "Can't cast spells if room not full."};
    }
    if (connection.lastCast && Date.now() - connection.lastCast <= 100) {
      return {error: 'Spell on cooldown'};
    }
    var newID = collections.spells.nextID();
    var newSpell = new Spell({
      id: newID,
      x: connection.user.get('x'),
      y: connection.user.get('y'),
      user: connection.user,
      color: connection.user.get('color')
    });
    collections.spells.add(newSpell);
    newSpell.projectTowards(data.x, data.y, 0.6, collections, function(spell) {
      collections.spells.remove(spell);
    });
    connection.lastCast = Date.now();
  }
};

var Spell = require('../models/Spell');

module.exports = {
  run: function(connection, collections, data) {
    if (data.x == null || data.y == null) {
      return {
        error: 'Invalid spell event.'
      };
    }
    if (connection.user == null) {
      return {
        error: "Can't cast if not logged in"
      };
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
  }
};

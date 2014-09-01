var Omni = require('omni');

module.exports = Omni.Model.extend({
  readPermission: function(connection, property) {
    return true;
  },

  writePermission: function(connection) {
    if (connection.user != null && connection.user == this) {
      return true;
    }
    return false;
  }
});

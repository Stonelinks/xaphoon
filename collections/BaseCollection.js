var Omni = require('omni');
var _ = require('lodash');

module.exports = Omni.Collection.extend({
  nextID: function() {
    return _.uniqueId()
  },

  createPermission: function(connection) {
    return true;
  }
});

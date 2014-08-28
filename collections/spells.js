var BaseCollection = require('./BaseCollection');
var Spell = require('../models/spell');

module.exports = BaseCollection.extend({
  model: Spell
});

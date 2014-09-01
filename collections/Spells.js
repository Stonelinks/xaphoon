var BaseCollection = require('./BaseCollection');
var Spell = require('../models/Spell');

module.exports = BaseCollection.extend({
  model: Spell
});

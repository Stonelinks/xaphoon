var BaseCollection = require('./BaseCollection');
var FeedItem = require('../models/FeedItem');

module.exports = BaseCollection.extend({
  model: FeedItem
});

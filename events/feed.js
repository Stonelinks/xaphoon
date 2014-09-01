var FeedItem = require('../models/FeedItem');

module.exports = {
  run: function(connection, collections, data) {
    if (data.message == null || data.message == '') {
      return {
        error: 'No message for feed event.'
      };
    }
    if (connection.user == null) {
      return {
        error: 'Can\'t send message if not logged in'
      };
    }

    var newID = collections.feed.nextID();
    var newFeedItem = new FeedItem({
      id: newID,
      user: connection.user,
      message: data.message
    });
    collections.feed.add(newFeedItem);
    
    return {
      success: 'Successfully logged in.',
      id: newID
    };
  }
};

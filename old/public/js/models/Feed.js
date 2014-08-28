var FeedItem = RealtimeModel.extend({
  urlRoot: 'feed'
});

var FeedCollection = RealtimeCollection.extend({
  model: FeedItem,

  urlRoot: 'feed'
});

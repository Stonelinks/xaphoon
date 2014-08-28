var User = RealtimeModel.extend({
  urlRoot: 'user'
});

var Users = RealtimeCollection.extend({
  model: User,

  urlRoot: 'user'
});

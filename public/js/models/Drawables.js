var Drawable = RealtimeModel.extend({
  urlRoot: 'drawable'
});

var Drawables = RealtimeCollection.extend({
  model: Drawable,
  
  urlRoot: 'drawable'
});

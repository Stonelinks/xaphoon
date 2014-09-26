var ThreeJSRenderer = m3js.ThreeJSRenderer.extend({
  initialize: function(options) {
    m3js.ThreeJSRenderer.prototype.initialize.call(this, options);
    BaseRealtimeView.prototype.initialize.call(this, options);
  }
});

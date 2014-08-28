// Drawable definition and functions
var Backbone = require('backbone');
var realtimeModel = require('./realtimeModel');


var Drawable = Backbone.Model.extend({});
var Drawables = Backbone.Collection.extend({
  model: Drawable
});
var drawables = new Drawables();

module.exports.attachSocketEvents = function(socket) {
  realtimeModel.attachSocketEvents('drawable', drawables, socket);
};

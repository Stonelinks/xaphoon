var Drawable = require('../models/Drawable');

module.exports = {
  run: function(connection, collections, data) {

    if (data.texture == null || data.texture == '') {
      return {
        error: 'No texture for drawable.'
      };
    }
    if (data.geometryType == null || data.geometryType == '') {
      return {
        error: 'No geometry for drawable.'
      };
    }
    if (connection.user == null) {
      return {
        error: 'Can\'t create a drawable if not logged in'
      };
    }

    var newID = collections.drawables.nextID();
    var newDrawable = new Drawable({
      id: newID,
      user: connection.user,
      geometryType: data.geometryType,
      geometryParams: data.geometryParams
    });
    collections.drawables.add(newDrawable);

    return {
      success: true,
      id: newID
    };
  }
};

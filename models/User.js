var BaseModel = require('./BaseModel');

module.exports = BaseModel.extend({
  defaults: {
    name: 'User',
    color: '#fff',
    room: 0
  }
});

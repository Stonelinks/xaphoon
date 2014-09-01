var BaseModel = require('./BaseModel');

module.exports = BaseModel.extend({
  defaults: {
    user: null,
    message: ''
  }
});

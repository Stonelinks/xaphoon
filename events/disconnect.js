module.exports = {
  run: function(connection, collections) {
    if (connection.user) {
      collections.users.remove(connection.user);

      // Decrement user count
      var userCount = collections.userCount.at(0);
      userCount.set('count', userCount.get('count') - 1);
    }
  }
};

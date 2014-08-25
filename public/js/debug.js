xaphoon.addInitializer(function(options) {

  sceneObjects.on('add', function(model) {
    console.log('add ' + model.id);
  });

  sceneObjects.on('remove', function(model) {
    console.log('remove ' + model.id);
  });

  sceneObjects.on('change', function(model) {
    console.log('change ' + model.id + ':');
    _.forEach(model.previousAttributes(), function(val, key) {
      console.log('  ' + key + ': ' + val + ' --> ' + model.get(key));
    });
  });
});

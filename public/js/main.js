$(document).ready(function() {

  var xaphoon = new Backbone.Marionette.Application();

  xaphoon.addInitializer(function(options) {

    xaphoon.addRegions({

      feedAnchor: '#feed-anchor',
      transformControlsAnchor: '#transform-control-anchor',
      rendererAnchor: '#renderer-anchor'
    });

    var feed = window.feed = new Feed();

    var feedView = new FeedView({
      collection: feed
    });
    xaphoon.feedAnchor.show(feedView);

    var drawables = new Drawables();

    var renderer = new m3js.ThreeJSRenderer({
      collection: drawables
    });

    renderer.once('transformcontrols:create', function(transformControl) {

      var transformControlModeView = new TransformControlMode({
        transformControl: transformControl,
        collection: drawables
      });
      xaphoon.transformControlsAnchor.show(transformControlModeView);
    });

    xaphoon.rendererAnchor.show(renderer);

    if (location.host === 'localhost:3000') {

      setTimeout(function() {
        // $('[data-robot="kuka-youbot.zae"]').click();
        // $('[data-robot="kuka-kr5-r650.zae"]').click();
        // $('[data-robot="willowgarage-pr2.zae"]').click();
      }, 2000);

      drawables.on('add', function(drawable) {
        drawable.once('drawable:loaded', function() {

          var kinematics = drawable.kinematics;
          var jointIndex = 0;
          var joint = kinematics.joints[jointIndex];
          var jointValue = joint.limits.min;

          var makeStep = function() {
            return (joint.limits.max - joint.limits.min) / 300.0;
          };

          var step = makeStep();

          var interval = setInterval(function() {
            if (drawable && drawable.kinematics) {

              if (jointValue >= joint.limits.max || joint.static) {

                // change over to the next joint
                if (!joint.static) {
                  drawable.setJointValue(jointIndex, joint.zeroPosition);
                }
                jointIndex++;

                // stop if we're past the number of joints
                if (jointIndex >= kinematics.joints.length) {
                  clearInterval(interval);
                  console.log('STOPPING JOINT MOVEMENT');
                }
                else {
                  joint = kinematics.joints[jointIndex];
                  jointValue = joint.limits.min;
                  step = makeStep();
                }
              }

              // console.log('jointIndex: ' + jointIndex + ' jointValue: ' + jointValue);

              jointValue += step;
              drawable.setJointValue(jointIndex, jointValue);

              drawable.trigger('change:dofvalues');
              drawable.save({
                // silent: true
              });
            }
          }, 10);
        });
      });
    }

  });

  Backbone.io.connect();
  xaphoon.start();
});

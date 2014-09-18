$(document).ready(function() {
  Backbone.io.connect();
  window.xaphoon.start();

  if (location.host === '192.168.13.133:3000') {

    setTimeout(function() {
      // $('#add-irex').click();
      // $('[data-robot="kuka-youbot.zae"]').click();
      // $('[data-robot="kuka-kr5-r650.zae"]').click();
      $('[data-robot="willowgarage-pr2.zae"]').click();
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
                drawable.setDOFValue(jointIndex, joint.zeroPosition);
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
            drawable.setDOFValue(jointIndex, jointValue);

            drawable.trigger('change:dofvalues');
            drawable.save({
              silent: true
            });
          }
        }, 10);
      });
    });
  }
});

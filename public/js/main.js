$(document).ready(function() {
  Backbone.io.connect();
  window.xaphoon.start();

  // setTimeout(function() {
    // $('[data-robot="kuka-kr5-r850.zae"]').click();
  // }, 2000);

  drawables.on('add', function(drawable) {
    var angle = undefined;

    var jointIndex = 0;

    var interval = setInterval(function() {
      if (drawable && drawable.kinematics) {
        var kinematics = drawable.kinematics;
        var joint = kinematics.joints[jointIndex];
        if (jointIndex == kinematics.joints.length) {
          clearInterval(interval);
          return;
        }
        else if (angle === undefined) {
          angle = joint.limits.min;
        }
        else if (angle >= joint.limits.max) {
          drawable.kinematics.setDOF(jointIndex, joint.zeroPosition);
          jointIndex++;
          angle = undefined;
        }
        else {
          angle += 10.0;
        }

        drawable.kinematics.setDOF(jointIndex, angle);
        window._renderer._render();
      }
    }, 50);
  });
});

$(document).ready(function() {
  Backbone.io.connect();
  window.xaphoon.start();

  setTimeout(function() {
    $('[data-robot="kuka-kr5-r850.zae"]').click();
  }, 2000);

  var angle = undefined;
  var jointIndex = 0;
  setInterval(function() {
    if (drawables.at(0) && drawables.at(0).kinematics) {
      var kinematics = drawables.at(0).kinematics;
      var joint = kinematics.joints[jointIndex];
      if (jointIndex > kinematics.joints.length) {
        return;
      }
      else if (angle === undefined) {
        angle = joint.limits.min;
      }
      else if (angle >= joint.limits.max) {
        drawables.at(0).kinematics.set(jointIndex, joint.positions.middle);
        jointIndex++;
        angle = undefined;
      }
      else {
        angle += 1.0;
      }

      console.log('set joint ' + jointIndex + ' to value ' + angle);
      drawables.at(0).kinematics.set(jointIndex, angle);
      window._renderer._render();
    }
  }, 30);
});

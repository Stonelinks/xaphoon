$(document).ready(function() {
  Backbone.io.connect();
  window.xaphoon.start();

  // if (location.host === 'localhost:3000') {
//
  // setTimeout(function() {
    // $('#robot-menu a').each(function(index) {
      // var $this = $(this);
      // setTimeout(function() {
        // $this.click();
      // }, 4000 * index);
    // });
  // }, 2000);

    // setTimeout(function() {
      // $('[data-robot="kuka-kr5-r850.zae"]').click();
    // }, 3000);

    // drawables.on('add', function(drawable) {
      // var angle = undefined;
//
      // var jointIndex = 0;
//
      // var interval = setInterval(function() {
        // if (drawable && drawable.kinematics) {
          // var kinematics = drawable.kinematics;
          // var joint = kinematics.joints[jointIndex];
          // if (jointIndex == kinematics.joints.length) {
            // clearInterval(interval);
            // return;
          // }
          // else if (angle === undefined) {
            // angle = joint.limits.min;
          // }
          // else if (angle >= joint.limits.max) {
            // drawable.setDOFValue(jointIndex, joint.zeroPosition);
            // jointIndex++;
            // angle = undefined;
          // }
          // else {
            // angle += 10.0;
          // }
          //
          // drawable.setDOFValue(jointIndex, angle);
          // drawable.trigger('change:dofvalues');
          // drawable.save({
            // silent: true
          // });
//
          // window._renderer._render();
        // }
      // }, 50);
    // });
  // }
});

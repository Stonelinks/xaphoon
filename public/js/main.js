var broadCast = function(data) {
  socket.emit('feed:new', data);
};

$(document).ready(function() {
  window.xaphoon = xaphoon;
  xaphoon.start();
});

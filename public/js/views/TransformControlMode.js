var TransformControlMode = m3js.TransformControlMode.extend({

  template: '#transform-control-template',

  events: function() {
    var ret = _.clone(m3js.TransformControlMode.prototype.events);

    _.extend(ret, {

      'click #feed-toggle': function(e) {
        var _this = this;
        setTimeout(function() {
          _this.onWindowResize();
        }, 1100);
        $('#wrapper').toggleClass('toggled');
      },

      'click #add-box': function(e) {
        window.sendFeedUpdate('added box');

        this.createNewDrawable({
          texture: '/img/crate.gif',
          geometryType: 'BoxGeometry',
          geometryParams: [200, 200, 200]
        });
      },

      'click #add-torus': function(e) {
        window.sendFeedUpdate('added torus');

        this.createNewDrawable({
          texture: '/img/crate.gif',
          geometryType: 'TorusGeometry',
          geometryParams: [50, 20, 20, 20]
        });
      },

      'click #add-monster': function(e) {
        window.sendFeedUpdate('added monster');

        this.createNewDrawable({
          geometryType: 'collada',
          // geometryParams: ['/vendor/collada_robots/kawada-hironx.zae']
          geometryParams: ['/models/monster.dae', 0.1]
        });
      },

      'click .load-robot': function(e) {
        var $target = $(e.currentTarget);
        window.sendFeedUpdate('added ' + $target.text());
        var robotUrl = '/vendor/collada_robots/' + $target.data('robot');

        this.createNewDrawable({
          geometryType: 'collada_zae',
          geometryParams: [robotUrl, 500.0]
        });
      }
    });
    return ret;
  },

  createNewDrawable: function(options) {

    var newDrawable = new this.collection.model(options);

    var _this = this;
    this.collection.once('drawable:loaded', function(newDrawable) {
      _this.transformControl.attachDrawable(newDrawable);
    });

    this.collection.add(newDrawable);
    newDrawable.save();
  }
});

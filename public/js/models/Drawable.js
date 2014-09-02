var Drawable = BaseRealtimeModel.extend({
  defaults: {
    texture: '/img/crate.gif',
    geometryType: 'BoxGeometry',
    geometryParams: [200, 200, 200],
    matrixWorld: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
  },

  mesh: undefined,
  texture: undefined,
  material: undefined,
  geometry: undefined,

  initDrawable: function() {
    var _this = this;

    this.texture = THREE.ImageUtils.loadTexture(this.get('texture'), new THREE.UVMapping(), function() {
      _this.trigger('texture:loaded');
      if (_this.collection !== undefined) {
        _this.collection.trigger('texture:loaded');
      }
    });

    this.texture.anisotropy = window._renderer.renderer.getMaxAnisotropy();
    var construct = function(constructor, args) {
      var f = function() {
        return constructor.apply(this, args);
      };
      f.prototype = constructor.prototype;
      return new f();
    };

    this.geometry = construct(THREE[this.get('geometryType')], this.get('geometryParams'));

    this.material = new THREE.MeshLambertMaterial({
      map: this.texture
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.on('change:matrixWorld', function() {
      // this.mesh.matrixWorld.set.apply(this, this.get('matrixWorld'));
    });
  },

  getMesh: function() {
    if (this.mesh === undefined) {
      this.initDrawable();
    }
    return this.mesh;
  }
});

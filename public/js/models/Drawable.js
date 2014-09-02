
// creates instances
var construct = function(constructor, args) {
  var f = function() {
    return constructor.apply(this, args);
  };
  f.prototype = constructor.prototype;
  return new f();
};

var Drawable = BaseRealtimeModel.extend({
  defaults: {
    texture: '/img/crate.gif',
    geometryType: 'BoxGeometry',
    geometryParams: [200, 200, 200],
    matrix: [1, 0, 0, 100, 0, 1, 0, 101, 0, 0, 1, 102, 0, 0, 0, 1]
  },

  _mesh: undefined,
  _texture: undefined,
  _material: undefined,
  _geometry: undefined,

  initDrawable: function() {
    var _this = this;

    this._texture = THREE.ImageUtils.loadTexture(this.get('texture'), new THREE.UVMapping(), function() {
      if (_this.collection !== undefined) {
        _this.collection.trigger('texture:loaded');
      }
    });

    this._texture.anisotropy = window._renderer.renderer.getMaxAnisotropy();

    this._geometry = construct(THREE[this.get('geometryType')], this.get('geometryParams'));

    this._material = new THREE.MeshLambertMaterial({
      map: this._texture
    });

    this._mesh = new THREE.Mesh(this._geometry, this._material);

    this.on('change:matrix', function() {
      if (_this.collection !== undefined) {
        _this.collection.trigger('matrix:update');
      }
      console.log('Drawable: update mesh');
      this.updateMesh();
    });
    this.updateMesh();
  },

  updateMesh: function() {
    this._mesh.matrix.set.apply(this._mesh.matrix, this.get('matrix'));
    this._mesh.matrix.decompose(this._mesh.position, this._mesh.quaternion, this._mesh.scale);
  },

  getMesh: function() {
    if (this._mesh === undefined) {
      this.initDrawable();
    }
    return this._mesh;
  }
});

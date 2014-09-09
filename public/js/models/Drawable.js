
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

    var _loaded = function() {
      if (_this.collection !== undefined) {
        _this.collection.trigger('drawable:loaded', _this);
      }
      _this.trigger('drawable:loaded', _this);

      _this.on('change:matrix', function() {
        console.log('Drawable: update mesh');
        _this.updateMesh();
      });
      _this.updateMesh();
    };

    if (this.get('geometryType') !== 'collada') {

      this._texture = THREE.ImageUtils.loadTexture(this.get('texture'), new THREE.UVMapping(), _loaded);

      this._texture.anisotropy = window._renderer.renderer.getMaxAnisotropy();

      this._geometry = construct(THREE[this.get('geometryType')], this.get('geometryParams'));

      this._material = new THREE.MeshLambertMaterial({
        map: this._texture
      });

      this._mesh = new THREE.Mesh(this._geometry, this._material);
    }
    else {

      var loader = new THREE.ColladaLoader();
      loader.options.convertUpAxis = true;
      loader.load(this.get('geometryParams')[0], function(collada) {
        _this._mesh.updateMatrix();
        _this._mesh = collada.scene;

        _loaded();
      });
    }
  },

  updateMesh: function() {
    this._mesh.matrix.set.apply(this._mesh.matrix, this.get('matrix'));
    this._mesh.matrix.decompose(this._mesh.position, this._mesh.quaternion, this._mesh.scale);
  },

  getMesh: function() {
    return this._mesh;
  },

  initialize: function(options) {
    BaseRealtimeModel.prototype.initialize.apply(this, options);
    this.initDrawable();
  }
});

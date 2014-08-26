// this can call any constructor with an array of arguments
var construct = function(constructor, args) {
  var f = function() {
    return constructor.apply(this, args);
  }
  f.prototype = constructor.prototype;
  return new f();
}

var Drawable = RealtimeModel.extend({
  urlRoot: 'drawable',
  
  defaults: {
    texture: '/img/crate.gif',
    geometryType: 'BoxGeometry',
    geometryParams: [200, 200, 200],
  },
  
  _mesh: undefined,
  _texture: undefined,
  _material: undefined,
  _geometry: undefined,
  
  initDrawable: function(renderer) {
    var _this = this

    this._texture = THREE.ImageUtils.loadTexture(this.get('texture'), new THREE.UVMapping(), function() {
      _this.trigger('texture:loaded');
    });
    this._texture.anisotropy = renderer.getMaxAnisotropy();

    this._geometry = construct(THREE[this.get('geometryType')], this.get('geometryParams'));
    
    this._material = new THREE.MeshLambertMaterial({
      map: this._texture
    });

    this._mesh = new THREE.Mesh(this._geometry, this._material);
  },
  
  getMesh: function(renderer) {
    if (this._mesh === undefined) {
      this.initDrawable(renderer)
    }
    return this._mesh
  }
});

var Drawables = RealtimeCollection.extend({
  model: Drawable,
  
  urlRoot: 'drawable'
});

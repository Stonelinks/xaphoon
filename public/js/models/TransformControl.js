var TransformControl = Backbone.Model.extend({

  defaults: {
    mode: 'translate', // translate, rotate or scale
    attachedDrawable: undefined
  },

  _control: undefined,

  initializeControl: function() {

    var _this = this;

    this._control = new THREE.TransformControls(this.renderer.camera, this.renderer.renderer.domElement);

    this._control.addEventListener('change', function() {
      _this.renderer._render();

      var drawable = _this.get('attachedDrawable');
      var elementsFloat32Arr = drawable.getMesh().matrix.elements;
      var elements = Array.prototype.slice.call(elementsFloat32Arr);
      var e = elements;

      // elements
      // 0 4 8 12 1 5 9 13 2 6 10 14 3 7 11 15

      // set: function (n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44)
      //                 0,   1,   2,   3,   4,   5,   6,   7,   8,   9,   10,  11,  12,  13,  14,  15

      // var te = this.elements;

      // te[ 0 ] = n11; te[ 4 ] = n12; te[ 8 ] = n13; te[ 12 ] = n14;
      // te[ 1 ] = n21; te[ 5 ] = n22; te[ 9 ] = n23; te[ 13 ] = n24;
      // te[ 2 ] = n31; te[ 6 ] = n32; te[ 10 ] = n33; te[ 14 ] = n34;
      // te[ 3 ] = n41; te[ 7 ] = n42; te[ 11 ] = n43; te[ 15 ] = n44;

      var elementsRowMajor = [e[0], e[4], e[8], e[12], e[1], e[5], e[9], e[13], e[2], e[6], e[10], e[14], e[3], e[7], e[11], e[15]];

      // col-major (elements - sanity check): [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 100, 101, 102, 1]
      // row-major (set - sanity check): [0, ]
      
      if (!_.isEqual(drawable.get('matrix'), elementsRowMajor)) {
        drawable.set('matrix', elementsRowMajor, {
          silent: true
        });
        drawable.save();
      }
    });

    _this.renderer.scene.add(_this._control);
    _this.renderer._render();
  },

  getControl: function() {
    if (this._control === undefined) {
      this.initializeControl();
    }
    return this._control;
  },

  attachDrawable: function(drawable) {
    if (this._control === undefined) {
      this.initializeControl();
    }
    this.set('attachedDrawable', drawable);
    this._control.attach(drawable.getMesh());
  },

  renderer: undefined,

  initialize: function(options) {
    this.renderer = options.renderer;

    this.on('change:mode', function() {
      if (this._control === undefined) {
        this.initializeControl();
      }
      this._control.setMode(this.get('mode'));
    });
  }
});
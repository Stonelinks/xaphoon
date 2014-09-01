var Control = Backbone.Model.extend({

  defaults: {
    mode: 'translate', // translate, rotate or scale
    attachedDrawable: undefined
  },

  _control: undefined,

  initializeControl: function() {

    var _this = this;

    this._control = new THREE.TransformControls(window._renderer.renderer.camera, window._renderer.renderer.domElement);

    this._control.addEventListener('change', function() {
      window._renderer.renderer._render();

      var drawable = this.get('attachedDrawable');
      // var elements = drawable.getMesh().matrixWorld.elements;
      // drawable.set('matrixWorld', elements);
      // drawable.save({
        // silent: true
      // });
    });

    window._renderer.renderer.scene.add(this._control);
    window._renderer.renderer._render();
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


var canvasID = '#canvas-anchor';

var ThreeJSRenderer = BaseRealtimeView.extend({

  template: '#renderer-template',

  events: {
    'click #feed-toggle': function(e) {
      e.preventDefault();
      var _this = this;
      setTimeout(function() {
        _this.onWindowResize();
      }, 1100);
      $('#wrapper').toggleClass('toggled');
    },

    'click #translate-mode': function(e) {
      this.control.set('mode', 'translate');
      e.preventDefault();
      e.stopPropagation();
    },

    'click #rotate-mode': function(e) {
      this.control.set('mode', 'rotate');
      e.preventDefault();
      e.stopPropagation();
    },

    'click #scale-mode': function(e) {
      this.control.set('mode', 'scale');
      e.preventDefault();
      e.stopPropagation();
    },

    'click #add-box': function(e) {
      Omni.trigger('drawable', {
        texture: '/img/crate.gif',
        geometryType: 'BoxGeometry',
        geometryParams: [200, 200, 200],
        matrixWorld: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
      }, function(data) {
        if (data.error != undefined) {
          alert(data.error);
        }
      });

      e.preventDefault();
      e.stopPropagation();
    }
  },

  getWidth: function() {
    return window.innerWidth - $(canvasID).offset().left - 15;
  },

  getHeight: function() {
    return window.innerHeight - $(canvasID).offset().top - 15;
  },

  camera: undefined,

  scene: undefined,

  renderer: undefined,

  setupRenderer: function() {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.sortObjects = false;
    this.renderer.setSize(this.getWidth(), this.getHeight());

    this.$el.find(canvasID).append(this.renderer.domElement);
  },

  setupCamera: function() {
    this.camera = new THREE.PerspectiveCamera(70, this.getWidth() / this.getHeight(), 1, 3000);
    this.camera.position.set(1000, 500, 1000);
    this.camera.lookAt(new THREE.Vector3(0, 200, 0));
  },

  setupScene: function() {
    this.scene = new THREE.Scene();
    this.scene.add(new THREE.GridHelper(500, 100));

    var light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(1, 1, 1);
    this.scene.add(light);
  },

  addDrawable: function(drawable) {
    window.sendFeedUpdate('add drawable ' + drawable.id);
    var mesh = drawable.getMesh();
    this.scene.add(mesh);
    this._render();
  },

  removeDrawable: function(drawable) {
    window.sendFeedUpdate('remove drawable ' + drawable.id);
    var mesh = drawable.getMesh();
    this.scene.remove(mesh);
    this._render();
  },

  _collectionEvents: {
    'add': function(drawable) {
      this.addDrawable(drawable);
      // this.control.attachDrawable(drawable);
      this._render();
    },

    'remove': function(drawable) {
      this.removeDrawable(drawable);
      this._render();
    },

    'texture:loaded': function() {
      this._render();
    }
  },

  onWindowResize: function() {
    this.camera.aspect = this.getWidth() / this.getHeight();
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.getWidth(), this.getHeight());
    this._render();
  },

  _render: function() {
    this.renderer.render(this.scene, this.camera);
  },

  control: undefined,

  initialize: function(options) {
    BaseRealtimeView.prototype.initialize.apply(this, arguments);

    this.once('show', function() {
      this.setupRenderer();
      this.setupCamera();
      this.setupScene();

      // this.control = new Control({
        // renderer: this
      // });

      var _this = this;
      window.addEventListener('resize', function() {
        _this.onWindowResize();
      }, false);

      _this._render();
    });
  }
});

var canvasID = '#canvas-anchor';

var ThreeJSRenderer = Marionette.ItemView.extend({

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
      e.preventDefault();
      this.control.setMode('translate');
    },

    'click #rotate-mode': function(e) {
      e.preventDefault();
      this.control.setMode('rotate');
    },

    'click #scale-mode': function(e) {
      e.preventDefault();
      this.control.setMode('scale');
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

  control: undefined,

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

    var _this = this;

    // var drawable = new Drawable()
    // drawable.on('texture:loaded', function() {
      // _this._render();
    // })

    // this.control = new THREE.TransformControls(this.camera, this.renderer.domElement);

    // this.control.addEventListener('change', function() {
      // _this._render();
    // });

    // var mesh = drawable.getMesh(this.renderer)

    // this.scene.add(mesh);

    // this.control.attach(mesh);
    // this.scene.add(this.control);
  },

  addDrawable: function(drawable) {
    console.log('add drawable ' + drawable.id);
    var mesh = drawable.getMesh(this.renderer);
    this.scene.add(mesh);
    this._render();
  },

  removeDrawable: function(drawable) {
    console.log('remove drawable ' + drawable.id);
    var mesh = drawable.getMesh(this.renderer);
    this.scene.remove(mesh);
    this._render();
  },

  collectionEvents: {
    'add': function(drawable) {
      this.addDrawable(drawable);
    },

    'remove': function(drawable) {
      this.removeDrawable(drawable);
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
    // this.control.update();
    this.renderer.render(this.scene, this.camera);
  },

  initialize: function(options) {

    this.once('show', function() {
      this.setupRenderer();
      this.setupCamera();
      this.setupScene();

      var _this = this;
      window.addEventListener('resize', function() {
        _this.onWindowResize();
      }, false);

      this.collection.fetch();

      _this._render();
    });
  }
});

var add = function(attrs) {

  // We don't want ioBind events to occur as there is no id.
  // We extend Todo#Model pattern, toggling our flag, then create
  // a new todo from that.
  var _Drawable = Drawable.extend({
    noIoBind: true
  });

  var drawable = new _Drawable(attrs);
  drawable.save();
};

var remove = function(drawable) {
  // Silent is true so that we react to the server
  // broadcasting the remove event.
  drawable.destroy({
    silent: true
  });
};

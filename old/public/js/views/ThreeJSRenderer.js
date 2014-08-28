var canvasID = '#canvas-anchor';

var Control = Backbone.Model.extend({

  defaults: {
    mode: 'translate', // translate, rotate or scale
    attachedDrawable: undefined
  },

  _control: undefined,

  initializeControl: function() {

    var _this = this;

    this._control = new THREE.TransformControls(window.render.renderer.camera, window.render.renderer.domElement);

    this._control.addEventListener('change', function() {
      window.render.renderer._render();

      var drawable = this.get('attachedDrawable');
      // var elements = drawable.getMesh().matrixWorld.elements;
      // drawable.set('matrixWorld', elements);
      // drawable.save({
        // silent: true
      // });
    });

    window.render.renderer.scene.add(this._control);
    window.render.renderer._render();
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
      this.control.set('mode', 'translate');
    },

    'click #rotate-mode': function(e) {
      e.preventDefault();
      this.control.set('mode', 'rotate');
    },

    'click #scale-mode': function(e) {
      e.preventDefault();
      this.control.set('mode', 'scale');
    },

    'click #add-box': function(e) {
      e.preventDefault();

      // We don't want ioBind events to occur as there is no id
      var _Drawable = Drawable.extend({
        noIoBind: true
      });
      var drawable = new _Drawable();
      drawable.save();
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
    console.log('add drawable ' + drawable.id);
    var mesh = drawable.getMesh();
    this.scene.add(mesh);
    this._render();
  },

  removeDrawable: function(drawable) {
    console.log('remove drawable ' + drawable.id);
    var mesh = drawable.getMesh();
    this.scene.remove(mesh);
    this._render();
  },

  collectionEvents: {
    'add': function(drawable) {
      this.addDrawable(drawable);
      this.control.attachDrawable(drawable);
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

    this.once('show', function() {
      this.setupRenderer();
      this.setupCamera();
      this.setupScene();

      this.control = new Control({
        renderer: this
      });

      var _this = this;
      window.addEventListener('resize', function() {
        _this.onWindowResize();
      }, false);

      _this._render();

      this.collection.fetch();
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

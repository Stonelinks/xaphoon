var canvasID = '#canvas-anchor';

var ThreeJSRenderer = BaseRealtimeView.extend({

  template: '#renderer-template',

  pointerVector: new THREE.Vector3(),
  rayCaster: new THREE.Raycaster(),
  projector: new THREE.Projector(),

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
      this.transformControl.set('mode', 'translate');
      e.preventDefault();
      e.stopPropagation();
    },

    'click #rotate-mode': function(e) {
      this.transformControl.set('mode', 'rotate');
      e.preventDefault();
      e.stopPropagation();
    },

    'click #scale-mode': function(e) {
      this.transformControl.set('mode', 'scale');
      e.preventDefault();
      e.stopPropagation();
    },

    'click #add-box': function(e) {

      window.sendFeedUpdate('added box');

      var newDrawable = new Drawable({
        texture: '/img/crate.gif',
        geometryType: 'BoxGeometry',
        geometryParams: [200, 200, 200]
      });
      window.drawables.add(newDrawable);
      newDrawable.save();

      e.preventDefault();
      e.stopPropagation();
    },

    'click #canvas-anchor > canvas': function(e) {

      var rect = this.renderer.domElement.getBoundingClientRect();

      var x = (e.clientX - rect.left) / rect.width;
      var y = (e.clientY - rect.top) / rect.height;
      this.pointerVector.set((x) * 2 - 1, - (y) * 2 + 1, 0.5);

      this.projector.unprojectVector(this.pointerVector, this.camera);
      this.rayCaster.set(this.camera.position, this.pointerVector.sub(this.camera.position).normalize());

      var searchList = [];
      var intersections = this.rayCaster.intersectObjects(this.collection.map(function(model) {
        var mesh = model.getMesh();
        searchList.push({
          drawable: model,
          mesh: mesh
        });
        return mesh;
      }));

      var raycastedDrawable
      if (intersections[0]) {
         raycastedDrawable = _.findWhere(searchList, {
          mesh: intersections[0].object
        }).drawable;
      }
      this.collection.trigger('raycast', raycastedDrawable)
      raycastedDrawable.trigger('raycast', raycastedDrawable)

      e.preventDefault();
      e.stopPropagation();
    }
  },

  // TODO
  onClick: function() {

    var prevCamera = camera;

    camera = new THREE.PerspectiveCamera();
    camera.position.copy(prevCamera.position);
    camera.rotation.copy(prevCamera.rotation);

    var MODE = {
      TRACKBALL: 0,
      FLY: 1
    };

    switch (mode) {
      case MODE.FLY:
        controls = new THREE.TrackballControls(camera);
        mode = MODE.TRACKBALL;
        break;
      case MODE.TRACKBALL:
        controls = new THREE.FlyControls(camera);
        mode = MODE.FLY;
        break;
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
    console.log('ThreeJSRenderer: add drawable');
    var mesh = drawable.getMesh();
    this.scene.add(mesh);
    this._render();
  },

  removeDrawable: function(drawable) {
    console.log('ThreeJSRenderer: remove drawable');
    var mesh = drawable.getMesh();
    this.scene.remove(mesh);
    this._render();
  },

  collectionEvents: {
    'add': function(drawable) {
      this.addDrawable(drawable);
      this.transformControl.attachDrawable(drawable);
      this._render();
    },

    'remove': function(drawable) {
      this.removeDrawable(drawable);
      this._render();
    },

    'change': function() {
      console.log('ThreeJSRenderer: change drawable');
      var _this = this;
      setTimeout(function() {
        _this._render();
      }, 200);
    },

    'matrix:update': function() {
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

      this.transformControl = new TransformControl({
        renderer: this
      });

      this.collection.fetch();

      var _this = this;
      window.addEventListener('resize', function() {
        _this.onWindowResize();
      }, false);

      _this._render();
    });
  }
});

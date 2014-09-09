var canvasID = '#canvas-anchor';

var capitalise = function(string) {
  return string && string.charAt(0).toUpperCase() + string.slice(1);
};

var ThreeJSRenderer = BaseRealtimeView.extend({

  template: '#renderer-template',

  templateHelpers: function() {
    return {
      transformControlSpace: this.transformControl && capitalise(this.transformControl.get('space'))
    };
  },

  collectionEvents: {
    'remove': function(drawable) {
      this.removeDrawable(drawable);
      this._render();
    },

    'change:matrix': function() {
      this._render();
    },

    // this basically takes the place of the add event
    'drawable:loaded': function(drawable) {
      this.addDrawable(drawable);
      this._render();
    }
  },

  events: {
    'click #feed-toggle': function(e) {
      var _this = this;
      setTimeout(function() {
        _this.onWindowResize();
      }, 1100);
      $('#wrapper').toggleClass('toggled');

      e.preventDefault();
      e.stopPropagation();
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

    'click #toggle-space': function(e) {
      var newSpace = this.transformControl.get('space') == 'local' ? 'world' : 'local';
      this.transformControl.set('space', newSpace);
      this.render();

      e.preventDefault();
      e.stopPropagation();
    },

    'click #add-box': function(e) {

      window.sendFeedUpdate('added box');

      this.createNewDrawable({
        texture: '/img/crate.gif',
        geometryType: 'BoxGeometry',
        geometryParams: [200, 200, 200]
      });

      e.preventDefault();
      e.stopPropagation();
    },

    'click #add-torus': function(e) {

      window.sendFeedUpdate('added torus');

      this.createNewDrawable({
        texture: '/img/crate.gif',
        geometryType: 'TorusGeometry',
        geometryParams: [50, 20, 20, 20]
      });

      e.preventDefault();
      e.stopPropagation();
    },

    'click #add-robot': function(e) {

      window.sendFeedUpdate('added collada');

      this.createNewDrawable({
        // texture: '/img/crate.gif',
        geometryType: 'collada',
        geometryParams: ['/vendor/collada_robots/kawada-hironx.zae']
      });

      e.preventDefault();
      e.stopPropagation();
    }
  },

  createNewDrawable: function(options) {

    var newDrawable = new Drawable(options);

    var _this = this;
    this.collection.once('add', function(newDrawable) {
      _this.transformControl.attachDrawable(newDrawable);
    });

    this.collection.add(newDrawable);
    newDrawable.save();
  },

  _transformControlDragging: false,

  onPointerDown: function(e) {
    this.dispatchDOMEventToControls(e);
  },

  onPointerHover: function(e) {
    this.dispatchDOMEventToControls(e);
  },

  onPointerMove: function(e) {
    this.dispatchDOMEventToControls(e);
  },

  onPointerUp: function(e) {
    this.dispatchDOMEventToControls(e);

    if (!this._transformControlDragging) {
      var searchList = this.collection.map(function(model) {
        return {
          drawable: model,
          mesh: model.getMesh()
        };
      });

      this._raycast({
        event: e,
        callback: function(intersections) {

          var raycastedDrawable;
          if (intersections[0]) {
             raycastedDrawable = _.findWhere(searchList, {
              mesh: intersections[0].object
            }).drawable;
          }

          if (raycastedDrawable) {
            this.transformControl.attachDrawable(raycastedDrawable);
            this._render();
          }
        }
      });
    }
  },

  onMouseWheel: function(e) {
    this.dispatchDOMEventToControls(e);
  },

  onKeyDown: function(e) {
    this.dispatchDOMEventToControls(e);
  },

  onContextMenu: function(e) {
    this.dispatchDOMEventToControls(e);
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

    var _this = this;
    var _setRendererDOMElement = function() {
      _this.$el.find(canvasID).append(_this.renderer.domElement);
    };
    _setRendererDOMElement();
    this.on('render', _setRendererDOMElement);
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

    // synchronously insert
    var mesh = drawable.getMesh();
    if (mesh) {
      this.scene.add(mesh);
      this._render();
    }
  },

  removeDrawable: function(drawable) {
    console.log('ThreeJSRenderer: remove drawable');
    var mesh = drawable.getMesh();
    if (mesh) {
      this.scene.remove(mesh);
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
    this.transformControl.getControl().update();
    this.renderer.render(this.scene, this.camera);
  },

  pointerVector: new THREE.Vector3(),
  rayCaster: new THREE.Raycaster(),
  projector: new THREE.Projector(),

  _raycast: function(options) {
    var e = options.event;
    var callback = options.callback;

    if (!callback) {
      return;
    }

    var meshes = options.meshes || this.collection.map(function(model) {
      return model.getMesh();
    });

    var rect = this.renderer.domElement.getBoundingClientRect();

    var x = (e.clientX - rect.left) / rect.width;
    var y = (e.clientY - rect.top) / rect.height;
    this.pointerVector.set((x) * 2.0 - 1.0, - (y) * 2.0 + 1.0, 0.5);

    this.projector.unprojectVector(this.pointerVector, this.camera);
    this.rayCaster.set(this.camera.position, this.pointerVector.sub(this.camera.position).normalize());

    var intersections = this.rayCaster.intersectObjects(meshes);

    callback.call(this, intersections);
  },

  transformControl: undefined,
  orbitControl: undefined,

  setupTransformControl: function() {

    // reuse the same transformControl instance
    if (!this.transformControl) {
      this.transformControl = new TransformControl({
        renderer: this
      });
    }
  },

  disableTransformControl: function() {
    if (this.transformControl && this.transformControl.hasAttachedDrawable()) {
      this.transformControl.detachDrawable();
    }
  },

  setupOrbitControl: function() {

    // reuse the same orbitControl instance
    if (!this.orbitControl) {
      this.orbitControl = new OrbitControl({
        renderer: this
      });
    }
    else {
      this.orbitControl.enable();
    }
  },

  disableOrbitControl: function() {
    if (this.orbitControl && this.orbitControl.isEnabled()) {
      this.orbitControl.disable();
    }
  },

  setupPointerEvents: function() {
    var domElement = this.renderer.domElement;
    var eventMap = {
      'mousedown': 'onPointerDown',
      'touchstart': 'onPointerDown',

      'mousemove': ['onPointerHover', 'onPointerMove'],
      'touchmove': ['onPointerHover', 'onPointerMove'],

      'mouseup': 'onPointerUp',
      'mouseout': 'onPointerUp',
      'touchend': 'onPointerUp',
      'touchcancel': 'onPointerUp',
      'touchleave': 'onPointerUp',

      'mousewheel': 'onMouseWheel',
      'DOMMouseScroll': 'onMouseWheel',

      'keydown': 'onKeyDown',

      'contextmenu': 'onContextMenu'
    };

    var _this = this;
    _.forEach(eventMap, function(handlerName, eventName) {
      var handlerNames = _.isArray(handlerName) ? handlerName : [handlerName];
      handlerNames.forEach(function(handlerName) {
        domElement.addEventListener(eventName, _this[handlerName].bind(_this), false);
      });
    });
  },

  dispatchDOMEventToControls: function(e) {

    // only dispatch to orbit control if not intersecting transform control
    if (!this.transformControl.intersectsControl(e)) {
      this.orbitControl.dispatchDOMEvent(e);
    }

    if (this.transformControl) {
      this._transformControlDragging = this.transformControl.isDragging();
      this.transformControl.dispatchDOMEvent(e);
    }
    else {
      this._transformControlDragging = false;
    }
  },

  initialize: function(options) {
    this.once('show', function() {
      this.setupRenderer();
      this.setupCamera();
      this.setupScene();

      this.setupPointerEvents();

      this.setupTransformControl();
      this.setupOrbitControl();

      this.collection.fetch();

      var _this = this;
      window.addEventListener('resize', function() {
        _this.onWindowResize();
      }, false);

      _this._render();
      _this.render();
    });
  }
});

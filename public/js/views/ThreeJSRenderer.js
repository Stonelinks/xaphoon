var canvasID = '#canvas-anchor';

var ThreeJSRenderer = BaseRealtimeView.extend({

  template: '#renderer-template',

  collectionEvents: {
    'add': function(drawable) {
      this.addDrawable(drawable);
      this._render();
    },

    'remove': function(drawable) {
      this.removeDrawable(drawable);
      this._render();
    },

    'matrix:update': function() {
      this._render();
    },

    'texture:loaded': function() {
      this._render();
    }
  },

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

      var _this = this;
      this.collection.on('add', function(newDrawable) {
        if (!_this.transformControl) {
          _this.setupTransformControl();
        }
        _this.transformControl.attachDrawable(newDrawable);
      });

      this.collection.add(newDrawable);
      newDrawable.save();

      e.preventDefault();
      e.stopPropagation();
    }
  },

  _dragging: false,

  onPointerDown: function(e) {
    this.dispatchControlDOMEvent(this.transformControl, e);
    return;

    e.stopPropagation();
    e.preventDefault();

    if (this._dragging) {
      return;
    }

    console.log('mouse down');

    // if mouse down on transform control gizmos, delegate event

    // else if mouse down on drawable, set flag to attach transform controls on mouse up

    // var searchList = this.collection.map(function(model) {
      // return {
        // drawable: model,
        // mesh: model.getMesh()
      // };
    // });
//
    // this._raycast({
      // event: e,
      // callback: function(intersections) {
//
        // var raycastedDrawable;
        // if (intersections[0]) {
           // raycastedDrawable = _.findWhere(searchList, {
            // mesh: intersections[0].object
          // }).drawable;
        // }
//
        // console.log(raycastedDrawable);
//
        // if (raycastedDrawable) {
          // this.enableTransformControl()
          // this.transformControl.attachDrawable(raycastedDrawable);
          // this._render();
        // }
        // else {
          // this.setupOrbitControl();
        // }
      // }
    // });

    this._dragging = true;
  },

  onPointerHover: function(e) {
    this.dispatchControlDOMEvent(this.transformControl, e);
    return;

    e.stopPropagation();
    e.preventDefault();
    if (this._dragging) {
      return;
    }
  },

  onPointerMove: function(e) {
    this.dispatchControlDOMEvent(this.transformControl, e);
    return;

    e.stopPropagation();
    e.preventDefault();

    if (!this._dragging) {
      return;
    }
  },

  onPointerUp: function(e) {
    this.dispatchControlDOMEvent(this.transformControl, e);
    return;

    e.stopPropagation();
    e.preventDefault();
    this._dragging = false;
    this.onPointerHover(e);
  },

  onMouseWheel: function(e) {
    this.dispatchControlDOMEvent(this.transformControl, e);
    return;

    debugger;
  },

  onKeyDown: function(e) {
    this.dispatchControlDOMEvent(this.transformControl, e);
    return;

    debugger;
  },

  onContextMenu: function(e) {
    this.dispatchControlDOMEvent(this.transformControl, e);
    return;

    debugger;
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

  onWindowResize: function() {
    this.camera.aspect = this.getWidth() / this.getHeight();
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.getWidth(), this.getHeight());
    this._render();
  },

  _render: function() {
    if (this.transformControl) {
      this.transformControl.getControl().update();
    }
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

  controlMode: undefined, // either 'orbit' or 'transform'

  transformControl: undefined,
  tmpTransformControlDrawable: undefined,
  orbitControl: undefined,

  enableTransformControl: function() {

    // reuse the same transformControl instance
    if (!this.transformControl) {
      this.transformControl = new TransformControl({
        renderer: this
      });
    }

    // try to reattach previous drawable
    if (this.tmpTransformControlDrawable) {
      this.transformControl.attachDrawable(this.tmpTransformControlDrawable);
      this.tmpTransformControlDrawable = undefined;
    }
  },

  disableTransformControl: function() {
    if (this.transformControl && this.transformControl.hasAttachedDrawable()) {
      this.tmpTransformControlDrawable = this.transformControl.getAttachedDrawable();
      this.transformControl.detachDrawable();
    }
  },

  setupTransformControl: function() {
    console.log('setupTransformControl');
    if (this.controlMode != 'transform') {
      // this.disableOrbitControl();
      this.enableTransformControl();
      this.controlMode = 'transform';
    }
  },

  enableOrbitControl: function() {

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

  setupOrbitControl: function() {
    console.log('setupOrbitControl');
    if (this.controlMode != 'orbit') {
      // this.disableTransformControl()
      this.enableOrbitControl();
      this.controlMode = 'orbit';
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
        // domElement.addEventListener(eventName, function(e) {
          // console.log(e.type === eventName)
        // }, false)
      });
    });
  },

  dispatchControlDOMEvent: function(control, e) {
    control.dispatchDOMEvent(e);
  },

  initialize: function(options) {
    this.once('show', function() {
      this.setupRenderer();
      this.setupCamera();
      this.setupScene();

      this.setupPointerEvents();

      // this.setupOrbitControl();
      this.setupTransformControl();

      this.collection.fetch();

      var _this = this;
      window.addEventListener('resize', function() {
        _this.onWindowResize();
      }, false);

      _this._render();
    });
  }
});

var ThreeJSRenderer = Marionette.ItemView.extend({

  template: _.template('<div></div>'),

  getWidth: function() {
    return window.innerWidth - $('#renderer-anchor').offset().left - 15;
  },

  getHeight: function() {
    return window.innerHeight - $('#renderer-anchor').offset().top - 15;
  },

  camera: undefined,

  scene: undefined,

  renderer: undefined,

  control: undefined,

  initialize: function(options) {

    this.once('render', function() {

      this.renderer = new THREE.WebGLRenderer();
      this.renderer.sortObjects = false;
      this.renderer.setSize(this.getWidth(), this.getHeight());

      this.$el.append(this.renderer.domElement);

      this.camera = new THREE.PerspectiveCamera(70, this.getWidth() / this.getHeight(), 1, 3000);
      this.camera.position.set(1000, 500, 1000);
      this.camera.lookAt(new THREE.Vector3(0, 200, 0));

      this.scene = new THREE.Scene();
      this.scene.add(new THREE.GridHelper(500, 100));

      var light = new THREE.DirectionalLight(0xffffff, 2);
      light.position.set(1, 1, 1);
      this.scene.add(light);

      var texture = THREE.ImageUtils.loadTexture('/img/crate.gif', new THREE.UVMapping(), render);
      texture.anisotropy = this.renderer.getMaxAnisotropy();

      var geometry = new THREE.BoxGeometry(200, 200, 200);
      var material = new THREE.MeshLambertMaterial({ map: texture });

      this.control = new THREE.TransformControls(this.camera, this.renderer.domElement);

      this.control.addEventListener('change', render);

      var mesh = new THREE.Mesh(geometry, material);
      this.scene.add(mesh);

      this.control.attach(mesh);
      this.scene.add(this.control);

      window.addEventListener('resize', onWindowResize, false);


      var _this = this;
      window.addEventListener('keydown', function(event ) {
        //console.log(event.which);
        switch (event.keyCode) {
          case 81: // Q
            _this.control.setSpace(control.space == 'local' ? 'world' : 'local');
            break;
          case 87: // W
            _this.control.setMode('translate');
            break;
          case 69: // E
            _this.control.setMode('rotate');
            break;
          case 82: // R
            _this.control.setMode('scale');
            break;
          case 187:
          case 107: // +,=,num+
            _this.control.setSize(_this.control.size + 0.1);
            break;
          case 189:
          case 10: // -,_,num-
            _this.control.setSize(Math.max(_this.control.size - 0.1, 0.1));
            break;
        }
      });

      function onWindowResize() {

        _this.camera.aspect = _this.getWidth() / _this.getHeight();
        _this.camera.updateProjectionMatrix();

        _this.renderer.setSize(_this.getWidth(), _this.getHeight());

        render();
      }

      $('#menu-toggle').click(function(e) {
        setTimeout(onWindowResize, 1100);
      });

      function render() {

        _this.control.update();

        _this.renderer.render(_this.scene, _this.camera);

      }
      render();
    });
  }
});




xaphoon.Renderer = Backbone.View.extend({
  id: 'renderer',

  initialize: function(todos) {

    this.DrawableCollection = DrawableCollection;

    // this is called upon fetch
    this.todos.bind('reset', this.render);

    // this is called when the collection adds a new todo from the server
    this.todos.bind('add', this.addDrawable);
    this.todos.bind('add', this.removeDrawable);

    this.render();
  },

  render: function() {
    var self = this;

    this.DrawableCollection.each(function(todo) {
      self.addDrawable(todo);
    });

    return this;
  },

  addDrawable: function(drawable) {

  }
});

var add = function(attrs) {

  // We don't want ioBind events to occur as there is no id.
  // We extend Todo#Model pattern, toggling our flag, then create
  // a new todo from that.
  var d = xaphoon.DrawableModel.extend({ noIoBind: true });

  var _object = new d(attrs);
  _object.save();
};

var remove = function(o) {
  // Silent is true so that we react to the server
  // broadcasting the remove event.
  o.destroy({ silent: true });
};

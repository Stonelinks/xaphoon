zip.workerScriptsPath = '/vendor/zip/WebContent/';
URL = window.webkitURL || window.mozURL || window.URL;

var Drawable = m3js.Drawable.extend({
  
  defaults: function() {
    
    var ret = _.clone(m3js.Drawable.prototype.defaults);

    _.extend(ret, {
      dofvalues: []
    })
    
    return ret
  },
  
  initDrawable: function() {
    var _this = this;

    var _loadCollada = function(url, scale, loaderFunc) {
      scale = scale || 1.0;

      var loader = new THREE.ColladaLoader();
      loader.options.convertUpAxis = true;
      loader.load(url, function(collada) {
        var dae = collada.scene;

        if (collada.kinematics) {
          _this.kinematics = collada.kinematics;

          _this.on('change:dofvalues', function() {
            // console.log('Drawable: update dofvalues');
            _this.updateDOFValues();
          });
          _this.updateDOFValues();

          _this.set('dofvalues', _.map(collada.kinematics.joints, function(joint) {
            return joint.zeroPosition;
          }));
        }

        _this._mesh = dae;

        if (_this.collection !== undefined) {
          _this.collection.trigger('drawable:loaded', _this);
        }
        _this.trigger('drawable:loaded', _this);

        _this.on('change:matrix', function() {
          // console.log('Drawable: update mesh');
          _this.updateMesh();
        });
        _this.updateMesh();

        dae.scale.x = dae.scale.y = dae.scale.z = scale;
        dae.updateMatrix();
      });
    };

    if (THREE.hasOwnProperty(this.get('geometryType'))) {
      m3js.Drawable.prototype.initDrawable.call(this);
    }
    else if (this.get('geometryType') == 'collada') {
      _loadCollada(this.get('geometryParams')[0], this.get('geometryParams')[1]);
    }
    else if (this.get('geometryType') == 'collada_zae') {
      var zaeUrl = this.get('geometryParams')[0];

      zip.createReader(new zip.HttpReader(zaeUrl), function(zipReader) {
        zipReader.getEntries(function(entries) {

          var hasLoadedCollada = false;

          if (entries.length) {
            _.forEach(entries, function(entry) {
              if (!hasLoadedCollada && entry.filename.split('.').pop() == 'dae') {
                entry.getData(new zip.BlobWriter('text/plain'), function(data) {
                  zipReader.close();
                  _loadCollada(URL.createObjectURL(data), _this.get('geometryParams')[1]);
                  hasLoadedCollada = true;
                });
              }
            });
          }
        });
      }, function() {
        console.warn('Drawable: problem loading ' + zaeUrl);
      });
    }
    else {
      console.warn('Drawable: no compatible geometry mesh');
    }
  },

  updateDOFValues: function() {
    if (this.kinematics) {
      var dofvalues = this.get('dofvalues');

      var _this = this;
      _.forEach(dofvalues, function(dofvalue, index) {
        if (_this.kinematics.joints[index] && !_this.kinematics.joints[index].static) {
          _this.kinematics.setJointValue(index, dofvalue);
        }
      });
    }
  },

  setJointValue: function(index, value) {
    if (this.kinematics) {
      var dofvalues = this.get('dofvalues');
      dofvalues[index] = value;
      this.set('dofvalues', dofvalues);
    }
  },

  getDOFValue: function(index) {
    if (this.kinematics) {
      return this.get('dofvalues')[index];
    }
  }
});

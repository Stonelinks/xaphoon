'use strict';

module.exports = function(grunt) {

  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    // 'node-inspector': {
      // dev: {
        // options: {
          // 'web-port': 1337
        // }
      // }
    // },
    //

    concurrent: {
      dev: {
        tasks: ['nodemon', 'watch'],
        options: {
          logConcurrentOutput: true
        }
      }
    },

    nodemon: {
      dev: {
        script: 'app.js',
        // nodeArgs: ['--debug'],
        options: {
          callback: function(nodemon) {
            nodemon.on('log', function(event) {
              console.log(event.colour);
            });

            // refreshes browser when server reboots
            nodemon.on('restart', function() {
              // delay before server listens on port
              setTimeout(function() {
                require('fs').writeFileSync('.rebooted', 'rebooted');
              }, 1000);
            });
          }
        }
      }
    },

    watch: {
      options: {
        livereload: true
      },

      server: {
        files: ['.rebooted']
      },

      less: {
        files: ['public/less/**/*.less'],
        tasks: ['less']
      },
      
      jade: {
        files: ['templates/**/*.jade'],
        tasks: ['jade']
      },

      public: {
        files: [
          'public/js/**/*.js',
          'public/img/**/*.{png,jpg,ico}'
        ]
      },

      templates: {
        files: ['views/**/*.jade']
      }
    },

    less: {
      main: {
        files: {
          'public/css/style.css': 'public/less/main.less'
        }
      }
    },
    
    jade: {
      templates: {
        src: ['templates/index.jade'],
        dest: 'public/index.html',
      }
    }
  });

  grunt.registerTask('build', [
    'jade',
    'less'
  ]);

  grunt.registerTask('default', [
    'build',
    'concurrent'
  ]);
};

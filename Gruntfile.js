'use strict';

module.exports = function(grunt) {

  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    watch: {
      less: {
        files: ['public/less/**/*.less'],
        tasks: ['less']
      }
    },

    less: {
      main: {
        files: {
          'public/css/style.css': 'public/less/main.less'
        }
      }
    }

  });

  grunt.registerTask('build', [
    'less'
  ]);

  grunt.registerTask('default', [
    'build'
  ]);
};

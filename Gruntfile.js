'use strict';

module.exports = function(grunt) {

grunt.initConfig({
  jshint: {
    files: ['Gruntfile.js', 'test/*.js', '*.js']
  },
  eslint: {
    target: ['Gruntfile.js', 'test/*.js', '*.js']
  },
  tape: {
    files: ['test/ed2k_test.js']
  }
});

grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.loadNpmTasks('grunt-eslint');
grunt.loadNpmTasks('grunt-tape');

grunt.registerTask('hint', ['jshint']);
grunt.registerTask('standard', ['eslint']);
grunt.registerTask('default', ['tape']);
};


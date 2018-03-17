'use strict'

module.exports = function(grunt) {

grunt.initConfig({
  jshint: {
    files: ['Gruntfile.js', 'test/*.js', '*.js']
  },
  eslint: {
    target: ['Gruntfile.js', 'test/*.js', '*.js']
  },
  shell: {
    taperunfirefox: {
      command: '/usr/bin/firefox "http://localhost:8081" & ./node_modules/browserify/bin/cmd.js ed2khash_test.js|./node_modules/tape-run/bin/run.js --wait 60 --static . --port 8081'
    },
    zuullocal: {
      command: 'zuul --ui tape --local 9000 ../test/ed2khash_test.js',
      options: { execOptions: { cwd: 'src' } }
    }
  }
})

grunt.loadNpmTasks('grunt-contrib-jshint')
grunt.loadNpmTasks('grunt-eslint')
grunt.loadNpmTasks('grunt-shell')

grunt.registerTask('hint', ['jshint'])
grunt.registerTask('standard', ['eslint'])
grunt.registerTask('test-local', ['shell:zuullocal'])
grunt.registerTask('default', [])
}


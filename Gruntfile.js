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
    taperun: {
      command: './node_modules/browserify/bin/cmd.js ./test/ed2khash_test.js|./node_modules/tape-run/bin/run.js --wait 60 --static src'
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
grunt.registerTask('test-tape', ['shell:taperun'])
grunt.registerTask('default', [])
}


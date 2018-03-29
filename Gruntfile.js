'use strict'

module.exports = function (grunt) {
  grunt.initConfig({
    jshint: {
      files: ['Gruntfile.js', 'test/*.js', 'src/*.js']
    },
    eslint: {
      target: ['Gruntfile.js', 'test/*.js', 'src/*.js']
    },
    shell: {
      taperun: {
        command: ['./node_modules/browserify/bin/cmd.js',
          './test/ed2khash_test.js|./node_modules/tape-run/bin/run.js',
          '--wait 60 --static build-test'].join(' ')
      },
      zuullocal: {
        command: 'zuul --ui tape --local 9000 --no-coverage ../test/ed2khash_test.js',
        options: { execOptions: { cwd: 'build-test' } }
      },
      dista: {
        command: ['rm -rf build-rel', 'mkdir build-rel',
          'cp src/*.html build-rel'].join('&&')
      },
      distb: {
        command: ['closure-compiler -O ADVANCED --language_in ECMASCRIPT_2017',
          '-D goog.DEBUG=false --dependency_mode STRICT',
          '--entry_point=ti.ed2khash.worker --js_output_file md4-worker.min.js',
          '--js="../src/**.js"',
          '--js="../node_modules/google-closure-library/**.js"'].join(' '),
        options: { execOptions: { cwd: 'build-rel' } }
      },
      distc: {
        command: ['closure-compiler -O ADVANCED --language_in ECMASCRIPT_2017',
          '-D goog.DEBUG=false --dependency_mode STRICT',
          '--entry_point=ti.ed2khash --js_output_file ed2khash.min.js',
          '--js="../src/**.js"',
          '--js="../node_modules/google-closure-library/**.js"'].join(' '),
        options: { execOptions: { cwd: 'build-rel' } }
      },
      testa: {
        command: ['rm -rf build-test', 'mkdir build-test',
          'cp src/*.html build-test'].join('&&')
      },
      testb: {
        command: ['closure-compiler -O BUNDLE --language_in ECMASCRIPT_2017',
          '--dependency_mode STRICT',
          '--entry_point=ti.ed2khash.worker --js_output_file md4-worker.min.js',
          '--js="../src/**.js"',
          '--js="../node_modules/google-closure-library/**.js"'].join(' '),
        options: { execOptions: { cwd: 'build-test' } }
      },
      testc: {
        command: ['closure-compiler -O BUNDLE --language_in ECMASCRIPT_2017',
          '--dependency_mode STRICT',
          '--entry_point=ti.ed2khash --js_output_file ed2khash.min.js',
          '--js="../src/**.js"',
          '--js="../node_modules/google-closure-library/**.js"' /*,
          '--output_wrapper="(function (root, factory) {',
          'if (typeof define === \'function\' && define.amd)',
          '  define([], factory);',
          'else if (typeof module === \'object\' && module.exports)',
          '  module.exports.ed2khash = factory();',
          'else',
          '  root.ed2khash = factory();',
          '})(this, function() {',
          '  %output%',
          '  ;return ed2khash;',
          '})"'*/].join(' '),
        options: { execOptions: { cwd: 'build-test' } }
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-eslint')
  grunt.loadNpmTasks('grunt-shell')

  grunt.registerTask('hint', ['jshint'])
  grunt.registerTask('standard', ['eslint'])

  grunt.registerTask('build-rel', ['shell:dista', 'shell:distb', 'shell:distc'])
  grunt.registerTask('build-test', ['shell:testa', 'shell:testb',
    'shell:testc'])
  grunt.registerTask('build', ['build-rel'])
  grunt.registerTask('build-release', ['build-rel'])

  grunt.registerTask('test-local', ['build-test', 'shell:zuullocal'])
  grunt.registerTask('test-tape', ['build-test', 'shell:taperun'])

  grunt.registerTask('default', [])
}

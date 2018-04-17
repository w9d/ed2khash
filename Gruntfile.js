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
          '--wait 60 --static build-rel'].join(' ')
      },
      zuullocal: {
        command: 'zuul --ui tape --local 9000 --no-coverage ../test/ed2khash_test.js',
        options: { execOptions: { cwd: 'build-rel' } }
      },
      clean: {
        command: dir => ['mkdir build-' + dir + ' 2>/dev/null||true',
          'rm -rf build-' + dir + '/* build-' + dir + '/.* 2>/dev/null||true',
          'cp src/*.html build-' + dir].join('&&')
      },
      closure_md4: {
        command: (mode, dir, debug) => ['cd build-' + dir + '&&',
          'closure-compiler -O ' + mode,
          '-D goog.DEBUG=' + (debug === 'debug') + ' -W VERBOSE',
          '--extra_annotation_name="exports"',
          '--language_in ECMASCRIPT_2017 --dependency_mode STRICT',
          '--entry_point=ed2khash.worker --js_output_file md4-worker.min.js',
          '--js="../src/**.js"',
          '--js="../node_modules/google-closure-library/**.js"'].join(' ')
      },
      closure_ed2khash: {
        command: (mode, dir, debug) => ['cd build-' + dir + '&&',
          'closure-compiler -O ' + mode,
          '-D goog.DEBUG=' + (debug === 'debug') + ' -W VERBOSE',
          '--extra_annotation_name="exports"',
          '--process_common_js_modules',
          '--language_in ECMASCRIPT_2017 --dependency_mode STRICT',
          '--entry_point=ed2khash --js_output_file ed2khash.min.js',
          '--js="../src/**.js"',
          '--js="../node_modules/google-closure-library/**.js"'].join(' ')
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-eslint')
  grunt.loadNpmTasks('grunt-shell')

  grunt.registerTask('hint', ['jshint'])
  grunt.registerTask('standard', ['eslint'])

  grunt.registerTask('build-rel', ['shell:clean:rel',
    'shell:closure_md4:ADVANCED:rel', 'shell:closure_ed2khash:ADVANCED:rel'])
  grunt.registerTask('build-test', ['shell:clean:test',
    'shell:closure_md4:ADVANCED:test', 'shell:closure_ed2khash:ADVANCED:test:debug'])

  grunt.registerTask('build', ['build-rel'])
  grunt.registerTask('build-release', ['build-rel'])

  grunt.registerTask('test-local', ['build-rel', 'shell:zuullocal'])
  grunt.registerTask('test-tape', ['build-rel', 'shell:taperun'])

  grunt.registerTask('default', [])
}

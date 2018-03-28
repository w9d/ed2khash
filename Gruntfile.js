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
          'cp src/*.html src/*.js build-rel'].join('&&')
      },
      distb: {
        command: ['closure-compiler -O ADVANCED --language_in ECMASCRIPT_2017',
          '-D goog.DEBUG=false',
          '--js md4.js --js md4-worker.js --js_output_file md4-worker.min.js',
          ' && rm md4.js md4-worker.js'].join(' '),
        options: { execOptions: { cwd: 'build-rel' } }
      },
      distc: {
        command: ['closure-compiler -O ADVANCED --language_in ECMASCRIPT_2017',
          '-D goog.DEBUG=false',
          '--dependency_mode STRICT --entry_point=ti.ed2khash --js ed2khash.js',
          '--js="../node_modules/google-closure-library/**.js"',
          '--js_output_file ed2khash.min.js',
          ' && rm ed2khash.js'].join(' '),
        options: { execOptions: { cwd: 'build-rel' } }
      },
      testa: {
        command: ['rm -rf build-test', 'mkdir build-test',
          'cp src/*.html src/*.js build-test'].join('&&')
      },
      testb: {
        command: ['closure-compiler -O BUNDLE --language_in ECMASCRIPT_2017',
          '--js md4.js --js md4-worker.js --js_output_file md4-worker.min.js',
          ' && rm md4.js md4-worker.js'].join(' '),
        options: { execOptions: { cwd: 'build-test' } }
      },
      testc: {
        command: ['closure-compiler -O BUNDLE --language_in ECMASCRIPT_2017',
          '--dependency_mode STRICT --entry_point=ti.ed2khash --js ed2khash.js',
          '--js="../node_modules/google-closure-library/**.js"',
          '--js_output_file ed2khash.min.js',
          ' && rm ed2khash.js'].join(' '),
        options: { execOptions: { cwd: 'build-test' } }
      }
    },
    replace: {
      removeMD4Import: {
        src: ['build-rel/md4-worker.js', 'build-test/md4-worker.js'],
        overwrite: true,
        replacements: [
          { from: 'importScripts(\'md4.js\')', to: '' }
        ]
      },
      updateLocations: {
        src: ['build-rel/*', 'build-test/*'],
        overwrite: true,
        replacements: [
          {
            from: /(['"][a-zA-Z0-9-]+)(\.js['"])/g,
            to: '$1.min$2'
          }
        ]
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-eslint')
  grunt.loadNpmTasks('grunt-shell')
  grunt.loadNpmTasks('grunt-text-replace')

  grunt.registerTask('hint', ['jshint'])
  grunt.registerTask('standard', ['eslint'])

  grunt.registerTask('build-rel', ['shell:dista', 'replace:removeMD4Import',
    'replace:updateLocations', 'shell:distb', 'shell:distc'])
  grunt.registerTask('build-test', ['shell:testa', 'replace:removeMD4Import',
    'replace:updateLocations', 'shell:testb', 'shell:testc'])
  grunt.registerTask('build', ['build-rel'])
  grunt.registerTask('build-release', ['build-rel'])

  grunt.registerTask('test-local', ['build-test', 'shell:zuullocal'])
  grunt.registerTask('test-tape', ['build-test', 'shell:taperun'])

  grunt.registerTask('default', [])
}

'use strict'

module.exports = function (grunt) {
  grunt.initConfig({
    eslint: {
      target: ['Gruntfile.js', 'test/*.js', 'src/*.js']
    },
    shell: {
      taperun: {
        command: (name) => ['npx --no-install browserify',
          './test/' + name + '.js|npx --no-install tape-run',
          '--wait 60 --port 8092 --static build-rel'].join(' ')
      },
      taperundirect: {
        command: (name) => ['npx --no-install browserify',
          './build-rel/' + name + '|npx --no-install tape-run',
          '--wait 60 --port 8092 --static build-rel'].join(' ')
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
      closure: {
        command: (mode, dir, entry, out_prefix, debug, node_globals) => ['cd build-' + dir + '&&',
          'npx --no-install google-closure-compiler -O ' + mode,
          '-D goog.DEBUG=' + !!debug + (debug ? ' -W VERBOSE' : ''),
          (debug === 'debug-types' ? ' --jscomp_warning=reportUnknownTypes' : ''),
          '--dependency_mode PRUNE',
          '--entry_point=' + entry + ' --js_output_file ' + out_prefix + '.min.js',
          '--js="../src/**.js"',
          '--js="../test/**.js"',
          '--js="../node_modules/google-closure-library/**.js"',
          (node_globals ? '--externs="../node_modules/google-closure-compiler/contrib/nodejs/globals.js"' : '')
        ].join(' ')
      }
    }
  })

  grunt.loadNpmTasks('grunt-eslint')
  grunt.loadNpmTasks('grunt-shell')

  grunt.registerTask('hint', ['jshint'])
  grunt.registerTask('standard', ['eslint'])

  grunt.registerTask('build-rel', [
    'shell:clean:rel',
    'shell:closure:ADVANCED:rel:ed2khash.worker:md4-worker',
    'shell:closure:ADVANCED:rel:ed2khash:ed2khash'
  ])
  grunt.registerTask('build-test', [
    'shell:clean:test',
    'shell:closure:SIMPLE:test:ed2khash.worker:md4-worker',
    'shell:closure:SIMPLE:test:ed2khash:ed2khash:debug'
  ])
  grunt.registerTask('build-types', [
    'shell:clean:test',
    'shell:closure:SIMPLE:test:ed2khash.worker:md4-worker:debug-types',
    'shell:closure:SIMPLE:test:ed2khash:ed2khash:debug-types'
  ])

  grunt.registerTask('build', ['build-rel'])
  grunt.registerTask('build-release', ['build-rel'])

  grunt.registerTask('test-local', ['build-rel', 'shell:zuullocal'])
  grunt.registerTask('test-tape', ['build-rel', 'shell:taperun:ed2khash_test'])
  grunt.registerTask('test-tape-torrent', [
    'shell:clean:rel',
    'shell:closure:SIMPLE:rel:ed2khash.torrent_parse.test:torrent_parse_test:debug:yep',
    'shell:taperundirect:torrent_parse_test.min.js'
  ])

  grunt.registerTask('default', [])
}

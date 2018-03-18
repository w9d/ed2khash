'use strict'

module.exports = function(grunt) {

grunt.initConfig({
  jshint: {
    files: ['Gruntfile.js', 'test/*.js', 'src/*.js']
  },
  eslint: {
    target: ['Gruntfile.js', 'test/*.js', 'src/*.js']
  },
  shell: {
    taperun: {
      command: ['./node_modules/browserify/bin/cmd.js ./test/ed2khash_test.js|',
        './node_modules/tape-run/bin/run.js --wait 60 --static src'].join('')
    },
    zuullocal: {
      command: 'zuul --ui tape --local 9000 ../test/ed2khash_test.js',
      options: { execOptions: { cwd: 'src' } }
    },
    dista: {
      command: ['rm -rf dist','mkdir dist','cp src/*.html src/*.js dist'].join('&&')
    },
    distb: {
      command: ['closure-compiler -O ADVANCED --language_in ECMASCRIPT_2017',
        '--js md4.js --js md4-worker.js --js_output_file md4-worker.min.js',
        ' && rm md4.js md4-worker.js'].join(' '),
      options: { execOptions: { cwd: 'dist' } }
    },
    distc: {
      command: ['closure-compiler -O ADVANCED --language_in ECMASCRIPT_2017',
        "--define='RELEASE=true' --js ed2khash.js --js_output_file",
        'ed2khash.min.js && rm ed2khash.js'].join(' '),
      options: { execOptions: { cwd: 'dist' } }
    }
  },
  replace: {
    removeMD4Import: {
      src: ['dist/md4-worker.js'],
      overwrite: true,
      replacements: [
        { from: "importScripts('md4.js')", to: "" }
      ]
    },
    updateLocations: {
      src: ['dist/*'],
      overwrite: true,
      replacements: [
        {
          from: /([a-zA-Z0-9\-]+)(\.js)/g,
          to: "$1.min$2"
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
grunt.registerTask('test-local', ['shell:zuullocal'])
grunt.registerTask('test-tape', ['shell:taperun'])
grunt.registerTask('build', ['shell:dista', 'replace:removeMD4Import',
                   'replace:updateLocations', 'shell:distb', 'shell:distc'])
grunt.registerTask('default', [])
}


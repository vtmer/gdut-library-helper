module.exports = (grunt) ->
  grunt.initConfig
    # Package meta
      
    pkg: grunt.file.readJSON 'package.json'
    srcDir: './src'
    buildDir: './dist'
    coffeeCompiledDir: '<%= buildDir %>/cjs'

    # Tasks Settings

    coffee:
      build:
        options:
            # Remove unnecessary function call wrap.
            bare: true
        expand: true
        flattern: true
        cwd: '<%= srcDir %>'
        src: ['**/*.coffee']
        dest: '<%= coffeeCompiledDir %>'
        ext: '.js'

    browserify:
      build:
        files:
          '<%= buildDir %>/<%= pkg.main %>': ['<%= coffeeCompiledDir %>/**/*.js']

    shell:
      convert:
        command: 'make convert_crx'

    watch:
      scripts:
        files: ['<%= srcDir %>/**/*.coffee']
        tasks: ['shell:convert']

    clean:
      build: ['<%= buildDir %>']

  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-browserify'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-shell'

  # Compile script with coffee & browserify
  grunt.registerTask 'compile', [
    'coffee:build'
    'browserify:build'
  ]

  grunt.registerTask 'default', [
      'clean:build'
      'compile'
  ]

  grunt.registerTask 'develop', [
    'default'
    'watch'
  ]

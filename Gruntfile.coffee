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
                src: ['*.coffee']
                dest: '<%= coffeeCompiledDir %>'
                ext: '.js'

        browserify:
            build:
                files:
                    '<%= buildDir %>/<%= pkg.main %>': ['<%= coffeeCompiledDir %>/**/*.js']

        clean:
            build: ['<%= buildDir %>']

    grunt.loadNpmTasks 'grunt-contrib-clean'
    grunt.loadNpmTasks 'grunt-contrib-coffee'
    grunt.loadNpmTasks 'grunt-browserify'

    # Compile script with coffee & browserify
    grunt.registerTask 'default', [
        'clean:build'
        'coffee:build'
        'browserify:build'
    ]

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            options: {
                process: function(src, filepath) {
                    return '// Source: ' + filepath + '\n' +
                        src.replace(/(^|\n)[ \t]*(var helper = helper \|\| \{\};)\s*/g, '');
                }
            },
            helper: {
                src: ['src/main.js', 'src/utils.js', 'src/tmpl.js', 
                      'src/parser.js', 'src/pages.*.js', 'src/kick.js'],
                dest: '<%= pkg.name %>.js'
            },
            gm: {
                src: ['src/main.js', 'src/utils.js', 'src/tmpl.js', 
                      'src/parser.js', 'src/pages.*.js', 'src/kick.js'],
                dest: '<%= pkg.name %>.gm.js'
            }
        },

        uglify: {
            options: {
                // 保留 GM 脚本信息
                preserveComments: function(node, src) {
                    return (/\@|\=/i).test(src.value);
                }
            },
            helper: {
                files: {
                    '<%= pkg.name %>.js': '<%= pkg.name %>.js'
                }
            }
        },

        watch: {
            helper: {
                files: ['src/**'],
                tasks: ['concat:helper']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['concat:helper', 'uglify:helper']);
    grunt.registerTask('gm', ['concat:gm']);
    grunt.registerTask('dev', ['concat:helper', 'watch:helper']);
};

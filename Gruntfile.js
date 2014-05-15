'use strict';

module.exports = function (grunt) {

    grunt.initConfig({
        pkg : grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: '\n\n',
            },
            emitter: {
                src: [
                    'lib/closureOpen.js',
                    'lib/Emitter.js', 
                    'index.js',
                    'lib/closureClose.js'],
                dest: 'build/postEmitter.js',
            },
            hone: {
                src: [
                    'lib/closureOpen.js',
                    'lib/Emitter.js', 
                    'index.js',
                    'hone.js',
                    'lib/closureClose.js'],
                dest: 'build/embed.js',
            },
            hone_auto_targeting: {
                src: [
                    'lib/closureOpen.js',
                    'lib/Emitter.js', 
                    'index.js',
                    'hone-autotarget.js',
                    'hone.js',
                    'lib/closureClose.js'],
                dest: 'build/embed.autotarget.js',
            },
        },
        connect: {
            server: {
                options: {
                    port: 3030,
                    hostname: '*',
                    keepalive: true
                }
            }
        },
        uglify : {
            dist: {
                options : {
                    banner : "/* <%= pkg.name %> - v<%= pkg.version %>\n * <%= pkg.company %>\n */\n\n"
                },
                files: {
                    'dist/<%= pkg.name %>-<%= pkg.version %>.min.js': 'build/embed.js'
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.registerTask('default', ['concat', 'connect']);
    grunt.registerTask('dist', 'uglify');

};
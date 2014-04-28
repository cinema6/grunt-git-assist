/*
 * grunt-git-assist
 * 
 *
 * Copyright (c) 2013 howard
 * Licensed under the MIT license.
 */

'use strict';

var settings = {};
module.exports = function(grunt) {

    var modules = {
        "angular.js"    : {
            "buildDir"  : "build",
            "grunt"     : ["package"],
            "npm"       : true,
            "path"      : "src/angular",
            "remotes"   : { "upstream"  : "https://github.com/angular/angular.js.git" },
            "repo"      : "git@github.com:cinema6/angular.js.git",
            "target"    : "lib/angular"
        },
        "GreenSock-JS"  : {
            "buildDir"  : "src/minified", 
            "grunt"     : false ,
            "npm"       : false, 
            "path"      : "src/gsap",
            "remotes"   : { "upstream"  : "https://github.com/greensock/GreenSock-JS.git"},
            "repo"      : "git@github.com:cinema6/GreenSock-JS.git",
            "target"    : "lib/gsap"
        },
        "jquery"        : {
            "buildDir"  : "dist",
            "grunt"     : [],
            "npm"       : true,
            "path"      : "src/jquery",
            "remotes"   : { "upstream"  : "https://github.com/jquery/jquery.git" },
            "repo"      : "git@github.com:cinema6/jquery.git",
            "target"    : "lib/jquery"
        }
    };

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>',
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp'],
    },

    submodule_add: modules,

    submodule_add_remotes : modules,

    submodule_build : modules,
    
    submodule_checkout : modules,

    submodule_sync : modules,

    submodule_version : modules,

    git_last_commit: {
        options : {
            versionFile : (__dirname + '/verion.json'),
            config : function(data) { settings.git_last_commit = data; }
        }
    },

    git_describe_tags: {
        default : {}
    },

    // Configuration to be run (and then tested).
    git_assist: {
      default_options: {
        options: {
        },
        files: {
          'tmp/default_options': ['test/fixtures/testing', 'test/fixtures/123'],
        },
      },
      custom_options: {
        options: {
          separator: ': ',
          punctuation: ' !!!',
        },
        files: {
          'tmp/custom_options': ['test/fixtures/testing', 'test/fixtures/123'],
        },
      },
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js'],
    },

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  grunt.registerTask('get-versions',function(){
        grunt.log.writelns('JQUERY VERSION:',JSON.stringify(grunt.config('submodule_versions')));
  });

  grunt.registerTask('get-git_last_commit',function(){
        grunt.log.writelns(JSON.stringify(settings));
  });
 
  grunt.registerTask('test-versions',['submodule_version','get-versions']);

  grunt.registerTask('test-git_last_commit',['git_last_commit','get-git_last_commit']);

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'git_assist', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};

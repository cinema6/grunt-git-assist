/*
 * grunt-git-assist
 * 
 *
 * Copyright (c) 2013 howard
 * Licensed under the MIT license.
 */

'use strict';

var path=require('path');

module.exports = function(grunt) {

    grunt.registerTask('submodule_update','Wrapper around git submodule update.',function(){
        var done    = this.async(),
            options = this.options({
                init      : true
            }),
            args = ['submodule','update'];

        if (options.init){
            args.push('--init');
        }

        grunt.util.spawn({
            cmd : 'git',
            args : args
        },function(error,result/*,code*/){
            if (error) {
                grunt.log.errorlns('submodule_update failed: ' + error.message);
                done(false);
                return;
            }

            if (result.stderr){
                grunt.log.writeln(result.stderr);
            } else
            if (result.stdout){
                grunt.log.writeln(result.stdout);
            }
            done(true);
        });
    });

};

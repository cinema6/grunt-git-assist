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

    grunt.registerMultiTask('submodule_add','Helps add submodules to a project.',function(){
        var target  = this.target,
            data    = this.data,
            done    = this.async(),
            args    = ['submodule','add'];

        if (!data.repo){
            grunt.log.errorlns('submodule_add:' + target + ' - fails, no repo');
            return done(false);
        }

        args.push(data.repo);
        if (data.path){
            args.push(data.path);
        }

        grunt.util.spawn({
            cmd : 'git',
            args : args
        },function(error/*,result,code*/){
            if (error) {
                grunt.log.errorlns('submodule_add:' + target + ' - failed: ' + error);
                done(false);
                return;
            }

            grunt.log.writelns('submodule_add:' + target + ' - repo <' + data.repo + '>' +
                ' [' + data.path + ']');

            done(true);
        });
    });

};

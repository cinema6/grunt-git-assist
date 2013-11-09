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

    grunt.registerMultiTask('submodule_version','Gets current versions of modules.',function(){
        var target = this.target,
            data   = this.data,
            args   = [],
            done   = this.async();

        if (!data.path){
            grunt.log.errorlns('submodule_add:' + target + ' - fails, no path');
            return done(false);
        }


        grunt.util.spawn({
            cmd : 'git',
            args : ['describe','--tags','--long'],
            opts : { cwd : data.path }
        },function(error,result/*,code*/){
            if (error) {
                grunt.log.errorlns('submodule_version:' + target + ' - failed: ' + error);
                done(false);
                return;
            }

            var versionData = grunt.config('submodule_versions');
            if (versionData === undefined){
                versionData = {};
            }
            versionData[target] = result.stdout;

            grunt.config('submodule_versions',versionData);
            done(true);
        });
    });
};

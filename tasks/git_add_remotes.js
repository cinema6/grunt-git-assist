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

    grunt.registerMultiTask('submodule_add_remotes','Adds remotes to project modules.',function(){
        var target = this.target,
            data   = this.data,
            args   = [],
            done   = this.async();

        if (!data.remotes || data.remotes === {}){
            grunt.log.errorlns('submodule_add_remotes:' + target + ' - fails, no remotes');
            return done(false);
        }

        if (!data.path){
            grunt.log.errorlns('submodule_add:' + target + ' - fails, no path');
            return done(false);
        }

        for (var name in data.remotes){
            args.push(['remote','add',name,data.remotes[name]]);
        }

        (function spawn(argsList){
            var args = argsList.shift(), subdir;
            if (!args){
                done(true);
                return;
            }
            grunt.util.spawn({
                cmd : 'git',
                args : args,
                opts : { cwd : data.path }
            },function(error/*,result,code*/){
                if ((error) && (error.message.match(/remote .* already exists/) === null)) {
                    grunt.log.errorlns('submodule_add_remotes:' + target + ' - failed: ' + error);
                    done(false);
                    return;
                }

                grunt.log.writelns('submodule_add_remotes:' + target +
                    ' - remote <' + args[2] +'>' +
                    ' repository <' + args[3] + '>');
                spawn(argsList);
            });
        }(args));
    });
};

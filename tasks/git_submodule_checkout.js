/*
 * grunt-git-assist
 * 
 *
 * Copyright (c) 2013 howard
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

    grunt.registerMultiTask('submodule_checkout','Submodules checkout a ref.',function(){
        var target  = this.target,
            data    = this.data,
            flags   = this.flags,
            args    = ['checkout'], done,
            spawn   = require('q').nbind(grunt.util.spawn,grunt.util),
            options = this.options({
                checkout : {
                    args : []
                }
            });

        if ((!flags) || (flags === {})){
            grunt.log.errorlns('Failed, no flags.');
            return false;
        }
        
        if (!data.path){
            grunt.log.errorlns('Failed, no path');
            return false;
        }

        options.checkout.args.forEach(function(arg){
            args.push(arg);
        });

        for (var ref in flags){
            args.push(ref);
            break;
        }

        done    = this.async();
        spawn({cmd : 'git', args : args, opts : { cwd : data.path } })
            .then(function(results){
                if (results[0].stderr){
                    grunt.log.writeln(results[0].stderr);
                } else
                if (results[0].stdout){
                    grunt.log.writeln(results[0].stdout);
                }
                done(true);
            })
            .fail(function(err){
                grunt.log.errorlns(err.message);
                done(false);
            });
        });
};

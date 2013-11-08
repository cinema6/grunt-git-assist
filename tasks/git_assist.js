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

    grunt.registerTask('git_last_commit','Get a version using git commit', function(){
        var done = this.async(),
            options = this.options({
                versionFile : null,
                config      : 'git_last_commit'
            });

        grunt.util.spawn({
            cmd     : 'git',
            args    : ['log','-n1','--format={ "commit" : "%h", "date" : "%ct" , "subject" : "%s" }']
        },function(err,result){
            var data;
            if (err) {
                grunt.log.errorlns('grunt-git-assist: Failed to get git_last_commit - ' + err);
                return done(false);
            }

            try {
                data = JSON.parse(result);
            }
            catch(e){
                grunt.log.errorlns('grunt-git-assist: unexpected result - ' + result);
            }

            if ((data === undefined) || (data.commit === undefined) ||
                (data.date === undefined)){
                grunt.log.errorlns('grunt-git-assist: Failed to parse git version.');
                return done(false);
            }

            data.date = new Date(data.date * 1000);
            if (options.versionFile !== null){
                grunt.file.write(options.versionFile,JSON.stringify(data),
                        { encoding: 'utf8' });    
            }

            if (typeof options.config === 'string'){
                grunt.config(options.config,data);
            } else
            if (typeof options.config === 'function'){
                options.config(data);
            }
            done(true);
        });
    });

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

    grunt.registerMultiTask('submodule_build','Build submodules',function(){
        var   target   = this.target,
              data     = this.data,
              done     = this.async(),
              subTasks = [],
              npmInstall = function(next){
                    var spawnOpts = { cmd : 'npm', args : ['install'],
                      opts : { cwd : data.path, env : process.env }
                    };

                    grunt.util.spawn( spawnOpts, function(error, result, code) {
                        next(error,code);
                    });
                },
              gruntInstall = function(next){
                    var spawnOpts = { cmd : 'grunt', args : data.grunt,
                      opts : { cwd : data.path, env : process.env }
                    };
                    grunt.util.spawn( spawnOpts, function(error, result, code) {
                        next(error,code);
                    });
                },
              cleanBuild = function(next){
                    if (grunt.file.exists(data.build)){
                        grunt.file.delete(data.build);
                    }
                    next();
                },
              cleanTarget = function(next){
                    if (grunt.file.exists(data.target)){
                        grunt.file.delete(data.target);
                    }
                    next();
                },
              copy= function(next){
                    var files = grunt.file.expand({ cwd : data.build},'**/*.*'),
                        cont = true,targetFile,abspath;
                    files.forEach(function(file){
                        //grunt.log.writelns('FILE: ' + file);
                        if (cont){
                            abspath     = path.join(data.build,file);
                            targetFile  = path.join(data.target,file);
                            grunt.file.copy(abspath,targetFile);
                            if (!grunt.file.exists(targetFile)) {
                                next( new Error('Failed to copy ' + abspath +
                                                    ' ==> ' + targetFile));
                                cont = false;
                                return;
                            }
                        }
                    });
                    next();
                    return ;
                },
              run = function(jobs,callback){
                    if (!jobs) {
                        callback();
                        return;
                    }

                    var job = jobs.shift();
                    if (!job){
                        callback();
                        return;
                    }

                    grunt.log.writelns('Attempt : ' + job.name);
                    job.func(function(error,code){
                        if (error){
                            callback(error,code,job.name);
                            return;
                        }

                        run(jobs,callback);
                    });
                };

        if (!data.path){
            grunt.log.errorlns('submodule_add:' + target + ' - fails, no path');
            return done(false);
        }

        if (!data.target){
            grunt.log.errorlns('submodule_build:' + target + ' - fails, no target');
            return done(false);
        }

        if (!data.buildDir){
            data.buildDir = 'dist';
        }

        if (!data.build){
            data.build = path.join(data.path,data.buildDir);
        }

        if ((data.npm === undefined) || (data.npm)){
            subTasks.push({ name : 'npm install', func : npmInstall });
        }

        if ((data.grunt === undefined) || (data.grunt !== false))  {
            subTasks.push({ name : 'clean-build', func : cleanBuild });
            subTasks.push({ name : 'grunt', func : gruntInstall });
        }

        if ((data.copy === undefined) || (data.copy) ){
            subTasks.push({ name : 'clean-target', func : cleanTarget });
            subTasks.push({ name : 'copy', func : copy });
        }

        run(subTasks,function(error,code,subTask){
            if (error){
                grunt.log.errorlns('Failed on ' + subTask + ': ' + error);
                done(false);
                return;
            }
            done(true);
        });
    });
};

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

    grunt.registerMultiTask('submodule_build','Build submodules',function(){
        var   target   = this.target,
              data     = this.data,
              targetPath = this.data.target,
              done     = this.async(),
              subTasks = [],
              getVersion = function(next){
                    var spawnOpts = { cmd : 'git', args : ['describe','--tags','--long'],
                      opts : { cwd : data.path, env : process.env }
                    };

                    grunt.util.spawn( spawnOpts, function(error, result, code) {
                        if (!error){
                            grunt.log.writelns('Building version: ' + result);
                            targetPath = path.join(data.target,result.toString());
                        }
                        next(error,code);
                    });
                },
              npmInstall = function(next){
                    var spawnOpts = { cmd : 'npm', args : ['install'],
                      opts : { cwd : data.path, env : process.env }
                    };

                    grunt.util.spawn( spawnOpts, function(error, result, code) {
                        next(error,code);
                    });
                },
              gruntBuild = function(next){
                    var spawnOpts = { cmd : 'grunt', args : data.grunt,
                      opts : { cwd : data.path, env : process.env }
                    };
                    grunt.util.spawn( spawnOpts, function(error, result, code) {
                        next(error,code);
                    });
                },
              gulpBuild = function(next){
                    var spawnOpts = { cmd : 'gulp', args : data.gulp,
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
                    if (grunt.file.exists(targetPath)){
                        grunt.file.delete(targetPath);
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
                            targetFile  = path.join(targetPath,file);
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
        
        subTasks.push({ name : 'get version', func : getVersion });

        if ((data.npm === undefined) || (data.npm)){
            subTasks.push({ name : 'npm install', func : npmInstall });
        }

        if ((data.grunt === undefined) || (data.grunt !== false))  {
            subTasks.push({ name : 'clean-build', func : cleanBuild });
            subTasks.push({ name : 'grunt', func : gruntBuild });
        }

        if (data.gulp) {
            subTasks.push({ name : 'clean-build', func : cleanBuild });
            subTasks.push({ name : 'gulp', func : gulpBuild });
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

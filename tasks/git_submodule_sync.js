/*
 * grunt-git-assist
 * 
 *
 * Copyright (c) 2013 howard
 * Licensed under the MIT license.
 */

'use strict';

var q=require('q');

module.exports = function(grunt) {

    function spawn(opts){
        var deferred = q.defer();
        grunt.verbose.writelns('spawn: ' + JSON.stringify(opts));
        grunt.util.spawn(opts,function(error,result,code){

            if (error){
                grunt.verbose.errorlns('error: ' + error.message);
                deferred.reject(error);
                return;
            }

            grunt.verbose.writelns('returns: ' + JSON.stringify([result,code]));
            deferred.resolve([result,code]);
        });

        return deferred.promise;
    }

    grunt.registerMultiTask('submodule_sync','Sync remote to origin.',function(){
        var target  = this.target,
            data    = this.data,
            options = this.options({
                remote : 'upstream'
                }),
            done    = this.async(),
            placeholder,
            remote;
        
        if (!data.repo){
            grunt.log.errorlns('submodule_sync:' + target + ' - fails, no repo');
            return done(false);
        }
    
        if (!data.path){
            grunt.log.errorlns('submodule_sync:' + target + ' - fails, no path');
            return done(false);
        }
    
        remote =  data.remotes && data.remotes[options.remote];
        if (!remote){
            grunt.log.errorlns('submodule_sync:' + target +
                ' - fails, no remote: ' + options.remote);
            return done(false);
        }

        function logResult(result){
            if (result[0].stderr){
                grunt.verbose.writeln(result[0].stderr);
            } else
            if (result[0].stdout){
                grunt.verbose.writeln(result[0].stdout);
            }
        }

        function getCommit(){
            return spawn({cmd : 'git', args : ['rev-parse','HEAD'],
                        opts : { cwd : data.path } })
            .then(function(result){
                grunt.log.notverbose.writeln('save our place at ' + result[0].stdout);
                placeholder = result[0].stdout;
                return result[0].stdout;
            });
        }

        function fetchRemote(currCommit){
            grunt.log.notverbose.writeln('fetch ' + options.remote);
            return spawn({cmd : 'git', args : ['fetch',options.remote],
                        opts : { cwd : data.path } })
            .then(function(result){
                logResult(result);
                return currCommit;
            });
        }

        function checkoutMaster(currCommit){
            grunt.log.notverbose.writeln('checkout master');
            return spawn({cmd : 'git', args : ['checkout','master'],
                        opts : { cwd : data.path } })
            .then(function(result){
                logResult(result);
                return currCommit;
            });
        }

        function mergeMaster(currCommit){
            grunt.log.notverbose.writeln('merge');
            return spawn({cmd : 'git', args : ['merge', options.remote + '/master'],
                        opts : { cwd : data.path } })
            .then(function(result){
                logResult(result);
                return currCommit;
            });
        }

        function upload(currCommit){
            grunt.log.notverbose.writeln('push');
            return spawn({cmd : 'git', args : ['push','origin', 'master'],
                        opts : { cwd : data.path } })
            .then(function(result){
                logResult(result);
                return currCommit;
            });
        }

        function restore(currCommit){
            grunt.log.notverbose.writeln('checkout ' + currCommit);
            return spawn({cmd : 'git', args : ['checkout',currCommit],
                        opts : { cwd : data.path } })
            .then(function(result){
                logResult(result);
                return done(true);
            });
        }

        getCommit()
            .then(fetchRemote)
            .then(checkoutMaster)
            .then(mergeMaster)
            .then(upload)
            .then(restore)
            .fail(function(err){
                grunt.log.errorlns(err.message);
                return restore(placeholder);
            })
            .fail(function(err){
                grunt.log.errorlns(err.message);
                return done(false);
            });
    });


};

/*
 * grunt-git-assist
 * 
 *
 * Copyright (c) 2013 howard
 * Licensed under the MIT license.
 */

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

};

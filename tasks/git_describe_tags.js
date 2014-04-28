/*
 * grunt-git-assist
 * 
 *
 * Copyright (c) 2013 howard
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {

    grunt.registerTask('git_describe_tags','git describe --tags --long', function(mode){
        var done = this.async(),
            options = this.options({
                allowCommits : (mode && mode.toLowerCase() === 'any') ,
                config       : 'git_tag'
            });

        grunt.util.spawn({
            cmd     : 'git',
            args    : ['describe','--tags','--long']
        },function(err,result){
            var data;
            if (err) {
                grunt.log.errorlns('grunt-git-assist: Failed to get git_describe_tags - ' + err);
                return done(false);
            }

            if (!options.allowCommits){
                if (result.stdout.match(/^.*-[1-9]+-\w+$/)){
                    grunt.log.errorlns('There have been commits since tag (' +
                        result.stdout + ')');
                    grunt.log.error('Set option allowCommits = true or re-tag the repository to proceed.');
                    return done(false);
                }
            }

            if (typeof options.config === 'string'){
                grunt.config(options.config,result.stdout);
            } else
            if (typeof options.config === 'function'){
                options.config(result.stdout);
            }

            grunt.log.oklns('git_describe_tags:',result.stdout);
            done(true);
        });
    });

};

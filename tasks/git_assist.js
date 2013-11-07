/*
 * grunt-git-assist
 * 
 *
 * Copyright (c) 2013 howard
 * Licensed under the MIT license.
 */

'use strict';
module.exports = function(grunt) {

    grunt.registerTask('gitLastCommit','Get a version using git commit', function(){
        var done = this.async(),
            options = this.options({
                versionFile : null,
                config      : 'gitLastCommit'
            });

        grunt.util.spawn({
            cmd     : 'git',
            args    : ['log','-n1','--format={ "commit" : "%h", "date" : "%ct" , "subject" : "%s" }']
        },function(err,result){
            var data;
            if (err) {
                grunt.log.errorlns('grunt-git-assist: Failed to get gitLastCommit - ' + err);
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

  grunt.registerMultiTask('git_assist', 'Plugin for helping out with git tasks.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      punctuation: '.',
      separator: ', '
    });

    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
      // Concat specified files.
      var src = f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function(filepath) {
        // Read file source.
        return grunt.file.read(filepath);
      }).join(grunt.util.normalizelf(options.separator));

      // Handle options.
      src += options.punctuation;

      // Write the destination file.
      grunt.file.write(f.dest, src);

      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" created.');
    });
  });

};

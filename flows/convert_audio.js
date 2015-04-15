var fs      = require('fs');
var exec    = require('child_process').exec;
var spawn   = require('child_process').spawn;

module.exports = function (options) {
  return function (previousObj, callback) {
    var tempPath = options.tempDir || 'defaultPath';
    exec( '(for FILE in '+tempPath+'*.flv ; do ffmpeg -i \"$FILE\" -f mp3 -ab 320000 '+tempPath+'\"`basename \"$FILE\" .flv`.mp3\" || continue; done)',
      function(error, stdout, stderr) {
        if(error) {
          return callback({error: true, message: 'Error! Failed to extract audio from video'});
        }
        if(/No such file or directory/.test(stderr)) {
          return callback({error: true, message: 'No actual video is downloaded!'});
        }
        if(options.log) {
          console.log('>>> Extracted audio');
        }

        return callback(null, true);
      }
    );
  }
}
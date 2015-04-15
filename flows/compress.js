var fs        = require('fs');
var exec      = require('child_process').exec;
var spawn     = require('child_process').spawn;
var zipstream = require('archiver');
var archiver  = require('async');

module.exports = function (options) {
  return function (previousObj, callback) {
    var tempPath = options.tempDir || 'defaultPath';
    var archiver = require('archiver');
    var hasItem  = false;

    try{
      //fs.statSync(options.tempDir);
      fs.readdirSync(tempPath).forEach(function (file) {
        if (~file.indexOf('.flv')) {
          hasItem = true;
          return;
        }
      });
    } catch(err) {
      if(err.code == 'ENOENT') {
        return callback({error: true, message: 'Error! Failed to create temp dirctory'});
      }
    }

    var output = fs.createWriteStream(options.destDir + options.fileName + '.zip');
    var archive = archiver('zip');

    output.on('close', function () {
      if(options.log) {
        console.log('>>> Zip: total size ' + archive.pointer());
      }
      callback(null, true);
    });

    archive.on('error', function(err){
        callback({error: true, message: 'Error! Failed to compress'});
    });

    archive.pipe(output);

    if(hasItem){
      archive.bulk([
        { expand: true, cwd: tempPath, src: ['**']}
      ]);
      archive.finalize();
    } else {
      archive.finalize();
      callback({error: true, message: 'Error! No item to compress'});
    }
  }
}
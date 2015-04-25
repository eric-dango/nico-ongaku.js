var fs = require('fs');

module.exports = function (options) {
  return function (previousObj, callback) {
      console.log("--------in rename");
    if(options.sync) {
      try {
        fs.renameSync(options.tempDir, options.destDir + options.fileName);
        if(options.log) {
          console.log('>>> Renamed result dirctory');
        }
        return callback(null, true);
      } catch(err) {
        if(err.code == 'ENOENT') {
          return callback({error: true, message: 'Error! Failed to rename temp dirctory'});
        }
      } 
    } else {
      fs.rename(options.tempDir, options.destDir + options.fileName, function(err) {
        if(err) {
          if(err.code == 'ENOENT') {
            return callback({error: true, message: 'Error! Failed to rename temp dirctory'});
          }
        }
        callback(null, true);
      })
    }    
  }
}

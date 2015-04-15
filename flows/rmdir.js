var fs = require('fs');
var path = require('path');

module.exports = function (options) {
  return function (previousObj, callback) {
    rmdir(options.tempDir);
    if(options.log) {
      console.log('>>> Removed temp dirctory');
    }
    callback(null, true);
  }
}

function rmdir (dir) {
  var list = fs.readdirSync(dir);
  for(var i = 0; i < list.length; i++) {
    var filename = path.join(dir, list[i]);
    var stat = fs.statSync(filename);
    
    if(filename == '.' || filename == '..') {
      // pass these files
    } else if(stat.isDirectory()) {
      // rmdir recursively
      rmdir(filename);
    } else {
      // rm fiilename
      fs.unlinkSync(filename);
    }
  }
  fs.rmdirSync(dir);
}

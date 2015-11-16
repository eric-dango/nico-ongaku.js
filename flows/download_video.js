var request = require('request');
var cheerio = require('cheerio');
var fs      = require('fs');
var exec    = require('child_process').exec;
var spawn   = require('child_process').spawn;
var ProgressBar = require('progress');

module.exports = function (options) {
  return function (previousObj, callback) {
    if(previousObj.prevError && previousObj.prevError.skip) {
      return callback(null, previousObj);
    }
    var jar       = previousObj.jar;
    var flvUrl    = previousObj.flvUrl;
    var title     = (previousObj.videoTitle || 'tmpvideo').replace(/\//g, ' ');
    if(!flvUrl) {
      previousObj.prevError = {skip: true, message: 'Error! Invalid download URL'};
      return callback(null, previousObj);
    }

    // create temp directory if not exist
    try{
      fs.statSync(options.tempDir);
    } catch(err) {
      if(err.code == 'ENOENT') {
        fs.mkdirSync(options.tempDir);
      } else {
        return callback({error: true, message: 'Error! Failed to create temp dirctory'});
      }
    }
    
    request({
      method   : 'GET',
      uri      : flvUrl,
      jar      : jar,
      encoding : null
    }).on('response', function(response) {
      if (response.statusCode !== 200) {
        previousObj.prevError = {skip: true, message: 'Error! Download failed'};
        return callback(null, previousObj);
      }
      
      var size = parseInt(response.headers['content-length'], 10);

      //Download progress bar
      if(options.log) {
        console.log();
        var bar = new ProgressBar('    Downloading [:bar] :percent :etas', {
          complete: '=',
          incomplete: ' ',
          width: 20,
          total: size
        });

        response.on('data', function (chunk) {
          bar.tick(chunk.length);
        });

        response.on('end', function () {
          console.log('\n');
        });
      }

    }).on('end', function() {
      var result = {};
      result.jar = jar;
      callback(null, result);
    })
    .pipe(fs.createWriteStream(options.tempDir + title + '.flv'));

  }
}
var request = require('request');
var cheerio = require('cheerio');

module.exports = function (options, videoId) {
  return function (previousObj, callback) {
    //reset skip flag
    if(previousObj.prevError) {
      if(previousObj.prevError.skip && options.log) {
        console.log('--- ERROR in processing ' + previousObj.prevVideoId);
      }
      delete previousObj.prevError;
    }
    previousObj.prevVideoId = videoId;
    var jar        = previousObj.jar;
    if(!videoId) {
      previousObj.prevError = {skip: true, message: 'Error! Invalid video ID'};
      return callback(null, previousObj);
    }
    if(options.log) {
      console.log('>>> Processing ' + videoId);
    }

    request.get({
      uri    : 'http://www.nicovideo.jp/watch/' + videoId,
      method  : 'GET',
      jar     : jar,
    }, function(error, response, body) {
      if(error) {
        previousObj.prevError = {skip: true, message: 'Error! GET video page(/watch/:id)'};
        return callback(null, previousObj);
      }
      var $ = cheerio.load(body);
      if($('#playerContainerWrapper').length > 0) {
        var nicoHeader = response.req._headers.cookie;
        var result = {};
        var cookie = request.cookie(nicoHeader);
        jar.setCookie(cookie, 'https://www.nicovideo.jp');
        result.jar = jar;

        result.videoTitle = $('h2 .videoHeaderTitle').text();
        result.videoTitle = result.videoTitle.replace(/\//g, "");
        result.videoId = videoId;
        result.fetchVideoUrl = 'http://flapi.nicovideo.jp/api/getflv/' + videoId + (/^nm/.test(videoId) ? '?as3=1' : '');
        if(options.log) {
          console.log('    Fetched "' + result.videoTitle + '"');
        }
        callback(null, result);
      } else {
        previousObj.prevError = {skip: true, message: 'Error! Incorrect video page: /watch/' + videoId};
        callback(null, previousObj);
      }
    });
  }
}
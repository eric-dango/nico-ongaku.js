var request = require('request');
var cheerio = require('cheerio');

module.exports = function (options) {
  return function (previousObj, callback) {
    var jar           = previousObj.jar;
    var fetchVideoUrl = previousObj.fetchVideoUrl;
    if(previousObj.prevError && previousObj.prevError.skip) {
      return callback(null, previousObj);
    }
    if(!fetchVideoUrl) {
      previousObj.prevError = {skip: true, message: 'Error! Invalid fetchVideoUrl'};
      return callback(null, previousObj);
    }
    request.get({
      uri     : fetchVideoUrl,
      method  : 'GET',
      jar     : jar,
      followAllRedirects : true,
    }, function(error, response, body) {
      if(error || response.statusCode !== 200) {
        previousObj.prevError = {skip: true, message: 'Error! GET video source page'};
        return callback(null, previousObj);
      } else {
        var urlComponent = /url=([^&]+)/.exec(body) || [];
        var flvUrl = decodeURIComponent(urlComponent[1] || '');
        if(flvUrl) {
          var result = {};
          var nicoHeader = response.req._headers.cookie;
          var cookie = request.cookie(nicoHeader);
          jar.setCookie(cookie, 'https://www.nicovideo.jp');
          result.jar = jar;

          result.flvUrl = flvUrl;
          result.videoId = previousObj.videoId;
          result.videoTitle = previousObj.videoTitle;
          if(options.log) {
            console.log('    Fetching download URL successed!');
          }
          return callback(null, result);
        }
        previousObj.prevError = {skip: true, message: 'Error! on fetrching watch page'};
        callback(null, previousObj);
      }
    });
  }
}
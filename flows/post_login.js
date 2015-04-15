var request = require('request');
var cheerio = require('cheerio');
var _       = require('underscore');

module.exports = function (options) {
  return function (previousObj, callback) {
    var loginUrl   = previousObj.loginUrl;
    var jar        = previousObj.jar;
    if(!options.nicoCredential) {
      return callback({error: true, message: 'Error! Invalid login credential.'})
    }
    var loginEmail = options.nicoCredential.email;
    var loginPass  = options.nicoCredential.password;
    var nickname   = options.nicoCredential.nickname;
    
    request({
        uri     : loginUrl,
        method  : 'POST',
        jar     : jar,
        followAllRedirects : true,
        form    : {
          'mail_tel': loginEmail,
          'password': loginPass
        }
      }, function(err, response, body) {
        if(err || response.statusCode !== 200) {
          callback({error: true, message: 'Error! Processing login POST'});
        } else {
          var re = new RegExp(nickname);
          if(true || re.test(body)) {
            if(options.log) {
              console.log('    Login successed!');
            }
            var result = {};
            var nicoCookie = {};
            var nicoHeader = response.req._headers.cookie;
            var cookie = request.cookie(nicoHeader);
            jar.setCookie(cookie, 'https://www.nicovideo.jp');

            result.jar = jar;
            callback(null, result);
          } else {
            callback({error: true, message: 'Login failed! Please input correct credential'});
          }
        }
    })
  }
}
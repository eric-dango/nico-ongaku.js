var request = require('request');
var cheerio = require('cheerio');
var _       = require('underscore');

module.exports = function (options) {

  return function (callback) {
    request.get('https://account.nicovideo.jp/login', function(error, response, body) {
    if(error || response.statusCode !== 200) {
      return callback({error: true, message: 'Error! Get login page'});
    }
      if(options.log) {
        console.log('>>> Login Nico');
      }
      var $ = cheerio.load(body);
      var loginForm = $('form#login_form');
      var loginUrl = loginForm.attr('action');

      var nicoSid = response.headers['x-niconico-sid']
      var jar = request.jar();
      var cookie = request.cookie('nicosid=' + nicoSid);
      jar.setCookie(cookie, 'https://www.nicovideo.jp');

      var result = {};
      result.loginUrl = loginUrl;
      result.jar = jar;

      // Proceed to finish
      callback(null, result);
    })
  }
}
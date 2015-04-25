var request = require('request');
var cheerio = require('cheerio');
var _       = require('underscore');
var async   = require('async');
var fs      = require('fs');
var exec    = require('child_process').exec;
var spawn   = require('child_process').spawn;
var path    = require('path');
var randomstring = require('randomstring');
var moment  =  require('moment');

module.exports = function (options, callback, socket) {
  var randomPath   = sanitizePath(randomstring.generate(7));
  options.destDir  = sanitizePath(options.destDir || options.tempDir);
  options.tempDir  = sanitizePath(options.tempDir + '/' + randomPath);
  options.fileName = (options.fileName || 'niconico') + '_' + moment().format('YYYY-MM-DD-HH-mm');
  var flows        = require('../flows/index.js')(options);
  var videoList    = options.videoList;

  if(videoList && videoList.length > 0) {
    var tasks = [flows.get_login, flows.post_login];

    _.each(videoList, function(id) {
      tasks.push(flows.get_watch_page(options, id));
      tasks.push(flows.get_video);
      tasks.push(flows.download_video);
    });

    tasks.push(flows.convert_audio);
    if(!options.isZip) {
      tasks.push(flows.renameDir);
    } else {
      tasks.push(flows.compress);
      tasks.push(flows.rmdir);
    }

    async.waterfall(tasks, function(error, result) {
      if(error) {
        return callback(error);
      }
      if(options.sync) {
        return callback(null, true);
      }
    });
    if(!options.sync) {
      return callback(null, true);
    }
  } else {
    return callback({error: true, message: 'Error! Empty video list'});
  }
}

function sanitizePath (path) {
  if(!path) {
    return process.cwd() + '/';
  }
  path = path.trim();
  if(path.charAt(path.length - 1) !== '/') {
    return path + '/';
  }
  return path;
}
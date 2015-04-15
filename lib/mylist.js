var request = require('request');
var cheerio = require('cheerio');
var _       = require('underscore');
var async   = require('async');
var extract = require('./process');
var is = require('is_js');
var vm      = require('vm');


module.exports = function (options, callback) {
  var limit = options ? options.limit : undefined;
  var downLoadFlag = options ? options.download === true : false;

  if(limit && !/\d+/.test(limit)) {
    return callback({error: true, message: 'Invalid argument! Please input integer as the top N videos to extract.'});
  }

  // request nico ranking
  request.get('http://www.nicovideo.jp/mylist/' + options.mylistId, function (error, response, body) {
    if(error || response.statusCode !== 200) {
      return callback({error: true, message: 'Error in GET nico mylist page'});
    }
    var $ = cheerio.load(body);
    var json = {};
    var resultObj = {};
    var itemArray = [];
    var myListMatch;
    var mylistObj;
    var myListSandbox = {};
    var limitOffset = 0;
    var result = {};

    result.title = $('#SYS_box_mylist_header h1').text().trim();
    result.author = $('#SYS_box_mylist_header strong').text().trim();

    //fetch video list in DOM
    _.each($('#SYS_page_items div.SYS_box_item'), function(item, idx) {
      if(limit && idx >= limit) {
        return;
      }
      var curItem = $(item);
      var imgLink = curItem.find('a["data-original"]');
      var curItemObj = {};

      curItemObj['title'] = curItem.find('.watch').text().trim();
      curItemObj['imgSrc'] = imgLink.attr('data-original');
      curItemObj['videoId'] = getVideoId(imgLink.closest('a').attr('href'));
      curItemObj['videoType'] =curItemObj['videoId'] ? curItemObj['videoId'].substring(0, 2) : undefined;

      itemArray.push(curItemObj);
    });

    limitOffset = limit - itemArray.length;

    //fetch video list in js
    if(limitOffset > 0) {
      myListMatch = $('script:contains("Mylist.preload")').text().match(/Mylist\.preload\(\d+, (\[{.+}])\);/);
      mylistObj = myListMatch ? myListMatch[1] : null;

      mylistObj = mylistObj.replace(/[^\:]("\\u)/g, '\\u');
      mylistObj = mylistObj.replace(/\\u307\\/g, '\\');
      //console.log(mylistObj);
      try { 
        vm.runInNewContext('var arr = ' + mylistObj, myListSandbox);
      } catch (e) { 
        return callback(e); 
      }
      //console.log(myListSandbox.arr);
      if(myListSandbox && myListSandbox.arr) {
        _.each(myListSandbox.arr, function (item, idx) {
          if(idx >= limitOffset) {
            return;
          }
          var curItemObj = {};

          curItemObj['title'] = item.item_data.title;
          curItemObj['imgSrc'] = item.item_data.thumbnail_url;
          curItemObj['videoId'] = item.item_data.video_id;
          curItemObj['videoType'] = curItemObj['videoId'] ? curItemObj['videoId'].substring(0, 2) : undefined;

          itemArray.push(curItemObj);
        });
      }
    }
    result.items = itemArray;

    //excute parallel
    if (!downLoadFlag) {
      return callback(null, result);
    } else {
      options.videoList = getVideoList(result);
      extract(options, function(err) {
        if(err) {
          return callback({error: true, message: 'Error in extracting videos from ranking.'});
        }
        return callback(null, result);
      })
    }
  }); //end of request
}


function getVideoId (href) {
  if(!href) {
    return false;
  }
  var result = href.match(/watch\/(\D\D\d+)\W.+/);
  return is.array(result) ? result[1] : false;
}

function getVideoList (list) {
  if(!list) {
    return false;
  }
  var arr = [];
  _.each(list.items, function(item) {
    arr.push(item.videoId);
  });
  return arr;
}


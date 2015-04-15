var request = require('request');
var cheerio = require('cheerio');
var _       = require('underscore');
var async   = require('async');
var extract = require('./process');

var rankMap = {
  daily: 1,
  weekly: 2,
  monthly: 3,
  utami: 999
}

module.exports = function (options, callback) {
  var types = options ? options.type : undefined;
  var limit = options ? options.limit : undefined;
  var downLoadFlag = options ? options.download === true : false;

  // option validate and convert
  if(types) {
    if(typeof types === 'string') {
      types = [types];
    }
    types = _.map(types, function(type) {
      return rankMap[type];
    })
  }

  if(limit && !/\d+/.test(limit)) {
    return callback({error: true, message: 'Invalid argument! Please input integer as the top N ranking to extract.'});
  }

  // request nico ranking
  request.get('http://ex.nicovideo.jp/vocaloid/ranking', function (error, response, body) {
    if(error || response.statusCode !== 200) {
      return callback({error: true, message: 'Error in GET nico ranking page'});
    }
    var $ = cheerio.load(body);
    var json = {};
    var titleArray = [];
    var rankCatArr = [];
    var derivativeUrl = 'http://ex.nicovideo.jp' + $('#ranking_tab #fan_tab a').attr('href') || 'http://ex.nicovideo.jp/vocaloid/ranking/derivative';
    
    //fetch ranking title
    _.each($('ul#ranking_title li'), function(title) {
      titleArray.push($(title).text().trim());
    });

    //fetch ranking categories and build link array
    _.each($('ul.ranking_cnt li'), function(item, idx) {
      if(idx === 0) {
        return;
      }
      if((types && _.indexOf(types, idx)) >= 0 || !types ) {
        var currentRankObj = {};
        currentRankObj.title = titleArray[idx] || 'default title';
        currentRankObj.url = $(item).find('.link_more a').attr('href') || undefined;
        rankCatArr.push(fetchVocaloidRankingPage(currentRankObj, limit));
      }
    });

    //handle utami
    if(_.indexOf(types, 999) >= 0 || !types) {
      rankCatArr.push(fetchDerivativeRankingPage(derivativeUrl, (_.indexOf(types, 999) >= 0 ? true : false), limit));
    }

    //excute parallel
    async.parallel(rankCatArr,
      function(err, results){
        if(results && results.length > 0 && Array.isArray(results[results.length - 1])) {
          var lastElement = results.pop();
          _.each(lastElement, function(el) {
            results.push(el);
          });
        }

        if (!downLoadFlag) {
          return callback(null, results.length === 1 ? results[0] : results);
        } else {
          options.videoList = getVideoList(results);
          extract(options, function(err) {
            if(err) {
              return callback({error: true, message: 'Error in extracting videos from ranking.'});
            }
            return callback(null, results.length === 1 ? results[0] : results);
          })
        }
      } //end of async.parallel callback
    ); // end of async.parallel
  }); //end of request
}

function fetchVocaloidRankingPage(targetObj, limit) {
  return function(callback) {
    if(targetObj && targetObj.url) {
      request.get(targetObj.url, function (error, response, body) {
        if(error || response.statusCode !== 200) {
          return callback({error: true, message: 'Error in GET nico ranking list'});
        }
        var $ = cheerio.load(body);
        var itemArray = [];
        var resultObj = {};

        //fetch ranking categories and build link array
        _.each($('section.content ul.list li.item.videoRanking'), function(list, idx) {
          if(limit && idx >= limit) {
            return;
          }
          var curItem = $(list);
          var imgWrapper = curItem.find('.itemThumb');
          var curItemObj = {};
          curItemObj['title'] = curItem.find('.itemTitle a').text().trim();
          curItemObj['imgSrc'] = imgWrapper.find('img.thumb').attr('data-original');
          curItemObj['videoId'] = imgWrapper.attr('data-id');
          curItemObj['videoType'] =curItemObj['videoId'] ? curItemObj['videoId'].substring(0, 2) : undefined;

          itemArray.push(curItemObj);
        });

        if(itemArray.length > 0 && targetObj.title) {
          resultObj.title = targetObj.title;
          resultObj.items = itemArray;
        }
        return callback(null, _.isEmpty(resultObj) ? null : resultObj);
      })
    } else {
      return callback({error: true, message: 'Error! Empty ranking link'});
    }
  }
}

function fetchDerivativeRankingPage(url, isUtami, limit) {
  return function(callback) {
    var resultObj = [];
    request.get(url, function (error, response, body) {
      if(error || response.statusCode !== 200) {
        return callback({error: true, message: 'Error in GET nico utami ranking list'});
      }
      var $ = cheerio.load(body);
      var titleArray = [];

      //fetch ranking title
      _.each($('ul#ranking_title li'), function(title) {
        titleArray.push($(title).text().trim());
      });

      //fetch ranking categories and build link array
      _.each($('ul.ranking_cnt li'), function(list, idx) {
        var itemArray = [];
        if(idx === 1) {
          return;
        }
        _.each($(list).find('div.box'), function(item, idx) {
          if(limit && idx >= limit) {
            return;
          }
          var curItem = $(item);
          var curItemObj = {};
          var curItemIdArr;
          curItemObj['title']     = curItem.find('p.ttl').text().trim();
          curItemObj['url']       = curItem.find('p.ttl a').attr('href');
          curItemObj['imgSrc']    = curItem.find('img').attr('src');
          curItemIdArr            = curItemObj['url'].split('/') || [];
          curItemObj['videoId']   = curItemIdArr.length > 1 ? curItemIdArr[curItemIdArr.length-1] : undefined;
          curItemObj['videoType'] = curItemObj['videoId'] ? curItemObj['videoId'].substring(0, 2) : undefined;
          itemArray.push(curItemObj);
        })

        if(itemArray.length > 0 && titleArray[idx]) {
          if(idx > 0 && isUtami) {
            
          } else {
            resultObj.push({title: titleArray[idx], items: itemArray});
          }
        }
      });
      callback(null, _.isEmpty(resultObj) ? null : resultObj);
    })
  }
}

function getVideoList (lists) {
  if(!lists) {
    return false;
  }
  var arr = [];
  _.each(lists, function(list) {
    _.each(list.items, function(item) {
      arr.push(item.videoId);
    })
  })
  return arr;
}


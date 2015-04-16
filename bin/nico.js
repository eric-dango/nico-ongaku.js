#! /usr/bin/env node

var VERSION      = '0.0.1';
var fs           = require('fs');
var program      = require('commander');
var exec         = require('child_process').exec;
var processVideo = require('../lib/process.js');
var processRank  = require('../lib/ranking.js');
var processMylist  = require('../lib/mylist.js');
var is           = require('is_js'); 

program
  .version(VERSION)
  .option('-u, --email <email>', 'Nico login email')
  .option('-p, --password <password>', 'Nico login password')
  .option('-f, --fileName <fileName>', 'Name for final zipped file')
  .option('-l, --limit <limit>', 'Limit number of video')
  .option('-z, --zip <zip>', 'Compress or not: Y/N', /^(Y|N)$/i, 'Y')
  .option('-o, --out [path]', 'Output directory')

//mylist
program
  .command('rank <type>')
  .description('Extract music from nico ranking: accept daily, weekly, monthly and utami')
  .action(function(type) {
    processRankExtract(type);
  });

program
  .command('extract <videoId> [otherVids...]')
  .description('Extract music by video id(s)')
  .action(function(videoId, otherVids) {
    if(is.array(otherVids)) {
      otherVids.unshift(videoId);
    }
    processDirectExtract(otherVids);
  });

program
  .command('mylist <mylistId>')
  .description('Extract music by mylist id')
  .action(function(mylistId) {
    processMylistExtract(mylistId);
  });

program.parse(process.argv);

function validation() {
  var result = true;
  if (!program.email) { 
    result = false;
    console.log('Nico account email required. -h for help'); 
  } else if(!program.password) {
    console.log('Nico account password required. -h for help');
    result = false;
  }
  program.out = program.out || process.cwd();
  return result;
}

function getNicoOptions() {
  return {
    nicoCredential: {
      email:    program.email,
      password: program.password,
      nickname: ""
    },
    destDir:  program.out || process.cwd() + '/',
    tempDir:  process.cwd() + '/',
    fileName: program.fileName || 'default',
    log:      true,
    sync:     true
  }
}

function processDirectExtract (videoList) {
  if(validation()) {
    var options = getNicoOptions();
    options.videoList = videoList;
    console.log('>>> Start processing');
    processVideo(options, function(err, result) {
      if(err) {
        console.log('Error: ' + err.message);
      }
      if(true) {
        console.log('+++ Completed!');
      }
    })
  }
}

function processRankExtract (rankType) {
  if(/^(daily|monthly|weekly|utami)$/i.test(rankType) && validation()) {
    var options      = getNicoOptions();
    options.type     = rankType;
    options.download = true;
    options.limit    = program.limit || 5;

    console.log('>>> Start processing');
    processRank(options, function(err, result) {
      if(err) {
        console.log('Error: ' + err.message);
      }
      if(true) {
        console.log('+++ Completed!');
      }
    })
  }
}

function processMylistExtract (mylistId) {
  if(mylistId && validation()) {
    var options      = getNicoOptions();
    options.mylistId = mylistId;
    options.download = true;
    options.limit    = program.limit || 5;

    console.log('>>> Start processing');
    processMylist(options, function(err, result) {
      if(err) {
        console.log('Error: ' + err.message);
      }
      if(true) {
        console.log('+++ Completed!');
      }
    })
  }
}
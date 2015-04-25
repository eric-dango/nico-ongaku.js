module.exports = function (options) {
  return {
    get_login        : require('./get_login')(options),
    post_login       : require('./post_login')(options),
    get_watch_page   : require('./get_watch_page'),
    get_video        : require('./get_video')(options),
    download_video   : require('./download_video')(options),
    convert_audio    : require('./convert_audio')(options),
    compress         : require('./compress')(options),
    renameDir        : require('./renameDir')(options),
    rmdir            : require('./rmdir')(options)
  }
}

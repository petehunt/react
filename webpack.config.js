var fs = require('fs');
var glob = require('glob');

var HASTE_MAP = null;

function buildHasteMap(root) {
  var hasteMap = {};

  glob.sync(root + '/**/*.js').forEach(function(file) {
    var code = fs.readFileSync(file);
    var regex = /@providesModule ([^\s*]+)/;
    var result = regex.exec(code);

    if (result) {
      hasteMap[result[1]] = file;
    }
  });

  return hasteMap;
}

HASTE_MAP = buildHasteMap('src/');

module.exports = {
  define: {
    __DEV__: true
  },
  module: {
    loaders: [
      //{ test: /\.js$/, loader: 'jsx-loader' }
    ],
  },
  plugins: [
    function() {
      this.resolvers.normal.plugin('module', function(request, callback) {
        var hastePath = HASTE_MAP[request.request];
        if (hastePath) {
          callback(
            null,
            {
              path: hastePath,
              query: request.query,
              file: true,
              resolved: true
            }
          );
        } else {
          // passthrough
          callback();
        }
      });
    }
  ]
};
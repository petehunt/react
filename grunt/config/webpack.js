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

var LOADERS = {
  loaders: [
    //{ test: /\.js$/, loader: 'jsx-loader' }
  ],
};

var PLUGINS = [
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
];

module.exports = {
  options: {},

  dev: {
    define: {
      __DEV__: true
    },

    entry: './src/ReactGlobal.js',

    module: {loaders: LOADERS},

    stats: {
      // Configure the console output
      colors: false,
      modules: true,
      reasons: true
    },

    output: {
      path: './build/',
      filename: 'react.webpack.js'
    },

    plugins: PLUGINS
  }/*,

  prod: {
    options: {
      define: {
        __DEV__: false
      },

      module: {loaders: LOADERS},

      plugins: PLUGINS
    }
  }*/
};
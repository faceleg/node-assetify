'use strict';
var assets = {
  js: [],
  css: []
};
module.exports = {
  add: function add(files) {
    if (files.js) {
      assets.js = assets.js.concat(files.js);
    }
    if (files.css) {
      assets.css = assets.css.concat(files.css);
    }
  },
  assets: function() {
    return assets;
  }
};

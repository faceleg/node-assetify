'use strict';

module.exports = function() {
  var assets = {
    js: [],
    css: []
  };

  return {
    get assets() {
      return assets;
    },
    add: function add(files) {
      if (files.js) {
        assets.js = assets.js.concat(files.js);
      }
      if (files.css) {
        assets.css = assets.css.concat(files.css);
      }
    }
  };
};

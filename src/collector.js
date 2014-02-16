'use strict';

function applyProfile(profile, files) {
  if (!profile) {
    return files;
  }

  var modifiedFiles = [];
  files.forEach(function(file) {
      if (typeof file === 'string') {
        file = {
          file: file,
          profile: profile
        };
      }

      if (!file.profile) {
        file.profile = profile;
      }

      modifiedFiles.push(file);
  });
  return modifiedFiles;
}

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
        assets.js = assets.js.concat(applyProfile(files.profile, files.js));
      }
      if (files.css) {
        assets.css = assets.css.concat(applyProfile(files.profile, files.css));
      }
    }
  };
};

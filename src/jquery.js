'use strict';

module.exports = function(version, debug, file, profile){
    var extension = debug ? '.js' : '.min.js';

    return {
        ext: '//ajax.googleapis.com/ajax/libs/jquery/' + version + '/jquery' + (debug ? '' : '.min') + '.js',
        file: file || '/js/vendor/jquery-' + version + extension,
        test: 'window.jQuery',
        profile: profile
    };
};
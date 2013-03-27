'use strict';

module.exports = function(version, debug, local, profile){
    var extension = debug ? '.js' : '.min.js';

    return {
        ext: '//ajax.googleapis.com/ajax/libs/jquery/' + version + '/jquery' + (debug ? '' : '.min') + '.js',
        local: local || '/js/vendor/jquery-' + version + extension,
        test: 'window.jQuery',
        profile: profile
    };
};
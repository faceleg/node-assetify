'use strict';

module.exports = function(version, local, profile, debug){
    return {
        ext: '//ajax.googleapis.com/ajax/libs/jquery/' + version + '/jquery' + (debug ? '' : '.min') + '.js',
        local: local,
        test: 'window.jQuery',
        profile: profile
    };
};
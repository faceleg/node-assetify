'use strict';

var async = require('async'),
    path = require('path');

function replaceAt(text, index, length, replacement) {
    return text.substr(0, index) + replacement + text.substr(index + length);
}

function replaceExtension(source, text, replacement){
    return replaceAt(source, source.lastIndexOf(text), text.length, replacement);
}

function getParser(key, extensions, parse){
    function plugin(items, config, ctx, callback){
        var extOut = '.' + key;

        async.forEach(items, function(item, done){
            var extName = path.extname(item.out);

            var found = extensions.some(function(ext){
                if(extName === ext){
                    item.out = replaceExtension(item.out, ext, extOut);

                    parse(item, config, ctx, done);
                }
                return extName === ext;
            });

            if(!found){
                done();
            }
        }, callback);
    }

    return {
        key: key,
        events: [{
            eventName: 'afterReadFile',
            plugin: plugin
        }]
    };
}

module.exports = {
    configure: getParser
};
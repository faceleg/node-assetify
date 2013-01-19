var async = require('async'),
    path = require('path');

function replaceAt(text, index, length, replacement) {
    return text.substr(0, index) + replacement + text.substr(index + length);
}

function replaceExtension(source, text, replacement){
    return replaceAt(source, source.lastIndexOf(text), text.length, replacement)
}

function getParser(key, extensions, parse){
    return {
        key: key,
        events: [{
            eventName: 'afterReadFile',
            plugin: function(items, config, ctx, callback){
                var extOut = '.' + key;

                async.forEach(items, function(item, done){
                    var extName = path.extname(item.out);

                    var found = extensions.some(function(ext){
                        if(extName === ext){
                            item.out = replaceExtension(item.out, ext, extOut);

                            parse(item, config, ctx, done);
                            return true;
                        }
                        return false;
                    });

                    if(!found){
                        done();
                    }
                },function(err){
                    if(err){
                        throw err;
                    }
                    callback();
                });
            }
        }]
    }
}

module.exports = {
    configure: getParser
};
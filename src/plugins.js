var async = require('async'),
    path = require('path'),
    less = require('less');

function replaceAt(text, index, length, replacement) {
    return text.substr(0, index) + replacement + text.substr(index + length);
}

var api = {
    less: {
        key: 'css',
        events: [{
            eventName: 'afterReadFile',
            plugin: function(items, config, callback){
                async.forEach(items, function(item, done){
                    var extIn = '.less',
                        extOut = '.css',
                        i = item.path.lastIndexOf(extIn);

                    if(path.extname(item.path) === extIn){
                        item.path = replaceAt(item.path, i, extIn.length, extOut);

                        var filename = path.join(config.source, item.local),
                            includes = path.dirname(filename),
                            parser = new(less.Parser)({
                                paths: [includes],
                                filename: path.basename(item.local)
                            });

                        parser.parse(item.src.toString(), function (err, tree) {
                            if(err){
                                throw err;
                            }
                            item.src = tree.toCSS({
                                compress: config.minify
                            });

                            done();
                        });
                    }else{
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
};

module.exports = api;
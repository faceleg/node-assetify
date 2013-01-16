var async = require('async'),
    path = require('path'),
    less = require('less'),
    cleanCss = require('clean-css');
    uglifyjs = require('uglify-js');

function replaceAt(text, index, length, replacement) {
    return text.substr(0, index) + replacement + text.substr(index + length);
}

function replaceExtension(source, text, replacement){
    return replaceAt(source, source.lastIndexOf(text), text.length, replacement)
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
                        item.out = replaceExtension(item.out, extIn, extOut);
                        item.path = replaceExtension(item.path, extIn, extOut);

                        var filename = path.join(config.source, item.local),
                            includes = path.dirname(filename),
                            parser = new(less.Parser)({
                                paths: [includes],
                                filename: path.basename(filename)
                            });

                        parser.parse(item.src.toString(), function (err, tree) {
                            if(err){
                                throw err;
                            }
                            item.src = tree.toCSS();
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
    },
    minifyCSS: {
        key: 'css',
        events: [{
            eventName: 'afterBundle',
            plugin: function(items, config, callback){
                async.forEach(items, function(item, done){
                    var source = item.src.toString();
                    item.src = cleanCss.process(source);
                    done();
                },function(err){
                    if(err){
                        throw err;
                    }
                    callback();
                });
            }
        }]
    },
    minifyJS: {
        key: 'js',
        events: [{
            eventName: 'afterBundle',
            plugin: function(items, config, callback){
                async.forEach(items, function(item, done){
                    var source = item.src.toString(),
                        result = uglifyjs.minify(source, {
                            fromString: true
                        });

                    item.src = result.code;
                    done();
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
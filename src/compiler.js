var extend = require('xtend'),
    fs = require('fs'),
    path = require('path'),
    async = require('async'),
    disk = require('./disk.js'),
    html = require('./html.js'),
    middleware = require('./middleware.js'),
    dynamic = require('./dynamic.js'),
    pluginFramework = require('./plugins/framework.js'),
    defaults = {
        js: [],
        css: []
    },
    snippets = 0,
    config; // module configuration options

function configure(opts){
    if(config !== undefined){
        throw new Error('assetify can only be configured once.');
    }

    config = extend(defaults, opts);

    if(config.source === undefined){
        throw new Error("opts.source must be defined as the folder where your assets are");
    }
    if(config.bin === undefined){
        throw new Error("opts.bin must be defined as the folder where processed assets will be stored");
    }
    if(config.source === config.bin){
        throw new Error("opts.source can't be the same as opts.bin");
    }
}

function anonymousSnippet(){
    return '/snippet_' + ++snippets + '.js';
}

function readFilesAsync(items, cb){
    async.forEach(items, function(source, callback){
        var complex = typeof source === 'object',
            item = complex ? source : {
                local: source
            };

        var i = items.indexOf(source);
        items[i] = item;

        if (item.inline !== true){
            item.out = item.local || anonymousSnippet();
        }

        if(item.local !== undefined){ // local might not exist.
            var file = path.join(config.source, item.local);

            fs.readFile(file, function(err, data){
                if(err){
                    throw err;
                }
                item.src = data;
                callback(err);
            });
        }else{
            callback();
        }
    },cb);
}

function outputAsync(items, cb){
    async.forEach(items, function(item, callback){
        if(item.inline !== true){ // don't write files for inline scripts
            var file = path.join(config.bin, item.out);
            disk.write(file, item.src, callback);
        }else{
            callback();
        }
    },function(err){
        if(err){
            throw err;
        }
        cb(null);
    });
}

function processLoop(items, key, cb){
    var ctx = { key: key };

    async.series([
        async.apply(disk.removeSafe, config.bin),
        async.apply(readFilesAsync, items),
        async.apply(pluginFramework.raise, key, 'afterReadFile', items, config, ctx),
        async.apply(pluginFramework.raise, key, 'beforeBundle', items, config, ctx),
        async.apply(pluginFramework.raise, key, 'afterBundle', items, config, ctx),
        async.apply(outputAsync, items),
        async.apply(pluginFramework.raise, key, 'afterOutput', items, config, ctx)
    ],function (err){
        if(err){
            throw err;
        }
        cb(items);
    });
}

function process(items, key, tag, done){
    processLoop(items, key, function(results){
        middleware.register(key, 'emit', function(locals){
            return function(profile, includeCommon){
                var dyn = dynamic.process(key, locals),
                    all = results.concat(dyn),
                    internal = tag(all);

                return internal(profile, includeCommon);
            }
        });
        return done();
    });
}

function compile(opts, cb){
    configure(opts);

    async.parallel([
        async.apply(process, config.js, 'js', html.scriptTags),
        async.apply(process, config.css, 'css', html.styleTags)
    ], cb);

    return config.bin;
}

module.exports = {
    compile: compile
};
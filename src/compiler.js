'use strict';

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
        css: [],
        misc: [],
        host: ''
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
    return '/snippet_' + (++snippets) + '.js';
}

function readFilesAsync(items, cb){
    async.forEach(items, function(source, callback){
        var complex = typeof source === 'object',
            item = complex ? source : {
                local: source
            };

        item.locals = [item.local];

        if(typeof item.profile === 'string'){
            item.profile = [item.profile];
        }

        if (item.profile !== undefined){
            item.profile = Array.prototype.concat.apply([], item.profile); // copy it
        }

        var i = items.indexOf(source);
        items[i] = item;

        if (item.inline !== true){
            item.out = item.local || anonymousSnippet();
        }

        if(item.local !== undefined && item.src === undefined){ // local might not exist.
            var file = path.join(config.source, item.local);

            fs.readFile(file, function(err, data){
                if(err){
                    return callback(err);
                }
                item.src = data;
                callback();
            });
        }else{
            if (item.src === undefined){
                item.src = ''; // sanity
            }
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
    }, cb);
}

function processLoop(items, key, cb){
    var ctx = { key: key };

    async.series([
        async.apply(readFilesAsync, items),
        async.apply(pluginFramework.raise, key, 'afterReadFile', items, config, ctx),
        async.apply(pluginFramework.raise, key, 'beforeBundle', items, config, ctx),
        async.apply(pluginFramework.raise, key, 'afterBundle', items, config, ctx),
        async.apply(outputAsync, items),
        async.apply(pluginFramework.raise, key, 'afterOutput', items, config, ctx)
    ], function (err){
        cb(err, items, ctx);
    });
}

function compileInternal(items, key, tag, done){
    if(items === undefined){
        process.nextTick(done);
        return;
    }

    processLoop(items, key, function(err, results, ctx){
        if(err){
            return done(err);
        }
        
        middleware.register(key + '.emit', function(req, res){
            ctx.http = { req: req, res: res };

            // NOTE: beforeRender plugins _must_ be synchronous
            // in order to make an impact on the request object
            pluginFramework.raise(key, 'beforeRender', results, config, ctx, function(){});

            return function(profile, includeCommon){
                var dyn = dynamic.process(key, req, res),
                    all = dyn.before.concat(results).concat(dyn.after),
                    internal = tag(all, config);

                return internal(profile, includeCommon);
            };
        });
        done();
    });
}

function compile(opts, cb){
    configure(opts);

    disk.removeSafe(config.bin, function(){
        async.parallel([
            async.apply(compileInternal, config.js, 'js', html.scriptTags),
            async.apply(compileInternal, config.css, 'css', html.styleTags)
        ], function(err){
            if(err){
                console.log(err);
                throw err.stack || err;
            }
            cb();
        });
    });

    return config.bin;
}

module.exports = {
    compile: compile
};
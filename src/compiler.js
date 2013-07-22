'use strict';

function compiler(middleware, pluginFramework){
    var extend = require('xtend'),
        fs = require('fs'),
        path = require('path'),
        async = require('async'),
        disk = require('./disk.js'),
        defaults = {
            js: [],
            css: [],
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

    function anonymousSnippet(key){
        return '/snippet_' + (++snippets) + '.' + key;
    }

    function readFilesAsync(items, key, done){
        async.forEach(items, function(source, callback){
            var complex = typeof source === 'object',
                item = complex ? source : {
                    file: source
                };

            item.files = item.file ? [item.file] : [];

            if(typeof item.profile === 'string'){
                item.profile = [item.profile];
            }

            if (item.profile !== undefined){
                item.profile = Array.prototype.concat.apply([], item.profile); // copy it
            }

            var i = items.indexOf(source);
            items[i] = item;

            if (item.inline !== true && (item.file || !item.ext)){
                item.out = item.file || anonymousSnippet(key);
            }

            if(item.file !== undefined && item.src === undefined){ // file might not exist.
                var file = path.join(config.source, item.file);

                fs.readFile(file, 'utf8', function(err, data){
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
        }, done);
    }

    function outputAsync(items, cb){
        async.forEach(items, function(item, callback){
            if(item.inline !== true && (item.file || !item.ext)){ // don't write files for inline scripts
                item.out = disk.parentless(item.out);
                var file = path.join(config.bin, 'assets', item.out);
                disk.write(file, item.src, callback);
            }else{
                callback();
            }
        }, cb);
    }

    function processLoop(items, key, cb){
        var ctx = { key: key };

        async.series([
            async.apply(readFilesAsync, items, key),
            async.apply(pluginFramework.raise, key, 'afterReadFile', items, config, ctx),
            async.apply(pluginFramework.raise, key, 'beforeBundle', items, config, ctx),
            async.apply(pluginFramework.raise, key, 'afterBundle', items, config, ctx),
            async.apply(outputAsync, items),
            async.apply(pluginFramework.raise, key, 'afterOutput', items, config, ctx)
        ], function (err){
            cb(err, items, ctx);
        });
    }

    function compileInternal(items, key, done){
        if(items === undefined){
            process.nextTick(done);
            return;
        }

        processLoop(items, key, function(err, results, ctx){
            if(err){
                return done(err);
            }

            middleware.meta.pushAsset(key, items);            

            done();
        });
    }

    return function(opts, cb){
        configure(opts.assets);

        disk.removeSafe(config.bin, function(){
            async.parallel([
                async.apply(compileInternal, config.js, 'js'),
                async.apply(compileInternal, config.css, 'css')
            ], function(err){
                if(err){
                    console.log(err);
                    throw err.stack || err;
                }

                middleware.meta.set('assets', opts.assets);
                middleware.meta.set('expires', opts.expires);
                middleware.meta.set('compress', opts.compress);
                middleware.meta.set('fingerprint', opts.fingerprint);
                middleware.meta.serialize(config.bin, cb);
            });
        });
    };
}

module.exports = {
    instance: compiler
};